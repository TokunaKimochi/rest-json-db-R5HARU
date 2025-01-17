import { z } from 'zod';

const shippingInstructionPrintHistoryTbRowSchema = z
  .object({
    delivery_date: z.coerce.date(),
    delivery_time_str: z.string().max(32),
    printed_at: z.string().datetime({ offset: true }),
    page_num_str: z.string().max(8),
    customer_name: z.string().max(60),
    customer_address: z.string().max(96),
    wholesaler: z.string().max(32),
    order_number: z.string().max(64),
    shipping_date: z.coerce.date(),
    carrier: z.string().max(32),
    package_count: z.coerce.number().int().nonnegative(),
    items_of_order: z.string(),
  })
  .brand<'ShippingInstructionPrintHistoryTbRow'>();

export default shippingInstructionPrintHistoryTbRowSchema;
