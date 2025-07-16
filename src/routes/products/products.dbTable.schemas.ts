import { z } from 'zod';
import {
  aCombinationSchema,
  aComponentSchema,
  basicProductsSchema,
  commonProductsSchema,
  productSkusSchema,
  productsSchema,
} from './products.schemas';

export const basicProductsTbRowSchema = commonProductsSchema.merge(basicProductsSchema);

export const productsTbRowSchema = commonProductsSchema.merge(productsSchema).extend({ ulid: z.string().ulid() });

export const productComponentsTbRowSchema = commonProductsSchema
  .merge(aComponentSchema)
  .extend({ product_id: z.number().int().positive() });

export const productCombinationsTbRowSchema = commonProductsSchema
  .merge(aCombinationSchema)
  .extend({ product_id: z.number().int().positive() });

export const productSkusTbRowSchema = commonProductsSchema.merge(productSkusSchema);
