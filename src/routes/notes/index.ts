import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './notes.co';
import { noteInputsSchema, paramsWithCustomerIdSchema } from './notes.schemas';

const router = Router();

router
  .route('/:customerId')
  .get(
    validateRequest({
      params: paramsWithCustomerIdSchema,
    }) as RequestHandler,
    controllers.findAllAboutCustomer as unknown as RequestHandler
  )
  .post(
    validateRequest({
      params: paramsWithCustomerIdSchema,
      body: noteInputsSchema,
    }) as RequestHandler,
    controllers.createOne as unknown as RequestHandler
  );

export default router;
