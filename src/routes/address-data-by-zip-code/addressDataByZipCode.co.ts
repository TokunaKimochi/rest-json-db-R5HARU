import { NextFunction, Request, Response } from 'express';
import { createAddressData } from './addressDataByZipCode.mo';
import { ZipCodeQuery } from './addressDataByZipCode.types';

const create = async (
  req: Request<object, object, object, ZipCodeQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const returnData = await createAddressData(req.query);
    // もし、厳密（？）に HTTP エラーを返したいなら、コメントアウト
    /* if (returnData.error) {
      const { loading, inValid, noFirstThreeDigits, notFound, notReady } = returnData.error;
      if (loading) {
        res.status(202).json(returnData);
      } else if (inValid) {
        res.status(400).json(returnData);
      } else if (noFirstThreeDigits ?? notFound) {
        res.status(404).json(returnData);
      } else if (notReady) {
        res.status(503).json(returnData);
      } else {
        res.status(500).json(returnData);
      }
    } */
    res.status(200).json(returnData);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default create;
