import { z } from 'zod';
import {
  findShippingInstructionsQuerySchema,
  shippingInstructionPrintHistoryIDSchema,
  shippingInstructionPrintHistoryInputSchema,
  shippingInstructionPrintHistoryTbRowSchema,
} from './shippingInstructionPrintouts.schemas';

export type ShippingInstructionPrintHistoryInput = z.infer<typeof shippingInstructionPrintHistoryInputSchema>;
export type ShippingInstructionPrintHistoryTbRow = z.infer<typeof shippingInstructionPrintHistoryTbRowSchema>;
export type FindShippingInstructionsQuery = z.infer<typeof findShippingInstructionsQuerySchema>;
export type ShippingInstructionPrintHistoryID = z.infer<typeof shippingInstructionPrintHistoryIDSchema>;
// branded types プロパティを削ぎ落とす
export type ShippingInstructionPrintHistoryIDWithoutBrand = Omit<ShippingInstructionPrintHistoryID, typeof z.BRAND>;
