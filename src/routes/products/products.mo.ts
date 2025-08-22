import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { ulid } from 'ulid';
import { InsertProductsTb, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { BasicProductsTbRow, ProductsTbRow } from './products.dbTable.types';
import { productsTbRowSchema } from './products.dbTable.schemas';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const basicProductsTbRow: BasicProductsTbRow = await t
      .one(`${basicText} RETURNING *`, basicValues)
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    let productInput: InsertProductsTb = {
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
      available_date: body.available_date, // undef なら取り除く
      discontinued_date: body.discontinued_date, // undef なら取り除く
      note: body.note ?? null,
      ulid_str: ulid(),
    };
    if (!body.available_date) {
      productInput = (({ available_date, ..._rest }) => _rest)(productInput);
    }
    if (!body.discontinued_date) {
      productInput = (({ discontinued_date, ..._rest }) => _rest)(productInput);
    }
    const { text, values } = insert('products', productInput).toParams();
    const productsTbRow: ProductsTbRow = await t
      .one(`${text} RETURNING *`, values)
      .then((row) => productsTbRowSchema.parse(row))
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    console.log(productsTbRow);
  });
};

export const registerOneSetProduct = (body: PostReqNewSetProduct): void => {
  console.log(body);
};
