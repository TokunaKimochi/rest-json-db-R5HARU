import { z } from 'zod';

export const invoiceTypesTbSchemas = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(32),
  created_at: z.string().max(40),
  updated_at: z.string().max(40),
});

export const invoiceTypesIdAndNameSchemas = invoiceTypesTbSchemas
  .pick({
    id: true,
    name: true,
  })
  .required();
