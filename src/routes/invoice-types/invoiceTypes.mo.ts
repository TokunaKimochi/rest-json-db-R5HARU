import { DataBaseError, db } from '../../db';
import { InvoiceTypesIdAndName } from './invoiceTypes.types';

// eslint-disable-next-line import/prefer-default-export
export const findAllInvoiceTypes = async (): Promise<InvoiceTypesIdAndName[]> => {
  const result: InvoiceTypesIdAndName[] = await db
    .manyOrNone('SELECT id, name FROM invoice_types ORDER BY id')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};
