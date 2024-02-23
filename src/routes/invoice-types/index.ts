import { RequestHandler, Router } from 'express';
import findAll from './invoiceTypes.co';

const router = Router();

router.route('/').get(findAll as RequestHandler);

export default router;
