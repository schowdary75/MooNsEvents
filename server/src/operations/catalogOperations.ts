// @ts-nocheck
import { z } from 'zod';
import { defineOperation } from './defineOperation.js';
import * as legacy from '../legacy/api/db.functions.server.js';
import { prisma } from '../config/prisma.js';

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  venue: 'Venue',
  photography: 'Photography',
  decoration: 'Decoration',
  catering: 'Catering',
  organizer: 'Planning',
  production: 'Production & AV',
  entertainment: 'Entertainment',
  logistics: 'Guest Logistics',
  staffing: 'Event Staffing',
};

function normalizeServiceCategory(value: string) {
  const category = value.toLowerCase();
  if (category.includes('venue')) return 'venue';
  if (category.includes('photo') || category.includes('video')) return 'photography';
  if (category.includes('decor') || category.includes('brand')) return 'decoration';
  if (category.includes('cater') || category.includes('food') || category.includes('hospitality'))
    return 'catering';
  if (category.includes('plan') || category.includes('organ')) return 'organizer';
  if (category.includes('production') || category.includes('stage') || category.includes('av'))
    return 'production';
  if (category.includes('entertain') || category.includes('artist') || category.includes('music'))
    return 'entertainment';
  if (
    category.includes('logistic') ||
    category.includes('transport') ||
    category.includes('travel')
  )
    return 'logistics';
  if (
    category.includes('staff') ||
    category.includes('security') ||
    category.includes('registration') ||
    category.includes('medical') ||
    category.includes('safety')
  )
    return 'staffing';
  return null;
}

function parseSuggestedServices(value: string): string[] {
  try {
    const services = JSON.parse(value || '[]');
    return [
      ...new Set(
        services
          .map((service: any) =>
            normalizeServiceCategory(String(service.category || service.name || '')),
          )
          .filter(Boolean),
      ),
    ] as string[];
  } catch {
    return [];
  }
}

function mapCatalogEventType(row: any) {
  const serviceCategories = parseSuggestedServices(row.suggested_services);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.public_description || row.summary || '',
    image_url: row.hero_image_url,
    image_key: row.slug,
    required_service_categories: JSON.stringify(serviceCategories),
    service_categories: serviceCategories,
    is_active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildSuggestedServices(categories: string[]) {
  return JSON.stringify(
    categories.map((category) => ({
      category: SERVICE_CATEGORY_LABELS[category] || category,
      name: SERVICE_CATEGORY_LABELS[category] || category,
      optional: false,
    })),
  );
}

async function getCatalogTenantId() {
  const row = await prisma.catalog_event_types.findFirst({ select: { tenant_id: true } });
  if (!row) throw new Error('No event catalog tenant is configured');
  return row.tenant_id;
}

export const adminGetOffers = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    return await prisma.promotional_offers.findMany({ orderBy: { id: 'asc' } });
  });

export const adminCreateOffer = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      title: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      discountPercent: z.number(),
      bannerImageUrl: z.string().optional(),
      theme: z
        .enum(['seasonal', 'flash-sale', 'early-bird', 'last-minute', 'exclusive'])
        .default('seasonal'),
      isActive: z.boolean().default(false),
      isGlobal: z.boolean().default(false),
      targetScope: z.enum(['global', 'package', 'location', 'domestic']).default('global'),
      targetId: z.number().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.promotional_offers.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        discount_percent: data.discountPercent,
        banner_image_url: data.bannerImageUrl || null,
        theme: data.theme,
        is_active: data.isActive,
        is_global: data.isGlobal,
        target_scope: data.targetScope,
        target_id: data.targetId || null,
      },
    });

    return { success: true };
  });

export const adminToggleOffer = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, id: z.number(), isActive: z.boolean() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.promotional_offers.update({
      where: { id: data.id },
      data: { is_active: data.isActive },
    });

    return { success: true };
  });

export const adminGetLocationsAll = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    return await prisma.destinations.findMany({
      select: { id: true, name: true, country: true },
      orderBy: { name: 'asc' },
    });
  });

