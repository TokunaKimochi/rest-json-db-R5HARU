import pgPromise from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';
import { DataBaseError } from '../../db';

// 単独ノート削除のトランザクションパーツバージョン
// eslint-disable-next-line import/prefer-default-export
export const deleteOneNoteInTx = async (t: pgPromise.ITask<object>, customerId: number, rank: number) => {
  const result: IResult = await t.result('DELETE FROM notes WHERE customer_id = $1 AND rank = $2', [customerId, rank]);
  if (result.rowCount !== 1) {
    throw new DataBaseError(`result.rowCount is ${result.rowCount}, not 1 as expected`);
  }
};
