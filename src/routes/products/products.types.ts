import { z } from 'zod';
import {
  newProductSummarySchema,
  paramsWithProductIdSchema,
  postReqNewProductSchema,
  postReqNewProductSkuSchema,
  postReqNewSetProductSchema,
  postReqProductVariantSchema,
  postReqSetProductVariantSchema,
  productSkusSchema,
  putReqProductSchema,
  putReqSetProductSchema,
  queryWithBasicIdSchema,
} from './products.schemas';

export type ProductSkus = z.infer<typeof productSkusSchema>;

export type PostReqNewProduct = z.infer<typeof postReqNewProductSchema>;
export type PostReqNewSetProduct = z.infer<typeof postReqNewSetProductSchema>;
export type PostReqProductVariant = z.infer<typeof postReqProductVariantSchema>;
export type PostReqSetProductVariant = z.infer<typeof postReqSetProductVariantSchema>;
export type PostReqNewProductSku = z.infer<typeof postReqNewProductSkuSchema>;
export type NewProductSummary = z.infer<typeof newProductSummarySchema>;
export type PutReqProduct = z.infer<typeof putReqProductSchema>;
export type PutReqSetProduct = z.infer<typeof putReqSetProductSchema>;
export type ParamsWithProductId = z.infer<typeof paramsWithProductIdSchema>;
export type QueryWithBasicId = z.infer<typeof queryWithBasicIdSchema>;
