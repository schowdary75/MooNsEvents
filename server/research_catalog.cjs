const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stays = await prisma.master_stays.findMany();
  const rooms = await prisma.master_rooms.findMany();
  const activities = await prisma.master_activities.findMany();
  const cars = await prisma.master_cars.findMany();
  const eventTypes = await prisma.catalog_event_types.findMany();

  console.log('=== STAYS ===');
  console.log(JSON.stringify(stays.map(s => ({ id: s.id, name: s.name, type: s.type, destination: s.destination })), null, 2));

  console.log('\n=== ROOMS ===');
  console.log(JSON.stringify(rooms.map(r => ({ stay_id: r.stay_id, name: r.name, type: r.room_type, destination: r.destination })), null, 2));

  console.log('\n=== ACTIVITIES ===');
  console.log(JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, destination: a.destination })), null, 2));

  console.log('\n=== CARS ===');
  console.log(JSON.stringify(cars.map(c => ({ id: c.id, name: c.name, type: c.vehicle_type, destination: c.destination })), null, 2));

  console.log('\n=== EVENT TYPES ===');
  console.log(JSON.stringify(eventTypes.map(e => ({ slug: e.slug, name: e.name })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
