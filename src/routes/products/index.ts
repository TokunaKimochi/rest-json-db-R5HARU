import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './products.co';
import { paramsWithProductIdSchema, postReqNewProductSchema, postReqNewSetProductSchema } from './products.schemas';

import findAll from './options/options.co';
import allImages from './images/images.co';

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

router
  .route('/:productId/combinations')
  .get(
    validateRequest({ params: paramsWithProductIdSchema }) as RequestHandler,
    controllers.findAllCombinationsAbout as unknown as RequestHandler
  );

router
  .route('/:productId/components')
  .get(
    validateRequest({ params: paramsWithProductIdSchema }) as RequestHandler,
    controllers.findAllComponentsAbout as unknown as RequestHandler
  );

// パッケージタイプや発注先などの各セレクト・オプションを一括返却
router.route('/options').get(findAll as RequestHandler);
router.route('/images').get(allImages as RequestHandler);

export default router;
