import { DataBaseError, db } from '@/db';
import { insert } from 'sql-bricks';
import {
  FindShippingInstructionsQuery,
  ShippingInstructionPrintHistoryInput,
  ShippingInstructionPrintHistoryTbRow,
} from './shippingInstructionPrintouts.types';

export const findSomeShippingInstructions = async ({
  category,
  dateA,
  dateB,
}: FindShippingInstructionsQuery): Promise<ShippingInstructionPrintHistoryTbRow[] | []> => {
  const nextDayString = (date: Date): string => {
    // 元の Date オブジェクトを変更しないようにコピーを作成
    const newDate = new Date(date);
    // setDate() を使用して日数を加算
    newDate.setDate(newDate.getDate() + 1);
    const newDateString = newDate.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' });
    return newDateString;
  };
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  // AB 同じ もしくは両方 undefined
  if (dateA === dateB) {
    if (dateA === undefined) {
      startDate = new Date();
    } else {
      startDate = dateA;
    }
    endDate = undefined;
    // AB 有効な Date 型
  } else if (dateA !== undefined && dateB !== undefined) {
    if (dateA < dateB) {
      startDate = dateA;
      endDate = dateB;
    } else {
      startDate = dateB;
      endDate = dateA;
    }
    // 片方有効な Date 型、もう片方 undefined
  } else {
    startDate = dateA ?? dateB;
    endDate = undefined;
  }
  const startDateStr = startDate?.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' });
  let dayAfterEndDateStr: string;

  if (category === 'printed_at') {
    // コンパイラを非nullアサーション演算子で懐柔💦
    dayAfterEndDateStr = endDate === undefined ? nextDayString(startDate!) : nextDayString(endDate);
    const result: ShippingInstructionPrintHistoryTbRow[] = await db
      .manyOrNone(
        'SELECT * FROM shipping_instruction_print_history WHERE printed_at > $1 AND printed_at < $2 ORDER BY printed_at',
        [startDateStr, dayAfterEndDateStr]
      )
      .catch((err: string) => Promise.reject(new DataBaseError(err)));
    return result;
  }
};

export const createOneShippingInstructionPrintout = async (
  body: ShippingInstructionPrintHistoryInput
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

    let record: ShippingInstructionPrintHistoryInput = { ...body };
    if (body.shipping_date === '') {
      // 即時関数の分割代入引数で shipping_date を捨てる🗑️
      record = (({ shipping_date, ..._rest }) => _rest)(record);
    }
    if (body.package_count === 0) {
      // 即時関数の分割代入引数で package_count を捨てる🗑️
      record = (({ package_count, ..._rest }) => _rest)(record);
    }

    const { text, values } = insert('shipping_instruction_print_history', record).toParams();
    await t.none(text, values).catch((err: string) => Promise.reject(new DataBaseError(err)));
  });
  return null;
};
