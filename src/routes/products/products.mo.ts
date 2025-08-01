import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { BasicProductsTbRow } from './products.dbTable.types';

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
    const { text, values } = insert('basic_products', basicInput).toParams();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const basicProductsTbRow: BasicProductsTbRow = await t
      .one(`${text} RETURNING *`, values)
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    const productInput = {
      basic_id: basicProductsTbRow.id,
      supplier_id: body.supplier_id,
      name: body.basic_name,
      short_name: body.short_name,
      internal_code: body.internal_code,
    };
  });
  console.log(body);
};

export const registerOneSetProduct = (body: PostReqNewSetProduct): void => {
  console.log(body);
};
