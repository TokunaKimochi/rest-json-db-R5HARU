import { DataBaseError, db } from '@/db';
import { ulid } from 'ulid';
import { z, ZodType } from 'zod';
import { ITask } from 'pg-promise';
import { insert, update } from 'sql-bricks';
import UnexpectedError from '@/classes/unexpected-error';
import jaconv from 'jaconv';
import {
  ParamsWithProductId,
  ParamsWithProductSkusId,
  PostReqNewProduct,
  PostReqNewSetProduct,
  ProductSkus,
  PutReqProduct,
  PutReqSetProduct,
  QueryWithBasicId,
} from './products.types';
import {
  BasicProductsTbRow,
  ProductSkusTbRow,
  ProductsTbRow,
  ViewProductCombinationsArray,
  ViewProductComponentsArray,
  ViewProductSkuTagsArray,
  ViewSingleProductsRow,
  ViewSkuDetailsRow,
} from './products.dbTable.types';
import {
  basicProductsTbRowSchema,
  productsTbRowSchema,
  productTagsTbRowSchema,
  viewProductCombinationsArraySchema,
  viewProductComponentsArraySchema,
  viewProductSkuTagsArraySchema,
  viewSingleProductsRowSchema,
  viewSkuDetailsRowSchema,
} from './products.dbTable.schemas';

export const CATEGORY_ID = {
  UNCATEGORIZED: { Int: 1, Str: '未分類' },
  OTHERS: { Int: 2, Str: 'その他' },
} as const;

const shortNameSanitize = (originalText: string, shouldDash2Space = true) => {
  let text = originalText;

  text = text.trim();
  text = jaconv.toZen(text);
  text = text.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, shouldDash2Space ? ' ' : '-');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/[ ]*（[ ]*/g, '（');
  text = text.replace(/[ ]*）[ ]*/g, '）');
  text = text.replace(/．/g, '.');

  return text;
};

const normalize = (originalText: string) => {
  let text = originalText;

  text = text.trim();
  text = jaconv.toKatakana(text);
  text = text.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '');
  text = text.replace(/\s+/g, '');
  text = jaconv.normalize(text);

  return text;
};

type Dimension = number | null | undefined;
const sortDimensions = (a: Dimension, b: Dimension): [Dimension, Dimension] => {
  // どちらか一方でも空値（null または undefined）なら、入力順のまま返す
  if (a == null || b == null) {
    return [a, b];
  }

  // 両方とも数値であれば、小さい順に並べ替えて返す
  return a < b ? [a, b] : [b, a];
};

export const formatBasicProductData = (
  body: PostReqNewProduct | PostReqNewSetProduct | PutReqProduct | PutReqSetProduct
) => ({
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
  body: PostReqNewProduct | PostReqNewSetProduct | PutReqProduct | PutReqSetProduct,
  basicProductsTbRow: BasicProductsTbRow,
  category_id: number,
  display_category_name: string,
  is_assorted: boolean,
  mode: 'new' | 'edit'
) => {
  const [depth, width] = sortDimensions(body.depth_mm, body.width_mm);
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
    short_name: shortNameSanitize(body.short_name),
    is_set_product: body.is_set_product,
    cached_category_id: category_id,
    display_category_name: is_assorted ? `${display_category_name} 他` : display_category_name,
    is_assorted,
    depth_mm: depth ?? null,
    width_mm: width ?? null,
    diameter_mm: body.diameter_mm ?? null,
    height_mm: body.height_mm ?? null,
    weight_g: body.weight_g ?? null,
    available_date: body.available_date,
    discontinued_date: body.discontinued_date,
    note: body.note ?? null,
    ulid_str: mode === 'new' ? ulid() : undefined,
  });
  return productInput;
};

