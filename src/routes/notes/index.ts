import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './notes.co';
import { noteInputsSchema, paramsWithCustomerIdAndRankSchema, paramsWithCustomerIdSchema } from './notes.schemas';

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
router
  .route('/:customerId/rank/:rank')
  .put(
    validateRequest({
      params: paramsWithCustomerIdAndRankSchema,
      body: noteInputsSchema,
    }) as RequestHandler,
    controllers.updateOne as unknown as RequestHandler
  )
  .delete(
    validateRequest({
      params: paramsWithCustomerIdAndRankSchema,
    }) as RequestHandler,
    controllers.deleteOne as unknown as RequestHandler
  );

export default router;
