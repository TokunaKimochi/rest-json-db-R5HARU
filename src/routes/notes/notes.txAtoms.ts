import pgPromise from 'pg-promise';
import { IResult } from 'pg-promise/typescript/pg-subset';
import { update } from 'sql-bricks';
import { DataBaseError } from '../../db';

// トランザクション中にランキングカラムのデータが歯抜けになっていたら前に詰めて整える
export const slideOverRankingInTx = async (t: pgPromise.ITask<object>, customerId: number) => {
  const currentRanks: { rank: string }[] = await t
    .manyOrNone('SELECT rank FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [customerId])
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
export const pushAsideRankersInTx = async (t: pgPromise.ITask<object>, customerId: number, ranked: number) => {
  const reverseRanks: { rank: string }[] = await t
    .manyOrNone('SELECT rank FROM notes WHERE customer_id = $1 ORDER BY rank DESC', [customerId])
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

// 単独ノート削除のトランザクションパーツバージョン
export const deleteOneNoteInTx = async (t: pgPromise.ITask<object>, customerId: number, rank: number) => {
  const result: IResult = await t
    .result('DELETE FROM notes WHERE customer_id = $1 AND rank = $2', [customerId, rank])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  if (result.rowCount !== 1) {
    throw new DataBaseError(`result.rowCount is ${result.rowCount}, not 1 as expected`);
  }
};