export const adminDeleteOffer = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.$transaction([
      prisma.offer_items.deleteMany({ where: { offer_id: data.id } }),
      prisma.promotional_offers.delete({ where: { id: data.id } }),
    ]);

    return { success: true };
  });

export const getEventThemes = defineOperation({ method: 'GET' }).handler(
  async (): Promise<legacy.EventTheme[]> => {
    await legacy.ensureRichInventoryTables();
    const rows = await prisma.catalog_event_types.findMany({
      where: { active: true },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });
    return rows.map(mapCatalogEventType) as unknown as legacy.EventTheme[];
  },
);

export const getEventThemeBySlug = defineOperation({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }): Promise<legacy.EventTheme | null> => {
    await legacy.ensureRichInventoryTables();
    const row = await prisma.catalog_event_types.findFirst({
      where: { slug: data.slug, active: true },
    });
    return row ? (mapCatalogEventType(row) as unknown as legacy.EventTheme) : null;
  });

export const adminGetEventThemes = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }): Promise<legacy.EventTheme[]> => {
    await legacy.requireAdmin(data.auth);
    const rows = await prisma.catalog_event_types.findMany({
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });
    return rows.map(mapCatalogEventType) as unknown as legacy.EventTheme[];
  });

export const adminCreateEventTheme = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      image_url: z.string().nullable().optional(),
      image_key: z.string().nullable().optional(),
      service_categories: z.array(z.string()).default([]),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const tenantId = await getCatalogTenantId();
    const maxSort = await prisma.catalog_event_types.aggregate({
      where: { tenant_id: tenantId },
      _max: { sort_order: true },
    });
    const created = await prisma.catalog_event_types.create({
      data: {
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        slug: data.slug,
        name: data.name,
        summary: data.description.slice(0, 191),
        public_description: data.description.slice(0, 191),
        hero_image_url: data.image_url || null,
        suggested_services: buildSuggestedServices(data.service_categories),
        checklist: '[]',
        ceremonies: '[]',
        workflow: JSON.stringify({
          stages: ['brief', 'proposal', 'deposit', 'planning', 'ready', 'live', 'complete'],
        }),
        custom_fields: '[]',
        active: true,
        published: false,
        sort_order: (maxSort._max.sort_order ?? 0) + 1,
        updated_at: new Date(),
      },
    });
    return { success: true, id: created.id };
  });

export const adminUpdateEventTheme = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      id: z.string().min(1),
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      image_url: z.string().nullable().optional(),
      image_key: z.string().nullable().optional(),
      service_categories: z.array(z.string()).default([]),
      is_active: z.number().min(0).max(1).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.catalog_event_types.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        name: data.name,
        summary: data.description.slice(0, 191),
        public_description: data.description.slice(0, 191),
        hero_image_url: data.image_url || null,
        suggested_services: buildSuggestedServices(data.service_categories),
        active: Boolean(data.is_active ?? 1),
        updated_at: new Date(),
      },
    });
    return { success: true };
  });

export const adminDeleteEventTheme = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.catalog_event_types.update({
      where: { id: data.id },
      data: { active: false, updated_at: new Date() },
    });
    return { success: true };
  });

export const getLocations = defineOperation({ method: 'GET' }).handler(
  async (): Promise<legacy.LocationRow[]> => {
    return (await prisma.destinations.findMany({
      orderBy: { id: 'asc' },
    })) as unknown as legacy.LocationRow[];
  },
);

export const getStays = defineOperation({ method: 'GET' }).handler(
  async (): Promise<legacy.StayRow[]> => {
    return (await prisma.stays.findMany({ orderBy: { id: 'asc' } })) as unknown as legacy.StayRow[];
  },
);

export const adminSaveAiRunOfShowToActivities = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      location: z.string(),
      runOfShow: z.array(
        z.object({
          day: z.number().optional(),
          title: z.string(),
          description: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.master_activities.createMany({
      data: data.runOfShow.map((day) => ({
        slug: (
          day.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
          '-' +
          Math.floor(Math.random() * 10000)
        ).substring(0, 200),
        name: day.title,
        location: data.location,
        country: 'Unknown',
        description: day.description,
        status: 'active',
      })),
    });
    return { success: true };
  });
