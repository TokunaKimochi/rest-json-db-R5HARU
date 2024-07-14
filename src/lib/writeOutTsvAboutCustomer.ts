import fs from 'node:fs/promises';
import { z } from 'zod';
import { customersTbRowSchema } from '../routes/customers/customers.schemas';

// 無限循環 import を避けるためにここで定義
type CustomersTbRow = z.infer<typeof customersTbRowSchema>;

const writeOutTsvAboutCustomer = async (arg: CustomersTbRow) => {
  const zipCodeHyphen = `${arg.zip_code.slice(0, 3)}-${arg.zip_code.slice(3)}`;
  /* Excel VBA が取りに来ることを想定した TSV
     Excel 側では２つの配列として利用される
     1. ['', '', 都道府県+市, 名前１]
     2. [電話番号, 郵便番号, 住所１+住所２+住所３, 名前１+名前２] */
  const textData =
    // UTF-8 BOM
    '\ufeff' +
    `\t${arg.tel}\r\n` +
    `\t${zipCodeHyphen}\r\n${arg.nja_pref}${arg.nja_city}\t${arg.address1}${arg.address2}${arg.address3}\r\n${arg.name1}\t${arg.name1}${arg.name2}`;

  await fs.writeFile('./vendor/in-house/api/tsv/customer.tsv', textData);
};

export default writeOutTsvAboutCustomer;
