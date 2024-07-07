import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './addressDataByZipCode.co';
import zipCodeQuerySchema from './addressDataByZipCode.schemas';

const router = Router();

router.route('/').get(
  validateRequest({
    query: zipCodeQuerySchema,
  }) as RequestHandler,
  controllers.default as unknown as RequestHandler
);

export default router;
