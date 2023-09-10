import { z } from 'zod';
import { insert } from 'sql-bricks';
import { DataBaseError, db } from '../../db';
import extractSemanticAddress from '../../lib/extractSemanticAddress';
import fixCorporateNameVariants from '../../lib/fixCorporateNameVariants';
import findMaxSha1SameVal from '../../private-sql-functions/findMaxSha1SameVal';

export const customersTbSchema = z
  .object({
    id: z.number().int().nonnegative(),
    tel: z
      .string()
      .min(3)
      .max(15)
      .regex(/^[0-9-]+$/),
    zip_code: z
      .string()
      .min(3)
      .max(8)
      .regex(/^[0-9-]+$/),
    address1: z.string().min(1).max(32),
    address2: z.string().max(32),
    address3: z.string().max(32),
    name1: z.string().min(1).max(30),
    name2: z.string().max(30),
    alias: z.string().max(30),
    searched_name: z.string().min(1).max(90),
    address_sha1: z.string().length(40),
    sha1_same_val: z.number().int().nonnegative().default(0),
    nja_pref: z.string().max(4),
    nja_city: z.string().max(12),
    nja_town: z.string().max(16),
    nja_addr: z.string().max(32),
    nja_lat: z.string().max(16),
    nja_lng: z.string().max(16),
    nja_level: z.number().int().gte(0).lte(3),
    notes: z.number().int().nonnegative().default(0),
    times: z.number().int().nonnegative().default(0),
    invoice_id: z.number().int().nonnegative(),
    created_at: z.string().max(40),
    updated_at: z.string().max(40),
  })
  .partial();

export const customersTbRowSchema = customersTbSchema.required();

export const createCustomerInputSchema = customersTbSchema
  .pick({
    tel: true,
    zip_code: true,
    address1: true,
    address2: true,
    address3: true,
    name1: true,
    name2: true,
    alias: true,
    invoice_id: true,
  })
  .required();

export const filterQuerySchema = z
  .object({
    size: z.coerce.number().int().gte(1).lte(50).default(10),
    page: z.coerce.number().int().positive().default(1),
  })
  .partial();

export const paramsWithIdSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
});

export type CustomersTbRow = z.infer<typeof customersTbRowSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;
export type FilterQuery = z.infer<typeof filterQuerySchema>;
export type ParamsWithId = z.infer<typeof paramsWithIdSchema>;

export const findAllCustomers = async (q: FilterQuery): Promise<CustomersTbRow[] | []> => {
  const limit = q.size || 10;
  const offset = limit * (q.page || 1) - limit;
  const result: CustomersTbRow[] = await db
    .manyOrNone(`SELECT * FROM customers ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const findOneCustomer = async (p: ParamsWithId): Promise<CustomersTbRow | null> => {
  const result: CustomersTbRow = await db
    .oneOrNone(`SELECT * FROM customers WHERE id = ${p.id}`)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const createOneCustomer = async (body: CreateCustomerInput): Promise<{ id: number }> => {
  const inputObj = body;
  // バリデーションで許した郵便番号のハイフンを消す
  inputObj.zip_code = inputObj.zip_code.replace(/\D/g, '');
  // 検索対象とする表記揺れを抑制した文字列を生成
  const searchedName = fixCorporateNameVariants(inputObj.name1 + inputObj.name2 + inputObj.alias);
  // 住所から分析しやすい情報を生成
  const semanticAddressObj = await extractSemanticAddress(inputObj.address1 + inputObj.address2 + inputObj.address3);
  // 同一住所が（最大）いくつ存在するか
  const sameAddress = await findMaxSha1SameVal(semanticAddressObj.address_sha1);
  const sha1SameVal = sameAddress === null ? 0 : sameAddress + 1;
  // INSERT 文を生成
  const insertStatement = insert('customers', {
    ...inputObj,
    searched_name: searchedName,
    ...semanticAddressObj,
    sha1_same_val: sha1SameVal,
  }).toString();
  // データベースに登録を試み、成功したら自動採番の id を返却
  const newIdObj: { id: number } = await db
    .one(`${insertStatement} RETURNING id`)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return newIdObj;
};
