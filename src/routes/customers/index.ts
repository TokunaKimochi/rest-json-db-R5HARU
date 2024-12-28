import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './customers.co';
import {
  checkingOverlapCustomersQuerySchema,
  customerInputsSchema,
  customersTbRowSchema,
  deleteIdsSchema,
  filterQuerySchema,
  paramsWithIdSchema,
} from './customers.schemas';

const router = Router();

router
  .route('/')
  .get(
    validateRequest({
      query: filterQuerySchema,
    }) as RequestHandler,
    controllers.findAllOrSearch as RequestHandler
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
    controllers.findOne as unknown as RequestHandler
  )
  .put(
    validateRequest({
      params: paramsWithIdSchema,
      body: customerInputsSchema,
    }) as RequestHandler,
    controllers.updateOne as unknown as RequestHandler
  )
  .delete(
    validateRequest({
      params: paramsWithIdSchema,
    }) as RequestHandler,
    controllers.deleteOne as unknown as RequestHandler
  );
router.route('/:id/checkingOverlap').get(
  validateRequest({
    params: paramsWithIdSchema,
    query: checkingOverlapCustomersQuerySchema,
  }) as RequestHandler,
  controllers.checkingOverlap as unknown as RequestHandler
);
router.route('/output').post(
  validateRequest({
    body: customersTbRowSchema,
  }) as RequestHandler,
  controllers.createOneTsv as unknown as RequestHandler
);
// HTTP の DELETE リクエストメソッドはボディをあえて使わないのが業界の空気らしい、、、
// https://scrapbox.io/heguro/REST_APIにおける複数削除の設計をどうするか
router
  .route('/delete')
  .post(
    validateRequest({ body: deleteIdsSchema }) as RequestHandler,
    controllers.deleteInBulk as unknown as RequestHandler
  );

export default router;