export const formatSkusData = (
  body: PostReqNewProduct | PostReqNewSetProduct | PutReqProduct | PutReqSetProduct | ProductSkus,
  productsTbRow: ProductsTbRow
) => {
  let name: string;
  if ('skus_name' in body) {
    name = shortNameSanitize(body.skus_name);
  } else {
    name = shortNameSanitize(body.short_name);
  }
  const [caseDepth, caseWidth] = sortDimensions(body.case_depth_mm, body.case_width_mm);
  const [innerDepth, innerWidth] = sortDimensions(body.inner_carton_depth_mm, body.inner_carton_width_mm);
  return {
    product_id: productsTbRow.id,
    name,
    case_quantity: body.case_quantity ?? null,
    inner_carton_quantity: body.inner_carton_quantity ?? null,
    itf_case_code: body.itf_case_code ?? null,
    itf_inner_carton_code: body.itf_inner_carton_code ?? null,
    case_depth_mm: caseDepth ?? null,
    case_width_mm: caseWidth ?? null,
    case_height_mm: body.case_height_mm ?? null,
    case_weight_g: body.case_weight_g ?? null,
    inner_carton_depth_mm: innerDepth ?? null,
    inner_carton_width_mm: innerWidth ?? null,
    inner_carton_height_mm: body.inner_carton_height_mm ?? null,
    inner_carton_weight_g: body.inner_carton_weight_g ?? null,
    priority: body.priority,
  };
};

export async function insertTags(t: ITask<object>, tags: ProductSkus['tags'], productSkusTbRow: ProductSkusTbRow) {
  if (!tags || tags.length === 0) return;

  // まずは重複無し・ノーマライズ済のリストを作成
  interface NormalizedTags {
    label: string;
    normalizedLabel: string;
  }
  const tmpMap = new Map<string, boolean>();
  const normalizedTags = tags.reduce<NormalizedTags[]>((result, tag) => {
    const normalizedLabel = normalize(tag.label);
    if (!tmpMap.has(normalizedLabel)) {
      tmpMap.set(normalizedLabel, true);
      result.push({
        label: shortNameSanitize(tag.label, false),
        normalizedLabel,
      });
    }
    return result;
  }, []);

  // Promise.all で並行処理
  await Promise.all(
    normalizedTags.map(async (normaTag) => {
      try {
        // 1. タグの UPSERT (存在しなければ挿入、存在すれば既存の値を維持して返す)
        // DO UPDATE SET label = product_tags.label とすることで、空打ちアップデートを行い RETURNING で確実に id を取得します。
        const tagRow = await t.one<unknown>(
          `INSERT INTO product_tags (label, normalized_label) 
           VALUES ($1, $2) 
           ON CONFLICT (normalized_label) 
           DO UPDATE SET label = product_tags.label 
           RETURNING *`,
          [normaTag.label, normaTag.normalizedLabel]
        );

        const productTagsRow = productTagsTbRowSchema.parse(tagRow);

        // 2. 中間テーブルへの紐付け INSERT
        // すでに紐付いている場合に備えて ON CONFLICT DO NOTHING を付与するとより安全です
        await t.none(
          `INSERT INTO product_sku_tags (product_tags_id, product_skus_id) 
           VALUES ($1, $2) 
           ON CONFLICT (product_tags_id, product_skus_id) DO NOTHING`,
          [productTagsRow.id, productSkusTbRow.id]
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new DataBaseError(err.message);
        }
        throw new UnexpectedError('💥エラー :: insertTags()');
      }
    })
  );
}

// ユニーク制約ハンドリングの共通ヘルパー
export async function upsertOne<T>({
  t,
  table,
  input,
  schema,
  returning = '*',
  updateId,
}: {
  t: ITask<object>;
  table: string;
  input: Record<string, unknown>;
  // schema は Zod スキーマであり、バリデーション成功時、型「T」になる
  schema: ZodType<T>;
  returning?: string;
  updateId: number | null;
}): Promise<
  | { isSucceeded: true; rows: T }
  | {
      isSucceeded: false;
      uniqueConstraintError: {
        table: string;
        column: string;
        value: string;
      };
    }
