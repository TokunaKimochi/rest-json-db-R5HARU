import { insert } from 'sql-bricks';
import { DataBaseError, db } from '@/db';
import { NewProductSummary, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { basicProductsTbRowSchema, productSkusTbRowSchema, productsTbRowSchema } from './products.dbTable.schemas';
import {
  formatBasicProductData,
  formatProductData,
  formatSkusData,
  resolveRegularCategory,
  resolveSetCategory,
  upsertOne,
} from './products.mo';

// 完全新規登録（通常商品）
export const registerOneRegularProduct = async (
  body: PostReqNewProduct
): Promise<
  | { isRegistered: true; rows: NewProductSummary }
  | {
      isRegistered: false;
      uniqueConstraintError: {
        key: string;
        value: string;
      };
    }
> =>
  db.tx('regular-product-registration', async (t) => {
    // 1. basic_products
    const basicProductsTbResults = await upsertOne({
      t,
      table: 'basic_products',
      input: formatBasicProductData(body),
      schema: basicProductsTbRowSchema,
      updateId: null,
    });
    if (basicProductsTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${basicProductsTbResults.uniqueConstraintError.table}.${basicProductsTbResults.uniqueConstraintError.column}`,
          value: basicProductsTbResults.uniqueConstraintError.value,
        },
      };
    }

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
        'new'
      ),
      schema: productsTbRowSchema,
      returning: '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date',
      updateId: null,
    });
    if (productsTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${productsTbResults.uniqueConstraintError.table}.${productsTbResults.uniqueConstraintError.column}`,
          value: productsTbResults.uniqueConstraintError.value,
        },
      };
    }

    // 3. product_components (並列挿入)
    await Promise.all(
      body.components.map(async (component) => {
        const { text, values } = insert('product_components', {
          product_id: productsTbResults.rows.id,
          title: component.title,
          category_id: component.category_id,
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
    const productSkusTbResults = await upsertOne({
      t,
      table: 'product_skus',
      input: formatSkusData(body, productsTbResults.rows),
      schema: productSkusTbRowSchema,
      updateId: null,
    });
    if (productSkusTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${productSkusTbResults.uniqueConstraintError.table}.${productSkusTbResults.uniqueConstraintError.column}`,
          value: productSkusTbResults.uniqueConstraintError.value,
        },
      };
    }

    // 5. summary
    return {
      isRegistered: true,
      rows: {
        basic_id: basicProductsTbResults.rows.id,
        product_id: productsTbResults.rows.id,
        sku_id: productSkusTbResults.rows.id,
        product_name: productsTbResults.rows.name,
        short_name: productsTbResults.rows.short_name,
      },
    };
  });

// 完全新規登録（セット商品）
export const registerOneSetProduct = async (
  body: PostReqNewSetProduct
): Promise<
  | { isRegistered: true; rows: NewProductSummary }
  | {
      isRegistered: false;
      uniqueConstraintError: {
        key: string;
        value: string;
      };
    }
> =>
  db.tx('set-product-registration', async (t) => {
    // 1. basic_products
    const basicProductsTbResults = await upsertOne({
      t,
      table: 'basic_products',
      input: formatBasicProductData(body),
      schema: basicProductsTbRowSchema,
      updateId: null,
    });
    if (basicProductsTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${basicProductsTbResults.uniqueConstraintError.table}.${basicProductsTbResults.uniqueConstraintError.column}`,
          value: basicProductsTbResults.uniqueConstraintError.value,
        },
      };
    }

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
        'new'
      ),
      schema: productsTbRowSchema,
      returning: '*, available_date::text AS available_date, discontinued_date::text AS discontinued_date',
      updateId: null,
    });
    if (productsTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${productsTbResults.uniqueConstraintError.table}.${productsTbResults.uniqueConstraintError.column}`,
          value: productsTbResults.uniqueConstraintError.value,
        },
      };
    }

    // 3. product_combinations (並列挿入)
    await Promise.all(
      body.combinations.map(async (combination) => {
        const { text, values } = insert('product_combinations', {
          product_id: productsTbResults.rows.id,
          item_product_id: combination.item_product_id,
          quantity: combination.quantity,
        }).toParams();

        await t.none(text, values).catch((err: string) => {
          throw new DataBaseError(err);
        });
      })
    );

    // 4. product_skus
    const productSkusTbResults = await upsertOne({
      t,
      table: 'product_skus',
      input: formatSkusData(body, productsTbResults.rows),
      schema: productSkusTbRowSchema,
      updateId: null,
    });
    if (productSkusTbResults.isSucceeded === false) {
      return {
        isRegistered: false,
        uniqueConstraintError: {
          key: `${productSkusTbResults.uniqueConstraintError.table}.${productSkusTbResults.uniqueConstraintError.column}`,
          value: productSkusTbResults.uniqueConstraintError.value,
        },
      };
    }

    // 5. summary
    return {
      isRegistered: true,
      rows: {
        basic_id: basicProductsTbResults.rows.id,
        product_id: productsTbResults.rows.id,
        sku_id: productSkusTbResults.rows.id,
        product_name: productsTbResults.rows.name,
        short_name: productsTbResults.rows.short_name,
      },
    };
  });
