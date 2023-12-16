import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './customers.co';
import { customerInputsSchema, filterQuerySchema, paramsWithIdSchema } from './customers.schemas';

const router = Router();

router
  .route('/')
  .get(
    validateRequest({
      query: filterQuerySchema,
    }) as RequestHandler,
    controllers.findAll as RequestHandler
  )
  .post(
    validateRequest({
      body: customerInputsSchema,
    }) as RequestHandler,
    controllers.createOne as unknown as RequestHandler
  );
router
  .route('/:id')
  .get(
    validateRequest({
      params: paramsWithIdSchema,
    }) as RequestHandler,
    controllers.findOne as RequestHandler
  )
  .put(
    validateRequest({
      params: paramsWithIdSchema,
      body: customerInputsSchema,
    }) as RequestHandler,
    controllers.updateOne as RequestHandler
  )
  .delete(
    validateRequest({
      params: paramsWithIdSchema,
    }) as RequestHandler,
    controllers.deleteOne as RequestHandler
  );

export default router;
