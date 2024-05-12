import { z } from 'zod';
import { insert, update } from 'sql-bricks';
import { DataBaseError, db } from '../../db';
import {
  noteInputsSchema,
  notesTbRowSchemas,
  paramsWithCustomerIdAndRankSchema,
  paramsWithCustomerIdSchema,
} from './notes.schemas';
import { deleteOneNoteInTx, pushAsideRankersInTx, slideOverRankingInTx } from './notes.txAtoms';

export type ParamsWithCustomerId = z.infer<typeof paramsWithCustomerIdSchema>;
export type ParamsWithCustomerIdAndRank = z.infer<typeof paramsWithCustomerIdAndRankSchema>;
export type NotesTbRow = z.infer<typeof notesTbRowSchemas>;
export type NoteInputs = z.infer<typeof noteInputsSchema>;

export const findAllNotesAboutCustomer = async (p: ParamsWithCustomerId): Promise<NotesTbRow[] | []> => {
  const result: NotesTbRow[] = await db
    .manyOrNone('SELECT * FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [p.customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const createOneNote = async (p: ParamsWithCustomerId, body: NoteInputs): Promise<NotesTbRow> => {
  // customers テーブルの notes カラムや他のランクのノートが連動する必要があるのでトランザクションを使用
  const note: NotesTbRow = await db
    .tx('add-a-note-to-the-customer', async (t) => {
      // 現在処理中の顧客に対してメモがいくつあるか取得する
      // SQL の世界から返ってくるオブジェクトなのでキャメルケースは使えない
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
      const { total_notes }: { total_notes: string } = await t
        .one('SELECT COUNT(*) AS total_notes FROM notes WHERE customer_id = $1', [p.customerId])
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      // customers テーブルを先にアップデート
      const notes = { notes: parseInt(total_notes, 10) + 1 };
      const { text: updateCustomersText, values: updateCustomersValues } = update('customers', notes)
        .where('id', p.customerId)
        .toParams();
      await t
        .none(updateCustomersText, updateCustomersValues)
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      // ランク（表示順）を整える
      await slideOverRankingInTx(t, p.customerId);
      await pushAsideRankersInTx(t, p.customerId, body.rank);

      // 本題。メモの登録
      const { text, values } = insert('notes', { ...body }).toParams();
      // データベースに登録を試み、成功したら登録されたデータを全て返却
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: NotesTbRow = await t
        .one(`${text} RETURNING *`, values)
        .catch((err: string) => Promise.reject(new DataBaseError(err)));
      return result;
    })
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  return note;
};

export const updateOneNote = async (p: ParamsWithCustomerIdAndRank, body: NoteInputs): Promise<NotesTbRow> => {
  let note: NotesTbRow;
  // 現状からランクを変えるか？
  if (p.rank !== body.rank) {
    // ランクを変える場合複数の SQL が必要な可能性があるのでトランザクション
    note = await db
      .tx('update-a-note-to-the-customer', async (t) => {
        // 現状の（古い）ランクはパスパラメータで渡って来る仕様
        // シンプルに一度古いノートを削除する
        await deleteOneNoteInTx(t, p.customerId, p.rank);
        // （アップデートではなく）インサートとしてランクを整える
        await slideOverRankingInTx(t, body.customer_id);
        await pushAsideRankersInTx(t, body.customer_id, body.rank);

        // 改めて編集内容を「新規」ノートとしてインサートし直す
        const { text, values } = insert('notes', { ...body }).toParams();
        // データベースに登録を試み、成功したら登録されたデータを全て返却
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result: NotesTbRow = await t
          .one(`${text} RETURNING *`, values)
          .catch((err: string) => Promise.reject(new DataBaseError(err)));
        return result;
      })
      .catch((err: string) => Promise.reject(new DataBaseError(err)));
  }
  // 単独の UPDATE 文
  else {
    const { text, values } = update('notes', { ...body })
      .where('customer_id', body.customer_id)
      .and('rank', body.rank)
      .toParams();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    note = await db.one(`${text} RETURNING *`, values).catch((err: string) => Promise.reject(new DataBaseError(err)));
  }
  return note;
};
