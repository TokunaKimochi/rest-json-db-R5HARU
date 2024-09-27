import { spawn } from 'node:child_process';

const hoo = () =>
  new Promise<void>((resolve) => {
    const date = new Date().toLocaleString('sv', { timeZone: 'Asia/Tokyo' }).replace(/\D/g, '.');
    const targetPath = `./vendor/easy-ja-postal-code/${date}`;
    // 依存関係の cli を pnpm run。`pnpm exec` だと npm scripts と関係なしに呼び出せる
    const subProcess = spawn('pnpm', ['exec', 'ejpc-generate-json', '-d', targetPath, '-t'], {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
    });
    if (!subProcess) console.log('⚠️予期しない動作を検出しました！');
    subProcess.stdout.on('data', (data) => {
      if (typeof data !== 'object') console.log('⚠️予期しない動作を検出しました！');
      console.log(`ℹ️${data}`);
    });
    subProcess.on('close', () => resolve());
  });
async function main() {
  await hoo();
  console.log('●工程1/2: 成功✨ JSON を作成しました');
}

try {
  main().catch((err: string) => {
    console.error(err);
  });
} catch (err: unknown) {
  if (typeof err === 'string') throw new Error(err);
}
