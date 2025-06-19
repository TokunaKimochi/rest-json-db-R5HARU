import z from 'zod';

export const productOptionsCommonSchemas = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(32),
  created_at: z.string().max(40),
  updated_at: z.string().max(40),
});

export const productOptionsIdAndNameSchemas = productOptionsCommonSchemas
  .pick({
    id: true,
    name: true,
  })
  .required();

export const optionTypesSchemas = z.enum([
  'unit_types',
  'product_sourcing_types',
  'product_categories',
  'product_packaging_types',
  'product_inner_packaging_types',
  'suppliers',
]);
