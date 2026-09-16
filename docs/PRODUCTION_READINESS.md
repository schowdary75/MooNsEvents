# Production-readiness checklist

MooNsEvents is intentionally easy to evaluate locally, but local success is not a production
certification. Complete this checklist for the exact commit, infrastructure, providers, data
residency, and threat model you plan to operate.

## Required before handling real client data

- [ ] Use a supported Node.js 24 release and pinned container images.
- [ ] Replace every generated local secret and verify no `.env`, key, dump, or credential is in Git.
- [ ] Put TLS in front of every public endpoint and restrict database, Redis, Asterisk, and admin
      services to private networks.
- [ ] Use managed MySQL and Redis with backups, monitoring, encryption, and restore drills.
- [ ] Run platform and tenant Prisma migrations against a staging copy before production.
- [ ] Configure object storage, malware scanning, retention, and deletion rules for uploaded files.
- [ ] Configure tenant isolation, roles, module permissions, MFA-sensitive actions, audit retention,
      and incident access.
- [ ] Keep `MAYA_EXTERNAL_WRITES_ENABLED` disabled until every enabled Maya tool has an owner,
      approval policy, idempotency behavior, and rollback or recovery procedure.
- [ ] Validate each external provider with non-production accounts and provider-specific rate
      limits, retries, signature checks, and webhook replay protection.
- [ ] Review privacy, consent, call recording, WhatsApp, payment, tax, consumer, and events rules
      for every jurisdiction served.
- [ ] Add service-level dashboards and alerts for API latency/errors, queues, dead letters,
      database health, Redis, storage, email, webhooks, telephony, and background jobs.
- [ ] Define RPO/RTO, test backup restoration, and document disaster-recovery ownership.
- [ ] Run a security review and the performance plan below with a dataset representative of the
      intended tenancy and traffic.

## Repository checks

Run these from a clean checkout:

```bash
npm ci
npm run prisma:generate
npm run secrets:check
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

The GitHub Actions workflow runs the same application-quality checks. Infrastructure, provider,
load, recovery, legal, and operational checks remain deployment responsibilities unless a
dedicated workflow explicitly proves otherwise.

## Release evidence to retain

For every production candidate, record:

- Git commit and signed release tag
- migration plan and rollback/forward-fix decision
- dependency and container scan reports
- test and build logs
- environment-specific load-test report
- backup restore result
- provider smoke-test result
- security review owner and unresolved risks
- deployment and rollback owner

## Known boundary

The repository contains integration surfaces for high-impact actions, including communications,
booking changes, payments, refunds, escrow, and AI-assisted operations. Code presence is not
permission to enable them. Keep them disabled until the deployment owner has validated access,
consent, approval, audit, and failure behavior.
