import { insert, update } from 'sql-bricks';
import type { IResult } from 'pg-promise/typescript/pg-subset';
import { DataBaseError, db } from '../../db';
import { deleteOneNoteInTx, pushAsideRankersInTx, slideOverRankingInTx } from './notes.txAtoms';
import { CustomersTbRow } from '../customers/customers.types';
import { NoteInputs, NotesTbRow, ParamsWithCustomerId, ParamsWithCustomerIdAndRank } from './notes.types';

export const findAllNotesAboutCustomer = async (p: ParamsWithCustomerId): Promise<NotesTbRow[] | []> => {
  const result: NotesTbRow[] = await db
    .manyOrNone('SELECT * FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [p.customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const createOneNote = async (
  p: ParamsWithCustomerId,
  body: NoteInputs
): Promise<{ customer: CustomersTbRow; note: NotesTbRow }> => {
  // customers テーブルの notes カラムや他のランクのノートが連動する必要があるのでトランザクション
  const result: { customer: CustomersTbRow; note: NotesTbRow } = await db
    .tx('add-a-note-to-the-customer', async (t) => {
      // 現在処理中の顧客に対してメモがいくつあるか取得する
      // SQL の世界から返ってくるオブジェクトなのでキャメルケースは使えない
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
      const { total_notes }: { total_notes: string } = await t
        .one('SELECT COUNT(*) AS total_notes FROM notes WHERE customer_id = $1', [p.customerId])
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      // ランク（表示順）を整える
      await slideOverRankingInTx(t, p.customerId);
      await pushAsideRankersInTx(t, p.customerId, body.rank);

      // 本題。メモの登録
      const { text, values } = insert('notes', { ...body }).toParams();
      // データベースに登録を試み、成功したら登録されたデータを全て返却
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const createdNote: NotesTbRow = await t
        .one(`${text} RETURNING *`, values)
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      // メモのインサート成功を受けて customers テーブルをアップデート
      const notes = { notes: parseInt(total_notes, 10) + 1 };
      const { text: updateCustomersText, values: updateCustomersValues } = update('customers', notes)
        .where('id', p.customerId)
        .toParams();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedCustomer: CustomersTbRow = await t
        .one(`${updateCustomersText} RETURNING *`, updateCustomersValues)
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

      return { customer: updatedCustomer, note: createdNote };
    })
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  return result;
};

export const updateOneNote = async (
  p: ParamsWithCustomerIdAndRank,
  body: NoteInputs
): Promise<{ customer: CustomersTbRow; note: NotesTbRow }> => {
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

  // ノートの更新が済んだら当該カスタマーのレコードをセレクト
  // セレクトなのでトランザクション外で良しとする
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customer: CustomersTbRow = await db
    .one('SELECT * FROM customers WHERE id = $1', [p.customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return { customer, note };
};

export const deleteOneNote = async (p: ParamsWithCustomerIdAndRank): Promise<{ command: string; rowCount: number }> => {
  const result = await db.tx('delete-a-note-to-the-customer', async (t) => {
    // 現在処理中の顧客に対してメモがいくつあるか取得する
    // SQL の世界から返ってくるオブジェクトなのでキャメルケースは使えない
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
    const { total_notes }: { total_notes: string } = await t
      .one('SELECT COUNT(*) AS total_notes FROM notes WHERE customer_id = $1', [p.customerId])
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    // 本題。メモを削除
    const deleteResult: { command: string; rowCount: number } = await t
      .result('DELETE FROM notes WHERE customer_id = $1 AND rank = $2', [p.customerId, p.rank], (r: IResult) => ({
        command: r.command,
        rowCount: r.rowCount,
      }))
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    // メモの削除成功を受けて customers テーブルをアップデート
    const notes = { notes: parseInt(total_notes, 10) - 1 };
    const { text: updateCustomersText, values: updateCustomersValues } = update('customers', notes)
      .where('id', p.customerId)
      .toParams();
    await t
      .none(updateCustomersText, updateCustomersValues)
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    return deleteResult;
  });

  if (result.rowCount !== 1) {
    throw new DataBaseError(`result.rowCount is ${result.rowCount}, not 1 as expected`);
  }
  return result;
};
