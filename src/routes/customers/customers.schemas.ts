import { z } from 'zod';

export const customersTbSchema = z
  .object({
    id: z.number().int().positive(),
    tel: z
      .string()
      .min(3)
      .max(15)
      .regex(/^[0-9-]+$/),
    zip_code: z
      .string()
      .min(3)
      .max(8)
      .regex(/^[0-9-]+$/),
    address1: z.string().min(1).max(32),
    address2: z.string().max(32),
    address3: z.string().max(32),
    name1: z.string().min(1).max(30),
    name2: z.string().max(30),
    alias: z.string().max(30),
    searched_name: z.string().min(1).max(90),
    address_sha1: z.string().length(40),
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
