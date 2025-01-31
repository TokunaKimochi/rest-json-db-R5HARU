import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './shippingInstructionPrintouts.co';
import { shippingInstructionPrintHistoryInputSchema } from './shippingInstructionPrintouts.schemas';

const router = Router();

router.route('/').post(
  validateRequest({
    body: shippingInstructionPrintHistoryInputSchema,
  }) as RequestHandler,
  controllers.default as RequestHandler
);

export default router;
