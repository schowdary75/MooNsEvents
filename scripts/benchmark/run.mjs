import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import mysql from 'mysql2/promise';
import {
  classifyResponse,
  createSelector,
  percentile,
  renderReport,
  selectMixed,
  selectRead,
  summarizeSamples,
} from './lib.mjs';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..', '..');
const composeFile = path.join(root, 'docker-compose.benchmark.yml');
const smoke = process.argv.includes('--smoke');
const config = {
  profile: smoke ? 'smoke' : 'canonical-ci-v1',
  warmupSeconds: Number(process.env.BENCHMARK_WARMUP_SECONDS ?? (smoke ? 1 : 10)),
  durationSeconds: Number(process.env.BENCHMARK_DURATION_SECONDS ?? (smoke ? 2 : 30)),
  repetitions: Number(process.env.BENCHMARK_REPETITIONS ?? (smoke ? 1 : 3)),
  loginConcurrency: Number(process.env.BENCHMARK_LOGIN_CONCURRENCY ?? (smoke ? 1 : 2)),
  workloadConcurrency: Number(process.env.BENCHMARK_CONCURRENCY ?? (smoke ? 1 : 10)),
  policyOverrides: {
    rateLimitCeilingsRaised: true,
    ownerMfaEnrollmentRequired: false,
  },
};
const project = (process.env.BENCHMARK_PROJECT ?? `moonsevents-benchmark-${process.pid}`)
  .toLowerCase()
  .replace(/[^a-z0-9_-]/g, '-');
const apiPort = Number(process.env.BENCHMARK_API_PORT ?? 4001);
const mysqlPort = Number(process.env.BENCHMARK_MYSQL_PORT ?? 3307);
const baseUrl = `http://127.0.0.1:${apiPort}/api/v1`;
const outputDirectory = path.resolve(process.env.BENCHMARK_OUTPUT ?? 'artifacts/benchmark');
const tenants = [
  { slug: 'benchmark-alpha', email: 'owner-alpha@benchmark.example.com' },
  { slug: 'benchmark-beta', email: 'owner-beta@benchmark.example.com' },
];
const password = 'Benchmark-only-password-2026!';
const databaseNames = ['moonsevents_benchmark_alpha', 'moonsevents_benchmark_beta'];

function compose(args, options = {}) {
  return execFileSync('docker', ['compose', '-p', project, '-f', composeFile, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  });
}

