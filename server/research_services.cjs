const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.vendor_services.findMany();
  console.log('=== VENDOR SERVICES ===');
  console.log(JSON.stringify(services.slice(0, 10), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
