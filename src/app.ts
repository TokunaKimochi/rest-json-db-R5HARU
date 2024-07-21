import express, { Express, Response } from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import 'dotenv/config';

import MessageResponse from 'interfaces/MessageResponse';
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

app.use('/api', routers);
// 静的ファイルの配信
console.log(__dirname);
app.use('/vendor', express.static(path.join(__dirname, '../vendor')));

app.use(middleWares.notFound);
app.use(middleWares.errorHandler);

export default app;
