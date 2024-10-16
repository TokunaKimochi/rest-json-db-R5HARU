import { DataBaseError, db } from '@/db';
import { customerInputsSchema } from '../routes/customers/customers.schemas';
import { CustomerInputs } from '../routes/customers/customers.mo';

type Merge<T> = {
  [K in keyof T]: T[K];
};

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
    type ReCheckedValuesAndId = Merge<{ id: number } & CustomerInputs>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      id,
      tel,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      zip_code,
      address1,
      address2,
      address3,
      name1,
      name2,
      alias,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      invoice_type_id,
    }: ReCheckedValuesAndId =
      // eslint-disable-next-line no-await-in-loop
      await db
        .one('SELECT * FROM customers ORDER BY id ASC LIMIT $1 OFFSET $2', [1, i])
        .catch((err: string) => Promise.reject(new DataBaseError(err)));

    const result = customerInputsSchema.safeParse({
      tel,
      zip_code,
      address1,
      address2,
      address3,
      name1,
      name2,
      alias,
      invoice_type_id,
    });

    if (result.success === false) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`${id}: ${name1}${result.error.issues[0].path[0] === 'tel' ? `\n${tel}` : ''} => ${result.error}`);
    }
  }
};

main().catch((err: string) => console.error(err));
