import { config } from '@geolonia/normalize-japanese-addresses';
import app from './app';

const port = process.env.PORT ?? 3001;
config.japaneseAddressesApi = `http://localhost:${port}/vendor/japanese-addresses/api/ja`;
app.listen(port, () => {
  console.log(`⚡Server listening at http://localhost:${port} 👀👂`);
});
