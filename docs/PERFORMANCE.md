# Performance and scale evidence

MooNsEvents does not currently publish a throughput, latency, tenant-count, or concurrent-session
claim. That is deliberate: repository size and feature count are not performance evidence.

## When a benchmark may be published

A result is publishable only when it includes:

- the exact Git commit and date;
- CPU, memory, operating system, container/runtime, MySQL, and Redis versions;
- whether the environment is local, cloud, or CI;
- tenant count and the shape/size of seeded data;
- scenario definitions and request mix;
- warm-up, duration, concurrency, and repetition count;
- median, p95, p99, error rate, and resource saturation;
- the command or script needed to reproduce it;
- known bottlenecks and any excluded provider latency.

## Proposed baseline scenarios

1. Authentication and tenant resolution.
2. Lead list search and cursor/page navigation.
3. Lead creation plus follow-up scheduling.
4. Package list and package-detail reads.
5. RunOfShow save with route stops.
6. Conversation history pagination and message send.
7. Webhook ingestion with duplicate delivery.
8. Queue processing with retries and a dead-letter path.
9. A mixed read/write workload across multiple tenants.

## Safety rules

- Use synthetic benchmark identities and content, never copied customer data.
- Use sandbox provider accounts or stub provider calls.
- Do not benchmark against production without written authorization and an abort threshold.
- Do not convert a single developer-laptop result into a production capacity claim.

## Current reproducible evidence

The repository's CI and local validation demonstrate build and test correctness for the checked
commit. They do not establish production throughput.

The first benchmark harness is available through `npm run benchmark` and the manually triggered
**Reproducible benchmark** GitHub Actions workflow. It measures two synthetic tenants on an
isolated, resource-constrained Docker stack and emits versioned JSON, resource samples, SQL digest
evidence, and a Markdown report. See [benchmark reports](benchmarks/README.md) for the publication
process. A generated report is committed only after the full canonical run succeeds; the presence
of the harness alone is not performance evidence.

For a short end-to-end harness check that is not publishable evidence, run:

```sh
npm run benchmark:smoke
```
