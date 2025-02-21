import { z } from 'zod';
import {
  findShippingInstructionsQuerySchema,
  shippingInstructionPrintHistoryInputSchema,
  shippingInstructionPrintHistoryTbRowSchema,
} from './shippingInstructionPrintouts.schemas';

export type ShippingInstructionPrintHistoryInput = z.infer<typeof shippingInstructionPrintHistoryInputSchema>;
export type ShippingInstructionPrintHistoryTbRow = z.infer<typeof shippingInstructionPrintHistoryTbRowSchema>;
export type FindShippingInstructionsQuery = z.infer<typeof findShippingInstructionsQuerySchema>;
