import { z } from 'zod';

export const notesTbSchemas = z
  .object({
    customer_id: z.number().int().positive(),
    rank: z.number().int().positive(),
    body: z.string().min(1),
    created_at: z.string().max(40),
    updated_at: z.string().max(40),
  })
  .partial();

export const notesTbRowSchemas = notesTbSchemas.required().brand<'NotesTbRow'>();

export const noteInputsSchema = notesTbSchemas
  .pick({
    customer_id: true,
    rank: true,
    body: true,
  })
  .required()
  .brand<'NoteInputs'>();

export const paramsWithCustomerIdSchema = z
  .object({
    // リクエストボディではなくパスパラメータ（e.g. /123）なのでキャメルケース
    customerId: z.coerce.number().int().positive(),
  })
  .brand<'ParamsWithCustomerId'>();

export const paramsWithCustomerIdAndRankSchema = z
  .object({
    // リクエストボディではなくパスパラメータ（e.g. /123/rank/1）なのでキャメルケース
    customerId: z.coerce.number().int().positive(),
    rank: z.coerce.number().int().positive(),
  })
  .brand<'ParamsWithCustomerIdAndRank'>();
