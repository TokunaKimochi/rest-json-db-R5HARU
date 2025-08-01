import { z } from 'zod';
import {
  aCombinationSchema,
  aComponentSchema,
  basicProductsSchema,
  commonProductsSchema,
  productSkusSchema,
  productsSchema,
} from './products.schemas';

export const basicProductsTbRowSchema = commonProductsSchema.merge(basicProductsSchema).transform((data) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { basic_name, ...rest } = data;
  return {
    ...rest,
    name: basic_name,
  };
});

export const productsTbRowSchema = commonProductsSchema
  .merge(productsSchema)
  .extend({ ulid: z.string().ulid() })
  .transform((data) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { product_name, ...rest } = data;
    return {
      ...rest,
      name: product_name,
    };
  });

export const productComponentsTbRowSchema = commonProductsSchema
  .merge(aComponentSchema)
  .extend({ product_id: z.number().int().positive() });

export const productCombinationsTbRowSchema = commonProductsSchema
  .merge(aCombinationSchema)
  .extend({ product_id: z.number().int().positive() });

export const productSkusTbRowSchema = commonProductsSchema.merge(productSkusSchema);
