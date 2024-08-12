import pgPromise, { IDatabase, IMain } from 'pg-promise';
import type { IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import env from '@/env';

export class DataBaseError extends Error {
  constructor(message: string) {
    super(`🐘 - DB Error - ${message}`);
    this.name = 'DataBaseError';
  }
}

const pgp: IMain = pgPromise();

const dbConf: IConnectionParameters = {
  host: env.PG_HOST,
  port: env.PG_PORT,
  user: env.PG_USERNAME,
  password: env.PG_PASSWORD,
  database: env.PG_DATABASE,
  allowExitOnIdle: true,
};

export const db: IDatabase<object> = pgp(dbConf);
