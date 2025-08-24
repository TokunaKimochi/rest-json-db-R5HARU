import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { ulid } from 'ulid';
import { InsertProductsTb, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { BasicProductsTbRow, ProductsTbRow } from './products.dbTable.types';
import {
  basicProductsTbRowSchema,
  productComponentsTbRowSchema,
  productsTbRowSchema,
} from './products.dbTable.schemas';

export const registerOneRegularProduct = async (body: PostReqNewProduct): Promise<void> => {
  // 完全新規登録（通常商品）
  await db.tx('regular-product-registration', async (t) => {
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
    const basicProductsTbRow: BasicProductsTbRow = await t
      .one(`${basicText} RETURNING *`, basicValues)
      .then((row) => basicProductsTbRowSchema.parse(row))
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    const productInput: InsertProductsTb = {
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
      available_date: body.available_date, // undef なら pgp でデフォルトに変換される
      discontinued_date: body.discontinued_date, // undef なら pgp でデフォルトに変換される
      note: body.note ?? null,
      ulid_str: ulid(),
    };
    const { text, values } = insert('products', productInput).toParams();
    const productsTbRow: ProductsTbRow = await t
      .one(`${text} RETURNING *`, values)
      .then((row) => productsTbRowSchema.parse(row))
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

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

        return t
          .one(`${componentText} RETURNING *`, componentValues)
          .then((row) => productComponentsTbRowSchema.parse(row))
          .catch((err: string) => {
            throw new DataBaseError(err);
          });
      })
    );
  });
};

export const registerOneSetProduct = (body: PostReqNewSetProduct): void => {
  console.log(body);
};
