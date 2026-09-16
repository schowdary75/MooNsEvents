import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyResponse,
  createSelector,
  percentile,
  renderReport,
  selectMixed,
  selectRead,
  summarizeSamples,
} from './lib.mjs';

test('percentiles and summaries are deterministic', () => {
  assert.equal(percentile([40, 10, 30, 20], 0.5), 25);
  const summary = summarizeSamples(
    [
      { latencyMs: 10, status: 200, valid: true },
      { latencyMs: 30, status: 500, valid: false },
    ],
    2,
  );
  assert.equal(summary.requestsPerSecond, 1);
  assert.equal(summary.errors, 1);
  assert.deepEqual(summary.statuses, { 200: 1, 500: 1 });
  assert.throws(() => summarizeSamples([], 1), /samples/i);
});

test('the seeded selector and workload boundaries are stable', () => {
  const left = createSelector(42);
  const right = createSelector(42);
  assert.deepEqual(Array.from({ length: 10 }, left), Array.from({ length: 10 }, right));
  assert.equal(selectRead(0.59), 'leads');
  assert.equal(selectRead(0.89), 'packages');
  assert.equal(selectRead(0.99), 'package-detail');
  assert.equal(selectMixed(0.81), 'create-lead');
});

test('response validity rejects errors and rate limits', () => {
  assert.equal(classifyResponse(200, { success: true }).valid, true);
  assert.equal(classifyResponse(200, { success: false }).valid, false);
  assert.equal(classifyResponse(429, {}).rateLimited, true);
});

test('report rendering rejects malformed input and labels capacity limits', () => {
  assert.throws(() => renderReport({}), /malformed/i);
  const report = renderReport({
    schemaVersion: 1,
    environment: {
      commit: '1234567890abcdef',
      timestamp: '2026-01-01T00:00:00Z',
      os: 'test',
      cpuCount: 2,
      memoryBytes: 1000,
      cpuModel: 'test cpu',
      runnerImage: 'test image',
      node: '24',
      docker: '1',
      compose: '1',
      mysql: '8.4',
      redis: '7.4',
    },
    config: { repetitions: 1, warmupSeconds: 1, durationSeconds: 1 },
    scenarios: [
      {
        name: 'smoke',
        concurrency: 1,
        aggregate: {
          samples: 1,
          requestsPerSecond: 1,
          latencyMs: { p50: 1, p95: 1, p99: 1 },
          errors: 0,
        },
        repetitions: [
          { samples: 1, requestsPerSecond: 1, latencyMs: { p50: 1, p95: 1, p99: 1 }, errors: 0 },
        ],
      },
    ],
  });
  assert.match(report, /not a production/);
  assert.match(report, /npm run benchmark/);
});
