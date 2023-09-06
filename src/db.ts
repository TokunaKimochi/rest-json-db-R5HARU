import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset';

export class DataBaseError extends Error {
  constructor(message: Error) {
    super(`🐘 - DB Error - ${message}`);
    this.name = 'DataBaseError';
  }
}

export const pgp: IMain = pgPromise();

const dbConf: IConnectionParameters = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT as unknown as number,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  allowExitOnIdle: true,
};

export const db: IDatabase<{}> = pgp(dbConf);