> {
  const { text, values } =
    updateId !== null ? update(table, input).where('id', updateId).toParams() : insert(table, input).toParams();

  const keyRegex = /^Key \((.*?)\)=\((.*?)\) already exists\.$/;
  const pgErrorSchema = z.object({
    code: z.string(),
    detail: z
      .string()
      .regex(keyRegex)
      .transform((s) => {
        // 末尾の ! (非null アサーション演算子) でコンパイラに null にならないと伝える
        const [errorMessage, column, value] = s.match(keyRegex)!;
        return { errorMessage, column, value };
      }),
    table: z.string(),
  });
  try {
    const row = await t.one<unknown>(`${text} RETURNING ${returning}`, values);
    return {
      isSucceeded: true,
      rows: schema.parse(row),
    };
  } catch (err: unknown) {
    const parsedError = pgErrorSchema.safeParse(err);
    if (parsedError.success && parsedError.data.code === '23505') {
      console.warn(`⚠️ ${parsedError.data.detail.errorMessage} in ${parsedError.data.table}`);
      return {
        isSucceeded: false,
        uniqueConstraintError: {
          table: parsedError.data.table.toUpperCase(),
          column: parsedError.data.detail.column.toUpperCase(),
          value: parsedError.data.detail.value,
        },
      };
    }
    console.error(`❌ ${table} ${updateId ? 'update' : 'insert'} failed\n`, err);
    throw new DataBaseError(err as string);
  }
}

export const resolveRegularCategory = async (
  t: ITask<object>,
  body: PostReqNewProduct | PutReqProduct
): Promise<{
  resolvedCategoryId: number;
  resolvedCategoryName: string;
  isAssorted: boolean;
}> => {
  // Set で順番を維持しつつ重複を消し、スプレッド構文で配列に戻す
  const categoryIds = [...new Set(body.components.map((component) => component.category_id))];
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
  const isAssorted = !hasUncategorized && !hasOthers && categoryIds.length > 1;

  return {
    resolvedCategoryId,
    resolvedCategoryName,
    isAssorted,
  };
};

export const resolveSetCategory = async (
  t: ITask<object>,
  body: PostReqNewSetProduct | PutReqSetProduct
): Promise<{
  resolvedCategoryId: number;
  resolvedCategoryName: string;
  isAssorted: boolean;
}> => {
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

  return {
    resolvedCategoryId,
    resolvedCategoryName,
    isAssorted,
  };
};

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

export const findAllTagsWithProductSkuCount = async () => {};

// 特定の SKU に付いているタグを取得
export const findAllTagsAboutProductSku = async (p: ParamsWithProductSkusId): Promise<ViewProductSkuTagsArray> => {
  const rows = await db
    .manyOrNone('SELECT * FROM v_product_sku_tags WHERE product_skus_id = $1 ORDER BY product_tags_id ASC', [
      p.productSkusId,
    ])
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = viewProductSkuTagsArraySchema.safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};

// excludeId は編集時に先代商品（リニューアル前）に自分自身を指定できたらマズイので指定する
export const findAllBasicProducts = async (q: QueryWithBasicId): Promise<BasicProductsTbRow[]> => {
  const hasExcludeId = q.excludeId !== undefined;

  const query = hasExcludeId
    ? 'SELECT * FROM basic_products WHERE id != $1 ORDER BY id'
    : 'SELECT * FROM basic_products ORDER BY id';
  const params = hasExcludeId ? [q.excludeId] : undefined;

  const rows = await db.manyOrNone(query, params).catch((err: string) => Promise.reject(new DataBaseError(err)));
  const result = z.array(basicProductsTbRowSchema).safeParse(rows);

  if (result.success && result.data.length) return result.data;
  if (result.error) throw new DataBaseError(result.error.message);
  return [];
};
