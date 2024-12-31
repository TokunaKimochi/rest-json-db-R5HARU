import env from '@/env';
import { ReturnDataType, SearchAddress } from 'easy-ja-postal-code-search-address';
import { ZipCodeQuery } from './addressDataByZipCode.types';

// eslint-disable-next-line import/prefer-default-export
export const createAddressData = async (q: ZipCodeQuery): Promise<ReturnDataType> => {
  const ejpc = await SearchAddress.init({
    baseUrl: `${env.BASE_URL}/vendor/easy-ja-postal-code/api/`,
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
