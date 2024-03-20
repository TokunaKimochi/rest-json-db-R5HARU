import { NextFunction, Request, Response } from 'express';
import {
  CheckingOverlapCustomersQuery,
  CustomerInputs,
  FilterQuery,
  ParamsWithId,
  checkingOverlapCustomers,
  createOneCustomer,
  deleteOneCustomer,
  findAllCustomersOrSearch,
  findOneCustomer,
  updateOneCustomer,
} from './customers.mo';

export const findAllOrSearch = async (req: Request<FilterQuery>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customers = await findAllCustomersOrSearch(req.query);
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

export const createOne = async (req: Request<CustomerInputs>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await createOneCustomer(req.body as CustomerInputs);
    res.status(201).json(customer);
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
    const customer = await updateOneCustomer(req.params, req.body as CustomerInputs);
    res.status(200).json(customer);
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

export const checkingOverlap = async (
  req: Request<ParamsWithId, CheckingOverlapCustomersQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customers = await checkingOverlapCustomers(req.params, req.query as CheckingOverlapCustomersQuery);
    res.status(200).json(customers);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};
