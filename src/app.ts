import { access, constants } from 'node:fs/promises';
import express, { Express, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import MessageResponse from 'interfaces/MessageResponse';
import * as middleWares from './middleWares';
import routers from './routes';

/* https://docs.npmjs.com/cli/v10/commands/npm-run-script
Scripts are run from the root of the package folder, regardless of what the current working directory is when npm run is called. */
access('./package.json', constants.F_OK).catch((err: string) => {
  console.error(
    '\n💥👻 サーバの起動に失敗しました\n  本サーバは `./package.json` の `scripts` フィールドから実行される事のみを想定しています\n  また、process.chdir() などでカレントディレクトリがプロジェクトルート以外に設定された\n  場合もサーバの起動に失敗します 👻💥\n'
  );
  throw new Error(err);
});

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
app.use('/vendor', express.static('./vendor'));

app.use(middleWares.notFound);
app.use(middleWares.errorHandler);

export default app;
