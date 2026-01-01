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

export const viewSingleProductsRowSchema = z.object({
  // Product (単体商品)
  product_id: z.number().int().positive(),
  product_name: z.string().min(1).max(32),
  product_short_name: z.string().min(1).max(32),
  internal_code: z.string().min(5).max(10).nullable(),
  available_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  discontinued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  depth_mm: z.number().int().positive().nullable(),
  width_mm: z.number().int().positive().nullable(),
  diameter_mm: z.number().int().positive().nullable(),
  height_mm: z.number().int().positive().nullable(),
  weight_g: z.number().int().positive().nullable(),
  product_note: z.string().nullable(),
  ulid_str: z.string().ulid(),
  // Basic Product
  basic_product_name: z.string().min(1).max(32),
  jan_code: z.string().length(13).regex(/[0-9]/).nullable(),
  predecessor_id: z.number().int().positive().nullable(),
  expiration_value: z.number().int().positive(),
  expiration_unit: z.enum(['D', 'M', 'Y']),
  sourcing_type: z.string().min(1).max(32),
  category_name: z.string().min(1).max(32),
  packaging_type: z.string().min(1).max(32),
  // Supplier
  // 半角スペースで連結のため name1.length + name2.length + 1
  supplier_name: z.string().min(1).max(61),
  // First Component (代表成分・内容量)
  component_title: z.string().min(1).max(32),
  component_symbol: z.string().min(1).max(8),
  component_amount: z.number().positive(),
  component_unit_name: z.string().min(1).max(8),
  component_pieces: z.number().int().positive(),
  component_inner_packaging_type: z.string().min(1).max(32),
});
