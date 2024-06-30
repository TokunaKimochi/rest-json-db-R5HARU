import { z } from 'zod';

const zipCodeInputSchema = z.object({
  zip_code: z
    .string()
    .min(7, { message: '現在、郵便番号の桁数は７桁です（ハイフンを除く）' })
    .max(8)
    .regex(/^[0-9-]+$/, { message: '半角数字と半角ハイフンのみ使用できます' })
    .refine(
      (val: string) => {
        const zipCode = val.replace(/\D/g, '');
        if (zipCode.length === 7) return true;
        return false;
      },
      { message: '郵便番号として不適当です' }
    ),
});

export default zipCodeInputSchema;
