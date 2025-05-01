import { z } from 'zod';
import {
  findShippingInstructionsQuerySchema,
  shippingInstructionModificationSchema,
  shippingInstructionPrintIDSchema,
  shippingInstructionPrintInputSchema,
  shippingInstructionHistoryTbRowSchema,
} from './shippingInstructionPrintouts.schemas';

export type ShippingInstructionPrintInput = z.infer<typeof shippingInstructionPrintInputSchema>;
export type ShippingInstructionModification = z.infer<typeof shippingInstructionModificationSchema>;
export type ShippingInstructionHistoryTbRow = z.infer<typeof shippingInstructionHistoryTbRowSchema>;
export type FindShippingInstructionsQuery = z.infer<typeof findShippingInstructionsQuerySchema>;
export type ShippingInstructionPrintID = z.infer<typeof shippingInstructionPrintIDSchema>;
// branded types プロパティを削ぎ落とす
export type ShippingInstructionPrintIDWithoutBrand = Omit<ShippingInstructionPrintID, typeof z.BRAND>;
