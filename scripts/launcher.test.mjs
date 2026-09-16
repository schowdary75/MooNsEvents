import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

async function readLauncher(name) {
  return readFile(path.join(root, name), 'utf8');
}

test('start.sh provides a complete native startup path', async () => {
  const source = await readLauncher('start.sh');

  assert.match(source, /^#!\/usr\/bin\/env bash\n/);
  assert.doesNotMatch(source, /\r\n/, 'start.sh must keep LF endings for Unix shells');
  assert.match(source, /ensure_redis/);
  assert.match(source, /npm run dev:server/);
  assert.match(source, /npm run dev:client/);
  assert.match(source, /corepack pnpm dev/);
  assert.match(source, /Press Ctrl\+C to stop all services/);
  assert.match(source, /pause_on_windows/);
});

test('stop.sh preserves local data', async () => {
  const source = await readLauncher('stop.sh');

  assert.match(source, /^#!\/usr\/bin\/env bash\n/);
  assert.doesNotMatch(source, /\r\n/, 'stop.sh must keep LF endings for Unix shells');
  assert.match(source, /4000, 8080, 3001/);
  assert.match(source, /Stop-Process/);
  assert.doesNotMatch(source, /docker/i, 'the native stop path must not depend on Docker');
  assert.match(source, /database, uploads, and native Redis data were preserved/i);
});
