import { config } from '@geolonia/normalize-japanese-addresses';
import env from '@/env';
import app from './app';

config.japaneseAddressesApi = `http://${env.API_HOST}:${env.PORT}/vendor/japanese-addresses/api/ja`;
app.listen(env.PORT, () => {
  console.log(`⚡Server listening at http://${env.API_HOST}:${env.PORT} 👀👂`);
});
