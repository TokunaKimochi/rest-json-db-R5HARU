import { z } from 'zod';
import env from '@/env';
import {
  ErrorDataType,
  ReturnDataType,
  SearchAddress,
  SucceessDataType as SuccessDataType,
} from 'easy-ja-postal-code-search-address';
import zipCodeQuerySchema from './addressDataByZipCode.schemas';

export type ZipCodeQuery = z.infer<typeof zipCodeQuerySchema>;

export const createAddressData = async (q: ZipCodeQuery): Promise<SuccessDataType | ErrorDataType> => {
  const ejpc = await SearchAddress.init({
    baseUrl: `${env.BASE_URL}:${env.PORT}/vendor/easy-ja-postal-code/api/`,
    fallback: () => {
      throw new Error('初期化に失敗しました');
    },
  });
  if (!q) throw new Error('q: ZipCodeQuery is error !!');
  if (!ejpc) throw new Error('ejpc: SearchAddress is error !!');
  const zipCode = q.zip_code.replace(/\D/g, '');
  const result: ReturnDataType = await ejpc.search({ zipInput: zipCode });

  return result;
};
