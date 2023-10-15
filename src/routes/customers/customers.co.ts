import { NextFunction, Request, Response } from 'express';
import {
  CustomerInputs,
  FilterQuery,
  ParamsWithId,
  createOneCustomer,
  deleteOneCustomer,
  findAllCustomers,
  findOneCustomer,
  updateOneCustomer,
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

export const updateOne = async (
  req: Request<ParamsWithId, CustomerInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newIdObj = await updateOneCustomer(req.params, req.body);
    res.status(200).json(newIdObj);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const deleteOne = async (req: Request<ParamsWithId>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await deleteOneCustomer(req.params);
    if (result.rowCount === 0) {
      res.status(404);
      throw new Error(`🐘🔍 - DB: Row not found - Customer with id "${req.params.id}" not found.`);
    }
    res.status(200).json(result);
  } catch (err: unknown) {
    res.status(res.statusCode !== 404 ? 500 : 404);
    next(err);
  }
};
