import { AnyZodObject } from 'zod';

export default interface ValidatedRequest {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}
