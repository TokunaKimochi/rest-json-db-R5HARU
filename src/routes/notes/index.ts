import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './notes.co';
import { paramsWithCustomerIdSchema } from './notes.schemas';

const router = Router();

router.route('/:customerId').get(
  validateRequest({
    params: paramsWithCustomerIdSchema,
  }) as RequestHandler,
  controllers.default as unknown as RequestHandler
);

export default router;
