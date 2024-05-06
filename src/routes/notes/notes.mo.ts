import { z } from 'zod';
import { insert, update } from 'sql-bricks';
import pgPromise from 'pg-promise';
import { DataBaseError, db } from '../../db';
import { noteInputsSchema, notesTbRowSchemas, paramsWithCustomerIdSchema } from './notes.schemas';

export type ParamsWithCustomerId = z.infer<typeof paramsWithCustomerIdSchema>;
export type NotesTbRow = z.infer<typeof notesTbRowSchemas>;
export type NoteInputs = z.infer<typeof noteInputsSchema>;

// トランザクション中にランキングカラムのデータが歯抜けになっていたら前に詰めて整える
const slideOverRanking = async (t: pgPromise.ITask<object>, customerId: number) => {
  const currentRanks: { rank: string }[] = await t
    .many('SELECT rank FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  for (let i = 0; i < currentRanks.length; i += 1) {
    const j = i + 1;

    if (j !== parseInt(currentRanks[i].rank, 10)) {
      const { text, values } = update('notes', { rank: j })
        .where('customer_id', customerId)
        .and('rank', currentRanks[i].rank)
        .toParams();

      // eslint-disable-next-line no-await-in-loop
      await t.none(text, values).catch((err: string) => Promise.reject(new DataBaseError(err)));
    }
  }
};

// トランザクション中に挿入したいランクが埋まっていたら一つずつ後ろにずらして席を空ける
const pushAsideRankers = async (t: pgPromise.ITask<object>, customerId: number, ranked: number) => {
  const reverseRanks: { rank: string }[] = await t
    .many('SELECT rank FROM notes WHERE customer_id = $1 ORDER BY rank DESC', [customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  for (const currentRanker of reverseRanks) {
    const currentNo = parseInt(currentRanker.rank, 10);
    if (ranked <= currentNo) {
      const { text, values } = update('notes', { rank: currentNo + 1 })
        .where('customer_id', customerId)
        .and('rank', currentNo)
        .toParams();

      // eslint-disable-next-line no-await-in-loop
      await t.none(text, values).catch((err: string) => Promise.reject(new DataBaseError(err)));
    }
  }
};

export const findAllNotesAboutCustomer = async (p: ParamsWithCustomerId): Promise<NotesTbRow[] | []> => {
  const result: NotesTbRow[] = await db
    .manyOrNone('SELECT * FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [p.customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const createOneNote = async (p: ParamsWithCustomerId, body: NoteInputs): Promise<NotesTbRow> => {
  // customers テーブルの notes カラムが連動する必要があるのでトランザクションを使用
  const note: NotesTbRow = await db
    .tx('add-a-note-to-the-customer', async (t) => {
      // 現在処理中の顧客に対してメモがいくつあるか取得する
      // SQL の世界から返ってくるオブジェクトなのでキャメルケースは使えない
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
      const { total_notes }: { total_notes: string } = await t
        .one('SELECT COUNT(*) AS total_notes FROM notes WHERE customer_id = $1', [p.customerId])
        .catch((err: string) => Promise.reject(new DataBaseError(err)));
      const notes = { notes: parseInt(total_notes, 10) + 1 };

      // customers テーブルを先にアップデート
      const { text: updateCustomersText, values: updateCustomersValues } = update('customers', notes)
        .where('id', p.customerId)
        .toParams();
      await t
        .none(updateCustomersText, updateCustomersValues)
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      // ランク（表示順）を整える
      await slideOverRanking(t, p.customerId);
      await pushAsideRankers(t, p.customerId, body.rank);

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
