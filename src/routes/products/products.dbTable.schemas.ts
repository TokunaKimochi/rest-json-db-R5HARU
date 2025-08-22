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
  .extend({
    available_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式で入力してください'),
    discontinued_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式で入力してください'),
    internal_code: z.string().trim().min(5).max(10).nullable(),
    depth_mm: z.number().int().positive().nullable(),
    width_mm: z.number().int().positive().nullable(),
    diameter_mm: z.number().int().positive().nullable(),
    height_mm: z.number().int().positive().nullable(),
    weight_g: z.number().int().positive().nullable(),
    note: z.string().nullable(),
    ulid: z.string().ulid(),
  })
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
