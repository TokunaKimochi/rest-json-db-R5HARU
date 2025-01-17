import { db } from '@/db';
import { ShippingInstructionPrintHistoryTbRow } from './shippingInstructionPrintouts.types';

const recordingShippingInstructionPrintout = async (body: ShippingInstructionPrintHistoryTbRow): Promise<void> => {
  const { delivery_date } = body;
};

export default recordingShippingInstructionPrintout;
