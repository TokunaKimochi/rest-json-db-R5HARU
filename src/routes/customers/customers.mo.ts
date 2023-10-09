import { z } from 'zod';
import { insert } from 'sql-bricks';
import { DataBaseError, db } from '../../db';
import extractSemanticAddress from '../../lib/extractSemanticAddress';
import fixCorporateNameVariants from '../../lib/fixCorporateNameVariants';
import { customersTbRowSchema, customerInputsSchema, filterQuerySchema, paramsWithIdSchema } from './customers.schemas';

export type CustomersTbRow = z.infer<typeof customersTbRowSchema>;
export type CustomerInputs = z.infer<typeof customerInputsSchema>;
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

export const createOneCustomer = async (body: CustomerInputs): Promise<{ id: number }> => {
  const inputObj = body;
  // バリデーションで許した郵便番号のハイフンを消す
  inputObj.zip_code = inputObj.zip_code.replace(/\D/g, '');
  // 検索対象とする表記揺れを抑制した文字列を生成
  const searchedName = fixCorporateNameVariants(inputObj.name1 + inputObj.name2 + inputObj.alias);
  // 住所から分析しやすい情報を生成
  const semanticAddressObj = await extractSemanticAddress(inputObj.address1 + inputObj.address2 + inputObj.address3);
  // INSERT クエリを生成
  const { text, values } = insert('customers', {
    ...inputObj,
    searched_name: searchedName,
    ...semanticAddressObj,
  }).toParams();
  // データベースに登録を試み、成功したら自動採番の id を返却
  const newIdObj: { id: number } = await db
    .one(`${text} RETURNING id`, values)
    .catch((err: Error) => Promise.reject(new DataBaseError(err)));
  return newIdObj;
};
