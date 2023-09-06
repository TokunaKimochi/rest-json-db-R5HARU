import { DataBaseError, db } from '../db';

const findMaxSha1SameVal = async (sha1: string): Promise<{ max_same_val: string | null }> => {
  const result = await db
    .one(`SELECT MAX(sha1_same_val) AS "max_same_val" FROM customers WHERE address_sha1 = '${sha1}'`)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return result;
};

export default findMaxSha1SameVal;
