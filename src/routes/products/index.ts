import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './products.co';
import { postReqNewProductSchema, postReqNewSetProductSchema } from './products.schemas';

import findAll from './options/options.co';

const router = Router();

router
  .route('/')
  .get(controllers.findAllSkuDetails as RequestHandler)
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
router.route('/single-products').get(controllers.findAllSingles as RequestHandler);

// パッケージタイプや発注先などの各セレクト・オプションを一括返却
router.route('/options').get(findAll as RequestHandler);

export default router;
