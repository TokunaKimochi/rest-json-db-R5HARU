import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './zipData.co';
import zipCodeInputSchema from './zipData.schemas';

const router = Router();

router.route('/').post(
  validateRequest({
    body: zipCodeInputSchema,
  }) as RequestHandler,
  controllers.default as unknown as RequestHandler
);

export default router;
