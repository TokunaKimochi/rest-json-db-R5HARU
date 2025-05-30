import { z } from 'zod';

export const commonProductsSchema = z.object({
  id: z.coerce.number().int().positive(),
  created_at: z.string().trim().max(40),
  updated_at: z.string().trim().max(40),
});

const basicProductsSchema = z.object({
  name: z.string().trim().min(1).max(32),
  jan_code: z.string().trim().length(13).regex(/[0-9]/).optional(),
  sourcing_type_id: z.coerce.number().int().positive(),
  category_id: z.coerce.number().int().positive(),
  packaging_type_id: z.coerce.number().int().positive(),
  expiration_value: z.coerce.number().int().positive(),
  expiration_unit: z.enum(['D', 'M', 'Y']),
  predecessor_id: z.coerce.number().int().positive().optional(),
});

const productsSchema = z.object({
  // name を省略
  short_name: z.string().trim().max(32),
  internal_code: z.string().trim().max(10).optional(),
  is_set_product: z.boolean(),
  height_mm: z.coerce.number().int().positive().optional(),
  width_mm: z.coerce.number().int().positive().optional(),
  depth_mm: z.coerce.number().int().positive().optional(),
  weight_g: z.coerce.number().int().positive().optional(),
  available_date: z.coerce
    .date()
    .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })),
  discontinued_date: z.coerce
    .date()
    .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' }))
    .optional(),
  note: z.string().trim().optional(),
});

const productComponentsSchema = z.object({
  components: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(32),
        symbol: z.string().trim().min(1).max(8),
        amount: z.coerce.number().positive(),
        unit_type_id: z.coerce.number().int().positive(),
        pieces: z.coerce.number().int().positive(),
        inner_packaging_type_id: z.coerce.number().int().positive(),
      })
    )
    .min(1),
});

const productCombinationsSchema = z.object({
  combinations: z
    .array(
      z.object({
        product_id: z.coerce.number().int().positive(),
        item_product_id: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1),
});

const productSkusSchema = z.object({
  // name を省略
  case_quantity: z.coerce.number().int().positive().optional(),
  inner_carton_quantity: z.coerce.number().int().positive().optional(),
  itf_case_code: z.string().trim().length(14).regex(/[0-9]/).optional(),
  itf_inner_carton_code: z.string().trim().length(14).regex(/[0-9]/).optional(),
  case_height_mm: z.coerce.number().int().positive().optional(),
  case_width_mm: z.coerce.number().int().positive().optional(),
  case_depth_mm: z.coerce.number().int().positive().optional(),
  case_weight_g: z.coerce.number().int().positive().optional(),
  inner_carton_height_mm: z.coerce.number().int().positive().optional(),
  inner_carton_width_mm: z.coerce.number().int().positive().optional(),
  inner_carton_depth_mm: z.coerce.number().int().positive().optional(),
  inner_carton_weight_g: z.coerce.number().int().positive().optional(),
  priority: z.enum(['A', 'B', 'C']),
});

// 完全新規登録（通常商品）
export const postReqNewProductSchema = basicProductsSchema.extend({
  // name は basicProductsSchema.name をコピー
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  ...productsSchema.extend({ is_set_product: z.literal(false) }).shape,
  ...productComponentsSchema.shape,
  // name は productsSchema.short_name をコピー
  ...productSkusSchema.shape,
});

// 完全新規登録（セット商品）
export const postReqNewSetProductSchema = basicProductsSchema.extend({
  // name は basicProductsSchema.name をコピー
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  ...productsSchema.extend({ is_set_product: z.literal(true) }).shape,
  ...productCombinationsSchema.shape,
  // name は productsSchema.short_name をコピー
  ...productSkusSchema.shape,
});

// （通常商品の）内容量変更などの既存商品のバリエーション（JAN は同じ）
export const postReqProductVariantSchema = productsSchema.extend({
  // ulid_str はサーバ側で計算
  basic_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(32),
  // is_set_product を上書き extend()
  is_set_product: z.literal(false),
  ...productComponentsSchema.shape,
  // name は productsSchema.short_name をコピー
  ...productSkusSchema.shape,
});

// （セット商品の）内容量変更などの既存商品のバリエーション（JAN は同じ）
export const postReqSetProductVariantSchema = productsSchema.extend({
  // ulid_str はサーバ側で計算
  basic_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(32),
  // is_set_product を上書き extend()
  is_set_product: z.literal(true),
  ...productCombinationsSchema.shape,
  // name は productsSchema.short_name をコピー
  ...productSkusSchema.shape,
});

// ケースの入り数違い
export const postReqNewProductSkuSchema = productSkusSchema.extend({
  product_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(32),
});
