import { z } from 'zod';

const envSchema = z.object({
  // `http://` or `https://` の部分は今のところハードコード
  API_HOST: z.union([z.string().ip(), z.literal('localhost')]),
  PORT: z.coerce.number().min(1024).max(65535),
  // ポスグレ
  PG_HOST: z.union([z.string().ip(), z.literal('localhost')]),
  PG_PORT: z.coerce.number().min(1024).max(65535),
  PG_USERNAME: z.string().min(3),
  PG_PASSWORD: z.string().min(7),
  PG_DATABASE: z.string().min(3),
  // 一時ファイル保存ディレクトリを設定し、使用する
  TEMP_DIR: z.string().startsWith('./').min(4).optional(),
});

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

export default env;
