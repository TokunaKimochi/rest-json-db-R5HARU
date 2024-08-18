import fs from 'node:fs/promises';
import { z } from 'zod';
import env from '@/env';
import { customersTbRowSchema } from '../routes/customers/customers.schemas';
import makeParentDirectory from './makeParentDirectory';

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

  const tsvFilePath = env.TEMP_DIR ? `${env.TEMP_DIR}/customer.tsv` : './vendor/in-house/api/tsv/customer.tsv';

  const result = await fs.writeFile(tsvFilePath, textData).catch((err) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err && err?.code === 'ENOENT') {
      return 'RUN makeParentDirectory()';
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new Error(err);
  });

  if (result === 'RUN makeParentDirectory()') {
    await makeParentDirectory(tsvFilePath);
    await writeOutTsvAboutCustomer(arg);
  }
};

export default writeOutTsvAboutCustomer;
