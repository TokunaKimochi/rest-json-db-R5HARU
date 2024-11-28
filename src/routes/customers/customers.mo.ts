import { z } from 'zod';
import { insert, update } from 'sql-bricks';
import { DataBaseError, db } from '../../db';
import { deleteAllNotes4SpecificCustomerInTx } from '../notes/notes.txAtoms';
import extractSemanticAddress from '../../lib/extractSemanticAddress';
import fixCorporateNameVariants from '../../lib/fixCorporateNameVariants';
import writeOutTsvAboutCustomer from '../../lib/writeOutTsvAboutCustomer';
import {
  customersTbRowSchema,
  customerInputsSchema,
  filterQuerySchema,
  paramsWithIdSchema,
  checkingOverlapCustomersQuerySchema,
  deleteIdsSchema,
} from './customers.schemas';

export type CustomersTbRow = z.infer<typeof customersTbRowSchema>;
export type CustomerInputs = z.infer<typeof customerInputsSchema>;
export type FilterQuery = z.infer<typeof filterQuerySchema>;
export type ParamsWithId = z.infer<typeof paramsWithIdSchema>;
export type DeleteIds = z.infer<typeof deleteIdsSchema>;
export type CheckingOverlapCustomersQuery = z.infer<typeof checkingOverlapCustomersQuerySchema>;

