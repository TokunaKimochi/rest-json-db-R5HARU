import { z } from 'zod';
import { DataBaseError, db } from '../../db';
import { notesTbRowSchemas, paramsWithCustomerIdSchema } from './notes.schemas';

export type ParamsWithCustomerId = z.infer<typeof paramsWithCustomerIdSchema>;
export type NotesTbRow = z.infer<typeof notesTbRowSchemas>;

export const findAllNotesAboutCustomer = async (p: ParamsWithCustomerId): Promise<NotesTbRow[] | []> => {
  const result: NotesTbRow[] = await db
    .manyOrNone('SELECT * FROM notes WHERE customer_id = $1 ORDER BY rank ASC', [p.customerId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};
