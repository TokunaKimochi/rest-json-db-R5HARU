import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { ulid } from 'ulid';
import { NewProductSummary, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { BasicProductsTbRow, ProductSkusTbRow, ProductsTbRow } from './products.dbTable.types';
import { basicProductsTbRowSchema, productSkusTbRowSchema, productsTbRowSchema } from './products.dbTable.schemas';

export const registerOneRegularProduct = async (body: PostReqNewProduct): Promise<NewProductSummary> => {
  // 完全新規登録（通常商品）
  const newProductSummary = await db.tx('regular-product-registration', async (t) => {
    const basicInput = {
      name: body.basic_name,
      jan_code: body.jan_code ?? null,
      sourcing_type_id: body.sourcing_type_id,
      category_id: body.category_id,
      packaging_type_id: body.packaging_type_id,
      expiration_value: body.expiration_value,
      expiration_unit: body.expiration_unit,
      predecessor_id: body.predecessor_id ?? null,
    };
    const { text: basicText, values: basicValues } = insert('basic_products', basicInput).toParams();
    let basicProductsTbRow: BasicProductsTbRow;
    try {
      basicProductsTbRow = await t
        .one(`${basicText} RETURNING *`, basicValues)
        .then((row) => basicProductsTbRowSchema.parse(row));
    } catch (err) {
      console.error('❌ basic_products insert failed\n', err);
      throw new DataBaseError(err as string);
    }

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
    console.log(productInput);
    const { text, values } = insert('products', productInput).toParams();
    let productsTbRow: ProductsTbRow;
    try {
      productsTbRow = await t
        .one(
          `${text} RETURNING *, available_date::text AS available_date, discontinued_date::text AS discontinued_date`,
          values
        )
        .then((row) => productsTbRowSchema.parse(row));
    } catch (err) {
      console.error('❌ products insert failed\n', err);
      throw new DataBaseError(err as string);
    }
    // Promise.all で並列実行
    await Promise.all(
      body.components.map(async (component) => {
        const componentInput = {
          product_id: productsTbRow.id,
          title: component.title,
          symbol: component.symbol,
          amount: component.amount,
          unit_type_id: component.unit_type_id,
          pieces: component.pieces,
          inner_packaging_type_id: component.inner_packaging_type_id,
        };
        const { text: componentText, values: componentValues } = insert(
          'product_components',
          componentInput
        ).toParams();

        await t.none(componentText, componentValues).catch((err: string) => {
          throw new DataBaseError(err);
        });
      })
    );

    const skusInput = {
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
    };
    const { text: skusText, values: skusValues } = insert('product_skus', skusInput).toParams();

    let productSkusTbRow: ProductSkusTbRow;
    try {
      productSkusTbRow = await t
        .one(`${skusText} RETURNING *`, skusValues)
        .then((row) => productSkusTbRowSchema.parse(row));
    } catch (err) {
      console.error('❌ product_skus insert failed\n', err);
      throw new DataBaseError(err as string);
    }

    return {
      basic_id: basicProductsTbRow.id,
      product_id: productsTbRow.id,
      sku_id: productSkusTbRow.id,
      product_name: productsTbRow.name,
      short_name: productsTbRow.short_name,
    };
  });
  return newProductSummary;
};

export const registerOneSetProduct = (body: PostReqNewSetProduct): void => {
  console.log(body);
};
