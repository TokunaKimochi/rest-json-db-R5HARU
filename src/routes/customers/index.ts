import { Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './customers.co';
import { customerInputsSchema, filterQuerySchema, paramsWithIdSchema } from './customers.schemas';

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
      body: customerInputsSchema,
    }),
    controllers.createOne
  );
router.route('/:id').get(
  validateRequest({
    params: paramsWithIdSchema,
  }),
  controllers.findOne
);

export default router;
