import { z } from 'zod';

export const customersTbSchema = z
  .object({
    id: z.number().int().positive(),
    tel: z
      .string()
      .min(1, { message: '電話番号は必須項目です' })
      .min(3, { message: '電話番号として短すぎます' })
      .max(13)
      .regex(/^[0-9-]+$/, { message: '半角数字と半角ハイフンのみ使用できます' })
      .refine(
        (val: string) => {
          const phoneNumber = val.replace(/\D/g, '');
          if (/104/.test(phoneNumber)) return true;
          if (phoneNumber.length === 10) return true;
          if (phoneNumber.length === 11) return true;
          return false;
        },
        { message: '電話番号として不適当です' }
      ),
    zip_code: z
      .string()
      .min(1, { message: '郵便番号は必須項目です' })
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
    address1: z.string().min(1, { message: '住所１は必須項目です' }).max(32, { message: '３２文字まで登録できます' }),
    address2: z.string().max(32, { message: '３２文字まで登録できます' }),
    address3: z.string().max(32, { message: '３２文字まで登録できます' }),
    name1: z.string().min(1, { message: '名称１は必須項目です' }).max(30, { message: '３０文字まで登録できます' }),
    name2: z.string().max(30, { message: '３０文字まで登録できます' }),
    alias: z.string().max(30, { message: '３０文字まで登録できます' }),
    searched_name: z.string().min(1).max(90),
    address_sha1: z.string().length(40),
    is_individual: z.boolean(),
    nja_pref: z.string().max(4),
    nja_city: z.string().max(12),
    nja_town: z.string().max(16),
    nja_addr: z.string().max(32),
    nja_lat: z.number().positive().nullable(),
    nja_lng: z.number().positive().nullable(),
    nja_level: z.number().int().gte(0).lte(3),
    notes: z.number().int().nonnegative().default(0),
    times: z.number().int().nonnegative().default(0),
    invoice_type_id: z.number().int().positive(),
    created_at: z.string().max(40),
    updated_at: z.string().max(40),
  })
  .partial();

export const customersTbRowSchema = customersTbSchema.required();

export const customerInputsSchema = customersTbSchema
  .pick({
    tel: true,
    zip_code: true,
    address1: true,
    address2: true,
    address3: true,
    name1: true,
    name2: true,
    alias: true,
    invoice_type_id: true,
  })
  .required();

export const filterQuerySchema = z
  .object({
    size: z.coerce.number().int().gte(1).lte(50).default(10),
    page: z.coerce.number().int().positive().default(1),
    search_name: z.coerce.string().trim().min(1),
  })
  .partial();

export const paramsWithIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const checkingOverlapCustomersQuerySchema = customersTbSchema
  .pick({
    name1: true,
    name2: true,
    searched_name: true,
    address_sha1: true,
    nja_pref: true,
  })
  .required();
