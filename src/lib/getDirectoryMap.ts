import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * 探索元ディレクトリ直下のサブディレクトリを走査し、
 * サブディレクトリ名ごとの画像URLリストをマッピングして返します。
 *
 * @param baseDir 探索元ディレクトリの絶対パス
 * @param baseUrl プレフィックス（例: 'http://example.com/images'）
 * @param fileFilter ファイル形式の正規表現（例: /\.(png|jpg|jpeg)$/i）
 */
export default async function getDirectoryMap(
  baseDir: string,
  baseUrl = '',
  fileFilter?: RegExp
): Promise<Record<string, string[]>> {
  // 1. 探索元ディレクトリの存在・種類チェック
  try {
    const s = await stat(baseDir);
    if (!s.isDirectory()) {
      throw new Error(`Path "${baseDir}" is not a directory.`);
    }
  } catch (err: unknown) {
    // Errorインスタンスであり、かつ 'code' プロパティを持っているか安全にチェックする（型ガード）
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      throw new Error(`Directory "${baseDir}" does not exist.`);
    }
    throw err;
  }

  const result: Record<string, string[]> = {};
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // 2. 1階層目のエントリーを取得。withFileTypes: true でファイルタイプも取得
  const entries = await readdir(baseDir, { withFileTypes: true });

  // サブディレクトリのみを抽出
  const subDirs = entries.filter((entry) => entry.isDirectory());

  // 3. 各サブディレクトリのファイル読み込みを並列処理
  await Promise.all(
    subDirs.map(async (dirEntry) => {
      const dirName = dirEntry.name;
      const subDirPath = join(baseDir, dirName);

      const files = await readdir(subDirPath, { withFileTypes: true });

      const fileUrls = files
        .filter((f) => f.isFile() && (!fileFilter || fileFilter.test(f.name)))
        .map((f) => `${cleanBaseUrl}/${dirName}/${f.name}`);

      if (fileUrls.length > 0) {
        // Promise.all内でオブジェクトの別々のキーに書き込むため、競合（スレッドセーフティ）の問題はありません
        result[dirName] = fileUrls;
      }
    })
  );

  return result;
}
