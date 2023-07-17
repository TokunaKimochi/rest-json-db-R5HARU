import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';

export const pgp: IMain = pgPromise();

const dbConf: IConnectionParameters = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT as unknown as number,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
};

export const db: IDatabase<{}> = pgp(dbConf);
