import { RequestHandler, Router } from 'express';
import { validateRequest } from '../../middleWares';
import { postReqNewProductSchema } from './products.schemas';

const router = Router();

router.route('/new').post(validateRequest({ body: postReqNewProductSchema }) as RequestHandler);
