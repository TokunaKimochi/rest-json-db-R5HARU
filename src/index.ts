import { config } from '@geolonia/normalize-japanese-addresses';
import env from '@/env';
import app from './app';

config.japaneseAddressesApi = `${env.BASE_URL}/vendor/japanese-addresses/api/ja`;
app.listen(env.PORT, () => {
  console.log(`⚡Server listening at ${env.BASE_URL} 👀👂`);
});
