import { Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './customers.co';
import { createCustomerInputSchema, filterQuerySchema } from './customers.mo';

const router = Router();

router
  .route('/')
  .get(
    validateRequest({
      query: filterQuerySchema,
    }),
    controllers.findAll
  )
  .post(
    validateRequest({
      body: createCustomerInputSchema,
    }),
    controllers.createOne
  );

export default router;
