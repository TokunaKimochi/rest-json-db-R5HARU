import { NextFunction, Request, Response } from 'express';
import {
  FindShippingInstructionsQuery,
  ShippingInstructionPrintHistoryID,
  ShippingInstructionPrintHistoryInput,
} from './shippingInstructionPrintouts.types';
import {
  createOneShippingInstructionPrintout,
  deleteOneHistory,
  findSomeShippingInstructions,
} from './shippingInstructionPrintouts.mo';

export const findSome = async (
  req: Request<object, object, object, FindShippingInstructionsQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const printHistories = await findSomeShippingInstructions(req.query);
    res.status(200).json(printHistories);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const createOne = async (
  req: Request<object, object, ShippingInstructionPrintHistoryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createOneShippingInstructionPrintout(req.body);
    if (typeof result === 'object') {
      res.status(201).json({
        isSuccess: true,
        id: result,
        message: `${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })} -- 出荷指示書の印刷履歴 追加`,
      });
    } else {
      res.status(400).json({
        isSuccess: false,
        message: `${result} -- ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })}`,
      });
    }
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      message: `出荷指示書の印刷履歴 追加失敗 -- ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })}`,
    });
    next(err);
  }
};

export const deleteOne = async (
  req: Request<object, object, object, ShippingInstructionPrintHistoryID>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deleteOneHistory(req.query);
    if (result.rowCount === 0) {
      res.status(404);
      throw new Error(
        `🐘🔍 - DB: Record not found - Shipping_instruction_print_history with delivery_date "${req.query.delivery_date}" and printed_at "${req.query.printed_at}" not found.`
      );
    }
    res.status(200).json(result);
  } catch (err: unknown) {
    res.status(res.statusCode !== 404 ? 500 : 404);
    next(err);
  }
};
