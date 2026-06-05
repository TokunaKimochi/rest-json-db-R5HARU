import { DataBaseError, db } from '@/db';
import { ulid } from 'ulid';
import { z, ZodType } from 'zod';
import { ITask } from 'pg-promise';
import { insert, update } from 'sql-bricks';
import UnexpectedError from '@/classes/unexpected-error';
import { ParamsWithProductId, PostReqNewProduct, PostReqNewSetProduct, PutReqProduct } from './products.types';
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
  is_assorted: boolean,
  mode: 'new' | 'edit'
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
    ulid_str: mode === 'new' ? ulid() : undefined,
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
