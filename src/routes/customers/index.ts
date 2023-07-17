import { Router } from 'express';
import * as controllers from './customers.co';

const router = Router();

router.get('/', controllers.findAll);

export default router;
