const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.packages.findMany();
  console.log('=== PACKAGES ===', packages.length);
  if (packages.length > 0) console.log(JSON.stringify(packages.slice(0, 2), null, 2));

  const features = await prisma.catalog_features.findMany();
  console.log('=== FEATURES ===', features.length);
  if (features.length > 0) console.log(JSON.stringify(features.slice(0, 2), null, 2));

  const items = await prisma.package_line_items.findMany();
  console.log('=== LINE ITEMS ===', items.length);
  if (items.length > 0) console.log(JSON.stringify(items.slice(0, 2), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
