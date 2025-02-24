import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './shippingInstructionPrintouts.co';
import {
  findShippingInstructionsQuerySchema,
  shippingInstructionPrintHistoryIDSchema,
  shippingInstructionPrintHistoryInputSchema,
} from './shippingInstructionPrintouts.schemas';

const router = Router();

router
  .route('/')
  .get(
    validateRequest({
      query: findShippingInstructionsQuerySchema,
    }) as RequestHandler,
    controllers.findSome as unknown as RequestHandler
  )
  .post(
    validateRequest({
      body: shippingInstructionPrintHistoryInputSchema,
    }) as RequestHandler,
    controllers.createOne as RequestHandler
  )
  .delete(
    validateRequest({
      query: shippingInstructionPrintHistoryIDSchema,
    }) as RequestHandler,
    controllers.deleteOne as unknown as RequestHandler
  );

export default router;
