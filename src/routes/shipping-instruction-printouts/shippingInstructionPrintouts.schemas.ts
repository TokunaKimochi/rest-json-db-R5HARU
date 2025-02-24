import { z } from 'zod';

export const shippingInstructionPrintHistoryInputSchema = z.object({
  delivery_date: z.coerce
    .date()
    .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })),
  delivery_time_str: z.string().max(32),
  // タイムスタンプ with Timezone
  printed_at: z.string().datetime({ offset: true }).optional(),
  page_num_str: z.string().max(8),
  customer_name: z.string().max(60),
  customer_address: z.string().max(96),
  wholesaler: z.string().max(32),
  order_number: z.string().max(64),
  shipping_date: z
    .union([
      // ただし、DB側はDATE型で固定なのでデフォルトになるように
      // shipping_date 自体を削る処理をする
      z.string().length(0),
      z.coerce.date().transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })),
    ])
    .optional(),
  carrier: z.string().max(32),
  package_count: z.coerce.number().int().nonnegative().optional(),
  items_of_order: z.string(),
});
// .extend ここでは上書き
export const shippingInstructionPrintHistoryTbRowSchema = shippingInstructionPrintHistoryInputSchema.required().extend({
  shipping_date: z.coerce
    .date()
    .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })),
  package_count: z.coerce.number().int().nonnegative().nullable(),
});

export const findShippingInstructionsQuerySchema = z
  .object({
    category: z.enum(['delivery_date', 'printed_at', 'shipping_date']),
    dateA: z.coerce.date().optional(),
    dateB: z.coerce.date().optional(),
  })
  .brand<'FindShippingInstructionsQuery'>();

export const shippingInstructionPrintHistoryIDSchema = z
  .object({
    delivery_date: z.coerce
      .date()
      .transform((val) => val.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })),
    printed_at: z
      .string()
      .min(22)
      .regex(/[0-9:.+ -]+/),
  })
  .brand<'ShippingInstructionPrintHistoryID'>();
