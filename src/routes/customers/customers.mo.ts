import { z } from 'zod';
import { db } from '../../db';

export const customersTbSchema = z
  .object({
    id: z.number().int().nonnegative(),
    tel: z.string().min(3).max(15),
    zip_code: z.string().min(3).max(8),
    address1: z.string().min(1).max(32),
    address2: z.string().max(32),
    address3: z.string().max(32),
    name1: z.string().min(1).max(30),
    name2: z.string().max(30),
    alias: z.string().max(30),
    searched_name: z.string().min(1).max(90),
    address_sha1: z.string().length(40),
    sha1_same_val: z.number().int().nonnegative(),
    nja_pref: z.string().max(4),
    nja_city: z.string().max(12),
    nja_town: z.string().max(16),
    nja_addr: z.string().max(32),
    nja_lat: z.string().max(16),
    nja_lng: z.string().max(16),
    nja_level: z.number().int().gte(0).lte(3),
    notes: z.number().int().nonnegative(),
    times: z.number().int().nonnegative(),
    invoice_id: z.number().int().nonnegative(),
    created_at: z.string().max(40),
    updated_at: z.string().max(40),
  })
  .partial();

export const filterQuerySchema = z
  .object({
    size: z.number().int().gte(1).lte(100).default(10),
    page: z.number().int().positive().default(1),
  })
  .partial();

export type CustomersTb = z.infer<typeof customersTbSchema>;
export type FilterQuery = z.infer<typeof filterQuerySchema>;

export const findAllCustomers = async (q: FilterQuery): Promise<CustomersTb[]> => {
  const limit = q.size || 10;
  const offset = limit * (q.page || 1) - limit;
  const result: CustomersTb[] = await db
    .manyOrNone(`SELECT * FROM customers ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`)
    .catch((err) => {
      throw new Error(err);
    });
  return result;
};
