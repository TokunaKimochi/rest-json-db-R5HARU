import { z } from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().refine((url) => url.startsWith('http://') || url.startsWith('https://')),
  PORT: z.coerce.number().min(1024).max(65535),
});

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

export default env;
