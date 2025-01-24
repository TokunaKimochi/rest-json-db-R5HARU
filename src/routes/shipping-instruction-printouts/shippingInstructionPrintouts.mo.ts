import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import { ShippingInstructionPrintHistoryTbRow } from './shippingInstructionPrintouts.types';

const createOneShippingInstructionPrintout = async (
  body: ShippingInstructionPrintHistoryTbRow
): Promise<null | string> => {
  if (
    body.delivery_date === '' ||
    body.customer_name === '' ||
    body.customer_address === '' ||
    body.items_of_order === ''
  ) {
    return '🖊️必要項目が不足しています😓💦';
  }
  await db.tx('recording-the-printout-of-shipping-instructions', async (t) => {
    await t
      .proc('create_year_range_partition_by_date', ['shipping_instruction_print_history', body.delivery_date])
      .catch((err: string) => Promise.reject(new DataBaseError(err)));

    let record = { ...body };
    if (body.shipping_date === '') {
      // 分割代入引数で shipping_date を捨てる🗑️
      record = (({ shipping_date, ..._rest }) => _rest)(record);
    }

    const { text, values } = insert('shipping_instruction_print_history', record).toParams();
    await t.none(text, values).catch((err: string) => Promise.reject(new DataBaseError(err)));
  });
  return null;
};

export default createOneShippingInstructionPrintout;
