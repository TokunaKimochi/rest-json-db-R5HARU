// eslint-disable-next-line import/no-extraneous-dependencies
import { Service } from 'node-windows';
import path from 'path';
import env from '@/env';

const svc = new Service({
  name: `A${env.PORT}__REST_JSON_DB_SERVER`,
  description: 'The nodejs.org REST API web server.',
  script: path.join(__dirname, '../../assets/freezeBuild.js'),
  env: Object.entries(env).map(([key, val]) => {
    if (typeof val === 'string') {
      return { name: key, value: val };
    }
    return { name: key, value: val.toString() };
  }),
});

export default svc;
