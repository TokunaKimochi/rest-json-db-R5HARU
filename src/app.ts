import express, { Express, Response } from 'express';
import cors from 'cors';
import MessageResponse from 'interfaces/MessageResponse';
import * as middleWares from './middleWares';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res: Response<MessageResponse>) => {
  res.json({
    message: '☕Hallo Local Area Network❢',
  });
});

app.use(middleWares.notFound);
app.use(middleWares.errorHandler);

export default app;
