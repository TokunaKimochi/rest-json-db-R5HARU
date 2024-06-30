import { z } from 'zod';
import { ReturnDataType, SearchAddress, SucceessDataType as SuccessDataType } from 'easy-ja-postal-code-search-address';
import zipCodeInputSchema from './zipData.schemas';

export type ZipCodeInput = z.infer<typeof zipCodeInputSchema>;

export const createZipData = async (body: ZipCodeInput): Promise<SuccessDataType> => {
  // TODO 名前を適切なものに変更
  const port = process.env.PORT ?? '3001';
  const ejpc = await SearchAddress.init({
    baseUrl: `http://localhost:${port}/vendor/easy-ja-postal-code/api/`,
    fallback: () => {
      throw new Error('初期化に失敗しました');
    },
  });
  if (!ejpc) throw new Error('error !!');
  const zipCode = body.zip_code.replace(/\D/g, '');
  const result: ReturnDataType = await ejpc.search({ zipInput: zipCode });
  if (result.error) {
    console.error(result.error);
    throw new Error('zip-data api error !!');
  }

  return result;
};
