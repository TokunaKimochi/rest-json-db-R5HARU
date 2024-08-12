import { NextFunction, Request, Response } from 'express';
import { ZipCodeQuery, createAddressData } from './addressDataByZipCode.mo';

const create = async (
  req: Request<object, object, object, ZipCodeQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const addressData = await createAddressData(req.query);
    res.status(200).json(addressData);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default create;
