import { z } from 'zod';
import {
  shippingInstructionPrintHistoryInputSchema,
  shippingInstructionPrintHistoryInputWithOptionalShippingDateSchema,
  shippingInstructionPrintHistoryTbRowSchema,
} from './shippingInstructionPrintouts.schemas';

export type ShippingInstructionPrintHistoryInput = z.infer<typeof shippingInstructionPrintHistoryInputSchema>;
export type ShippingInstructionPrintHistoryInputWithOptionalShippingDate = z.infer<
  typeof shippingInstructionPrintHistoryInputWithOptionalShippingDateSchema
>;
export type ShippingInstructionPrintHistoryTbRow = z.infer<typeof shippingInstructionPrintHistoryTbRowSchema>;
