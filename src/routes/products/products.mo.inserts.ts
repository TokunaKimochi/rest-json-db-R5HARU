import { insert } from 'sql-bricks';
import { z } from 'zod';
import UnexpectedError from '@/classes/unexpected-error';
import { DataBaseError, db } from '@/db';
import { NewProductSummary, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { basicProductsTbRowSchema, productSkusTbRowSchema, productsTbRowSchema } from './products.dbTable.schemas';
import {
  CATEGORY_ID,
  formatBasicProductData,
  formatProductData,
  formatSkusData,
  resolveRegularCategory,
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

    // Set で順番を維持しつつ重複を消し、スプレッド構文で配列に戻す
    const itemIds = [...new Set(body.combinations.map((item) => item.item_product_id))];
    const itemProducts = await t
      .many('SELECT * FROM products WHERE id IN ($1:csv)', [itemIds])
      .then((rows) =>
        z
          .array(
            productsTbRowSchema.extend({
              // この２つは insert の RETURNING 句で DATE 型を YYYY-MM-DD にキャストする前提の定義
              // なので、ここでは上書き
              available_date: z.date(),
              discontinued_date: z.date(),
            })
          )
          .min(1)
          .parse(rows)
      )
      .catch((err: string) => {
        throw new UnexpectedError(err);
      });

    const categoryIds = [...new Set(itemProducts.map((item) => item.cached_category_id))];
    const isAssortedArr = [...new Set(itemProducts.map((item) => item.is_assorted))];

    const { name: categoryName } = await t
      .one('SELECT name FROM product_categories WHERE id = $1', [categoryIds[0]])
      .then((row) => z.object({ name: z.string().min(1).max(32) }).parse(row))
      .catch((err: string) => {
        throw new UnexpectedError(err);
      });

    // 特定のID { 1: '未分類', 2: 'その他' } が含まれているかチェック
    const hasUncategorized = categoryIds.includes(CATEGORY_ID.UNCATEGORIZED.Int);
    const hasOthers = categoryIds.includes(CATEGORY_ID.OTHERS.Int);

    // 引数に渡すIDと名前を決定（1 > 2 > それ以外のカテゴリー の優先順位）
    // eslint-disable-next-line no-nested-ternary
    const resolvedCategoryId = hasUncategorized
      ? CATEGORY_ID.UNCATEGORIZED.Int
      : hasOthers
      ? CATEGORY_ID.OTHERS.Int
      : categoryIds[0];
    // eslint-disable-next-line no-nested-ternary
    const resolvedCategoryName = hasUncategorized
      ? CATEGORY_ID.UNCATEGORIZED.Str
      : hasOthers
      ? CATEGORY_ID.OTHERS.Str
      : categoryName;

    // 「未分類」や「その他」が含まれる場合は false、それ以外で複数カテゴリ or アソート含なら true
    const isAssorted = !hasUncategorized && !hasOthers && (categoryIds.length > 1 || isAssortedArr.includes(true));

    // 2. products
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