function command(program, args, fallback = 'unavailable') {
  try {
    return execFileSync(program, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return fallback;
  }
}

async function database() {
  return mysql.createConnection({
    host: '127.0.0.1',
    port: mysqlPort,
    user: 'root',
    password: 'test-root-password',
    database: 'moonsevents',
  });
}

async function cleanupGenerated() {
  const connection = await database();
  try {
    for (const name of databaseNames) {
      await connection.query(
        `DELETE f FROM \`${name}\`.lead_followups f INNER JOIN \`${name}\`.lead_submissions l ON l.id=f.lead_id WHERE l.lead_source='benchmark-run'`,
      );
      await connection.query(
        `DELETE FROM \`${name}\`.lead_submissions WHERE lead_source='benchmark-run'`,
      );
      await connection.query(
        `DELETE FROM \`${name}\`.admin_audit_logs WHERE admin_email LIKE '%@benchmark.example.com' AND action='create_lead'`,
      );
    }
  } finally {
    await connection.end();
  }
}

async function resetDigests() {
  const connection = await database();
  try {
    await connection.query('TRUNCATE TABLE performance_schema.events_statements_summary_by_digest');
  } finally {
    await connection.end();
  }
}

async function mysqlDigests() {
  const connection = await database();
  try {
    const [rows] = await connection.query(`
      SELECT DIGEST_TEXT AS digestText, COUNT_STAR AS count,
        ROUND(SUM_TIMER_WAIT / 1000000000, 3) AS totalMs,
        SUM_ROWS_EXAMINED AS rowsExamined
      FROM performance_schema.events_statements_summary_by_digest
      WHERE DIGEST_TEXT IS NOT NULL
      ORDER BY SUM_TIMER_WAIT DESC LIMIT 10
    `);
    return rows.map((row) => ({
      digestText: row.digestText,
      count: Number(row.count),
      totalMs: Number(row.totalMs),
      rowsExamined: Number(row.rowsExamined),
    }));
  } finally {
    await connection.end();
  }
}

async function jsonRequest(pathname, body, token) {
  const started = performance.now();
  let status = 0;
  let parsed;
  try {
    const response = await fetch(`${baseUrl}${pathname}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    status = response.status;
    parsed = await response.json().catch(() => null);
  } catch (error) {
    parsed = { error: error instanceof Error ? error.message : String(error) };
  }
  const classification = classifyResponse(status, parsed);
  return { latencyMs: performance.now() - started, status, ...classification, body: parsed };
}

async function loginTenant(tenant) {
  const sample = await jsonRequest('/auth/login', {
    email: tenant.email,
    password,
    workspace: tenant.slug,
  });
  if (!sample.valid || !sample.body?.data?.accessToken || !sample.body?.data?.user?.session_token) {
    throw new Error(`Benchmark login failed for ${tenant.slug}: ${JSON.stringify(sample.body)}`);
  }
  return {
    tenant,
    token: sample.body.data.accessToken,
    auth: { email: tenant.email, sessionToken: sample.body.data.user.session_token },
    packageIds: [],
  };
}

async function sessions() {
  const result = [];
  for (const tenant of tenants) {
    const session = await loginTenant(tenant);
    const packages = await jsonRequest('/operations/getPackages', { data: {} }, session.token);
    if (!packages.valid || !Array.isArray(packages.body?.data))
      throw new Error('Package setup request failed');
    session.packageIds = packages.body.data.map((item) => item.id);
    result.push(session);
  }
  return result;
}

function operationAction(kind, activeSessions, sequence) {
  const session = activeSessions[sequence % activeSessions.length];
  if (kind === 'leads') {
    return () =>
      jsonRequest('/operations/adminGetLeads', { data: { auth: session.auth } }, session.token);
  }
  if (kind === 'packages') {
    return () => jsonRequest('/operations/getPackages', { data: {} }, session.token);
  }
  if (kind === 'package-detail') {
    const id = session.packageIds[sequence % session.packageIds.length];
    return () => jsonRequest('/operations/publicGetPackageDetail', { data: { id } }, session.token);
  }
  const unique = `${Date.now()}-${sequence}`;
  return () =>
    jsonRequest(
      '/operations/adminCreateLead',
      {
        data: {
          auth: session.auth,
          name: `Benchmark Generated ${unique}`,
          phone: `+919${String(sequence).padStart(9, '0').slice(-9)}`,
          email: `generated-${unique}@benchmark.invalid`,
          location: 'Synthetic',
          budgetRange: 'benchmark',
          leadSource: 'benchmark-run',
          nextFollowUpAt: '2027-01-01T00:00:00.000Z',
          followUpNotes: `benchmark-generated:${unique}`,
        },
      },
      session.token,
    );
}

async function runClosed(concurrency, seconds, actionForSequence, collect = true) {
  const samples = [];
  const deadline = performance.now() + seconds * 1_000;
  let sequence = 0;
  async function worker() {
    while (performance.now() < deadline) {
      const current = sequence++;
      const sample = await actionForSequence(current)();
      if (collect)
        samples.push({
          latencyMs: sample.latencyMs,
          status: sample.status,
          valid: sample.valid,
          reason: sample.reason,
          rateLimited: sample.rateLimited,
          responseMessage: sample.body?.message ?? sample.body?.error ?? null,
        });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return samples;
}

function parsePercent(value) {
  return Number(String(value ?? '0').replace('%', '')) || 0;
}

function parseBytes(value) {
  const match = String(value ?? '')
    .trim()
    .match(/^([\d.]+)\s*([KMGTP]?i?B)?/i);
  if (!match) return 0;
  const units = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, KIB: 1024, MIB: 1024 ** 2, GIB: 1024 ** 3 };
  return Number(match[1]) * (units[(match[2] ?? 'B').toUpperCase()] ?? 1);
}

function startResourceSampler() {
  const samples = [];
  let stopped = false;
  const capture = async () => {
    try {
      const { stdout: ids } = await execFileAsync('docker', [
        'ps',
        '--filter',
        `label=com.docker.compose.project=${project}`,
        '--format',
        '{{.ID}}',
      ]);
      const containerIds = ids.trim().split(/\s+/).filter(Boolean);
      if (!containerIds.length) return;
      const { stdout } = await execFileAsync('docker', [
        'stats',
        '--no-stream',
        '--format',
        '{{json .}}',
        ...containerIds,
      ]);
      for (const line of stdout.trim().split(/\r?\n/).filter(Boolean)) {
        const row = JSON.parse(line);
        samples.push({
          timestamp: new Date().toISOString(),
          container: row.Name,
          cpuPercent: parsePercent(row.CPUPerc),
          memoryBytes: parseBytes(String(row.MemUsage).split('/')[0]),
          memoryLimitBytes: parseBytes(String(row.MemUsage).split('/')[1]),
          networkIo: row.NetIO,
          blockIo: row.BlockIO,
        });
      }
    } catch (error) {
      samples.push({ timestamp: new Date().toISOString(), samplingError: String(error) });
    }
  };
  const loop = (async () => {
    while (!stopped) {
      await capture();
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  })();
  return {
    samples,
    stop: async () => {
      stopped = true;
      await loop;
    },
  };
}

function aggregate(repetitions) {
  const median = (path) => percentile(repetitions.map(path), 0.5);
  const statuses = {};
  for (const repetition of repetitions) {
    for (const [status, count] of Object.entries(repetition.statuses)) {
      statuses[status] = (statuses[status] ?? 0) + count;
    }
  }
  return {
    samples: repetitions.reduce((sum, item) => sum + item.samples, 0),
    requestsPerSecond: median((item) => item.requestsPerSecond),
    latencyMs: {
      p50: median((item) => item.latencyMs.p50),
      p95: median((item) => item.latencyMs.p95),
      p99: median((item) => item.latencyMs.p99),
      max: Math.max(...repetitions.map((item) => item.latencyMs.max)),
    },
    errors: repetitions.reduce((sum, item) => sum + item.errors, 0),
    errorRate: median((item) => item.errorRate),
    statuses,
  };
}

async function runScenario(name, concurrency, makeAction) {
  const repetitions = [];
  const allResources = [];
  let digests = [];
  for (let repetition = 0; repetition < config.repetitions; repetition += 1) {
    await cleanupGenerated();
    const activeSessions = name === 'workspace-login' ? null : await sessions();
    const selector = createSelector(0x6d6f6f6e + repetition);
    const action = makeAction(activeSessions, selector);
    await runClosed(concurrency, config.warmupSeconds, action, false);
    await cleanupGenerated();
    await resetDigests();
    const resources = startResourceSampler();
    const samples = await runClosed(concurrency, config.durationSeconds, action, true);
    await resources.stop();
    allResources.push(
      ...resources.samples.map((item) => ({ ...item, repetition: repetition + 1 })),
    );
    digests = await mysqlDigests();
    const summary = summarizeSamples(samples, config.durationSeconds);
    if (
      summary.samples < concurrency ||
      summary.errors > 0 ||
      samples.some((item) => item.rateLimited)
    ) {
      const examples = samples.filter((item) => !item.valid).slice(0, 3);
      throw new Error(
        `${name} repetition ${repetition + 1} failed validity checks: ${JSON.stringify({ summary, examples })}`,
      );
    }
    repetitions.push(summary);
  }
  const validResources = allResources.filter((item) => !item.samplingError);
  return {
    name,
    concurrency,
    repetitions,
    aggregate: aggregate(repetitions),
    resources: allResources,
    resourceSummary: {
      maxCpuPercent: Math.max(0, ...validResources.map((item) => item.cpuPercent)),
      maxMemoryBytes: Math.max(0, ...validResources.map((item) => item.memoryBytes)),
    },
    mysqlDigests: digests,
  };
}

async function environment() {
  const connection = await database();
  let mysqlVersion = 'unavailable';
  try {
    const [rows] = await connection.query('SELECT VERSION() AS version');
    mysqlVersion = rows[0].version;
  } finally {
    await connection.end();
  }
  return {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA ?? command('git', ['rev-parse', 'HEAD']),
    os: `${os.type()} ${os.release()} ${os.arch()}`,
    cpuModel: os.cpus()[0]?.model ?? 'unknown',
    cpuCount: os.cpus().length,
    memoryBytes: os.totalmem(),
    node: process.version,
    docker: command('docker', ['version', '--format', '{{.Server.Version}}']),
    compose: command('docker', ['compose', 'version', '--short']),
    mysql: mysqlVersion,
    redis: compose(['exec', '-T', 'redis', 'redis-server', '--version'], { capture: true }).trim(),
    runnerImage: process.env.ImageOS ?? null,
  };
}

function analysisFor(scenarios) {
  const findings = [];
  for (const scenario of scenarios) {
    const apiCpu = Math.max(
      0,
      ...scenario.resources
        .filter((item) => /api/i.test(item.container ?? ''))
        .map((item) => item.cpuPercent),
    );
    const mysqlCpu = Math.max(
      0,
      ...scenario.resources
        .filter((item) => /mysql/i.test(item.container ?? ''))
        .map((item) => item.cpuPercent),
    );
    findings.push(
      `${scenario.name}: peak API CPU was ${apiCpu.toFixed(2)}% and peak MySQL CPU was ${mysqlCpu.toFixed(2)}% of one CPU as reported by Docker.`,
    );
    const top = scenario.mysqlDigests?.[0];
    if (top)
      findings.push(
        `${scenario.name}: the highest-total-time MySQL digest examined ${top.rowsExamined} rows across ${top.count} executions; see the digest above before drawing a query-level conclusion.`,
      );
  }
  findings.push(
    'The lead-list operation returns the complete 1,000-row tenant dataset; the baseline intentionally records its payload and rows-examined cost as a candidate pagination bottleneck.',
  );
  return findings;
}

async function waitForApi() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error('Benchmark API did not become healthy');
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  compose(['build', 'api']);
  compose(['up', '-d', 'mysql', 'redis']);
  compose([
    'run',
    '--rm',
    'api',
    'sh',
    '-c',
    'npx prisma migrate deploy --schema prisma/platform/schema.prisma && npx prisma migrate deploy && node dist/benchmarks/seed.js',
  ]);
  compose(['up', '-d', 'api']);
  await waitForApi();
  const scenarios = [
    await runScenario('workspace-login', config.loginConcurrency, () => {
      let index = 0;
      return () => () =>
        jsonRequest('/auth/login', {
          email: tenants[index % tenants.length].email,
          password,
          workspace: tenants[index++ % tenants.length].slug,
        });
    }),
    await runScenario(
      'authenticated-reads',
      config.workloadConcurrency,
      (activeSessions, selector) => (sequence) =>
        operationAction(selectRead(selector()), activeSessions, sequence),
    ),
    await runScenario(
      'mixed-read-write',
      config.workloadConcurrency,
      (activeSessions, selector) => (sequence) =>
        operationAction(selectMixed(selector()), activeSessions, sequence),
    ),
  ];
  const result = {
    schemaVersion: 1,
    valid: true,
    config,
    environment: await environment(),
    dataset: { tenants: 2, leadsPerTenant: 1_000, followupsPerTenant: 100, packagesPerTenant: 100 },
    scenarios,
    analysis: analysisFor(scenarios),
  };
  fs.writeFileSync(
    path.join(outputDirectory, 'result.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(outputDirectory, 'report.md'), renderReport(result));
  const resourceRows = [
    'scenario,repetition,timestamp,container,cpu_percent,memory_bytes,memory_limit_bytes,network_io,block_io',
  ];
  for (const scenario of scenarios)
    for (const row of scenario.resources) {
      resourceRows.push(
        [
          scenario.name,
          row.repetition,
          row.timestamp,
          row.container ?? '',
          row.cpuPercent ?? '',
          row.memoryBytes ?? '',
          row.memoryLimitBytes ?? '',
          row.networkIo ?? '',
          row.blockIo ?? '',
        ]
          .map((item) => `"${String(item).replace(/"/g, '""')}"`)
          .join(','),
      );
    }
  fs.writeFileSync(path.join(outputDirectory, 'resources.csv'), `${resourceRows.join('\n')}\n`);
  console.info(`Benchmark artifacts: ${outputDirectory}`);
}

let failure;
try {
  await main();
} catch (error) {
  failure = error;
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'failure.txt'), `${error?.stack ?? error}\n`);
  try {
    fs.writeFileSync(
      path.join(outputDirectory, 'compose.log'),
      compose(['logs', '--no-color'], { capture: true }),
    );
  } catch (logError) {
    fs.appendFileSync(
      path.join(outputDirectory, 'failure.txt'),
      `Could not capture Compose logs: ${logError}\n`,
    );
  }
  console.error(error);
} finally {
  try {
    compose(['down', '--volumes', '--remove-orphans']);
  } catch (error) {
    console.error('Benchmark teardown failed', error);
  }
}
if (failure) process.exitCode = 1;
