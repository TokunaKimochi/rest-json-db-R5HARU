import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import shippingInstructionPrintHistoryTbRowSchema from './shippingInstructionPrintouts.schemas';

const router = Router();

router.route('/').post(
  validateRequest({
    body: shippingInstructionPrintHistoryTbRowSchema,
  }) as RequestHandler
  // TODO コントローラーに引き継ぎ
);

export default router;
