import { z } from 'zod';
import {
  customersTbRowSchema,
  customerInputsSchema,
  filterQuerySchema,
  paramsWithIdSchema,
  checkingOverlapCustomersQuerySchema,
  deleteIdsSchema,
} from './customers.schemas';

export type CustomersTbRow = z.infer<typeof customersTbRowSchema>;
export type CustomerInputs = z.infer<typeof customerInputsSchema>;
export type FilterQuery = z.infer<typeof filterQuerySchema>;
export type ParamsWithId = z.infer<typeof paramsWithIdSchema>;
export type DeleteIds = z.infer<typeof deleteIdsSchema>;
export type CheckingOverlapCustomersQuery = z.infer<typeof checkingOverlapCustomersQuerySchema>;
