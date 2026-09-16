import { PrismaClient } from '@prisma/client';
import { platformPrisma } from '../config/platformPrisma.js';
import { env } from '../config/env.js';
import { encryptTenantCredential } from '../utils/tenantCredentials.js';
import { hashPassword } from '../utils/password.js';
import { provisionTenant } from '../services/tenantProvisioningService.js';
import { closeQueues } from '../jobs/queues.js';

export const BENCHMARK_PASSWORD = 'Benchmark-only-password-2026!';
export const BENCHMARK_TENANTS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    userId: '20000000-0000-4000-8000-000000000001',
    membershipId: '30000000-0000-4000-8000-000000000001',
    jobId: '40000000-0000-4000-8000-000000000001',
    slug: 'benchmark-alpha',
    name: 'Benchmark Alpha',
    email: 'owner-alpha@benchmark.example.com',
    databaseName: 'moonsevents_benchmark_alpha',
    databaseUsername: 'benchmark_alpha',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    userId: '20000000-0000-4000-8000-000000000002',
    membershipId: '30000000-0000-4000-8000-000000000002',
    jobId: '40000000-0000-4000-8000-000000000002',
    slug: 'benchmark-beta',
    name: 'Benchmark Beta',
    email: 'owner-beta@benchmark.example.com',
    databaseName: 'moonsevents_benchmark_beta',
    databaseUsername: 'benchmark_beta',
  },
] as const;

const databasePassword = 'benchmark-tenant-database-password';

async function seedTenant(tenant: (typeof BENCHMARK_TENANTS)[number], passwordHash: string) {
  await platformPrisma.platformUser.upsert({
    where: { id: tenant.userId },
    update: {
      email: tenant.email,
      passwordHash,
      name: `${tenant.name} Owner`,
      emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'active',
    },
    create: {
      id: tenant.userId,
      email: tenant.email,
      passwordHash,
      name: `${tenant.name} Owner`,
      emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'active',
    },
  });
  await platformPrisma.tenant.upsert({
    where: { id: tenant.id },
    update: {},
    create: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      databaseName: tenant.databaseName,
      databaseUsername: tenant.databaseUsername,
      encryptedDatabasePassword: encryptTenantCredential(databasePassword),
      billingAddress: 'Synthetic benchmark address',
      status: 'pending_activation',
      internal: true,
    },
  });
  await platformPrisma.membership.upsert({
    where: { id: tenant.membershipId },
    update: {},
    create: {
      id: tenant.membershipId,
      tenantId: tenant.id,
      userId: tenant.userId,
      role: 'owner',
      status: 'active',
    },
  });
  await platformPrisma.provisioningJob.upsert({
    where: { id: tenant.jobId },
    update: {},
    create: { id: tenant.jobId, tenantId: tenant.id, status: 'pending' },
  });
  await provisionTenant(tenant.jobId, tenant.id);

  const url = new URL(env.tenantDatabaseBaseUrl);
  url.username = tenant.databaseUsername;
  url.password = databasePassword;
  url.pathname = `/${tenant.databaseName}`;
  const db = new PrismaClient({ datasourceUrl: url.toString() });
  try {
    await db.lead_followups.deleteMany({});
    await db.admin_audit_logs.deleteMany({ where: { admin_email: tenant.email } });
    await db.lead_submissions.deleteMany({});
    await db.package_themes.deleteMany({});
    await db.packages.deleteMany({});
    await db.crmAuthSession.deleteMany({});

    await db.lead_submissions.createMany({
      data: Array.from({ length: 1_000 }, (_, index) => ({
        name: `Benchmark Lead ${String(index + 1).padStart(4, '0')}`,
        phone: `+910000${String(index).padStart(6, '0')}`,
        email: `lead-${index + 1}@benchmark.invalid`,
        location: ['Hyderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam'][index % 4]!,
        event_month: '2026-10',
        clients_count: 2 + (index % 4),
        budget_range: 'synthetic-100000-200000',
        lead_source: 'benchmark-seed',
        status: index % 5 === 0 ? 'contacted' : 'new',
        priority: index % 10 === 0 ? 'high' : 'medium',
        assigned_owner: `${tenant.name} Owner`,
        created_at: new Date(Date.UTC(2026, 0, 1, 0, index % 60, index % 60)),
      })),
    });
    const leads = await db.lead_submissions.findMany({ orderBy: { id: 'asc' }, take: 100 });
    await db.lead_followups.createMany({
      data: leads.map((lead, index) => ({
        lead_id: lead.id,
        follow_up_date: new Date(Date.UTC(2026, 9, 1 + (index % 28))),
        notes: 'Synthetic benchmark follow-up',
        status: 'pending',
      })),
    });
    const packages = await Promise.all(
      Array.from({ length: 100 }, (_, index) =>
        db.packages.create({
          data: {
            slug: `benchmark-package-${String(index + 1).padStart(3, '0')}`,
            name: `Benchmark Package ${String(index + 1).padStart(3, '0')}`,
            description: 'Synthetic package used only by the reproducible benchmark.',
            country: 'IN',
            location: ['Hyderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam'][index % 4]!,
            nights: 3 + (index % 7),
            days: 4 + (index % 7),
            price: 50_000 + index * 1_000,
            image_url: '/benchmark-placeholder.png',
            image_key: 'benchmark',
            is_active: true,
            status: 'published',
            published_at: new Date('2026-01-01T00:00:00.000Z'),
          },
        }),
      ),
    );
    await db.package_themes.createMany({
      data: packages.flatMap((item, index) => [
        { package_id: item.id, theme: 'benchmark' },
        { package_id: item.id, theme: index % 2 ? 'culture' : 'leisure' },
      ]),
    });
  } finally {
    await db.$disconnect();
  }
}

async function main() {
  const passwordHash = await hashPassword(BENCHMARK_PASSWORD);
  for (const tenant of BENCHMARK_TENANTS) await seedTenant(tenant, passwordHash);
  console.info(
    JSON.stringify({
      schemaVersion: 1,
      seed: { tenants: 2, leadsPerTenant: 1_000, followupsPerTenant: 100, packagesPerTenant: 100 },
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([platformPrisma.$disconnect(), closeQueues()]);
  });
