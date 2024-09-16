import pathNix from 'node:path/posix';
import { config } from '@geolonia/normalize-japanese-addresses';
import { DataBaseError, db } from '@/db';
import { CustomerInputs, updateOneCustomer } from '@/routes/customers/customers.mo';

type Merge<T> = {
  [K in keyof T]: T[K];
};

const njaApiPath = `file:///${pathNix.join(__dirname, '../../vendor/japanese-addresses/api/ja').slice(3)}`;
config.japaneseAddressesApi = njaApiPath;

const main = async () => {
  interface CountObj {
    ct: string;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const countObj: CountObj = await db
    .one('SELECT COUNT(*) AS ct FROM customers')
    .catch((err: string) => Promise.reject(new DataBaseError(err)));
  const count = parseInt(countObj.ct, 10);

  for (let i = 0; i < count; i += 1) {
    type UnchangedValues = Merge<{ id: number } & CustomerInputs>;
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment
    const { id, tel, zip_code, address1, address2, address3, name1, name2, alias, invoice_type_id }: UnchangedValues =
      // eslint-disable-next-line no-await-in-loop
      await db
        .one('SELECT * FROM customers ORDER BY id ASC LIMIT $1 OFFSET $2', [1, i])
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

    // eslint-disable-next-line no-await-in-loop
    const customer = await updateOneCustomer(
      { id },
      { tel, zip_code, address1, address2, address3, name1, name2, alias, invoice_type_id }
    );
    console.log(`(${i + 1}/${count})`, customer.searched_name, customer.nja_town, customer.nja_level);
  }
};

main().catch((err: string) => console.error(err));
