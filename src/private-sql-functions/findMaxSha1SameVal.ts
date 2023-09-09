import { DataBaseError, db } from '../db';

export default async function findMaxSha1SameVal(sha1: string): Promise<number | null> {
  const result = await db
    .one(`SELECT MAX(sha1_same_val) AS "max_same_val" FROM customers WHERE address_sha1 = '${sha1}'`)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return result.max_same_val;
}
