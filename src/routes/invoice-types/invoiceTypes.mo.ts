import { z } from 'zod';
import { DataBaseError, db } from '../../db';
import { invoiceTypesIdAndNameSchemas } from './invoiceTypes.schemas';

export type InvoiceTypesIdAndName = z.infer<typeof invoiceTypesIdAndNameSchemas>;

export const findAllInvoiceTypes = async (): Promise<InvoiceTypesIdAndName[]> => {
  const result: InvoiceTypesIdAndName[] = await db
    .manyOrNone('SELECT id, name FROM invoice_types ORDER BY id')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};
