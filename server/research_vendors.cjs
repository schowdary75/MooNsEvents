const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendors.findMany({ take: 5 });
  console.log('=== VENDORS ===', JSON.stringify(vendors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
