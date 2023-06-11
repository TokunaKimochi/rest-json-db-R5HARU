import express, { Express, Response } from 'express';

const app: Express = express();

app.use(express.json());

app.get('/', (_, res: Response) => {
  res.json({
    message: '☕Hallo Local Area Network❢',
  });
});

export default app;
