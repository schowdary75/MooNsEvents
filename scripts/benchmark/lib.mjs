export function percentile(values, quantile) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function summarizeSamples(samples, durationSeconds) {
  if (!samples.length || !(durationSeconds > 0)) throw new Error('Measured samples are required');
  const latencies = samples.map((sample) => sample.latencyMs);
  const statuses = {};
  for (const sample of samples) statuses[sample.status] = (statuses[sample.status] ?? 0) + 1;
  const errors = samples.filter((sample) => !sample.valid).length;
  return {
    samples: samples.length,
    requestsPerSecond: samples.length / durationSeconds,
    latencyMs: {
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
      max: Math.max(...latencies),
    },
    errors,
    errorRate: errors / samples.length,
    statuses,
  };
}

export function createSelector(seed = 0x6d6f6f6e) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

export function selectRead(value) {
  if (value < 0.6) return 'leads';
  if (value < 0.9) return 'packages';
  return 'package-detail';
}

export function selectMixed(value) {
  return value < 0.8 ? selectRead(value / 0.8) : 'create-lead';
}

export function classifyResponse(status, body) {
  const valid = status >= 200 && status < 300 && body?.success === true;
  return {
    valid,
    rateLimited: status === 429,
    reason: valid ? null : status === 429 ? 'rate-limited' : `invalid-response-${status}`,
  };
}

function fixed(value, digits = 2) {
  return Number(value ?? 0).toFixed(digits);
}

export function renderReport(result) {
  if (result?.schemaVersion !== 1 || !Array.isArray(result.scenarios)) {
    throw new Error('Unsupported or malformed benchmark result');
  }
  const lines = [
    `# MooNsEvents benchmark — ${result.environment.commit.slice(0, 12)}`,
    '',
    '> This is a reproducible measurement of one small CI environment. It is not a production',
    '> capacity, tenant-count, availability, or service-level claim.',
    '',
    '## Environment',
    '',
    `- Timestamp: ${result.environment.timestamp}`,
    `- Commit: \`${result.environment.commit}\``,
    `- Host: ${result.environment.os}; ${result.environment.cpuModel}; ${result.environment.cpuCount} logical CPUs; ${result.environment.memoryBytes} bytes memory`,
    `- Runner image: ${result.environment.runnerImage ?? 'not reported'}`,
    `- Runtime: Node ${result.environment.node}; Docker ${result.environment.docker}; Compose ${result.environment.compose}`,
    `- Services: MySQL ${result.environment.mysql}; Redis ${result.environment.redis}; production API container`,
    `- Limits: API 1.5 CPU/2 GiB, MySQL 1.5 CPU/2 GiB, Redis 0.5 CPU/256 MiB`,
    `- Dataset: 2 tenants; 1,000 leads, 100 follow-ups, and 100 packages per tenant`,
    '',
    result.environment.runnerImage
      ? 'The load generator ran on the same GitHub-hosted runner as the containers. Hosted-runner'
      : 'The load generator ran on the same local host as the containers. Local background load',
    result.environment.runnerImage
      ? 'hardware and contention vary between runs, so comparisons require repeated measurements.'
      : 'can affect results; smoke-profile output is not publishable benchmark evidence.',
    '',
    '## Method',
    '',
    `Each scenario used ${result.config.repetitions} ${result.config.repetitions === 1 ? 'repetition' : 'repetitions'} with ${result.config.warmupSeconds}s warm-up and ${result.config.durationSeconds}s measured time.`,
    'Workspace login uses concurrency 2 in the canonical profile. Authenticated reads use concurrency 10 with 60% lead list, 30% package list, and 10% package detail requests. The mixed workload uses concurrency 10 with 80% reads and 20% lead creation with follow-up scheduling.',
    'Aggregate rates, error rates, and latency percentiles are medians of the per-repetition values; aggregate sample and error counts are totals.',
    'Synthetic identities and content were used. Generated writes were removed between repetitions.',
    'Rate-limit ceilings were raised to keep throttling out of the application-path measurement; any 429 still fails the run. The benchmark-only owner MFA enrollment gate was disabled.',
    'External providers, nginx, browser rendering, WebSockets, background workers, MFA enrollment, and production traffic were excluded.',
    '',
    '## Results',
    '',
    '| Scenario | Concurrency | Samples | req/s | p50 ms | p95 ms | p99 ms | Errors |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const scenario of result.scenarios) {
    const metric = scenario.aggregate;
    lines.push(
      `| ${scenario.name} | ${scenario.concurrency} | ${metric.samples} | ${fixed(metric.requestsPerSecond)} | ${fixed(metric.latencyMs.p50)} | ${fixed(metric.latencyMs.p95)} | ${fixed(metric.latencyMs.p99)} | ${metric.errors} |`,
    );
  }
  lines.push('', 'Per-repetition results:', '');
  for (const scenario of result.scenarios) {
    lines.push(`### ${scenario.name}`, '');
    for (const [index, repetition] of scenario.repetitions.entries()) {
      lines.push(
        `- Run ${index + 1}: ${fixed(repetition.requestsPerSecond)} req/s; p50 ${fixed(repetition.latencyMs.p50)} ms; p95 ${fixed(repetition.latencyMs.p95)} ms; p99 ${fixed(repetition.latencyMs.p99)} ms; errors ${repetition.errors}/${repetition.samples}.`,
      );
    }
    const peak = scenario.resourceSummary ?? {};
    lines.push(
      `- Observed container peaks: CPU ${fixed(peak.maxCpuPercent)}%; memory ${fixed(peak.maxMemoryBytes, 0)} bytes.`,
    );
    if (scenario.mysqlDigests?.length) {
      lines.push('- Highest-total-time MySQL statement digests:');
      for (const digest of scenario.mysqlDigests.slice(0, 5)) {
        lines.push(
          `  - ${fixed(digest.totalMs)} ms total, ${digest.count} executions, ${digest.rowsExamined} rows examined: \`${String(digest.digestText).replace(/`/g, "'").slice(0, 180)}\``,
        );
      }
    }
    lines.push('');
  }
  lines.push(
    '## Bottlenecks and interpretation',
    '',
    ...(result.analysis?.length
      ? result.analysis.map((item) => `- ${item}`)
      : [
          '- No bottleneck conclusion was generated; inspect the raw resource samples and SQL digests.',
        ]),
    '',
    'These measurements establish a baseline method and identify work for investigation. They must',
    'not be extrapolated into production capacity or a customer-facing scale claim.',
    '',
    '## Reproduce',
    '',
    '```sh',
    'npm ci',
    'npm run benchmark',
    '```',
    '',
    'Raw, versioned JSON and resource samples are attached to the corresponding workflow run.',
    '',
  );
  return lines.join('\n');
}
