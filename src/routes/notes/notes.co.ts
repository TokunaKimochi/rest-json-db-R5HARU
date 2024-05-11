import { NextFunction, Request, Response } from 'express';
import {
  NoteInputs,
  ParamsWithCustomerId,
  ParamsWithCustomerIdAndRank,
  createOneNote,
  findAllNotesAboutCustomer,
  updateOneNote,
} from './notes.mo';

export const findAllAboutCustomer = async (
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

export const createOne = async (
  req: Request<ParamsWithCustomerId, NoteInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { customer_id } = req.body as NoteInputs;
    if (req.params.customerId !== customer_id) {
      throw new Error(
        `Illegal call detection: params.customerId is ${req.params.customerId}, body.customer_id is ${customer_id}`
      );
    }
    const note = await createOneNote(req.params, req.body as NoteInputs);
    res.status(200).json(note);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};

export const updateOne = async (
  req: Request<ParamsWithCustomerIdAndRank, NoteInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { customer_id } = req.body as NoteInputs;
    if (req.params.customerId !== customer_id) {
      throw new Error(
        `Illegal call detection: params.customerId is ${req.params.customerId}, body.customer_id is ${customer_id}`
      );
    }
    const note = await updateOneNote(req.params, req.body as NoteInputs);
    res.status(200).json(note);
  } catch (err: unknown) {
    res.status(500);
    next(err);
  }
};
