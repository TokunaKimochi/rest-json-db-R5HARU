import { copyFileSync } from 'node:fs';
import svc from './svc';

copyFileSync('.\\dist\\assets\\bundle.js', '.\\dist\\assets\\freezeBuild.js');

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
  svc.start();
});

svc.install();
