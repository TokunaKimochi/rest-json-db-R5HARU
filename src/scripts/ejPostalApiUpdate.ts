import { spawn } from 'node:child_process';
import symlinkDir from 'symlink-dir';

const date = new Date().toLocaleString('sv', { timeZone: 'Asia/Tokyo' }).replace(/\D/g, '.');
const targetPath = `./vendor/easy-ja-postal-code/${date}`;

const runEjpcGenerateJson = () =>
  new Promise<void>((resolve) => {
    // 依存関係の cli を pnpm run。`pnpm exec` だと npm scripts と関係なしに呼び出せる
    const subProcess = spawn('pnpm', ['exec', 'ejpc-generate-json', '-d', targetPath, '-t'], {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
    });
    if (!subProcess) console.error('⚠️予期しない動作を検出しました！');
    process.stdout.write('Downloading and JSON generating.');
    subProcess.stdout.on('data', (data) => {
      if (typeof data !== 'object') console.error('⚠️予期しない動作を検出しました！');
      process.stdout.write('.');
    });
    subProcess.on('close', () => {
      process.stdout.write('\nDone.\n');
      resolve();
    });
  });

async function main() {
  await runEjpcGenerateJson();
  console.log('●工程1/2: 成功✨ JSON を作成しました');

  const resultObj = (await symlinkDir(targetPath, './vendor/easy-ja-postal-code/api').catch((e: string) =>
    console.error(`  >>>> ✘ ${e}`)
  )) || { warn: '' };
  if (resultObj.warn) throw new Error(`symlinkDir().warn: ${resultObj.warn}`);

  console.log('●工程2/2: 成功✨ api にリンクを通しました');
}

try {
  main().catch((err: string) => {
    console.error(`  >>>> ✘ ${err}`);
  });
} catch (err: unknown) {
  if (typeof err === 'string') throw new Error(err);
}
