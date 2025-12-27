import { z } from 'zod';
import {
  aCombinationSchema,
  aComponentSchema,
  basicProductsSchema,
  commonProductsSchema,
  productSkusSchema,
  productsSchema,
} from './products.schemas';

export const basicProductsTbRowSchema = commonProductsSchema
  .merge(basicProductsSchema)
  .omit({
    basic_name: true,
  })
  .extend({
    name: z.string().trim().min(1).max(32),
    jan_code: z.string().trim().length(13).regex(/[0-9]/).nullable(),
    predecessor_id: z.number().int().positive().nullable(),
  });

export const productsTbRowSchema = commonProductsSchema
  .merge(productsSchema)
  .omit({ product_name: true })
  .extend({
    name: z.string().trim().min(1).max(32),
    available_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式で入力してください'),
    discontinued_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式で入力してください'),
    internal_code: z.string().trim().min(5).max(10).nullable(),
    is_set_product: z.boolean(),
    depth_mm: z.number().int().positive().nullable(),
    width_mm: z.number().int().positive().nullable(),
    diameter_mm: z.number().int().positive().nullable(),
    height_mm: z.number().int().positive().nullable(),
    weight_g: z.number().int().positive().nullable(),
    note: z.string().nullable(),
    ulid_str: z.string().ulid(),
  });

export const productComponentsTbRowSchema = commonProductsSchema
  .merge(aComponentSchema)
  .extend({ product_id: z.number().int().positive() });

export const productCombinationsTbRowSchema = commonProductsSchema
  .merge(aCombinationSchema)
  .extend({ product_id: z.number().int().positive() });

export const productSkusTbRowSchema = commonProductsSchema
  .merge(productSkusSchema)
  .omit({ skus_name: true })
  .extend({
    name: z.string().trim().min(1).max(32),
    case_quantity: z.number().int().positive().nullable(),
    inner_carton_quantity: z.number().int().positive().nullable(),
    itf_case_code: z.string().trim().length(14).regex(/[0-9]/).nullable(),
    itf_inner_carton_code: z.string().trim().length(14).regex(/[0-9]/).nullable(),
    case_height_mm: z.number().int().positive().nullable(),
    case_width_mm: z.number().int().positive().nullable(),
    case_depth_mm: z.number().int().positive().nullable(),
    case_weight_g: z.number().int().positive().nullable(),
    inner_carton_height_mm: z.number().int().positive().nullable(),
    inner_carton_width_mm: z.number().int().positive().nullable(),
    inner_carton_depth_mm: z.number().int().positive().nullable(),
    inner_carton_weight_g: z.number().int().positive().nullable(),
  });
