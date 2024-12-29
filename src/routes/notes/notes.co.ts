import { NextFunction, Request, Response } from 'express';
import { createOneNote, deleteOneNote, findAllNotesAboutCustomer, updateOneNote } from './notes.mo';
import { NoteInputs, ParamsWithCustomerId, ParamsWithCustomerIdAndRank } from './notes.types';

export const findAllAboutCustomer = async (
  req: Request<ParamsWithCustomerId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notes = await findAllNotesAboutCustomer(req.params);
    res.status(200).json(notes);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const createOne = async (
  req: Request<ParamsWithCustomerId, object, NoteInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { customer_id } = req.body;
    if (req.params.customerId !== customer_id) {
      throw new Error(
        `Illegal call detection: params.customerId is ${req.params.customerId}, body.customer_id is ${customer_id}`
      );
    }
    const customerAndCurrentNote = await createOneNote(req.params, req.body);
    res.status(201).json(customerAndCurrentNote);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const updateOne = async (
  req: Request<ParamsWithCustomerIdAndRank, object, NoteInputs>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { customer_id } = req.body;
    if (req.params.customerId !== customer_id) {
      throw new Error(
        `Illegal call detection: params.customerId is ${req.params.customerId}, body.customer_id is ${customer_id}`
      );
    }
    const customerAndCurrentNote = await updateOneNote(req.params, req.body);
    res.status(200).json(customerAndCurrentNote);
  } catch (err: unknown) {
    console.error(err);
    res.status(500);
    next(err);
  }
};

export const deleteOne = async (
  req: Request<ParamsWithCustomerIdAndRank>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deleteOneNote(req.params);
    if (result.rowCount === 0) {
      res.status(404);
      throw new Error(
        `🐘🔍 - DB: Record not found - Note with customer_id "${req.params.customerId}" and rank "${req.params.rank}" not found.`
      );
    }
    res.status(200).json(result);
  } catch (err: unknown) {
    res.status(res.statusCode !== 404 ? 500 : 404);
    next(err);
  }
};
