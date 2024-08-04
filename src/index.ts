import 'dotenv/config';
import { config } from '@geolonia/normalize-japanese-addresses';
import env from '@/env';
import app from './app';

console.log(env);
config.japaneseAddressesApi = `${env.BASE_URL}:${env.PORT}/vendor/japanese-addresses/api/ja`;
app.listen(env.PORT, () => {
  console.log(`⚡Server listening at ${env.BASE_URL}:${env.PORT} 👀👂`);
});
