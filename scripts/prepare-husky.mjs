import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

if (process.env.HUSKY === '0' || process.env.CI === 'true') {
  console.log('Git hook setup skipped for this environment.');
  process.exit(0);
}

const executable = path.resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'husky.cmd' : 'husky',
);

try {
  await access(executable);
} catch {
  console.log('Git hook setup skipped because Husky is not installed in this workspace install.');
  process.exit(0);
}

const result = spawnSync(executable, [], { stdio: 'inherit' });
process.exit(result.status ?? 1);
