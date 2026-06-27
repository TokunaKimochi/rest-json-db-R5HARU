import { DataBaseError, db } from '@/db';
import UnexpectedError from '@/classes/unexpected-error';
import { update } from 'sql-bricks';
import jaconv from 'jaconv';
import { NewProductSummary, PutReqProduct, PutReqSetProduct } from './products.types';
import {
  formatBasicProductData,
  formatProductData,
  formatSkusData,
  insertTags,
  resolveRegularCategory,
  resolveSetCategory,
  upsertOne,
} from './products.mo';
import {
  basicProductsTbRowSchema,
  productCombinationsTbRowSchema,
  productComponentsTbRowSchema,
  productSkusTbRowSchema,
  productsTbRowSchema,
} from './products.dbTable.schemas';

export const updateOneRegularProduct = async (
  body: PutReqProduct
): Promise<
  | { isUpdated: true; rows: NewProductSummary }
  | {
      isUpdated: false;
      uniqueConstraintError: {
        key: string;
        value: string;
      };
    }
> =>
  db.tx('regular-product-updates', async (t) => {
    // 1. basic_products
    const basicProductsTbResults = await upsertOne({
      t,
      table: 'basic_products',
      input: formatBasicProductData(body),
      schema: basicProductsTbRowSchema,
      updateId: body.basic_id,
    });
    if (basicProductsTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${basicProductsTbResults.uniqueConstraintError.table}.${basicProductsTbResults.uniqueConstraintError.column}`,
          value: basicProductsTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (body.basic_id !== basicProductsTbResults.rows.id)
      throw new UnexpectedError('Inconsistent ID value in table `basic_products`');

    // 2. products
    const { resolvedCategoryId, resolvedCategoryName, isAssorted } = await resolveRegularCategory(t, body);
    const productsTbResults = await upsertOne({
      t,
      table: 'products',
      input: formatProductData(
        body,
        basicProductsTbResults.rows,
        resolvedCategoryId,
        resolvedCategoryName,
        isAssorted,
        'edit'
      ),
      schema: productsTbRowSchema,
      returning: '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date',
      updateId: body.product_id,
    });
    if (productsTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${productsTbResults.uniqueConstraintError.table}.${productsTbResults.uniqueConstraintError.column}`,
          value: productsTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (body.product_id !== productsTbResults.rows.id)
      throw new UnexpectedError('Inconsistent ID value in table `products`');

    // 3. product_components (並列挿入)
    await Promise.all(
      body.components.map(async (component) => {
        const { text, values } = update('product_components', {
          product_id: productsTbResults.rows.id,
          title: component.title,
          category_id: component.category_id,
          symbol: jaconv.toHanAscii(component.symbol),
          amount: component.amount,
          unit_type_id: component.unit_type_id,
          pieces: component.pieces,
          inner_packaging_type_id: component.inner_packaging_type_id,
        })
          .where('id', component.component_id)
          .toParams();

        const row = await t.one<unknown>(`${text} RETURNING *`, values).catch((err: string) => {
          throw new DataBaseError(err);
        });
        const { id } = productComponentsTbRowSchema.parse(row);
        if (component.component_id !== id)
          throw new UnexpectedError('Inconsistent ID value in table `product_components`');
      })
    );

    // 4. product_skus
    const productSkusTbResults = await upsertOne({
      t,
      table: 'product_skus',
      input: formatSkusData(body, productsTbResults.rows),
      schema: productSkusTbRowSchema,
      updateId: body.sku_id,
    });
    if (productSkusTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${productSkusTbResults.uniqueConstraintError.table}.${productSkusTbResults.uniqueConstraintError.column}`,
          value: productSkusTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (productSkusTbResults.rows.id !== body.sku_id)
      throw new UnexpectedError('Inconsistent ID value in table `product_skus`');

    // 5.1. 関連タグを一旦全て消し、
    await t
      .none('DELETE FROM product_sku_tags WHERE product_skus_id = $1', [productSkusTbResults.rows.id])
      .catch((err: unknown) => {
        if (err instanceof Error) throw new DataBaseError(err.message);
        throw new UnexpectedError(
          `エラー :: updateOneRegularProduct() 内
          DELETE FROM product_sku_tags WHERE product_skus_id = ${productSkusTbResults.rows.id}`
        );
      });
    // 5.2. 改めて作成し、紐づけ
    await insertTags(t, body.tags, productSkusTbResults.rows);

    // 6. summary
    return {
      isUpdated: true,
      rows: {
        basic_id: basicProductsTbResults.rows.id,
        product_id: productsTbResults.rows.id,
        sku_id: productSkusTbResults.rows.id,
        product_name: productsTbResults.rows.name,
        short_name: productsTbResults.rows.short_name,
      },
    };
  });

export const updateOneSetProduct = async (
  body: PutReqSetProduct
): Promise<
  | { isUpdated: true; rows: NewProductSummary }
  | {
      isUpdated: false;
      uniqueConstraintError: {
        key: string;
        value: string;
      };
    }
> =>
  db.tx('set-product-updates', async (t) => {
    // 1. basic_products
    const basicProductsTbResults = await upsertOne({
      t,
      table: 'basic_products',
      input: formatBasicProductData(body),
      schema: basicProductsTbRowSchema,
      updateId: body.basic_id,
    });
    if (basicProductsTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${basicProductsTbResults.uniqueConstraintError.table}.${basicProductsTbResults.uniqueConstraintError.column}`,
          value: basicProductsTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (body.basic_id !== basicProductsTbResults.rows.id)
      throw new UnexpectedError('Inconsistent ID value in table `basic_products`');

    // 2. products
    const { resolvedCategoryId, resolvedCategoryName, isAssorted } = await resolveSetCategory(t, body);
    const productsTbResults = await upsertOne({
      t,
      table: 'products',
      input: formatProductData(
        body,
        basicProductsTbResults.rows,
        resolvedCategoryId,
        resolvedCategoryName,
        isAssorted,
        'edit'
      ),
      schema: productsTbRowSchema,
      returning: '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date',
      updateId: body.product_id,
    });
    if (productsTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${productsTbResults.uniqueConstraintError.table}.${productsTbResults.uniqueConstraintError.column}`,
          value: productsTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (body.product_id !== productsTbResults.rows.id)
      throw new UnexpectedError('Inconsistent ID value in table `products`');

    // 3. product_combinations (並列挿入)
    await Promise.all(
      body.combinations.map(async (combination) => {
        const { text, values } = update('product_combinations', {
          product_id: productsTbResults.rows.id,
          item_product_id: combination.item_product_id,
          quantity: combination.quantity,
        })
          .where('id', combination.combination_id)
          .toParams();

        const row = await t.one<unknown>(`${text} RETURNING *`, values).catch((err: string) => {
          throw new DataBaseError(err);
        });
        const { id } = productCombinationsTbRowSchema.parse(row);
        if (combination.combination_id !== id)
          throw new UnexpectedError('Inconsistent ID value in table `product_combinations`');
      })
    );

    // 4. product_skus
    const productSkusTbResults = await upsertOne({
      t,
      table: 'product_skus',
      input: formatSkusData(body, productsTbResults.rows),
      schema: productSkusTbRowSchema,
      updateId: body.sku_id,
    });
    if (productSkusTbResults.isSucceeded === false) {
      return {
        isUpdated: false,
        uniqueConstraintError: {
          key: `${productSkusTbResults.uniqueConstraintError.table}.${productSkusTbResults.uniqueConstraintError.column}`,
          value: productSkusTbResults.uniqueConstraintError.value,
        },
      };
    }
    if (productSkusTbResults.rows.id !== body.sku_id)
      throw new UnexpectedError('Inconsistent ID value in table `product_skus`');

    // 5.1. 関連タグを一旦全て消し、
    await t
      .none('DELETE FROM product_sku_tags WHERE product_skus_id = $1', [productSkusTbResults.rows.id])
      .catch((err: unknown) => {
        if (err instanceof Error) throw new DataBaseError(err.message);
        throw new UnexpectedError(
          `エラー :: updateOneSetProduct() 内
          DELETE FROM product_sku_tags WHERE product_skus_id = ${productSkusTbResults.rows.id}`
        );
      });
    // 5.2. 改めて作成し、紐づけ
    await insertTags(t, body.tags, productSkusTbResults.rows);

    // 6. summary
    return {
      isUpdated: true,
      rows: {
        basic_id: basicProductsTbResults.rows.id,
        product_id: productsTbResults.rows.id,
        sku_id: productSkusTbResults.rows.id,
        product_name: productsTbResults.rows.name,
        short_name: productsTbResults.rows.short_name,
      },
    };
  });
