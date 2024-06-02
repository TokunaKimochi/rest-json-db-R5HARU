import { NextFunction, Request, Response } from 'express';
import { findAllInvoiceTypes } from './invoiceTypes.mo';

const findAll = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoiceTypes = await findAllInvoiceTypes();
    res.status(200).json(invoiceTypes);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default findAll;
