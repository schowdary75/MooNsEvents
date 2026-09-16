// @ts-nocheck -- byte-compatible public API adapter.
import { prisma } from '../config/prisma.js';
import { buildHomeFeaturedLocationsResponse } from './homeOrbit.js';
const resolve = () => Promise.resolve();
import { z } from 'zod';
function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        init.status && init.status >= 400 ? 'no-store' : 'public, max-age=15, s-maxage=60',
      ...(init.headers || {}),
    },
  });
}
function notFound() {
  return json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
}
function badRequest(message) {
  return json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
}
function decodeBase64Strict(value) {
  const base64 = value.includes(';base64,') ? value.split(';base64,').pop() || '' : value;
  const normalized = base64.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error('Invalid base64 payload.');
  }
  return Buffer.from(normalized, 'base64');
}
// Public offer rows come straight from `SELECT *` (snake_case columns). The MooN
// website consumes camelCase, so normalise here to keep both shapes available.
function mapOfferRow(offer) {
  return {
    ...offer,
    discountPercent: offer.discount_percent,
    bannerImageUrl: offer.banner_image_url,
    isActive: offer.is_active === 1 || offer.is_active === true,
    isGlobal: offer.is_global === 1 || offer.is_global === true,
    targetScope: offer.target_scope,
    targetId: offer.target_id,
    validFrom: offer.valid_from,
    validUntil: offer.valid_until,
  };
}
// The welcome-offer claim ledger backs the "new user, first booking, once" perk.
// Created lazily (matching the rest of this module) so no migration is required.
let welcomeOffersTableReady = false;
async function ensureWelcomeOffersTable(_pool) {
  if (welcomeOffersTableReady) return;
  await resolve();
  welcomeOffersTableReady = true;
}
async function countUserBookings(_pool, userId) {
  return prisma.bookings.count({ where: { user_id: userId } });
  /* removed legacy SQL
      // bookings table not created yet ⇒ user has no history
    */
}
const trimmedString = (max) => z.string().trim().min(1).max(max);
const optionalTrimmedString = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+()\-\s\d]{7,20}$/, 'Invalid phone number');
const emailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .transform((value) => value.toLowerCase());
const contactSchema = z.object({
  name: trimmedString(120),
  email: emailSchema,
  location: optionalTrimmedString(120),
  message: trimmedString(2000),
});
const leadSchema = z.object({
  name: trimmedString(120),
  phone: phoneSchema,
  email: emailSchema
    .optional()
    .nullable()
    .transform((value) => value || null),
  location: trimmedString(120),
  eventMonth: optionalTrimmedString(80),
  clientsCount: z.coerce.number().int().min(1).max(10_000).default(2),
  eventType: optionalTrimmedString(100),
  budgetRange: optionalTrimmedString(120).transform((value) => value || 'Not specified'),
  notes: optionalTrimmedString(3000),
  attribution: z.record(z.unknown()).optional().nullable(),
});
const newsletterSchema = z.object({
  email: emailSchema,
});
const callbackSchema = z.object({
  name: trimmedString(120),
  phone: phoneSchema,
  location: optionalTrimmedString(120),
});
const scheduledCallSchema = z.object({
  name: trimmedString(120),
  phone: phoneSchema,
  email: emailSchema
    .optional()
    .nullable()
    .transform((value) => value || null),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD date'),
  timeSlot: trimmedString(80),
  method: z.enum(['phone', 'whatsapp', 'google_meet', 'zoom']).or(trimmedString(80)),
});
function validatePayload(schema, data) {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    message:
      parsed.error.issues.map((issue) => issue.message).join(', ') || 'Invalid request payload',
  };
}
function getAllowedCorsOrigin(request) {
  const configured = (
    process.env.PUBLIC_SITE_ORIGIN ||
    process.env.MOONS_PUBLIC_ORIGIN ||
    ''
  ).replace(/\/+$/, '');
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (configured && origin.replace(/\/+$/, '') === configured) return origin;
  if (!configured && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;
  return null;
}
function corsHeaders(request) {
  const allowedOrigin = getAllowedCorsOrigin(request);
  return allowedOrigin
    ? {
        'Access-Control-Allow-Origin': allowedOrigin,
        Vary: 'Origin',
      }
    : {};
}
function parseJsonArray(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
function getBaseUrl(request) {
  const url = new URL(request.url);
  const configured = process.env.CONFIG_PUBLIC_URL || process.env.VITE_CONFIG_PUBLIC_URL || '';
  return configured ? configured.replace(/\/+$/, '') : `${url.protocol}//${url.host}`;
}
function absolutizeUploads(row, request) {
  const baseUrl = getBaseUrl(request);
  const copy = { ...row };
  for (const key of [
    'admin_notes',
    'research_notes',
    'source_name',
    'price_source_url',
    'contact_source_url',
    'google_search_url',
    'last_checked_at',
    'confidence',
    'phone',
    'email',
    'price_basis',
    'approval_status',
    'created_by',
    'updated_by',
  ]) {
    delete copy[key];
  }
  for (const key of ['image_url', 'cover_image_url', 'public_url', 'avatar_url', 'storage_url']) {
    if (typeof copy[key] === 'string' && copy[key].startsWith('/uploads/')) {
      copy[key] = `${baseUrl}${copy[key]}`;
    }
  }
  return copy;
}
async function packageList(request) {
  const rows = await prisma.packages.findMany({
    where: { is_active: true },
    orderBy: [{ destination: 'asc' }, { price: 'asc' }],
  });
  const themes = await prisma.package_themes.findMany({
    where: { package_id: { in: rows.map((row) => row.id) } },
    orderBy: { theme: 'asc' },
  });
  const themesByPackage = Map.groupBy(themes, (theme) => theme.package_id);
  return rows.map((row) =>
    absolutizeUploads(
      {
        ...row,
        location: row.destination,
        themes: (themesByPackage.get(row.id) ?? []).map((theme) => theme.theme),
      },
      request,
    ),
  );
}
async function packageDetail(slug, request) {
  const pkg = await prisma.packages.findFirst({ where: { slug, is_active: true } });
  if (!pkg) return null;
  const [themeRows, itinRows, inclRows, exclRows, serviceRows] = await Promise.all([
    prisma.package_themes.findMany({
      where: { package_id: pkg.id },
      orderBy: { theme: 'asc' },
      select: { theme: true },
    }),
    prisma.package_itinerary.findMany({
      where: { package_id: pkg.id },
      orderBy: { day_number: 'asc' },
      select: {
        day_number: true,
        title: true,
        description: true,
        city: true,
        slot_morning: true,
        slot_afternoon: true,
        slot_evening: true,
      },
    }),
    prisma.package_inclusions.findMany({
      where: { package_id: pkg.id },
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
      select: { category: true, item: true },
    }),
    prisma.package_exclusions.findMany({
      where: { package_id: pkg.id },
      orderBy: { id: 'asc' },
      select: { item: true },
    }),
    prisma.package_line_items.findMany({
      where: { package_id: pkg.id },
      orderBy: [{ day_number: 'asc' }, { id: 'asc' }],
      select: {
        item_name: true,
        unit_type: true,
        quantity: true,
        day_number: true,
      },
    }),
  ]);
  return absolutizeUploads(
    {
      ...pkg,
      description: seventMetadataFromDescription(pkg.description),
      themes: themeRows.map((row) => row.theme),
      runOfShow: itinRows.map((item) => ({
        ...item,
        description: seventMetadataFromDescription(item.description),
      })),
      inclusions: inclRows,
      exclusions: exclRows,
      services: serviceRows.map((service) => ({
        name: service.item_name,
        unit_type: service.unit_type,
        quantity: Number(service.quantity),
        day_number: service.day_number,
      })),
    },
    request,
  );
}
function mapAccommodation(row, request) {
  return absolutizeUploads(
    {
      ...row,
      description: seventMetadataFromDescription(row.description),
      rating: Number(row.rating),
      price_inr: Number(row.price_inr),
      price_status: String(row.price_basis || '')
        .toLowerCase()
        .includes('contracted')
        ? 'confirmed'
        : 'rfq_required',
      price_display_label: String(row.price_basis || '')
        .toLowerCase()
        .includes('contracted')
        ? 'Confirmed live price'
        : 'Request live quote',
      review_count: Number(row.review_count),
      beds: Number(row.beds),
      baths: Number(row.baths),
      guests: Number(row.guests),
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      amenities: parseJsonArray(row.amenities),
      tags: parseJsonArray(row.tags),
    },
    request,
  );
}
function mapCar(row, request) {
  return absolutizeUploads(
    {
      ...row,
      description: seventMetadataFromDescription(row.description),
      rating: Number(row.rating),
      price_inr: Number(row.price_inr),
      price_status: String(row.price_basis || '')
        .toLowerCase()
        .includes('contracted')
        ? 'confirmed'
        : 'rfq_required',
      price_display_label: String(row.price_basis || '')
        .toLowerCase()
        .includes('contracted')
        ? 'Confirmed live price'
        : 'Request live quote',
      seats: Number(row.seats),
      luggage: Number(row.luggage),
      driver_included: Number(row.driver_included),
      eventSite_pickup: Number(row.eventSite_pickup),
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      features: parseJsonArray(row.features),
    },
    request,
  );
}
function seventMetadataFromDescription(desc) {
  if (!desc) return '';
  // Remove lines that look like internal metadata (Source:, checked:, confidence:, etc.)
  return desc
    .replace(/\n?Source:\s*[^\n]*/gi, '')
    .replace(/\n?checked:\s*[^\n]*/gi, '')
    .replace(/\n?confidence:\s*[^\n]*/gi, '')
    .replace(/\n?last.?checked.?at:\s*[^\n]*/gi, '')
    .replace(/\n?price.?source.?url:\s*[^\n]*/gi, '')
    .replace(/\n?contact.?source.?url:\s*[^\n]*/gi, '')
    .replace(/\n?google.?search.?url:\s*[^\n]*/gi, '')
    .replace(/\n?source.?name:\s*[^\n]*/gi, '')
    .trim();
}
async function supportStaff() {
  const rows = await prisma.crmUser.findMany({
    where: {
      mobile: { not: null },
      OR: [
        { role: { in: ['sales', 'support'] } },
        { roles: { some: { role: { in: ['sales', 'support'] } } } },
      ],
    },
    include: { roles: true },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });
  return rows
    .filter((row) => row.mobile?.trim())
    .map((row) => {
      const roleNames = row.roles.map((role) => String(role.role));
      const staffRole = roleNames.includes('support')
        ? 'support'
        : roleNames.includes('sales')
          ? 'sales'
          : String(row.role);
      return {
        id: row.id,
        name: row.name?.trim() || row.email.split('@')[0],
        phone_number: row.mobile,
        role: staffRole,
        badge_key: row.badgeKey || null,
        avatar_url: null,
        rating: null,
      };
    })
    .sort((a, b) => {
      const rank = (role) => (role === 'support' ? 0 : role === 'sales' ? 1 : 2);
      return rank(a.role) - rank(b.role) || a.name.localeCompare(b.name);
    });
}
async function inventoryList(table, mapper, request) {
  const delegate = {
    accommodation_listings: prisma.accommodation_listings,
    car_listings: prisma.car_listings,
  }[table];
  if (!delegate) return [];
  const rows = await delegate.findMany({
    where: { is_active: true, approval_status: 'approved' },
    orderBy: [{ location: 'asc' }, { price_inr: 'asc' }],
  });
  return rows.map((row) => mapper(row, request));
}
async function inventoryDetail(table, mapper, slug, request) {
  const delegate = {
    accommodation_listings: prisma.accommodation_listings,
    car_listings: prisma.car_listings,
  }[table];
  if (!delegate) return null;
  const row = await delegate.findFirst({
    where: { slug, is_active: true, approval_status: 'approved' },
  });
  return row ? mapper(row, request) : null;
}
function mapVendor(row, request) {
  const startingPrice = Number(
    String(row.price_basis || '')
      .match(/[\d,]+/)?.[0]
      ?.replace(/,/g, '') || 0,
  );
  return absolutizeUploads(
    {
      ...row,
      services: (row.service_offerings || []).map((service) => ({
        name: service.name,
        category: service.category,
        description: service.description,
        unit_type: service.unit_type,
      })),
      service_offerings: undefined,
      locations: parseJsonArray(row.locations),
      rating: row.rating == null ? null : Number(row.rating),
      b2b_price: startingPrice,
    },
    request,
  );
}
async function vendors(request) {
  const rows = await prisma.vendors.findMany({
    where: { status: 'approved' },
    include: {
      service_offerings: {
        where: { is_active: true, is_public: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      },
    },
    orderBy: { company_name: 'asc' },
  });
  return rows.map((row) => mapVendor(row, request));
}
async function vendorBySlug(slug, request) {
  const row = await prisma.vendors.findFirst({
    where: { slug, status: 'approved' },
    include: {
      service_offerings: {
        where: { is_active: true, is_public: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      },
    },
  });
  return row ? mapVendor(row, request) : null;
}
const defaultPermitCmsPage = {
  hero_eyebrow: 'Permit Concierge Desk',
  hero_title: 'Indian Credential',
  hero_italic: 'Permit Requirements.',
  hero_body:
    'Indian clients face complex permit rules when booking international holidays. Use our credential checker to get instant document requirements, fees, and processing times. Let MooN handle the application stress with our permit assistance concierge.',
  form_eyebrow: 'Assisted Filing',
  form_title: 'Let MooN File For You.',
  form_body:
    'Avoid portal failures, transaction errors, or document rejections. Our experienced permit operations team carries a 99.8% approval rate.',
  guarantee_title: '100% Rejection Protection',
  guarantee_body:
    'If your permit gets rejected due to clerical errors made on our end during filing, MooN refunds all concierge fees immediately.',
  sections: [],
  service_plans: [
    {
      plan_key: 'standard',
      title: 'Standard ePermit Service',
      description: 'Document verification, application prep, and portal submission support.',
      sort_order: 1,
      is_active: true,
    },
    {
      plan_key: 'premium',
      title: 'Premium VIP fast-track',
      description:
        'Priority checklist review, filing guidance, and personal counselor call coordination.',
      sort_order: 2,
      is_active: true,
    },
  ],
  locations: [
    {
      location_key: 'Bali',
      location_label: 'Bali (Indonesia)',
      status_text: 'Permit on Arrival (VoA) / e-VoA',
      duration_text: '30 Days',
      processing_time: 'Instant at EventSite or 24 hours online',
      average_cost: 'IDR 500,000 (about Rs 2,700)',
      notes: 'Apply for e-VoA online before departure to reduce eventSite queue time.',
      epermit_available: true,
      sort_order: 1,
      requirements: [
        'Credential valid for at least 6 months',
        'Confirmed return or onward ticket',
        'e-VoA receipt or payment at counter',
        'Completed customs declaration QR code',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Dubai',
      location_label: 'Dubai (UAE)',
      status_text: 'Pre-arranged ePermit Required',
      duration_text: '30 or 60 Days',
      processing_time: '3 to 5 Working Days',
      average_cost: 'Rs 7,200 for 30 Days Single Entry',
      notes: 'MooN can review documents and coordinate filing before events.',
      epermit_available: true,
      sort_order: 2,
      requirements: [
        'Credential front and back pages',
        'Credential-sized photo',
        'Confirmed return timeline ticket',
        'Venue reservation or host details',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Thailand',
      location_label: 'Thailand',
      status_text: 'Permit-Free Entry for Indians',
      duration_text: 'Up to 30 Days',
      processing_time: 'Instant at immigration counters',
      average_cost: 'Rs 0',
      notes: 'Carry venue bookings, return tickets, and proof of funds.',
      epermit_available: false,
      sort_order: 3,
      requirements: [
        'Credential valid for at least 6 months',
        'Confirmed return timeline ticket',
        'Proof of funds',
        'Venue booking confirmation',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Kazakhstan',
      location_label: 'Kazakhstan',
      status_text: 'Permit-Free Entry for Indians',
      duration_text: 'Up to 14 Days',
      processing_time: 'Instant at border checkpoints',
      average_cost: 'Rs 0',
      notes: 'Keep events vouchers and return timeline documents available.',
      epermit_available: false,
      sort_order: 4,
      requirements: [
        'Credential valid for at least 6 months',
        'Round-event timeline booking',
        'Venue voucher or invitation letter',
        'Events insurance cover',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Azerbaijan',
      location_label: 'Azerbaijan',
      status_text: 'ASAN ePermit Required',
      duration_text: 'Up to 30 Days',
      processing_time: '3 Working Days standard or 3 Hours urgent',
      average_cost: '$26 standard / $60 urgent',
      notes: 'Names must match credential details exactly to avoid boarding issues.',
      epermit_available: true,
      sort_order: 5,
      requirements: [
        'Credential bio-data page',
        'Intended date of entry',
        'Venue address',
        'Valid card for portal payment',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Georgia',
      location_label: 'Georgia',
      status_text: 'ePermit Required / Conditional Permit-Free',
      duration_text: '90 Days within 180-day period',
      processing_time: '5 to 7 Working Days',
      average_cost: '$20 plus filing assistance',
      notes:
        'Indian citizens with valid US, UK, Schengen, UAE, Saudi Arabia, or GCC permit/residence permit may qualify for permit-free entry.',
      epermit_available: true,
      sort_order: 6,
      requirements: [
        'Credential copy',
        'Recent photograph',
        'Events and health insurance',
        'Bank statements',
        'Return timelines and runOfShow',
      ],
      conditional_rules: [
        {
          trigger_label: 'I hold a valid US/UK/Schengen/UAE permit or PR',
          status_text: 'Permit-Free (Conditional)',
          average_cost: 'Rs 0',
          notes: 'Carry a printed copy of the valid permit/PR with venue and timeline bookings.',
        },
      ],
    },
    {
      location_key: 'Turkey',
      location_label: 'Turkey',
      status_text: 'ePermit (Conditional) or Sticker Permit',
      duration_text: '30 Days ePermit / 90 Days sticker',
      processing_time: '24 Hours ePermit / 10-12 Working Days sticker',
      average_cost: '$43 ePermit / Rs 16,500 sticker permit',
      notes:
        'Without a qualifying permit, Indian clients usually need the physical sticker permit route.',
      epermit_available: true,
      sort_order: 7,
      requirements: [
        'Credential valid for at least 6 months',
        'Valid US, UK, Schengen, or Ireland permit/residence permit for ePermit',
        'Return timeline ticket and venue reservation',
        'Financial profile and employer NOC for sticker permit',
      ],
      conditional_rules: [
        {
          trigger_label: 'I hold a valid US/UK/Schengen/UAE permit or PR',
          status_text: 'Conditional ePermit Available',
          average_cost: '$43',
          notes: 'You may qualify for an ePermit and avoid the physical sticker permit route.',
        },
      ],
    },
  ],
};
async function ensurePermitCmsTables() {
  return;
}
async function seedPermitCmsIfEmpty() {
  if (await prisma.visa_cms_page.findUnique({ where: { id: 1 }, select: { id: true } })) return;
  await prisma.$transaction(async (tx) => {
    await tx.permit_cms_page.create({
      data: {
        id: 1,
        hero_eyebrow: defaultPermitCmsPage.hero_eyebrow,
        hero_title: defaultPermitCmsPage.hero_title,
        hero_italic: defaultPermitCmsPage.hero_italic,
        hero_body: defaultPermitCmsPage.hero_body,
        form_eyebrow: defaultPermitCmsPage.form_eyebrow,
        form_title: defaultPermitCmsPage.form_title,
        form_body: defaultPermitCmsPage.form_body,
        guarantee_title: defaultPermitCmsPage.guarantee_title,
        guarantee_body: defaultPermitCmsPage.guarantee_body,
      },
    });
    await tx.permit_cms_sections.createMany({ data: defaultPermitCmsPage.sections });
    await tx.permit_cms_service_plans.createMany({ data: defaultPermitCmsPage.service_plans });
    for (const location of defaultPermitCmsPage.locations) {
      const created = await tx.permit_cms_locations.create({
        data: {
          location_key: location.location_key,
          location_label: location.location_label,
          status_text: location.status_text,
          duration_text: location.duration_text,
          processing_time: location.processing_time,
          average_cost: location.average_cost,
          notes: location.notes,
          epermit_available: location.epermit_available,
          sort_order: location.sort_order,
        },
      });
      await tx.permit_cms_requirements.createMany({
        data: location.requirements.map((item, index) => ({
          location_id: created.id,
          item,
          sort_order: index + 1,
        })),
      });
      await tx.permit_cms_conditional_rules.createMany({
        data: location.conditional_rules.map((rule) => ({
          location_id: created.id,
          ...rule,
        })),
      });
    }
  });
}
async function permitCmsPage() {
  await ensurePermitCmsTables();
  await seedPermitCmsIfEmpty();
  const page = await prisma.visa_cms_page.findUnique({ where: { id: 1 } });
  if (!page) return defaultPermitCmsPage;
  const destRows = await prisma.visa_cms_destinations.findMany({
    where: { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { location_label: 'asc' }],
  });
  const locations = [];
  for (const dest of destRows) {
    const [reqRows, ruleRows] = await Promise.all([
      prisma.visa_cms_requirements.findMany({
        where: { location_id: dest.id },
        orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
        select: { item: true },
      }),
      prisma.visa_cms_conditional_rules.findMany({
        where: { location_id: dest.id },
        orderBy: { id: 'asc' },
        select: { trigger_label: true, status_text: true, average_cost: true, notes: true },
      }),
    ]);
    locations.push({
      location_key: dest.location_key,
      location_label: dest.location_label,
      status_text: dest.status_text,
      duration_text: dest.duration_text,
      processing_time: dest.processing_time,
      average_cost: dest.average_cost,
      notes: dest.notes,
      epermit_available: !!dest.epermit_available,
      sort_order: Number(dest.sort_order || 0),
      requirements: reqRows.map((row) => row.item),
      conditional_rules: ruleRows,
    });
  }
  const [sectionRows, planRows] = await Promise.all([
    prisma.visa_cms_sections.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      select: { section_key: true, title: true, body: true, sort_order: true, is_active: true },
    }),
    prisma.visa_cms_service_plans.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      select: {
        plan_key: true,
        title: true,
        description: true,
        sort_order: true,
        is_active: true,
      },
    }),
  ]);
  return {
    hero_eyebrow: page.hero_eyebrow,
    hero_title: page.hero_title,
    hero_italic: page.hero_italic,
    hero_body: page.hero_body,
    form_eyebrow: page.form_eyebrow,
    form_title: page.form_title,
    form_body: page.form_body,
    guarantee_title: page.guarantee_title,
    guarantee_body: page.guarantee_body,
    locations,
    sections: sectionRows,
    service_plans: planRows,
  };
}
const defaultPackingCmsPage = {
  hero_eyebrow: 'Preparation Portal',
  hero_title: 'Smart Packing',
  hero_italic: 'Checklist.',
  hero_body:
    'Tailored packing recommendations for Indian clients by location, climate, and events season.',
  suggestion_title: 'MooN Smart Suggestion',
  suggestion_body:
    'Print this list out using the Print List button. Our printing stylesheet creates a high-contrast dual-column layout optimized for physical pen-and-paper checks.',
  seasons: [
    { season_key: 'summer', label: 'Summer / Dry Season', sort_order: 1, is_active: true },
    { season_key: 'rainy', label: 'Rainy / Monsoon Season', sort_order: 2, is_active: true },
    { season_key: 'winter', label: 'Winter / Snow Season', sort_order: 3, is_active: true },
  ],
  categories: [
    { category_key: 'docs', label: 'Documents & Wallet', sort_order: 1, is_active: true },
    { category_key: 'clothing', label: 'Clothing & Shoes', sort_order: 2, is_active: true },
    { category_key: 'tech', label: 'Electronics & Tech', sort_order: 3, is_active: true },
    { category_key: 'health', label: 'Health & Wellness', sort_order: 4, is_active: true },
  ],
  items: [
    {
      item_key: 'docs-global-1',
      category_key: 'docs',
      item_text: 'Credential (valid for at least 6 months)',
      location_key: null,
      season_key: null,
      sort_order: 1,
      is_active: true,
    },
    {
      item_key: 'docs-global-2',
      category_key: 'docs',
      item_text: 'Printed Round-event Timeline Tickets',
      location_key: null,
      season_key: null,
      sort_order: 2,
      is_active: true,
    },
    {
      item_key: 'docs-global-3',
      category_key: 'docs',
      item_text: 'Venue Booking Vouchers / Stays Printout',
      location_key: null,
      season_key: null,
      sort_order: 3,
      is_active: true,
    },
    {
      item_key: 'docs-global-4',
      category_key: 'docs',
      item_text: 'ePermit Copy / e-VoA Document',
      location_key: null,
      season_key: null,
      sort_order: 4,
      is_active: true,
    },
    {
      item_key: 'docs-global-5',
      category_key: 'docs',
      item_text: 'Events Insurance Policy Document',
      location_key: null,
      season_key: null,
      sort_order: 5,
      is_active: true,
    },
    {
      item_key: 'tech-global-1',
      category_key: 'tech',
      item_text: 'Universal Events Adapter (Plug Converter)',
      location_key: null,
      season_key: null,
      sort_order: 1,
      is_active: true,
    },
    {
      item_key: 'tech-global-2',
      category_key: 'tech',
      item_text: 'Power Bank (Carry-on only, under 20k mAh)',
      location_key: null,
      season_key: null,
      sort_order: 2,
      is_active: true,
    },
    {
      item_key: 'health-global-1',
      category_key: 'health',
      item_text: 'Prescribed medicines (with valid prescription copy)',
      location_key: null,
      season_key: null,
      sort_order: 1,
      is_active: true,
    },
    {
      item_key: 'health-global-2',
      category_key: 'health',
      item_text: 'High-SPF Sunscreen (SPF 50+)',
      location_key: null,
      season_key: null,
      sort_order: 2,
      is_active: true,
    },
    {
      item_key: 'clothing-global-1',
      category_key: 'clothing',
      item_text: 'Comfortable cotton tees & shirts',
      location_key: null,
      season_key: null,
      sort_order: 1,
      is_active: true,
    },
    {
      item_key: 'clothing-global-2',
      category_key: 'clothing',
      item_text: 'Walking sneakers with good cushioning',
      location_key: null,
      season_key: null,
      sort_order: 2,
      is_active: true,
    },
    {
      item_key: 'tech-dubai-plug',
      category_key: 'tech',
      item_text: 'Type G power plugs (British 3-pin)',
      location_key: 'Dubai',
      season_key: null,
      sort_order: 20,
      is_active: true,
    },
    {
      item_key: 'tech-bali-plug',
      category_key: 'tech',
      item_text: 'Type C / F power plugs (European 2-pin)',
      location_key: 'Bali',
      season_key: null,
      sort_order: 20,
      is_active: true,
    },
    {
      item_key: 'clothing-bali-rainy-1',
      category_key: 'clothing',
      item_text: 'Lightweight rain poncho or folding umbrella',
      location_key: 'Bali',
      season_key: 'rainy',
      sort_order: 20,
      is_active: true,
    },
    {
      item_key: 'clothing-bali-summer-1',
      category_key: 'clothing',
      item_text: 'Swimwear / Board shorts (2-3 pairs)',
      location_key: 'Bali',
      season_key: 'summer',
      sort_order: 20,
      is_active: true,
    },
    {
      item_key: 'clothing-dubai-summer-1',
      category_key: 'clothing',
      item_text: 'Ultra-lightweight linen & loose cotton clothes',
      location_key: 'Dubai',
      season_key: 'summer',
      sort_order: 20,
      is_active: true,
    },
    {
      item_key: 'clothing-kazakhstan-winter-1',
      category_key: 'clothing',
      item_text: 'Heavy Thermal Innerwear (2-3 pairs)',
      location_key: 'Kazakhstan',
      season_key: 'winter',
      sort_order: 20,
      is_active: true,
    },
  ],
};
async function ensurePackingCmsTables() {
  return;
}
async function seedPackingCmsIfEmpty() {
  if (await prisma.packing_cms_page.findUnique({ where: { id: 1 }, select: { id: true } })) return;
  await prisma.$transaction([
    prisma.packing_cms_page.create({
      data: {
        id: 1,
        hero_eyebrow: defaultPackingCmsPage.hero_eyebrow,
        hero_title: defaultPackingCmsPage.hero_title,
        hero_italic: defaultPackingCmsPage.hero_italic,
        hero_body: defaultPackingCmsPage.hero_body,
        suggestion_title: defaultPackingCmsPage.suggestion_title,
        suggestion_body: defaultPackingCmsPage.suggestion_body,
      },
    }),
    prisma.packing_cms_seasons.createMany({ data: defaultPackingCmsPage.seasons }),
    prisma.packing_cms_categories.createMany({ data: defaultPackingCmsPage.categories }),
    prisma.packing_cms_items.createMany({ data: defaultPackingCmsPage.items }),
  ]);
}
async function packingCmsPage() {
  await ensurePackingCmsTables();
  await seedPackingCmsIfEmpty();
  const [page, seasonRows, categoryRows, itemRows] = await Promise.all([
    prisma.packing_cms_page.findUnique({ where: { id: 1 } }),
    prisma.packing_cms_seasons.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      select: { season_key: true, label: true, sort_order: true, is_active: true },
    }),
    prisma.packing_cms_categories.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      select: { category_key: true, label: true, sort_order: true, is_active: true },
    }),
    prisma.packing_cms_items.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      select: {
        item_key: true,
        category_key: true,
        item_text: true,
        location_key: true,
        season_key: true,
        sort_order: true,
        is_active: true,
      },
    }),
  ]);
  return {
    hero_eyebrow: page?.hero_eyebrow || defaultPackingCmsPage.hero_eyebrow,
    hero_title: page?.hero_title || defaultPackingCmsPage.hero_title,
    hero_italic: page?.hero_italic || defaultPackingCmsPage.hero_italic,
    hero_body: page?.hero_body || defaultPackingCmsPage.hero_body,
    suggestion_title: page?.suggestion_title || defaultPackingCmsPage.suggestion_title,
    suggestion_body: page?.suggestion_body || defaultPackingCmsPage.suggestion_body,
    seasons: seasonRows,
    categories: categoryRows,
    items: itemRows.map((item) => ({
      ...item,
      location_key: item.location_key || null,
      season_key: item.season_key || null,
    })),
  };
}
async function ensureSeoTables() {
  return;
}
async function mapBlogPosts(rows, request) {
  return rows.map(({ blog_authors, blog_categories, blog_post_tags, ...row }) =>
    absolutizeUploads(
      {
        ...row,
        category_slug: blog_categories?.slug ?? null,
        category_name: blog_categories?.name ?? null,
        author_name: blog_authors.name,
        author_slug: blog_authors.slug,
        tags: blog_post_tags.map(({ blog_tags }) => ({
          id: blog_tags.id,
          slug: blog_tags.slug,
          name: blog_tags.name,
        })),
      },
      request,
    ),
  );
}
async function blogPosts(request, filter = {}) {
  await ensureSeoTables();
  const rows = await prisma.blog_posts.findMany({
    where: {
      status: 'published',
      published_at: { lte: new Date() },
      ...(filter.slug ? { slug: filter.slug } : {}),
      ...(filter.categorySlug ? { blog_categories: { is: { slug: filter.categorySlug } } } : {}),
    },
    include: {
      blog_authors: true,
      blog_categories: true,
      blog_post_tags: { include: { blog_tags: true } },
    },
    orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
  });
  return mapBlogPosts(rows, request);
}
async function reviews(url) {
  await ensureSeoTables();
  const itemType = url.searchParams.get('itemType');
  const itemId = url.searchParams.get('itemId');
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 12), 1), 50);
  const rows = await prisma.customer_reviews.findMany({
    where: {
      status: 'approved',
      ...(itemType ? { item_type: itemType } : {}),
      ...(itemId ? { item_id: itemId } : {}),
    },
    select: {
      id: true,
      item_type: true,
      item_id: true,
      rating: true,
      author_name: true,
      review_text: true,
      travel_date: true,
      published_at: true,
    },
    orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
    take: limit,
  });
  return rows.map(({ travel_date, ...row }) => ({ ...row, event_date: travel_date }));
}
async function reviewSummary(url) {
  await ensureSeoTables();
  const itemType = url.searchParams.get('itemType');
  const itemId = url.searchParams.get('itemId');
  const summary = await prisma.customer_reviews.aggregate({
    where: {
      status: 'approved',
      ...(itemType ? { item_type: itemType } : {}),
      ...(itemId ? { item_id: itemId } : {}),
    },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return summary._count._all > 0
    ? {
        review_count: summary._count._all,
        average_rating: Number(Number(summary._avg.rating).toFixed(1)),
      }
    : null;
}
async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
async function handlePost(pathname, request) {
  const data = await readBody(request);
  if (pathname === '/api/public/contact') {
    const payload = validatePayload(contactSchema, data);
    if (!payload.ok) return badRequest(payload.message);
    await prisma.contact_submissions.create({ data: payload.value });
    return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/public/leads') {
    const payload = validatePayload(leadSchema, data);
    if (!payload.ok) return badRequest(payload.message);
    await ensurePackageRouteColumns(); // Ensures lead priority columns exist too
    let aiPriority = 'medium';
    let aiTheme = payload.value.eventType || 'General Event';
    let aiAssignedOwner = 'Unassigned';
    let aiAdminNotes = '';
    const isUrgentDate =
      payload.value.eventMonth &&
      (() => {
        const diff =
          (new Date(payload.value.eventMonth).getTime() - Date.now()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 14;
      })();
    if (isUrgentDate) {
      aiPriority = 'urgent';
    }
    // AI Lead Parsing — Event-Native Qualifier
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are Maya, the AI Event Operations Lead Qualifier for MooNs Events.
        Analyze this incoming event inquiry:
        Event Occasion: ${payload.value.eventType || 'General Event'}
        Venue/City: ${payload.value.location}
        Guest Count: ${payload.value.clientsCount}
        Target Date: ${payload.value.eventMonth || 'Not specified'}
        Estimated Budget: ${payload.value.budgetRange || 'Unknown'}
        Scope & Notes: ${payload.value.notes || 'None'}
        
        Tasks:
        1. Determine the primary Event Domain (e.g., Luxury Wedding, Reception, Corporate Gala, Milestone Birthday, Private Celebration, Concert/Live Show).
        2. Assign priority (low, medium, high, urgent). Set 'urgent' if the event is within 14 days or involves complex logistics (buses, multi-cuisine, drone).
        3. Recommend a Lead Planner:
           - "Priya" for Weddings, Engagements, Receptions & Cultural Ceremonies
           - "Rahul" for Corporate Events, Summits, Mega Productions & Music Shows
           - "Ananya" for Private Parties, Milestone Birthdays, Anniversaries & Socials
        
        Respond ONLY with raw JSON: {"theme": "string", "priority": "low|medium|high|urgent", "assignedOwner": "Priya|Rahul|Ananya"}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(
          text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim(),
        );
        if (parsed.theme) aiTheme = parsed.theme;
        if (parsed.priority) aiPriority = parsed.priority;
        if (parsed.assignedOwner) aiAssignedOwner = parsed.assignedOwner.split(' ')[0];
        aiAdminNotes = `[Maya AI Lead Analysis] Domain: ${aiTheme} | Priority: ${aiPriority.toUpperCase()} | Assigned Specialist: ${aiAssignedOwner}${isUrgentDate ? ' | ⚡ LAST-MINUTE EMERGENCY PROTOCOL' : ''}`;
      } catch (e) {
        console.error('AI Lead Parsing failed:', e);
      }
    }
    await prisma.lead_submissions.create({
      data: {
        name: payload.value.name,
        phone: payload.value.phone,
        email: payload.value.email,
        destination: payload.value.location,
        travel_month: payload.value.eventMonth,
        travelers_count: payload.value.clientsCount,
        budget_range: payload.value.budgetRange,
        notes: payload.value.notes,
        attribution: payload.value.attribution ? JSON.stringify(payload.value.attribution) : null,
        priority: aiPriority,
        theme: aiTheme,
        assigned_owner: aiAssignedOwner,
        admin_notes: aiAdminNotes,
      },
    });
    return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/public/newsletter') {
    const payload = validatePayload(newsletterSchema, data);
    if (!payload.ok) return badRequest(payload.message);
    await prisma.newsletter_subscribers.upsert({
      where: { email: payload.value.email },
      create: { email: payload.value.email },
      update: { subscribed_at: new Date() },
    });
    return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/public/callbacks') {
    const payload = validatePayload(callbackSchema, data);
    if (!payload.ok) return badRequest(payload.message);
    await prisma.callback_requests.create({ data: payload.value });
    return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/public/scheduled-calls') {
    const payload = validatePayload(scheduledCallSchema, data);
    if (!payload.ok) return badRequest(payload.message);
    await prisma.scheduled_calls.create({
      data: {
        name: payload.value.name,
        phone: payload.value.phone,
        email: payload.value.email,
        call_date: new Date(payload.value.date),
        time_slot: payload.value.timeSlot,
        method: payload.value.method,
      },
    });
    return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/public/submit-job-application') {
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const crypto = await import('node:crypto');
      if (!data.resumeUrl && !data.resumeFile) {
        return badRequest('Please upload a resume file or provide a portfolio link.');
      }
      let resumeUrlToSave = data.resumeUrl || '';
      if (data.resumeFile) {
        const { name, base64 } = data.resumeFile;
        const ext = path.extname(name).toLowerCase();
        if (ext !== '.pdf' && ext !== '.docx') {
          return badRequest('Invalid file type. Only PDF and DOCX formats are allowed.');
        }
        let base64Clean = base64;
        if (base64.includes(';base64,')) {
          base64Clean = base64.split(';base64,')[1];
        }
        const fileBuffer = decodeBase64Strict(base64Clean);
        const MAX_SIZE = 5 * 1024 * 1024;
        if (fileBuffer.length > MAX_SIZE) {
          return badRequest('File exceeds the maximum limit of 5MB.');
        }
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const randomUUID = crypto.randomUUID();
        const safeBase = path
          .basename(name, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 50);
        const uniqueFilename = `resume_${safeBase}_${randomUUID}${ext}`;
        const destPath = path.join(uploadDir, uniqueFilename);
        await fs.promises.writeFile(destPath, fileBuffer);
        resumeUrlToSave = `/uploads/resumes/${uniqueFilename}`;
      }
      await prisma.careers_applications.create({
        data: {
          job_id: Number(data.jobId),
          name: String(data.name),
          email: String(data.email),
          phone: String(data.phone),
          resume_url: resumeUrlToSave,
          cover_letter: String(data.coverLetter || ''),
          mock_test_score: data.mockTestScore == null ? null : Number(data.mockTestScore),
          mock_test_answers: data.mockTestAnswers ? JSON.stringify(data.mockTestAnswers) : null,
        },
      });
      return json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
      return badRequest(e.message);
    }
  }
  if (pathname === '/api/public/validate-promo-code') {
    const { code, totalAmount, userId } = data;
    if (!code) return badRequest('Promo code is required');
    const promo = await prisma.promo_codes.findFirst({
      where: { code: code.toUpperCase(), is_active: true },
    });
    if (!promo) return badRequest('Invalid or inactive promo code.');
    if (promo.type === 'referral' && userId && promo.referring_user_id === userId) {
      return badRequest('You cannot use your own referral code.');
    }
    if (promo.max_uses > 0 && promo.current_uses >= promo.max_uses) {
      return badRequest('This promo code has reached its usage limit.');
    }
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      return badRequest('This promo code has expired.');
    }
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = (Number(totalAmount) * Number(promo.discount_value)) / 100;
    } else {
      discountAmount = Number(promo.discount_value);
    }
    return json({ success: true, discountAmount, type: promo.type });
  }
  if (pathname === '/api/public/create-booking-with-payment') {
    const {
      userId,
      guestDetails,
      itemType,
      itemName,
      amount,
      promoCode,
      eventDate,
      clientsCount,
      utrReference,
      location,
      customizations,
      welcomeOfferSlug,
    } = data;
    if (!userId && !guestDetails) return badRequest('User ID or Guest details required');
    let discountAmount = 0;
    let promoType = null;
    let referringUserId = null;
    if (promoCode) {
      const promo = await prisma.promo_codes.findFirst({
        where: { code: promoCode.toUpperCase(), is_active: true },
      });
      if (promo) {
        if (!(promo.type === 'referral' && userId && promo.referring_user_id === userId)) {
          if (!((promo.max_uses ?? 0) > 0 && (promo.current_uses ?? 0) >= (promo.max_uses ?? 0))) {
            if (!(promo.valid_until && new Date(promo.valid_until) < new Date())) {
              promoType = promo.type;
              referringUserId = promo.referring_user_id;
              if (promo.discount_type === 'percentage') {
                discountAmount = (Number(amount) * Number(promo.discount_value)) / 100;
              } else {
                discountAmount = Number(promo.discount_value);
              }
              await prisma.promo_codes.update({
                where: { id: promo.id },
                data: { current_uses: { increment: 1 } },
              });
            }
          }
        }
      }
    }
    const finalAmount = Math.max(0, Number(amount) - discountAmount);
    let customerName = guestDetails?.name;
    let customerEmail = guestDetails?.email;
    let customerPhone = guestDetails?.mobile;
    if (userId && !customerName) {
      const user = await prisma.customerUser.findUnique({
        where: { id: Number(userId) },
        select: { name: true, email: true, phone: true },
      });
      if (user) {
        customerName = user.name;
        customerEmail = user.email;
        customerPhone = user.phone;
      }
    }
    let bookingUserId = userId;
    if (!bookingUserId) {
      if (!customerName || !customerEmail || !customerPhone)
        return badRequest('Guest details incomplete');
      // Find or create user
      const existingUser = await prisma.customerUser.findFirst({
        where: { OR: [{ email: customerEmail }, { phone: customerPhone }] },
        select: { id: true },
      });
      if (existingUser) {
        bookingUserId = existingUser.id;
      } else {
        const createdUser = await prisma.customerUser.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
        });
        bookingUserId = createdUser.id;
      }
    }
    // Welcome-offer eligibility must be evaluated against the booking history
    // *before* we insert this booking (a truly-new user has zero prior bookings).
    let welcomeOfferEligible = false;
    if (welcomeOfferSlug && bookingUserId) {
      await ensureWelcomeOffersTable(pool);
      const priorBookings = await countUserBookings(pool, Number(bookingUserId));
      if (priorBookings === 0) {
        const welcomeOffer = await prisma.user_welcome_offers.findUnique({
          where: { user_id: Number(bookingUserId) },
          select: { status: true },
        });
        welcomeOfferEligible = welcomeOffer?.status === 'claimed';
      }
    }
    const bookingRef = 'TPY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    let operatorId = null;
    if (itemType === 'package' || itemType === 'package_bundle') {
      operatorId = (
        await prisma.packages.findFirst({
          where: { name: itemName },
          select: { operator_id: true },
        })
      )?.operator_id;
    }
    const booking = await prisma.bookings.create({
      data: {
        user_id: Number(bookingUserId),
        booking_reference: bookingRef,
        item_type: itemType,
        item_name: itemName,
        amount: finalAmount,
        travel_date: new Date(eventDate),
        status: 'pending',
        operator_id: operatorId,
      },
    });
    const bookingId = booking.id;
    await prisma.payment_orders.create({
      data: {
        user_id: Number(bookingUserId),
        booking_id: bookingId,
        amount: finalAmount,
        utr_reference: utrReference,
        clients_count: clientsCount,
        location,
        customizations: customizations || null,
        status: 'pending_verification',
      },
    });
    // Initialize Escrow milestones: 50% deposit, 35% commencement, 15% completion
    const m50 = Math.round(finalAmount * 0.5);
    const m35 = Math.round(finalAmount * 0.35);
    const m15 = finalAmount - m50 - m35;
    const tDate = new Date(eventDate);
    const scheduledCommencement = eventDate;
    const completionDate = new Date(tDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    await prisma.escrow_ledger.createMany({
      data: [
        {
          booking_id: bookingId,
          milestone_type: 'deposit_50',
          amount: m50,
          status: 'held',
          scheduled_release_date: new Date(),
        },
        {
          booking_id: bookingId,
          milestone_type: 'commencement_35',
          amount: m35,
          status: 'held',
          scheduled_release_date: new Date(scheduledCommencement),
        },
        {
          booking_id: bookingId,
          milestone_type: 'completion_15',
          amount: m15,
          status: 'held',
          scheduled_release_date: new Date(completionDate),
        },
      ],
    });
    if (customizations) {
      try {
        const parsed = JSON.parse(customizations);
        if (parsed.paceMode || parsed.customRunOfShow) {
          await prisma.itinerary_customizations.create({
            data: {
              booking_id: bookingId,
              pace_mode: parsed.paceMode || 'Balanced',
              custom_runOfShow: parsed.customRunOfShow
                ? JSON.stringify(parsed.customRunOfShow)
                : null,
            },
          });
        }
      } catch (e) {
        console.warn('Failed to parse customization JSON:', e);
      }
    }
    if (promoType === 'referral' && referringUserId && finalAmount > 0) {
      await prisma.customerUser.update({
        where: { id: Number(referringUserId) },
        data: { points_balance: { increment: 500 } },
      });
    }
    // Redeem the welcome offer once — locks it to this booking so it can never re-apply.
    if (welcomeOfferEligible) {
      await prisma.user_welcome_offers.updateMany({
        where: { user_id: Number(bookingUserId), status: 'claimed' },
        data: { status: 'redeemed', booking_id: bookingId, redeemed_at: new Date() },
      });
    }
    // Booking-received email (fire-and-forget: SMTP issues must never fail a booking).
    import('../legacy/booking-emails.server.js')
      .then(({ sendBookingEmail, formatInr }) =>
        sendBookingEmail('booking-received', customerEmail, {
          customer_name: customerName || 'client',
          reference: bookingRef,
          item_name: itemName,
          amount: formatInr(finalAmount),
          event_date: eventDate,
          clients: String(clientsCount || 1),
          utr: utrReference,
          customer_phone: customerPhone || '',
        }),
      )
      .catch((e) => console.warn('booking-received email skipped:', e.message));
    return json({ success: true, bookingReference: bookingRef, bookingId });
  }
  // ── Welcome Offer: claim to account (new users only, once) ──
  if (pathname === '/api/public/claim-welcome-offer') {
    const { userId, slug } = data;
    if (!userId) return badRequest('You must be signed in to claim this offer.');
    if (!slug) return badRequest('Offer is required.');
    await ensureWelcomeOffersTable(pool);
    const offer = await prisma.promotional_offers.findFirst({
      where: { slug, is_active: true },
      select: { id: true, title: true, slug: true, discount_percent: true },
    });
    if (!offer) return badRequest('This offer has ended or is no longer available.');
    // Already claimed? Return current state (idempotent).
    const existing = await prisma.user_welcome_offers.findUnique({
      where: { user_id: Number(userId) },
      select: { status: true },
    });
    if (existing) {
      if (existing.status === 'redeemed') {
        return json({
          success: false,
          reason: 'already_redeemed',
          message: "You've already used your welcome offer.",
        });
      }
      return json({
        success: true,
        alreadyClaimed: true,
        discountPercent: offer.discount_percent,
        offerTitle: offer.title,
      });
    }
    // New users only — no prior booking history.
    const bookingCount = await countUserBookings(pool, Number(userId));
    if (bookingCount > 0) {
      return json({
        success: false,
        reason: 'not_new',
        message: 'This welcome offer is only for new clients with no bookings yet.',
      });
    }
    await prisma.user_welcome_offers.create({
      data: {
        user_id: Number(userId),
        offer_slug: offer.slug,
        offer_title: offer.title,
        discount_percent: offer.discount_percent,
        status: 'claimed',
      },
    });
    return json({
      success: true,
      discountPercent: offer.discount_percent,
      offerTitle: offer.title,
    });
  }
  // ── Welcome Offer: fetch the signed-in user's active claim ──
  if (pathname === '/api/public/my-welcome-offer') {
    const { userId } = data;
    if (!userId) return badRequest('User ID required');
    await ensureWelcomeOffersTable(pool);
    const claim = await prisma.user_welcome_offers.findUnique({
      where: { user_id: Number(userId) },
      select: { offer_slug: true, offer_title: true, discount_percent: true, status: true },
    });
    const bookingCount = await countUserBookings(pool, Number(userId));
    const eligible = bookingCount === 0;
    return json({
      success: true,
      eligible,
      claim: claim
        ? {
            offerSlug: claim.offer_slug,
            offerTitle: claim.offer_title,
            discountPercent: claim.discount_percent,
            status: claim.status,
          }
        : null,
    });
  }
  if (pathname === '/api/public/my-referral-code') {
    const { userId } = data;
    if (!userId) return badRequest('User ID required');
    const user = await prisma.customerUser.findUnique({ where: { id: Number(userId) } });
    if (!user) return badRequest('User not found');
    let codeRecord = await prisma.promo_codes.findFirst({
      where: { referring_user_id: Number(userId), type: 'referral' },
    });
    if (!codeRecord) {
      const codeBase =
        'REF-' +
        (user.name
          ? user.name
              .replace(/[^A-Za-z0-9]/g, '')
              .toUpperCase()
              .substring(0, 5)
          : 'USER');
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${codeBase}-${randomPart}`;
      await prisma.promo_codes.create({
        data: {
          code,
          type: 'referral',
          discount_type: 'percentage',
          discount_value: 5,
          max_uses: 0,
          current_uses: 0,
          is_active: true,
          referring_user_id: Number(userId),
        },
      });
      codeRecord = await prisma.promo_codes.findFirst({
        where: { referring_user_id: Number(userId), type: 'referral' },
      });
    }
    return json({
      success: true,
      code: codeRecord?.code,
      stats: { current_uses: codeRecord?.current_uses ?? 0, points: user.points_balance },
    });
  }
  // ── User Bookings (read) ──
  if (pathname === '/api/public/user-bookings') {
    const { userId } = data;
    if (!userId) return badRequest('User ID required');
    await resolve();
    const rows = await prisma.bookings.findMany({
      where: { user_id: Number(userId) },
      orderBy: { travel_date: 'asc' },
    });
    return json(
      rows.map(({ travel_date, ...row }) => ({ ...row, event_date: travel_date })),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  // ── Cancel Booking ──
  if (pathname === '/api/public/cancel-booking') {
    return badRequest(
      'Public cancellation is disabled. Sign in and use the client event portal so the request is identity-verified and staff-approved.',
    );
  }
  // ── Escrow Status by Booking ──
  if (pathname === '/api/public/user-escrow') {
    const { bookingId } = data;
    if (!bookingId) return badRequest('Booking ID required');
    try {
      const rows = await prisma.escrow_ledger.findMany({
        where: { booking_id: Number(bookingId) },
      });
      const rank = { deposit_50: 0, commencement_35: 1, completion_15: 2 };
      rows.sort((a, b) => rank[a.milestone_type] - rank[b.milestone_type]);
      return json(rows, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return json([]);
    }
  }
  // ── User Payment Orders ──
  if (pathname === '/api/public/user-payment-orders') {
    const { userId } = data;
    if (!userId) return badRequest('User ID required');
    try {
      const [rows, user] = await Promise.all([
        prisma.payment_orders.findMany({
          where: { user_id: Number(userId) },
          orderBy: { id: 'desc' },
        }),
        prisma.customerUser.findUnique({
          where: { id: Number(userId) },
          select: { name: true, email: true },
        }),
      ]);
      const bookings = await prisma.bookings.findMany({
        where: { id: { in: rows.flatMap((row) => (row.booking_id ? [row.booking_id] : [])) } },
      });
      const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
      return json(
        rows.map((row) => ({
          ...row,
          user_name: user?.name ?? null,
          user_email: user?.email ?? null,
          booking_reference: row.booking_id
            ? bookingById.get(row.booking_id)?.booking_reference
            : null,
          item_name: row.booking_id ? bookingById.get(row.booking_id)?.item_name : null,
          event_date: row.booking_id ? bookingById.get(row.booking_id)?.travel_date : null,
        })),
        { headers: { 'Cache-Control': 'no-store' } },
      );
    } catch {
      return json([]);
    }
  }
  // ── Invoice Data ──
  if (pathname === '/api/public/invoice-data') {
    const { userId, bookingReference } = data;
    if (!userId || !bookingReference) return badRequest('User ID and booking reference required');
    const bk = await prisma.bookings.findFirst({
      where: { booking_reference: bookingReference, user_id: Number(userId) },
    });
    if (!bk) return badRequest('Booking not found');
    const paymentSummary = await prisma.payment_orders.aggregate({
      where: { booking_id: bk.id, status: 'verified' },
      _sum: { amount: true },
    });
    const paidAmount = Number(paymentSummary._sum.amount || 0);
    return json(
      {
        booking: bk,
        paidAmount,
        pendingAmount: Math.max(0, Number(bk.amount) - paidAmount),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return notFound();
}
async function publicCareerJobs() {
  try {
    const jobs = await prisma.careers_jobs.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
    if (jobs && jobs.length > 0) return jobs;
  } catch (err) {
    console.warn('[Public API] careers_jobs query fallback:', err);
  }
  // Default Event Production Openings fallback
  return [
    {
      id: 1,
      title: 'Wedding Production & Stage Lead',
      department: 'Wedding Operations',
      location: 'Hyderabad / Pan-India',
      type: 'Full-time',
      salary: '₹8.5L – ₹14L / yr',
      openings: 3,
      description:
        'Direct on-site wedding mandap setup, floral production, vendor synchronization, and wedding day run-of-show execution.',
      responsibilities:
        'Manage on-site decor crews, coordinate with banquet venue managers, ensure Zero No-Show SLA compliance.',
      requirements:
        '3+ years event production experience, crisis management skills, strong vendor leadership.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Audio-Visual & Intelligent Lighting Engineer',
      department: 'Technical Production',
      location: 'Hyderabad / Bengaluru',
      type: 'Full-time',
      salary: '₹7L – ₹12L / yr',
      openings: 2,
      description:
        'Manage line-array sound systems, DMX moving head trussing, LED walls, and live failover systems for concerts and summits.',
      responsibilities:
        'Design truss rigging, engineer sound consoles, oversee 4K live broadcast signal distribution.',
      requirements: 'Experience with digital mixers, DMX512 controllers, LED video processors.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Master Emcee & VIP Hospitality Captain',
      department: 'Guest Experience',
      location: 'Hyderabad / Mumbai',
      type: 'Full-time',
      salary: '₹6L – ₹10L / yr',
      openings: 4,
      description:
        'Orchestrate grand entrances, VIP guest welcome protocols, registration desks, and schedule adherence.',
      responsibilities:
        'Train hostess teams, lead guest registration desks, coordinate bridal car and bus fleet arrivals.',
      requirements:
        'Excellent bilingual communication (English/Hindi/Telugu), graceful under pressure, luxury hospitality background.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Transport & Logistics Fleet Dispatcher',
      department: 'Fleet Operations',
      location: 'Pan-India',
      type: 'Full-time',
      salary: '₹5.5L – ₹9L / yr',
      openings: 2,
      description:
        'Command the relative transport fleet: 50-seater AC buses, tempo travelers, and VIP bridal cars with real-time GPS routing.',
      responsibilities:
        'Coordinate driver manifests, route planning, airport pickups, and zero-delay turnaround.',
      requirements:
        'Logistics dispatching background, GPS fleet tracker familiarity, emergency route rerouting experience.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      title: 'Gourmet Catering & Live Station Manager',
      department: 'Food & Beverage',
      location: 'Hyderabad',
      type: 'Full-time',
      salary: '₹6.5L – ₹11L / yr',
      openings: 2,
      description:
        'Oversee multi-cuisine banquet buffets, food temperature safety, live stations, mocktail bars, and plating quality.',
      responsibilities:
        'Manage kitchen timeline, dietary allergy protocols, live chaat and dessert station throughput.',
      requirements: 'Hospitality degree or 4+ years 5-star banquet catering operations experience.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}
async function publicCareerApply(request) {
  const body = await request.json();
  const {
    jobId,
    jobTitle,
    name,
    email,
    phone,
    resumeUrl,
    coverLetter,
    mockTestScore,
    mockTestAnswers,
  } = body;
  if (!name || !email || !phone) {
    return badRequest('Name, email, and phone are required.');
  }
  const score = typeof mockTestScore === 'number' ? mockTestScore : 0;
  const isQualified = score >= 75;
  const applicationStatus = isQualified ? 'shortlisted' : 'rejected';
  let savedApplication = null;
  try {
    savedApplication = await prisma.careers_applications.create({
      data: {
        job_id: Number(jobId) || 1,
        name,
        email,
        phone,
        resume_url: resumeUrl || 'https://moons.events/resumes/submitted-profile',
        cover_letter:
          coverLetter || `Applied for ${jobTitle || 'Event Role'}. Reasoning Test score: ${score}%`,
        status: applicationStatus,
        mock_test_score: score,
        mock_test_answers:
          typeof mockTestAnswers === 'string'
            ? mockTestAnswers
            : JSON.stringify(mockTestAnswers || {}),
      },
    });
  } catch (err) {
    console.warn('[Public API] Error saving to careers_applications:', err);
  }
  return json({
    success: true,
    applicationId: savedApplication?.id || Date.now(),
    qualified: isQualified,
    score,
    status: applicationStatus,
    message: isQualified
      ? 'Congratulations! You passed the MooNs Event Scenario Reasoning Test. Your application is shortlisted for Round 2.'
      : 'Thank you for your application. Unfortunately, your test score did not meet the 75% benchmark for this cycle. We wish you the best in your career journey.',
  });
}
export async function handlePublicApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (!pathname.startsWith('/api/public')) return null;
  if (request.method === 'OPTIONS') {
    const allowedOrigin = getAllowedCorsOrigin(request);
    if (!allowedOrigin) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(request),
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  try {
    if (request.method === 'POST') {
      const response = await handlePost(pathname, request);
      for (const [key, value] of Object.entries(corsHeaders(request))) {
        response.headers.set(key, value);
      }
      return response;
    }
    if (request.method !== 'GET') return badRequest('Unsupported method');
    if (pathname.startsWith('/api/public/quotes/')) {
      const match = pathname.match(/^\/api\/public\/quotes\/(\d+)\/pdf$/);
      if (match) {
        const quoteId = Number(match[1]);
        const quoteRow = await prisma.crm_quotes.findUnique({ where: { id: quoteId } });
        const deal = quoteRow
          ? await prisma.crm_deals.findUnique({ where: { id: quoteRow.deal_id } })
          : null;
        const quote = quoteRow && deal ? { ...quoteRow, ...deal, id: quoteRow.id } : null;
        if (!quote) return notFound();
        const { generateQuotePdfStream } = await import('../legacy/pdf-generator.js');
        const pdfStream = await generateQuotePdfStream(quote);
        return new Response(pdfStream, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="moon-quote-${quoteId}.pdf"`,
          },
        });
      }
    }
    if (pathname === '/api/public/locations') {
      return json(await prisma.destinations.findMany({ orderBy: { id: 'asc' } }));
    }
    if (pathname === '/api/public/legacy-stays') {
      return json(await prisma.stays.findMany({ orderBy: { id: 'asc' } }));
    }
    if (pathname === '/api/public/permit-cms') return json(await permitCmsPage());
    if (pathname === '/api/public/packing-cms') return json(await packingCmsPage());
    if (pathname === '/api/public/packages') return json(await packageList(request));
    if (pathname.startsWith('/api/public/packages/'))
      return json(
        (await packageDetail(decodeURIComponent(pathname.split('/').pop() || ''), request)) ?? null,
      );
    if (pathname === '/api/public/offers') {
      const [offers, items] = await Promise.all([
        prisma.promotional_offers.findMany({ where: { is_active: true } }),
        prisma.offer_items.findMany(),
      ]);
      const result = offers.map((offer) => ({
        ...mapOfferRow(offer),
        items: items.filter((item) => item.offer_id === offer.id),
      }));
      return json(result);
    }
    if (pathname.startsWith('/api/public/offers/')) {
      const slug = decodeURIComponent(pathname.split('/').pop() || '');
      const offer = await prisma.promotional_offers.findUnique({ where: { slug } });
      if (!offer) return notFound();
      const items = await prisma.offer_items.findMany({ where: { offer_id: offer.id } });
      const packageIds = items.filter((i) => i.item_type === 'package').map((i) => i.item_id);
      const packages = (
        packageIds.length
          ? await prisma.packages.findMany({ where: { id: { in: packageIds } } })
          : []
      ).map((pkg) => ({ ...pkg, heroImageUrl: pkg.image_url }));
      return json({
        ...mapOfferRow(offer),
        items,
        packages,
      });
    }
    if (
      pathname === '/api/public/home-featured-locations' ||
      pathname === '/api/public/home-orbit-locations'
    ) {
      const now = new Date();
      const [packages, coordinates] = await Promise.all([
        prisma.packages.findMany({
          where: { is_active: true },
          select: {
            destination: true,
            country: true,
            slug: true,
            image_url: true,
            price: true,
          },
          orderBy: [{ destination: 'asc' }, { price: 'asc' }],
        }),
        prisma.accommodation_listings.findMany({
          where: { is_active: true, approval_status: 'approved' },
          orderBy: { id: 'asc' },
          select: { location: true, latitude: true, longitude: true },
        }),
      ]);
      return json(
        buildHomeFeaturedLocationsResponse({
          packages: packages.map(({ destination, ...item }) => ({
            ...item,
            location: destination,
          })),
          trends: [],
          season: null,
          editorial: [],
          coordinates,
          now,
        }),
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
          },
        },
      );
    }
    if (pathname === '/api/public/careers') {
      return json(
        await prisma.careers_jobs.findMany({
          where: { is_active: true },
          orderBy: { id: 'asc' },
        }),
      );
    }
    if (pathname === '/api/public/support-staff') return json(await supportStaff());
    if (pathname === '/api/public/item-reviews') {
      const itemId = new URL(request.url).searchParams.get('itemId');
      if (!itemId) return json([]);
      return json(
        await prisma.item_reviews.findMany({
          where: { OR: [{ item_id: itemId }, { item_id: 'GENERIC' }] },
          select: { author: true, rating: true, comment: true },
          orderBy: { id: 'desc' },
          take: 5,
        }),
      );
    }
    if (pathname === '/api/public/stays')
      return json(await inventoryList('accommodation_listings', mapAccommodation, request));
    if (pathname.startsWith('/api/public/stays/'))
      return json(
        (await inventoryDetail(
          'accommodation_listings',
          mapAccommodation,
          decodeURIComponent(pathname.split('/').pop() || ''),
          request,
        )) ?? null,
      );
    if (pathname === '/api/public/themes') {
      const rows = await prisma.catalog_event_types.findMany({
        where: { active: true },
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
      });
      return json(
        rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.public_description || row.summary || '',
          image_url: row.hero_image_url,
          is_active: row.active,
        })),
        { headers: corsHeaders(request) },
      );
    }
    if (pathname.startsWith('/api/public/themes/')) {
      const slug = decodeURIComponent(pathname.split('/').pop() || '');
      const eventType = await prisma.catalog_event_types.findFirst({
        where: { slug, active: true },
      });
      return json(
        eventType
          ? {
              id: eventType.id,
              slug: eventType.slug,
              name: eventType.name,
              description: eventType.public_description || eventType.summary || '',
              image_url: eventType.hero_image_url,
              is_active: eventType.active,
            }
          : null,
        { headers: corsHeaders(request) },
      );
    }
    if (pathname === '/api/public/cars')
      return json(await inventoryList('car_listings', mapCar, request));
    if (pathname.startsWith('/api/public/cars/'))
      return json(
        (await inventoryDetail(
          'car_listings',
          mapCar,
          decodeURIComponent(pathname.split('/').pop() || ''),
          request,
        )) ?? null,
      );
    if (pathname === '/api/public/vendors') return json(await vendors(request));
    if (pathname.startsWith('/api/public/vendors/'))
      return json(
        (await vendorBySlug(decodeURIComponent(pathname.split('/').pop() || ''), request)) ?? null,
      );
    if (pathname === '/api/public/blog') return json(await blogPosts(request));
    if (pathname.startsWith('/api/public/blog/category/'))
      return json(
        await blogPosts(request, {
          categorySlug: decodeURIComponent(pathname.split('/').pop() || ''),
        }),
      );
    if (pathname.startsWith('/api/public/blog/tag/')) {
      await ensureSeoTables();
      const slug = decodeURIComponent(pathname.split('/').pop() || '');
      const rows = await prisma.blog_posts.findMany({
        where: {
          status: 'published',
          published_at: { lte: new Date() },
          blog_post_tags: { some: { blog_tags: { is: { slug } } } },
        },
        include: {
          blog_authors: true,
          blog_categories: true,
          blog_post_tags: { include: { blog_tags: true } },
        },
        orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
      });
      return json(await mapBlogPosts(rows, request));
    }
    if (pathname.startsWith('/api/public/blog/')) {
      const posts = await blogPosts(request, {
        slug: decodeURIComponent(pathname.split('/').pop() || ''),
      });
      return json(posts[0] ?? null);
    }
    if (pathname === '/api/public/blog-categories') {
      await ensureSeoTables();
      return json(await prisma.blog_categories.findMany({ orderBy: { name: 'asc' } }));
    }
    if (pathname === '/api/public/blog-tags') {
      await ensureSeoTables();
      return json(await prisma.blog_tags.findMany({ orderBy: { name: 'asc' } }));
    }
    if (pathname === '/api/public/careers/jobs') return json(await publicCareerJobs());
    if (pathname === '/api/public/careers/apply') {
      if (request.method !== 'POST') return badRequest('POST required');
      return await publicCareerApply(request);
    }
    if (pathname === '/api/public/reviews') return json(await reviews(url));
    if (pathname === '/api/public/review-summary') return json(await reviewSummary(url));
    if (pathname === '/api/public/sitemap-source') {
      const [pkgRows, stayRows, vendorRows, blogRows] = await Promise.all([
        prisma.packages.findMany({
          where: { is_active: true },
          select: { slug: true, destination: true },
        }),
        prisma.accommodation_listings.findMany({
          where: { is_active: true, approval_status: 'approved' },
          select: { slug: true },
        }),
        prisma.vendors.findMany({ where: { status: 'approved' }, select: { slug: true } }),
        blogPosts(request),
      ]);
      return json({
        packages: pkgRows.map(({ destination, ...item }) => ({ ...item, location: destination })),
        stays: stayRows.map((r) => r.slug),
        vendors: vendorRows.map((r) => r.slug),
        blogPosts: blogRows.map((r) => r.slug),
      });
    }
    return notFound();
  } catch (err) {
    console.error('[Public API] Request failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
//# sourceMappingURL=publicApi.js.map
