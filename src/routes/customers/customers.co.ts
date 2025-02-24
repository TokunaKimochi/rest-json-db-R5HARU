import { NextFunction, Request, Response } from 'express';
import {
  checkingOverlapCustomers,
  createOneCustomer,
  createOneCustomerTsv,
  deleteCustomersInBulk,
  deleteOneCustomer,
  findAllCustomersOrSearch,
  findOneCustomer,
  updateOneCustomer,
} from './customers.mo';
import {
  CheckingOverlapCustomersQuery,
  CustomerInputs,
  CustomersTbRow,
  DeleteIds,
  FilterQuery,
  ParamsWithId,
} from './customers.types';

export const findAllOrSearch = async (
  req: Request<object, object, object, FilterQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customers = await findAllCustomersOrSearch(req.query);
    res.status(200).json(customers);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const findOne = async (req: Request<ParamsWithId>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await findOneCustomer(req.params);
    res.status(200).json(customer);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const createOne = async (
  req: Request<object, object, CustomerInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await createOneCustomer(req.body);
    res.status(201).json(customer);
  } catch (err: unknown) {
    // console.error(err);
    res.status(500);
    next(err);
  }
};

export const updateOne = async (
  req: Request<ParamsWithId, object, CustomerInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await updateOneCustomer(req.params, req.body);
    res.status(200).json(customer);
  } catch (err: unknown) {
    // console.error(err);
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
  req: Request<ParamsWithId, object, object, CheckingOverlapCustomersQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customers = await checkingOverlapCustomers(req.params, req.query);
    res.status(200).json(customers);
  } catch (err: unknown) {
    // console.error(err);
    res.status(500);
    next(err);
  }
};

export const createOneTsv = async (
  req: Request<object, object, CustomersTbRow>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await createOneCustomerTsv(req.body);
    res.status(201).json({
      isSuccess: true,
      message: `${new Date().toLocaleString('sv', { timeZone: 'Asia/Tokyo' })} -- customer.tsv 作成`,
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      message: `customer.tsv 作成失敗 -- ${new Date().toLocaleString('sv', { timeZone: 'Asia/Tokyo' })}`,
    });
    next(err);
  }
};

export const deleteInBulk = async (
  req: Request<object, object, DeleteIds>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deleteCustomersInBulk(req.body);
    if (result.rowCount === 0) {
      res.status(404);
      throw new Error('🐘🔍 - DB: Row not found - Customer with id is not found.');
    }
    res.status(200).json(result);
  } catch (err: unknown) {
    res.status(res.statusCode !== 404 ? 500 : 404);
    next(err);
  }
};
