import { NextFunction, Request, Response } from 'express';
import { ShippingInstructionPrintHistoryTbRow } from './shippingInstructionPrintouts.types';
import createOneShippingInstructionPrintout from './shippingInstructionPrintouts.mo';

const createOne = async (
  req: Request<object, object, ShippingInstructionPrintHistoryTbRow>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createOneShippingInstructionPrintout(req.body);
    if (result === null) {
      res.status(201).json({
        isSuccess: true,
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

export default createOne;
