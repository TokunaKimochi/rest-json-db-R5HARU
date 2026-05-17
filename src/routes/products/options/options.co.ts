import { NextFunction, Request, Response } from 'express';
import { findAllProductOptions, findAllProductPackagingTypeFlags } from './options.mo';

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

export const findAllPackagingTypeFlags = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productPackagingTypeFlags = await findAllProductPackagingTypeFlags();
    res.status(200).json(productPackagingTypeFlags);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default findAll;
