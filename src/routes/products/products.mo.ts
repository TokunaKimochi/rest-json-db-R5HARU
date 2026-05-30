import { DataBaseError, db } from '@/db';
import { ulid } from 'ulid';
import { z } from 'zod';
import { ParamsWithProductId, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import {
  BasicProductsTbRow,
  ProductsTbRow,
  ViewProductCombinationsArray,
  ViewProductComponentsArray,
  ViewSingleProductsRow,
  ViewSkuDetailsRow,
} from './products.dbTable.types';
import {
  viewProductCombinationsArraySchema,
  viewProductComponentsArraySchema,
  viewSingleProductsRowSchema,
  viewSkuDetailsRowSchema,
} from './products.dbTable.schemas';

export const CATEGORY_ID = {
  UNCATEGORIZED: { Int: 1, Str: '未分類' },
  OTHERS: { Int: 2, Str: 'その他' },
} as const;

export const formatBasicProductData = (body: PostReqNewProduct | PostReqNewSetProduct) => ({
  name: body.basic_name,
  internal_code: body.internal_code ?? null,
  jan_code: body.jan_code ?? null,
  sourcing_type_id: body.sourcing_type_id,
  packaging_type_id: body.packaging_type_id,
  expiration_value: body.expiration_value ?? null,
  expiration_unit: body.expiration_unit ?? null,
  predecessor_id: body.predecessor_id ?? null,
});

export const formatProductData = (
  body: PostReqNewProduct | PostReqNewSetProduct,
  basicProductsTbRow: BasicProductsTbRow,
  category_id: number,
  display_category_name: string,
  is_assorted: boolean
) => {
  const productInput = ((o) =>
    // 最後にオブジェクトに戻す
    Object.fromEntries(
      // [key,value] の配列に変換
      Object.entries(o)
        // 値が undefined のものを排除
        .filter(([, v]) => v !== undefined)
    ))({
    basic_id: basicProductsTbRow.id,
    supplier_id: body.supplier_id,
    name: body.basic_name,
    short_name: body.short_name,
    is_set_product: body.is_set_product,
    cached_category_id: category_id,
    display_category_name: is_assorted ? `${display_category_name} 他` : display_category_name,
    is_assorted,
    depth_mm: body.depth_mm ?? null,
    width_mm: body.width_mm ?? null,
    diameter_mm: body.diameter_mm ?? null,
    height_mm: body.height_mm ?? null,
    weight_g: body.weight_g ?? null,
    available_date: body.available_date,
    discontinued_date: body.discontinued_date,
    note: body.note ?? null,
    ulid_str: ulid(),
  });
  return productInput;
};

export const formatSkusData = (body: PostReqNewProduct | PostReqNewSetProduct, productsTbRow: ProductsTbRow) => ({
  product_id: productsTbRow.id,
  name: body.short_name,
  case_quantity: body.case_quantity ?? null,
  inner_carton_quantity: body.inner_carton_quantity ?? null,
  itf_case_code: body.itf_case_code ?? null,
  itf_inner_carton_code: body.itf_inner_carton_code ?? null,
  case_depth_mm: body.case_depth_mm ?? null,
  case_width_mm: body.case_width_mm ?? null,
  case_height_mm: body.case_height_mm ?? null,
  case_weight_g: body.case_weight_g ?? null,
  inner_carton_depth_mm: body.inner_carton_depth_mm ?? null,
  inner_carton_width_mm: body.inner_carton_width_mm ?? null,
  inner_carton_height_mm: body.inner_carton_height_mm ?? null,
  inner_carton_weight_g: body.inner_carton_weight_g ?? null,
  priority: body.priority,
});

export const findAllSingleProducts = async (): Promise<ViewSingleProductsRow[]> => {
  const rows = await db
    .manyOrNone('SELECT * FROM v_single_products ORDER BY product_id')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = z.array(viewSingleProductsRowSchema).safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};

export const findAllProductSkuDetails = async (): Promise<ViewSkuDetailsRow[]> => {
  const rows = await db
    .manyOrNone('SELECT * FROM v_sku_details ORDER BY sku_id')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = z.array(viewSkuDetailsRowSchema).safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};

export const findAllCombinationsAboutProduct = async (
  p: ParamsWithProductId
): Promise<ViewProductCombinationsArray> => {
  const rows = await db
    .manyOrNone('SELECT * FROM v_product_combinations WHERE product_id = $1 ORDER BY combination_id ASC', [p.productId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = viewProductCombinationsArraySchema.safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};

export const findAllComponentsAboutProduct = async (p: ParamsWithProductId): Promise<ViewProductComponentsArray> => {
  const rows = await db
    .manyOrNone('SELECT * FROM v_product_components WHERE product_id = $1 ORDER BY component_id ASC', [p.productId])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = viewProductComponentsArraySchema.safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};
