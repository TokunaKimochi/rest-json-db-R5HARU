import { NextFunction, Request, Response } from 'express';
import { ParamsWithProductId, PostReqNewProduct, PostReqNewSetProduct } from './products.types';
import {
  findAllCombinationsAboutProduct,
  findAllComponentsAboutProduct,
  findAllProductSkuDetails,
  findAllSingleProducts,
  registerOneRegularProduct,
  registerOneSetProduct,
} from './products.mo';

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
    const productSummary = await registerOneSetProduct(req.body);
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

export const findAllSkuDetails = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skuDetails = await findAllProductSkuDetails();
    res.status(200).json(skuDetails);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const findAllCombinationsAbout = async (
  req: Request<ParamsWithProductId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const combinations = await findAllCombinationsAboutProduct(req.params);
    res.status(200).json(combinations);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const findAllComponentsAbout = async (
  req: Request<ParamsWithProductId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const components = await findAllComponentsAboutProduct(req.params);
    res.status(200).json(components);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};
