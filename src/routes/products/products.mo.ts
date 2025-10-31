import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { ulid } from 'ulid';
import { z, ZodTypeAny } from 'zod';
import { ITask } from 'pg-promise';
import { NewProductSummary, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { BasicProductsTbRow, ProductSkusTbRow, ProductsTbRow } from './products.dbTable.types';
import { basicProductsTbRowSchema, productSkusTbRowSchema, productsTbRowSchema } from './products.dbTable.schemas';

const formatBasicProductData = (body: PostReqNewProduct | PostReqNewSetProduct) => ({
  name: body.basic_name,
  jan_code: body.jan_code ?? null,
  sourcing_type_id: body.sourcing_type_id,
  category_id: body.category_id,
  packaging_type_id: body.packaging_type_id,
  expiration_value: body.expiration_value,
  expiration_unit: body.expiration_unit,
  predecessor_id: body.predecessor_id ?? null,
});

const formatProductData = (body: PostReqNewProduct | PostReqNewSetProduct, basicProductsTbRow: BasicProductsTbRow) => {
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
    internal_code: body.internal_code ?? null,
    is_set_product: body.is_set_product,
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

const formatSkusData = (body: PostReqNewProduct | PostReqNewSetProduct, productsTbRow: ProductsTbRow) => ({
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

// 共通 insertOne ヘルパー
async function insertOne<S extends ZodTypeAny>(
  t: ITask<object>,
  table: string,
  input: Record<string, unknown>,
  schema: S,
  returning = '*'
): Promise<z.infer<S>> {
  const { text, values } = insert(table, input).toParams();
  try {
    const row = await t.one<unknown>(`${text} RETURNING ${returning}`, values);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(row);
  } catch (err) {
    console.error(`❌ ${table} insert failed\n`, err);
    throw new DataBaseError(err as string);
  }
}

// 完全新規登録（通常商品）
export const registerOneRegularProduct = async (body: PostReqNewProduct): Promise<NewProductSummary> =>
  db.tx('regular-product-registration', async (t) => {
    // 1. basic_products
    const basicProductsTbRow = await insertOne(
      t,
      'basic_products',
      formatBasicProductData(body),
      basicProductsTbRowSchema
    );

    // 2. products
    const productsTbRow = await insertOne(
      t,
      'products',
      formatProductData(body, basicProductsTbRow),
      productsTbRowSchema,
      '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date'
    );

    // 3. product_components (並列挿入)
    await Promise.all(
      body.components.map(async (component) => {
        const { text, values } = insert('product_components', {
          product_id: productsTbRow.id,
          title: component.title,
          symbol: component.symbol,
          amount: component.amount,
          unit_type_id: component.unit_type_id,
          pieces: component.pieces,
          inner_packaging_type_id: component.inner_packaging_type_id,
        }).toParams();

        await t.none(text, values).catch((err: string) => {
          throw new DataBaseError(err);
        });
      })
    );

    // 4. product_skus
    const productSkusTbRow: ProductSkusTbRow = await insertOne(
      t,
      'product_skus',
      formatSkusData(body, productsTbRow),
      productSkusTbRowSchema
    );

    // 5. summary
    return {
      basic_id: basicProductsTbRow.id,
      product_id: productsTbRow.id,
      sku_id: productSkusTbRow.id,
      product_name: productsTbRow.name,
      short_name: productsTbRow.short_name,
    };
  });

// 完全新規登録（セット商品）
export const registerOneSetProduct = async (body: PostReqNewSetProduct): Promise<NewProductSummary> =>
  db.tx('set-product-registration', async (t) => {
    // 1. basic_products
    const basicProductsTbRow = await insertOne(
      t,
      'basic_products',
      formatBasicProductData(body),
      basicProductsTbRowSchema
    );

    // 2. products
    const productsTbRow = await insertOne(
      t,
      'products',
      formatProductData(body, basicProductsTbRow),
      productsTbRowSchema,
      '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date'
    );

    // 3. product_combinations (並列挿入)
    await Promise.all(
      body.combinations.map(async (combination) => {
        const { text, values } = insert('product_combinations', {
          product_id: productsTbRow.id,
          item_product_id: combination.item_product_id,
          quantity: combination.quantity,
        }).toParams();

        await t.none(text, values).catch((err: string) => {
          throw new DataBaseError(err);
        });
      })
    );

    // 4. product_skus
    const productSkusTbRow: ProductSkusTbRow = await insertOne(
      t,
      'product_skus',
      formatSkusData(body, productsTbRow),
      productSkusTbRowSchema
    );

    // 5. summary
    return {
      basic_id: basicProductsTbRow.id,
      product_id: productsTbRow.id,
      sku_id: productSkusTbRow.id,
      product_name: productsTbRow.name,
      short_name: productsTbRow.short_name,
    };
  });
