import { NextFunction, Request, Response } from 'express';
import getDirectoryMap from '@/lib/getDirectoryMap';
import env from '@/env';

const findAll = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imgDir = 'vendor/in-house/api/images/products';
    const images = await getDirectoryMap(`./${imgDir}`, `${env.BASE_URL}/${imgDir}`, /\.(png|jpg|jpeg|webp)$/i);
    res.status(200).json(images);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export default findAll;
