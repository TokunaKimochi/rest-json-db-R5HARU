import { NextFunction, Request, Response } from 'express';
import { findAllProductOptions } from './options.mo';

const findAll = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productOptions = await findAllProductOptions();
    res.status(200).json(productOptions);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default findAll;
