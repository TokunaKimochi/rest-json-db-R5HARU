import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './shippingInstructionPrintouts.co';
import {
  findShippingInstructionsQuerySchema,
  shippingInstructionModificationSchema,
  shippingInstructionPrintIDSchema,
  shippingInstructionPrintInputSchema,
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
      body: shippingInstructionPrintInputSchema,
    }) as RequestHandler,
    controllers.createOne as RequestHandler
  )
  .put(
    validateRequest({
      body: shippingInstructionModificationSchema,
      query: shippingInstructionPrintIDSchema,
    }) as RequestHandler,
    controllers.updateOne as unknown as RequestHandler
  )
  .delete(
    validateRequest({
      query: shippingInstructionPrintIDSchema,
    }) as RequestHandler,
    controllers.deleteOne as unknown as RequestHandler
  );

export default router;
