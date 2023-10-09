import { NextFunction, Request, Response } from 'express';
import {
  CustomerInputs,
  FilterQuery,
  ParamsWithId,
  createOneCustomer,
  findAllCustomers,
  findOneCustomer,
} from './customers.mo';

export const findAll = async (req: Request<FilterQuery>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customers = await findAllCustomers(req.query);
    res.status(200).json(customers);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const findOne = async (req: Request<ParamsWithId>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await findOneCustomer(req.params);
    res.status(200).json(customer);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const createOne = async (req: Request<{}, CustomerInputs>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newIdObj = await createOneCustomer(req.body);
    res.status(201).json(newIdObj);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};
