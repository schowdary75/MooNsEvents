const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendorsList = await prisma.vendors.findMany();
  const getVendor = (name) => vendorsList.find(v => v.company_name.toLowerCase().includes(name.toLowerCase()));

  const v_svl = getVendor('SVL Arena') || getVendor('Naina Conventions');
  const v_esci = getVendor('ESCI') || getVendor('Celeste');
  const v_eventara = getVendor('Eventara');
  const v_novotel = getVendor('Novotel');
  
  const packagesData = [
    // SAVER
    {
      slug: 'saver-wedding-essential',
      name: 'Saver Wedding Essential',
      description: 'A cost-effective wedding package focusing on essential core services while keeping budgets tight.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 0,
      days: 1,
      price: 150000,
      category: 'Saver',
      image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80',
      image_key: 'saver-wedding',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_svl?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80'])
    },
    {
      slug: 'saver-corporate-meetup',
      name: 'Saver Corporate Meetup',
      description: 'A simple, affordable full-day package for corporate gatherings featuring standard hall rentals and basic buffet catering.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 0,
      days: 1,
      price: 80000,
      category: 'Saver',
      image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80',
      image_key: 'saver-corp',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_svl?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80'])
    },
    // PREMIUM
    {
      slug: 'premium-celebration-gala',
      name: 'Premium Celebration Gala',
      description: 'Elevated celebration package with advanced stage decor, cinematic photography, and premium catering.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 1,
      days: 2,
      price: 450000,
      category: 'Premium',
      image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80',
      image_key: 'premium-gala',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_esci?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80'])
    },
    {
      slug: 'premium-tech-summit',
      name: 'Premium Tech Summit',
      description: 'Comprehensive corporate package with premium AV setup, superior catering, and professional event management.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 0,
      days: 1,
      price: 350000,
      category: 'Premium',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
      image_key: 'premium-summit',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_esci?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'])
    },
    // LUXURY
    {
      slug: 'luxury-royal-wedding',
      name: 'Luxury Royal Wedding',
      description: 'Hosted at top conventions with elite catering, lavish floral decorations, and drone photography.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 2,
      days: 3,
      price: 1200000,
      category: 'Luxury',
      image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
      image_key: 'luxury-wedding',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_eventara?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'])
    },
    {
      slug: 'luxury-executive-retreat',
      name: 'Luxury Executive Retreat',
      description: 'High-end corporate offsite package with luxury banquet provisions, premium entertainment, and luxury transport.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 1,
      days: 2,
      price: 850000,
      category: 'Luxury',
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80',
      image_key: 'luxury-retreat',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_eventara?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80'])
    },
    // POSH
    {
      slug: 'posh-destination-wedding',
      name: 'Posh Destination Wedding',
      description: 'The absolute top-tier package featuring 5-star hospitality, VIP fleet transport, multi-cuisine gourmet catering, and celebrity-grade photography.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 3,
      days: 4,
      price: 3500000,
      category: 'Posh',
      image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80',
      image_key: 'posh-wedding',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_novotel?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'])
    },
    {
      slug: 'posh-platinum-expo',
      name: 'Posh Platinum Expo',
      description: 'Ultra-premium corporate exhibition package utilizing the largest 5-star spaces, state-of-the-art DMX lighting, and high-end VIP hosting.',
      country: 'India',
      destination: 'Hyderabad',
      nights: 2,
      days: 3,
      price: 2500000,
      category: 'Posh',
      image_url: 'https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80',
      image_key: 'posh-expo',
      is_active: true,
      status: 'published',
      published_at: new Date(),
      vendor_id: v_novotel?.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80'])
    }
  ];

  for (const pkg of packagesData) {
    const existing = await prisma.packages.findUnique({ where: { slug: pkg.slug } });
    if (!existing) {
      await prisma.packages.create({ data: pkg });
      console.log('Created: ' + pkg.name);
    } else {
      console.log('Already exists: ' + pkg.name);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
