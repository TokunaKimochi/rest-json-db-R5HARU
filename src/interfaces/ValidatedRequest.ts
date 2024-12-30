import { ZodSchema } from 'zod';

export default interface ValidatedRequest {
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
}
