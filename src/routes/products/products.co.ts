import { NextFunction, Request, Response } from 'express';
import { PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { findAllSingleProducts, registerOneRegularProduct, registerOneSetProduct } from './products.mo';

export const registerOneRegular = async (
  req: Request<object, object, PostReqNewProduct>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productSummary = await registerOneRegularProduct(req.body);
    if (productSummary.isRegistered === false) {
      res.status(200).json(productSummary);
    } else {
      res.status(201).json(productSummary);
    }
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const registerOneSetItem = async (
  req: Request<object, object, PostReqNewSetProduct>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await registerOneSetProduct(req.body);
    res.status(201);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const findAllSingles = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const singleProducts = await findAllSingleProducts();
    res.status(200).json(singleProducts);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};