export const findAllCustomersOrSearch = async (q: FilterQuery): Promise<CustomersTbRow[] | []> => {
  const limit = q.size ?? 10;
  const offset = limit * (q.page ?? 1) - limit;

  // WHERE 句の組み立て
  let whereClause = '';
  // LIMIT 句と OFFSET 句は検索文字列が無ければ組み立て
  let limitAndOffsetClauses = '';
  if (q.search_name) {
    whereClause = ' WHERE ';
    const names = q.search_name.split(/\s+/);
    // 検索文字列の末尾に `:都道府県' もしくは `::市区町村' を指定
    let optionalCondition = '';
    const optionalWords = names.at(-1)?.match(/^([:：][:：]?)([^:：]+)$/);
    if (optionalWords !== null && optionalWords !== undefined) {
      names.pop();
      // 都道府県・市区町村以外に検索文字列が指定されていれば後ほどその後ろに `AND' で連結
      if (names.length) {
        optionalCondition = ' AND ';
      }
      if (
        optionalWords[1] === ':：' ||
        optionalWords[1] === '：:' ||
        optionalWords[1] === '::' ||
        optionalWords[1] === '：：'
      ) {
        optionalCondition += `nja_city LIKE '%${optionalWords[2]}%'`;
      } else if (optionalWords[1] === ':' || optionalWords[1] === '：') {
        optionalCondition += `nja_pref LIKE '%${optionalWords[2]}%'`;
      }
    }
    for (let i = 0; i < names.length; i += 1) {
      if (i > 0) whereClause += ' AND ';
      const normalizedName = fixCorporateNameVariants(names[i]);
      if (normalizedName) {
        whereClause += `(searched_name LIKE '%${normalizedName}%' OR name1 LIKE '%${names[i]}%')`;
      } else {
        whereClause += `(name1 LIKE '%${names[i]}%' OR alias LIKE '%${names[i]}%')`;
      }
    }
    whereClause += optionalCondition;
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
  const customer: CustomersTbRow = await db
    .oneOrNone(`SELECT * FROM customers WHERE id = ${p.id}`)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return customer;
};

type RegistrationData = Omit<CustomersTbRow, 'id' | 'is_individual' | 'notes' | 'times' | 'created_at' | 'updated_at'>;

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

export const createOneCustomer = async (body: CustomerInputs): Promise<CustomersTbRow> => {
  const registrationData = await generateRegistrationData(body);
  const { text, values } = insert('customers', { ...registrationData }).toParams();
  // データベースに登録を試み、成功したら登録されたデータを全て返却
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customer: CustomersTbRow = await db
    .one(`${text} RETURNING *`, values)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return customer;
};

export const updateOneCustomer = async (p: ParamsWithId, body: CustomerInputs): Promise<CustomersTbRow> => {
  const registrationData = await generateRegistrationData(body);
  const { text, values } = update('customers', { ...registrationData })
    .where('id', p.id)
    .toParams();
  // データベースの更新を試み、成功したら登録されたデータを全て返却
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customer: CustomersTbRow = await db
    .one(`${text} RETURNING *`, values)
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return customer;
};

export const deleteOneCustomer = async (p: ParamsWithId): Promise<{ command: string; rowCount: number }> => {
  const result = await db.tx('delete-a-customer', async (t) => {
    // id キーを外部キーとして参照してきているノートのレコードを先に削除
    await deleteAllNotes4SpecificCustomerInTx(t, p.id);
    const deleteResult: { command: string; rowCount: number } = await t
      .result('DELETE FROM customers WHERE id = $1', [p.id], (r) => ({ command: r.command, rowCount: r.rowCount }))
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    return deleteResult;
  });
  return result;
};

export const checkingOverlapCustomers = async (
  p: ParamsWithId,
  q: CheckingOverlapCustomersQuery
): Promise<CustomersTbRow[]> => {
  let searchedNameLikePattern = `${q.searched_name}%`;
  const name1Elements = q.name1.match(/^\s*(\S+[\s・㈱㈲㈹]+\S{2})/);
  // e.g. 会社名 支店名, 会社名㈱支店名 => 会社名と支店名の最初の２文字
  if (name1Elements !== null && name1Elements !== undefined) {
    searchedNameLikePattern = `${fixCorporateNameVariants(name1Elements[1])}%`;
  }
  // name1 にスペースは含まれないが name2 がある => name1
  else if (/\S/.test(q.name2)) {
    searchedNameLikePattern = `${fixCorporateNameVariants(q.name1)}%`;
  }
  const result: CustomersTbRow[] = await db
    .many(
      'SELECT * FROM customers WHERE address_sha1 = $1 OR (nja_pref = $2 AND searched_name LIKE $3) ORDER BY updated_at DESC',
      [q.address_sha1, q.nja_pref, searchedNameLikePattern]
    )
    .then((customers: CustomersTbRow[]) => {
      // パスパラメータの id とデータベースからの返却配列に矛盾がないか
      const customerIdExists = customers.some((customer) => customer.id === p.id);
      if (!customerIdExists) throw new Error('Detected request(s) made in an illegal manner.');
      return customers;
    })
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  return result;
};

export const createOneCustomerTsv = async (body: CustomersTbRow): Promise<void> => {
  await writeOutTsvAboutCustomer(body);
};

export const deleteAnyCustomers = async (body: DeleteIds): Promise<{ command: string; rowCount: number }> => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { existing_customers }: { existing_customers: string } = await db.one(
    // `$1:csv` is https://github.com/vitaly-t/pg-promise?tab=readme-ov-file#csv-filter
    'SELECT COUNT(*) AS existing_customers FROM customers WHERE id IN ($1:csv)',
    [body.deleteIds]
  );
  if (body.deleteIds.length !== parseInt(existing_customers, 10)) {
    throw new DataBaseError('存在しない顧客レコードの削除が要求されました');
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { existing_customers_notes }: { existing_customers_notes: string } = await db.one(
    'SELECT COUNT(*) AS existing_customers_notes FROM notes WHERE customer_id IN ($1:csv)',
    [body.deleteIds]
  );
  if (parseInt(existing_customers_notes, 10) !== 0) {
    throw new DataBaseError('関連メモを１件でも持っている顧客レコードは削除できません');
  }

  const deleteResult: { command: string; rowCount: number } = await db
    .result('DELETE FROM customers WHERE id IN ($1:csv)', [body.deleteIds], (r) => ({
      command: r.command,
      rowCount: r.rowCount,
    }))
    .catch((err: string) => Promise.reject(new DataBaseError(err)));

  return deleteResult;
};
