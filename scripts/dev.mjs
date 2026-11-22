import { spawn } from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = ['backend', 'frontend'].map(service => {
  const child = spawn(npm, ['--prefix', service, 'run', 'dev'], { stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('error', err => console.error(`[${service}]`, err.message));
  return child;
});
const stop = () => children.forEach(child => { if (!child.killed) child.kill(); });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
