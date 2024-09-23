import { spawn } from 'node:child_process';

spawn('pnpm', ['exec', 'ejpc-generate-json', '-d', './vendor/easy-ja-postal-code/api', '-t'], {
  stdio: 'inherit',
  shell: true,
});
