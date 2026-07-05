import { z } from 'zod';
import {
  newProductSummarySchema,
  paramsWithProductIdSchema,
  paramsWithProductSkusIdSchema,
  postReqNewProductSchema,
  postReqNewSetProductSchema,
  postReqProductRevisionSchema,
  postReqSetProductRevisionSchema,
  postReqUnifiedRevisionSchema,
  productSkusSchema,
  putReqProductSchema,
  putReqSetProductSchema,
  queryWithBasicIdSchema,
} from './products.schemas';

export type ProductSkus = z.infer<typeof productSkusSchema>;

export type PostReqNewProduct = z.infer<typeof postReqNewProductSchema>;
export type PostReqNewSetProduct = z.infer<typeof postReqNewSetProductSchema>;
export type PostReqProductRevision = z.infer<typeof postReqProductRevisionSchema>;
export type PostReqSetProductRevision = z.infer<typeof postReqSetProductRevisionSchema>;
export type PostReqUnifiedRevision = z.infer<typeof postReqUnifiedRevisionSchema>;
export type NewProductSummary = z.infer<typeof newProductSummarySchema>;
export type PutReqProduct = z.infer<typeof putReqProductSchema>;
export type PutReqSetProduct = z.infer<typeof putReqSetProductSchema>;
export type ParamsWithProductId = z.infer<typeof paramsWithProductIdSchema>;
export type ParamsWithProductSkusId = z.infer<typeof paramsWithProductSkusIdSchema>;
export type QueryWithBasicId = z.infer<typeof queryWithBasicIdSchema>;
