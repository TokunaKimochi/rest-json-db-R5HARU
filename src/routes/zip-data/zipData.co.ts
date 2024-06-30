import { NextFunction, Request, Response } from 'express';
import { ZipCodeInput, createZipData } from './zipData.mo';

const create = async (req: Request<ZipCodeInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zipData = await createZipData(req.body as ZipCodeInput);
    res.status(200).json(zipData);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default create;
