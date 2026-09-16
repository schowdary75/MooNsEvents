import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const archive = process.argv[2];
if (!archive) throw new Error('Usage: node scripts/import-local-ai-mail-config.mjs <archive>');

const sourceFiles = ['MooNsConfig/server/.env', 'MooNsConfig/.env'];
const allowedKeys = new Set([
  'GEMINI_API_KEY',
  'GEMINI_API_KEYS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'IMAP_USER',
  'IMAP_PASS',
]);

function parseEnv(text) {
  const values = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    if (!allowedKeys.has(key)) continue;
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (value) values.set(key, value);
  }
  return values;
}

const recovered = new Map();
for (const sourceFile of sourceFiles) {
  const text = execFileSync('tar', ['-xOf', archive, sourceFile], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  for (const [key, value] of parseEnv(text)) {
    if (!recovered.has(key)) recovered.set(key, value);
  }
}

if (!recovered.has('GEMINI_API_KEYS') && !recovered.has('GEMINI_API_KEY')) {
  throw new Error('No Gemini configuration found in the approved archive.');
}

const envPath = resolve('.env');
const existing = readFileSync(envPath, 'utf8');
const lines = existing.split(/\r?\n/);
const consumed = new Set();
const updated = lines.map((line) => {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  if (!match || !recovered.has(match[1])) return line;
  consumed.add(match[1]);
  return `${match[1]}=${recovered.get(match[1])}`;
});
for (const [key, value] of recovered) {
  if (!consumed.has(key)) updated.push(`${key}=${value}`);
}
writeFileSync(envPath, `${updated.join('\n').replace(/\n+$/, '')}\n`, 'utf8');

const geminiValue = recovered.get('GEMINI_API_KEYS') || recovered.get('GEMINI_API_KEY') || '';
const geminiKeyCount = geminiValue
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean).length;
console.log(
  JSON.stringify({
    importedKeys: [...recovered.keys()].sort(),
    geminiKeyCount,
    smtpConfigured: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].every((key) => recovered.has(key)),
    imapConfigured: ['IMAP_USER', 'IMAP_PASS'].every((key) => recovered.has(key)),
  }),
);
