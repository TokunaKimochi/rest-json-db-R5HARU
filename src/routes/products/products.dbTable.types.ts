import { z } from 'zod';
import {
  basicProductsTbRowSchema,
  productCombinationsTbRowSchema,
  productComponentsTbRowSchema,
  productSkusTbRowSchema,
  productsTbRowSchema,
} from './products.dbTable.schemas';

export type BasicProductsTbRow = z.infer<typeof basicProductsTbRowSchema>;
export type ProductsTbRow = z.infer<typeof productsTbRowSchema>;
export type ProductComponentsTbRow = z.infer<typeof productComponentsTbRowSchema>;
export type ProductCombinationsTbRow = z.infer<typeof productCombinationsTbRowSchema>;
export type ProductSkusTbRow = z.infer<typeof productSkusTbRowSchema>;
