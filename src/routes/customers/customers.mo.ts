import { z } from 'zod';
import { insert, update } from 'sql-bricks';
import { DataBaseError, db } from '../../db';
import extractSemanticAddress from '../../lib/extractSemanticAddress';
import fixCorporateNameVariants from '../../lib/fixCorporateNameVariants';
import { customersTbRowSchema, customerInputsSchema, filterQuerySchema, paramsWithIdSchema } from './customers.schemas';

export type CustomersTbRow = z.infer<typeof customersTbRowSchema>;
export type CustomerInputs = z.infer<typeof customerInputsSchema>;
export type FilterQuery = z.infer<typeof filterQuerySchema>;
export type ParamsWithId = z.infer<typeof paramsWithIdSchema>;

export const searchCustomers = async (q: FilterQuery): Promise<CustomersTbRow[] | []> => {
  const limit = q.size ?? 10;
  const offset = limit * (q.page ?? 1) - limit;

  // WHERE 句の組み立て
  let whereClause = '';
  // LIMIT 句と OFFSET 句は検索文字列が無ければ組み立て
  let limitAndOffsetClauses = '';
  if (q.search_name) {
    whereClause = ' WHERE ';
    const names = q.search_name.split(/\s+/);
    for (let i = 0; i < names.length; i += 1) {
      if (i > 0) whereClause += ' AND ';
      const normalizedName = fixCorporateNameVariants(names[i]);
      if (normalizedName) {
        whereClause += `searched_name LIKE '%${normalizedName}%'`;
      } else {
        whereClause += `name1 LIKE '%${names[i]}%'`;
      }
    }
  } else {
    limitAndOffsetClauses = ` LIMIT ${limit} OFFSET ${offset}`;
  }
  const result: CustomersTbRow[] = await db
    .manyOrNone(`SELECT * FROM customers${whereClause} ORDER BY updated_at DESC${limitAndOffsetClauses}`)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const findOneCustomer = async (p: ParamsWithId): Promise<CustomersTbRow | null> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result: CustomersTbRow = await db
    .oneOrNone(`SELECT * FROM customers WHERE id = ${p.id}`)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

type RegistrationData = Omit<CustomersTbRow, 'id' | 'notes' | 'times' | 'created_at' | 'updated_at'>;

const generateRegistrationData = async (customerInputs: CustomerInputs): Promise<RegistrationData> => {
  const inputObj = customerInputs;
  // バリデーションで許した郵便番号のハイフンを消す
  inputObj.zip_code = inputObj.zip_code.replace(/\D/g, '');
  // 検索対象とする表記揺れを抑制した文字列を生成
  const searchedName = fixCorporateNameVariants(inputObj.name1 + inputObj.name2 + inputObj.alias);
  // 住所から分析しやすい情報を生成
  const semanticAddressObj = await extractSemanticAddress(inputObj.address1 + inputObj.address2 + inputObj.address3);
  return {
    ...inputObj,
    searched_name: searchedName,
    ...semanticAddressObj,
  };
};

export const createOneCustomer = async (body: CustomerInputs): Promise<{ id: number }> => {
  const registrationData = await generateRegistrationData(body);
  const { text, values } = insert('customers', { ...registrationData }).toParams();
  // データベースに登録を試み、成功したら自動採番の id を返却
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const newIdObj: { id: number } = await db
    .one(`${text} RETURNING id`, values)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return newIdObj;
};

export const updateOneCustomer = async (p: ParamsWithId, body: CustomerInputs): Promise<{ id: number }> => {
  const registrationData = await generateRegistrationData(body);
  const { text, values } = update('customers', { ...registrationData })
    .where('id', p.id)
    .toParams();
  // データベースの更新を試み、成功したら自動採番の id を返却
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const newIdObj: { id: number } = await db
    .one(`${text} RETURNING id`, values)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return newIdObj;
};

export const deleteOneCustomer = async (p: ParamsWithId): Promise<{ command: string; rowCount: number }> => {
  const result: { command: string; rowCount: number } = await db
    .result('DELETE FROM customers WHERE id = $1', [p.id], (r) => ({ command: r.command, rowCount: r.rowCount }))
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};
