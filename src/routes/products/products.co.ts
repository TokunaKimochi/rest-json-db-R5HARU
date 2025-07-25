import { NextFunction, Request, Response } from 'express';
import { PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import { registerOneRegularProduct, registerOneSetProduct } from './products.mo';

export const registerOneRegular = (
  req: Request<object, object, PostReqNewProduct>,
  res: Response,
  next: NextFunction
): void => {
  try {
    registerOneRegularProduct(req.body);
    res.status(201);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const registerOneSetItem = (
  req: Request<object, object, PostReqNewSetProduct>,
  res: Response,
  next: NextFunction
): void => {
  try {
    registerOneSetProduct(req.body);
    res.status(201);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};
