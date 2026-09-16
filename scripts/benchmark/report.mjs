import fs from 'node:fs';
import path from 'node:path';
import { renderReport } from './lib.mjs';

const input = process.argv[2] ?? process.env.BENCHMARK_RESULT ?? 'artifacts/benchmark/result.json';
const output = process.argv[3] ?? process.env.BENCHMARK_REPORT ?? 'artifacts/benchmark/report.md';
const result = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(path.resolve(output), renderReport(result));
console.info(path.resolve(output));
