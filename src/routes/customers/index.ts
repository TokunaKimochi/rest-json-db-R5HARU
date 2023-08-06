import { Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './customers.co';
import { filterQuerySchema } from './customers.mo';

const router = Router();

router.route('/').get(
  validateRequest({
    query: filterQuerySchema,
  }),
  controllers.findAll
);

export default router;
