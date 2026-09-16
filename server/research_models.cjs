const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = Object.keys(prisma);
  console.log('=== MODELS ===', models.filter(m => !m.startsWith('_') && m !== '$connect' && m !== '$disconnect' && m !== '$on' && m !== '$transaction' && m !== '$use' && m !== '$extends'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
