import express, { Express, Response } from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import MessageResponse from 'interfaces/MessageResponse';
import env from '@/env';
import * as middleWares from './middleWares';
import routers from './routes';

const app: Express = express();

app.use(morgan('dev'));
// TODO *** !!! *** !!! ***
app.use(cors());
app.use(express.json());

app.get('/', (_, res: Response<MessageResponse>): void => {
  res.json({
    message: '☕Hallo Local Area Network❢',
  });
});
// 204 No Content
app.get('/favicon.ico', (_, res) => res.status(204));

app.use('/api', routers);
// 静的ファイルの配信
app.use('/vendor', express.static(path.join(__dirname, env.VENDOR_RELATIVE_PATH)));

app.use(middleWares.notFound);
app.use(middleWares.errorHandler);

export default app;
