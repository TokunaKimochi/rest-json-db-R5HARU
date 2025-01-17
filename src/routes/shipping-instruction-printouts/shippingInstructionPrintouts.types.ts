import { z } from 'zod';
import shippingInstructionPrintHistoryTbRowSchema from './shippingInstructionPrintouts.schemas';

export type ShippingInstructionPrintHistoryTbRow = z.infer<typeof shippingInstructionPrintHistoryTbRowSchema>;
