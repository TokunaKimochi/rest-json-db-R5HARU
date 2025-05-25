import { z } from 'zod/v4';

export const commonProductsSchema = z.object({
  id: z.int().positive(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const commonProductsPlusStr32NameSchema = commonProductsSchema.extend({
  name: z.string().trim().min(1).max(32),
});
