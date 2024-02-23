import express, { Response } from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import customers from './customers';
import invoiceTypes from './invoice-types';

const router = express.Router();

router.get('/', (_, res: Response<MessageResponse>): void => {
  res.json({
    message: 'API: ⚒The current version has always been v1',
  });
});

router.use('/customers', customers);
router.use('/invoice-types', invoiceTypes);

export default router;
