import { NextFunction, Request, Response } from 'express';
import { FilterQuery, findAllCustomers } from './customers.mo';

// eslint-disable-next-line import/prefer-default-export
export const findAll = async (req: Request<FilterQuery>, res: Response, next: NextFunction): Promise<void> => {
  const customers = await findAllCustomers(req.query).catch((err) => {
    next(err);
  });
  res.status(200).json(customers);
};
