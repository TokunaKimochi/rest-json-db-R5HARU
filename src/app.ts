import express, { Express, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import 'dotenv/config';

import MessageResponse from 'interfaces/MessageResponse';
import * as middleWares from './middleWares';
import routers from './routes';

const app: Express = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (_, res: Response<MessageResponse>): void => {
  res.json({
    message: '☕Hallo Local Area Network❢',
  });
});

app.use('/api', routers);

app.use(middleWares.notFound);
app.use(middleWares.errorHandler);

export default app;
