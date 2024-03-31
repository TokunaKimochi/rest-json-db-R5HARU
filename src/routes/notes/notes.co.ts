import { NextFunction, Request, Response } from 'express';
import { ParamsWithCustomerId, findAllNotesAboutCustomer } from './notes.mo';

const findAllAboutCustomer = async (
  req: Request<ParamsWithCustomerId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notes = await findAllNotesAboutCustomer(req.params);
    res.status(200).json(notes);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export default findAllAboutCustomer;
