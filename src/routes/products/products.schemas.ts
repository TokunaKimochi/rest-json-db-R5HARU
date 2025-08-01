import { z } from 'zod';

export const commonProductsSchema = z.object({
  id: z.coerce.number().int().positive(),
  created_at: z.string().trim().max(40),
  updated_at: z.string().trim().max(40),
});

export const basicProductsSchema = z.object({
  basic_name: z.string().trim().min(1).max(32),
  jan_code: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().length(13).regex(/[0-9]/).optional()),
  sourcing_type_id: z.coerce.number().int().positive(),
  category_id: z.coerce.number().int().positive(),
  packaging_type_id: z.coerce.number().int().positive(),
  expiration_value: z.coerce.number().int().positive(),
  expiration_unit: z.enum(['D', 'M', 'Y']),
  predecessor_id: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
});

export const productsSchema = z.object({
  basic_id: z.coerce.number().int().positive(),
  supplier_id: z.coerce.number().int().positive(),
  product_name: z.string().trim().min(1).max(32),
  short_name: z.string().trim().min(1).max(32),
  internal_code: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().min(5).max(10).optional()),
  is_set_product: z.boolean(),
  depth_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  width_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  diameter_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  height_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  weight_g: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  available_date: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce
      .date()
      .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' }))
      .optional()
  ),
  discontinued_date: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce
      .date()
      .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' }))
      .optional()
  ),
  note: z.string().optional(),
});

export const aComponentSchema = z.object({
  title: z.string().trim().min(1).max(32),
  symbol: z.string().trim().min(1).max(8),
  amount: z.coerce.number().positive(),
  unit_type_id: z.coerce.number().int().positive(),
  pieces: z.coerce.number().int().positive(),
  inner_packaging_type_id: z.coerce.number().int().positive(),
});

export const productComponentsSchema = z.object({
  components: z.array(aComponentSchema).min(1),
});

export const aCombinationSchema = z.object({
  item_product_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

export const productCombinationsSchema = z.object({
  combinations: z.array(aCombinationSchema).min(1),
});

export const productSkusSchema = z.object({
  skus_name: z.string().trim().min(1).max(32),
  product_id: z.coerce.number().int().positive(),
  case_quantity: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  inner_carton_quantity: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  itf_case_code: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().trim().length(14).regex(/[0-9]/).optional()
  ),
  itf_inner_carton_code: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().trim().length(14).regex(/[0-9]/).optional()
  ),
  case_height_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  case_width_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  case_depth_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  case_weight_g: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  inner_carton_height_mm: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().optional()
  ),
  inner_carton_width_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  inner_carton_depth_mm: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  inner_carton_weight_g: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  priority: z.enum(['A', 'B', 'C']),
});

// 仕入先の新規登録
export const postReqNewSupplierSchema = z.object({
  tel: z
    .string()
    .min(1)
    .min(3)
    .max(13)
    .regex(/^[0-9-]+$/)
    .refine((val: string) => {
      const phoneNumber = val.replace(/\D/g, '');
      if (/104/.test(phoneNumber)) return true;
      if (phoneNumber.length === 10) return true;
      if (phoneNumber.length === 11) return true;
      return false;
    }),
  fax: z
    .string()
    .max(12)
    .regex(/^[0-9-]*$/)
    .refine((val: string) => {
      const faxNumber = val.replace(/\D/g, '');
      if (faxNumber.length === 10) return true;
      if (faxNumber.length === 0) return true;
      return false;
    }),
  url: z.union([z.string().max(255).url(), z.string().length(0)]),
  zip_code: z
    .string()
    .min(1)
    .min(7)
    .max(8)
    .regex(/^[0-9-]+$/)
    .refine((val: string) => {
      const zipCode = val.replace(/\D/g, '');
      if (zipCode.length === 7) return true;
      return false;
    }),
  address1: z.string().min(1).max(32),
  address2: z.string().max(32),
  address3: z.string().max(32),
  name1: z.string().min(1).max(30),
  name2: z.string().max(30),
  contact_person_name: z.string().max(32),
  contact_person_phone: z
    .string()
    .max(13)
    .regex(/^[0-9-]*$/)
    .refine((val: string) => {
      const phoneNumber = val.replace(/\D/g, '');
      if (phoneNumber.length === 10) return true;
      if (phoneNumber.length === 11) return true;
      if (phoneNumber.length === 0) return true;
      return false;
    }),
  contact_person_email: z.union([z.string().max(255).email(), z.string().length(0)]),
  note: z.string(),
});

// 完全新規登録（通常商品）
export const postReqNewProductSchema = basicProductsSchema.extend({
  // product_name は basicProductsSchema.basic_name をコピー
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  ...productsSchema.extend({ is_set_product: z.literal(false) }).omit({ basic_id: true, product_name: true }).shape,
  ...productComponentsSchema.shape,
  // skus_name は productsSchema.short_name をコピー
  // product_id はコピー
  ...productSkusSchema.omit({ skus_name: true, product_id: true }).shape,
});

// 完全新規登録（セット商品）
export const postReqNewSetProductSchema = basicProductsSchema.extend({
  // product_name は basicProductsSchema.basic_name をコピー
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  ...productsSchema.extend({ is_set_product: z.literal(true) }).omit({ basic_id: true, product_name: true }).shape,
  ...productCombinationsSchema.shape,
  // skus_name は productsSchema.short_name をコピー
  // product_id はコピー
  ...productSkusSchema.omit({ skus_name: true, product_id: true }).shape,
});

// （通常商品の）内容量変更などの既存商品のバリエーション（JAN は同じ）
export const postReqProductVariantSchema = productsSchema.extend({
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  is_set_product: z.literal(false),
  ...productComponentsSchema.shape,
  // skus_name は productsSchema.short_name をコピー
  // product_id はコピー
  ...productSkusSchema.omit({ skus_name: true, product_id: true }).shape,
});

// （セット商品の）内容量変更などの既存商品のバリエーション（JAN は同じ）
export const postReqSetProductVariantSchema = productsSchema.extend({
  // ulid_str はサーバ側で計算
  // is_set_product を上書き extend()
  is_set_product: z.literal(true),
  ...productCombinationsSchema.shape,
  // skus_name は productsSchema.short_name をコピー
  // product_id はコピー
  ...productSkusSchema.omit({ skus_name: true, product_id: true }).shape,
});

// ケースの入り数違い
export const postReqNewProductSkuSchema = productSkusSchema;
