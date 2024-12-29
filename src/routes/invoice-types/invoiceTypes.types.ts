import { z } from 'zod';
import { invoiceTypesIdAndNameSchemas } from './invoiceTypes.schemas';

export type InvoiceTypesIdAndName = z.infer<typeof invoiceTypesIdAndNameSchemas>;
