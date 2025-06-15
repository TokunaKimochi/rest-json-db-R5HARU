import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import { postReqNewProductSchema } from './products.schemas';

import findAll from './options/options.co';

const router = Router();

// TODO バリデーションのみ、要コントロール追加
router.route('/new').post(validateRequest({ body: postReqNewProductSchema }) as RequestHandler);
router.route('/options').get(findAll as RequestHandler);

export default router;
