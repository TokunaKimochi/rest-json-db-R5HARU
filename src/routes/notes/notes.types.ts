import { z } from 'zod';
import {
  noteInputsSchema,
  notesTbRowSchemas,
  paramsWithCustomerIdAndRankSchema,
  paramsWithCustomerIdSchema,
} from './notes.schemas';

export type ParamsWithCustomerId = z.infer<typeof paramsWithCustomerIdSchema>;
export type ParamsWithCustomerIdAndRank = z.infer<typeof paramsWithCustomerIdAndRankSchema>;
export type NotesTbRow = z.infer<typeof notesTbRowSchemas>;
export type NoteInputs = z.infer<typeof noteInputsSchema>;
