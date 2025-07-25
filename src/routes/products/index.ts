import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './products.co';
import { postReqNewProductSchema, postReqNewSetProductSchema } from './products.schemas';

import findAll from './options/options.co';

const router = Router();

router
  .route('/')
  .post(
    validateRequest({ body: postReqNewProductSchema }) as RequestHandler,
    controllers.registerOneRegular as RequestHandler
  );
router
  .route('/set-item')
  .post(
    validateRequest({ body: postReqNewSetProductSchema }) as RequestHandler,
    controllers.registerOneSetItem as RequestHandler
  );
router.route('/options').get(findAll as RequestHandler);

export default router;
