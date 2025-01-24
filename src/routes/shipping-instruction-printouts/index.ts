import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import * as controllers from './shippingInstructionPrintouts.co';
import shippingInstructionPrintHistoryTbRowSchema from './shippingInstructionPrintouts.schemas';

const router = Router();

router.route('/').post(
  validateRequest({
    body: shippingInstructionPrintHistoryTbRowSchema,
  }) as RequestHandler,
  controllers.default as RequestHandler
);

export default router;
