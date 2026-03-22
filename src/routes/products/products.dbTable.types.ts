import { z } from 'zod';
import {
  basicProductsTbRowSchema,
  productCombinationsTbRowSchema,
  productComponentsTbRowSchema,
  productSkusTbRowSchema,
  productsTbRowSchema,
  viewProductCombinationsArraySchema,
  viewProductCombinationsRowSchema,
  viewProductComponentsArraySchema,
  viewProductComponentsRowSchema,
  viewSingleProductsRowSchema,
  viewSkuDetailsRowSchema,
} from './products.dbTable.schemas';

export type BasicProductsTbRow = z.infer<typeof basicProductsTbRowSchema>;
export type ProductsTbRow = z.infer<typeof productsTbRowSchema>;
export type ProductComponentsTbRow = z.infer<typeof productComponentsTbRowSchema>;
export type ProductCombinationsTbRow = z.infer<typeof productCombinationsTbRowSchema>;
export type ProductSkusTbRow = z.infer<typeof productSkusTbRowSchema>;
export type ViewSingleProductsRow = z.infer<typeof viewSingleProductsRowSchema>;
export type ViewSkuDetailsRow = z.infer<typeof viewSkuDetailsRowSchema>;
export type ViewProductCombinationsRow = z.infer<typeof viewProductCombinationsRowSchema>;
export type ViewProductCombinationsArray = z.infer<typeof viewProductCombinationsArraySchema>;
export type ViewProductComponentsRow = z.infer<typeof viewProductComponentsRowSchema>;
export type ViewProductComponentsArray = z.infer<typeof viewProductComponentsArraySchema>;
