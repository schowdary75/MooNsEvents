import bcrypt from 'bcrypt';
import { PrismaClient as PlatformPrismaClient } from '@moonsevents/platform-client';
import { PrismaClient as TenantPrismaClient } from '@prisma/client';

const platform = new PlatformPrismaClient({
  datasourceUrl: process.env.PLATFORM_DATABASE_URL || 'mysql://root:@127.0.0.1:3306/moonsevents_platform',
});
const tenant = new TenantPrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/moonsevents',
});

async function main() {
  console.log('Seeding admin credentials...');
  const pepper = process.env.AUTH_PASSWORD_PEPPER || '86fOlEyylRV40a6Jjs2NAm7OUm9fYZVV';
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

  const email = 'admin@moon.com';
  const password = 'admin';
  const passwordHash = await bcrypt.hash(`${password}${pepper}`, rounds);

  // 1. Create/upsert Platform User
  let platformUser = await platform.platformUser.findUnique({ where: { email } });
  if (!platformUser) {
    platformUser = await platform.platformUser.create({
      data: {
        email,
        passwordHash,
        name: 'MooNs Admin',
        emailVerifiedAt: new Date(),
        status: 'active',
      },
    });
  } else {
    platformUser = await platform.platformUser.update({
      where: { id: platformUser.id },
      data: { passwordHash, emailVerifiedAt: new Date(), status: 'active' },
    });
  }

  // 2. Create/upsert Tenant Workspace
  let tenantRecord = await platform.tenant.findFirst({ where: { slug: 'moons-events' } });
  if (!tenantRecord) {
    tenantRecord = await platform.tenant.create({
      data: {
        name: 'MooNs Events',
        slug: 'moons-events',
        databaseName: 'moonsevents',
        databaseUsername: 'root',
        encryptedDatabasePassword: '',
        status: 'active',
        billingAddress: 'MooNs Events Headquarters',
      },
    });
  } else {
    tenantRecord = await platform.tenant.update({
      where: { id: tenantRecord.id },
      data: { status: 'active' },
    });
  }

  // 3. Create/upsert Trial/Subscription
  let trial = await platform.trial.findUnique({ where: { tenantId: tenantRecord.id } });
  if (!trial) {
    await platform.trial.create({
      data: {
        tenantId: tenantRecord.id,
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 86400000),
      },
    });
  }

  // 4. Create/upsert Membership
  let membership = await platform.membership.findFirst({
    where: { userId: platformUser.id, tenantId: tenantRecord.id },
  });
  if (!membership) {
    membership = await platform.membership.create({
      data: {
        userId: platformUser.id,
        tenantId: tenantRecord.id,
        role: 'owner',
        status: 'active',
        tenantUserId: 1,
      },
    });
  } else {
    membership = await platform.membership.update({
      where: { id: membership.id },
      data: { status: 'active', tenantUserId: 1 },
    });
  }

  console.log('Admin account successfully seeded!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Workspace:', tenantRecord.slug);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await platform.$disconnect();
    await tenant.$disconnect();
  });
