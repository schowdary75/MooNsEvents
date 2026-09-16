import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.careers_jobs.count();
  if (count > 0) {
    console.log('Jobs already seeded.');
    return;
  }

  const defaultJobs = [
    {
      title: 'Wedding Production & Stage Lead',
      department: 'Wedding Operations',
      location: 'Hyderabad / Pan-India',
      type: 'Full-time',
      salary: '?8.5L – ?14L / yr',
      openings: 3,
      description: 'Direct on-site wedding mandap setup, floral production, vendor synchronization, and wedding day run-of-show execution.',
      responsibilities: 'Orchestrate on-site decor, lighting, and stage crews across 500 to 2,000 guest weddings.\nLiaise directly with luxury banquet properties and resort management.\nEnforce MooNs Zero No-Show SLA with contingency vendor backups.',
      requirements: '3+ years experience in large-scale luxury wedding production.\nFlawless real-time crisis resolution and crowd flow leadership.\nBilingual fluency (English + Hindi / Telugu / Kannada).',
      is_active: true,
    },
    {
      title: 'Audio-Visual & Intelligent Lighting Engineer',
      department: 'Technical Production',
      location: 'Hyderabad / Bengaluru',
      type: 'Full-time',
      salary: '?7L – ?12L / yr',
      openings: 2,
      description: 'Manage line-array sound systems, DMX moving head trussing, LED walls, and live failover systems for concerts, DJ nights, and summits.',
      responsibilities: 'Engineer digital sound consoles (Yamaha/Allen & Heath) and line-array rigging.\nProgram DMX intelligent moving head fixtures, hazers, and laser cues.\nMaintain dual-redundant 4K video switchers and live broadcast encoders.',
      requirements: 'Hands-on mastery of live concert sound, lighting consoles, and video processors.\nAbility to handle high-pressure live stage cues without delay.',
      is_active: true,
    },
    {
      title: 'Master Emcee & VIP Hospitality Captain',
      department: 'Guest Experience',
      location: 'Hyderabad / Mumbai',
      type: 'Full-time',
      salary: '?6L – ?10L / yr',
      openings: 4,
      description: 'Orchestrate grand entrances, VIP guest welcome protocols, registration desks, and schedule adherence.',
      responsibilities: 'Train and supervise hostess teams, tilak/garland greeters, and registration desks.\nLead stage announcements, timeline adherence, and VIP family coordination.\nManage guest transport arrivals with bridal car and luxury bus captains.',
      requirements: 'Charismatic presence, polished etiquette, and exceptional stage command.\nLuxury hotel or premier event hospitality background.',
      is_active: true,
    },
    {
      title: 'Transport & Logistics Fleet Dispatcher',
      department: 'Fleet Operations',
      location: 'Pan-India',
      type: 'Full-time',
      salary: '?5.5L – ?9L / yr',
      openings: 2,
      description: 'Command relative transport fleet: 50-seater AC buses, tempo travelers, and VIP bridal cars with real-time GPS tracking.',
      responsibilities: 'Manage driver manifests, airport pickup schedules, and venue shuttles.\nMonitor live traffic, GPS alerts, and emergency rerouting.\nEnsure passenger comfort, luggage safety, and zero departure delays.',
      requirements: 'Fleet management or transport dispatching background.\nSharp logistics acumen and rapid emergency route improvisation.',
      is_active: true,
    },
    {
      title: 'Gourmet Catering & Live Station Manager',
      department: 'Food & Beverage',
      location: 'Hyderabad',
      type: 'Full-time',
      salary: '?6.5L – ?11L / yr',
      openings: 2,
      description: 'Oversee multi-cuisine banquet buffets, food temperature safety, live stations, mocktail bars, and plating quality.',
      responsibilities: 'Supervise live chaat, tandoor, pasta, and dessert counters.\nEnforce rigorous food hygiene, temperature checks, and dietary allergy safety.\nEnsure rapid replenishment and zero food shortage during peak banquet hours.',
      requirements: 'Degree in Hotel Management or 3+ years experience with 5-star catering operations.\nHigh standards for culinary presentation and guest hospitality.',
      is_active: true,
    },
  ];

  for (const job of defaultJobs) {
    await prisma.careers_jobs.create({ data: job });
  }
  console.log('Seeded 5 jobs successfully.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
