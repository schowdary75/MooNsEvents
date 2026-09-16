// @ts-nocheck -- behavior-parity adapter retained until domain-by-domain type hardening.
import { defineOperation } from '../../operations/defineOperation.js';
import { prisma } from '../../config/prisma.js';
import { publishChatEvent } from '../../services/chatEventService.js';
import { provisionEventPlanSafely } from '../../services/eventPlanService.js';
export const resolve = () => Promise.resolve();
import { z } from 'zod';
import { whatsappService } from '../../maya/channels/whatsappService.js';
// --- Gemini API Key Rotation Pool ---
export let currentGenAIKeyIndex = 0;
export function getGeminiKeys() {
  return (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}
export async function getGenAI() {
  const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
  const keys = getGeminiKeys();
  const key = keys[currentGenAIKeyIndex % Math.max(keys.length, 1)] || '';
  if (!key) throw new Error('GEMINI_API_KEY or GEMINI_API_KEYS must be configured.');
  return new GoogleGenerativeAI(key);
}
export async function getMayaGenAI() {
  const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
  const keys = getGeminiKeys();
  if (!keys.length) throw new Error('GEMINI_API_KEY or GEMINI_API_KEYS must be configured.');
  const key = keys[currentGenAIKeyIndex % keys.length];
  currentGenAIKeyIndex = (currentGenAIKeyIndex + 1) % keys.length;
  return new GoogleGenerativeAI(key);
}
export function rotateGenAIKey() {
  const keys = getGeminiKeys();
  currentGenAIKeyIndex = keys.length ? (currentGenAIKeyIndex + 1) % keys.length : 0;
  console.log(`[System] Rotated Gemini API Key to index ${currentGenAIKeyIndex}`);
}
export function isGeminiRateLimitError(error) {
  const message = String(error?.message || '');
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    error?.status === 503 ||
    error?.statusCode === 503 ||
    /429|503|rate limit|quota|service unavailable/i.test(message)
  );
}
export async function withMayaGeminiRotation<T = unknown>(
  modelName: string,
  operation: (model: any) => Promise<T>,
  modelOptions: Record<string, unknown> = {},
): Promise<T> {
  const keyCount = getGeminiKeys().length;
  const attempts = Math.max(1, keyCount);
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const genAI = await getMayaGenAI();
    const model = genAI.getGenerativeModel({ model: modelName, ...modelOptions });
    try {
      return await operation(model);
    } catch (error) {
      lastError = error;
      if (!isGeminiRateLimitError(error) || attempt === attempts - 1) {
        throw error;
      }
      console.warn(
        `[Maya] Gemini rate limited. Retrying with next key (${attempt + 1}/${attempts}).`,
      );
    }
  }
  throw lastError;
}
// ------------------------------------
export function decodeBase64Strict(value) {
  const base64 = value.includes(';base64,') ? value.split(';base64,').pop() || '' : value;
  const normalized = base64.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error('Invalid base64 payload.');
  }
  return Buffer.from(normalized, 'base64');
}
export async function importServerOnlyModule(modulePath) {
  return await import(/* @vite-ignore */ modulePath);
}
export async function getDbPool() {
  const db = await importServerOnlyModule('../db.server.js');
  return db.getDbPool();
}
export async function getDb() {
  const db = await importServerOnlyModule('../db.server.js');
  return db.getDb();
}
export async function getDbSchema() {
  return await importServerOnlyModule('../db/schema.js');
}
export async function getSecurityModule() {
  return await importServerOnlyModule('../../security/securityService.js');
}
export function getRequiredPasswordPepper() {
  const pepper = process.env.AUTH_PASSWORD_PEPPER;
  if (!pepper || pepper.length < 24) {
    throw new Error('AUTH_PASSWORD_PEPPER must be configured with at least 24 characters.');
  }
  return pepper;
}
export async function ensureLeadSubmissionsTableImpl() {
  const pool = await getDbPool();
  await resolve();
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
}
export async function ensureLeadCrmTablesImpl() {
  const pool = await getDbPool();
  await ensureLeadSubmissionsTable();
  await resolve();
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
}
export async function refreshLeadNextFollowup(leadId) {
  const next = await prisma.lead_followups.findFirst({
    where: { lead_id: leadId, status: 'pending' },
    orderBy: { follow_up_date: 'asc' },
    select: { follow_up_date: true },
  });
  await prisma.lead_submissions.update({
    where: { id: leadId },
    data: { next_follow_up_at: next?.follow_up_date ?? null },
  });
}
export const submitLead = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      phone: z.string().min(6, 'Phone number is required'),
      email: z.string().email('Invalid email address'),
      location: z.string().min(1, 'Location is required'),
      eventMonth: z.string().optional(),
      clientsCount: z.number().int().min(1).max(99),
      budgetRange: z.string().min(1, 'Budget range is required'),
      notes: z.string().optional(),
      attribution: z.any().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.lead_submissions.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        destination: data.location,
        travel_month: data.eventMonth || null,
        travelers_count: data.clientsCount,
        budget_range: data.budgetRange,
        notes: data.notes || null,
        attribution: data.attribution ? JSON.stringify(data.attribution) : null,
      },
    });
    return { success: true };
  });
export const subscribeNewsletter = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      email: z.string().email('Invalid email address'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.newsletter_subscribers.upsert({
        where: { email: data.email },
        create: { email: data.email },
        update: { subscribed_at: new Date() },
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to insert newsletter subscriber:', err);
      throw new Error('Failed to subscribe');
    }
  });
export const requestCallback = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      phone: z.string().min(1, 'Phone number is required'),
      location: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.callback_requests.create({
        data: { name: data.name, phone: data.phone, destination: data.location || null },
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to insert callback request:', err);
      throw new Error('Failed to submit request');
    }
  });
export const scheduleCall = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      phone: z.string().min(1, 'Phone number is required'),
      email: z.string().email('Invalid email address'),
      date: z.string().min(1, 'Date is required'),
      timeSlot: z.string().min(1, 'Time slot is required'),
      method: z.enum(['voice', 'google_meet', 'zoom', 'whatsapp_video']),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.scheduled_calls.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          call_date: new Date(data.date),
          time_slot: data.timeSlot,
          method: data.method,
        },
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to insert scheduled call:', err);
      throw new Error('Failed to schedule call');
    }
  });
export async function ensureWishlistTableImpl() {
  const pool = await getDbPool();
  await resolve();
  await resolve();
}
export const syncWishlistDb = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      userId: z.number(),
      items: z.array(
        z.object({
          id: z.string(),
          type: z.enum(['package', 'stay', 'car']),
          name: z.string(),
          price: z.number(),
          imageKey: z.string(),
          detail: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    if (data.items.length === 0) return { success: true };
    try {
      await prisma.user_wishlists.createMany({
        data: data.items.map((item) => ({
          user_id: data.userId,
          item_id: item.id,
          item_type: item.type,
          name: item.name,
          price: item.price,
          image_key: item.imageKey,
          detail: item.detail,
        })),
        skipDuplicates: true,
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to sync wishlist to DB:', err);
      throw new Error('Failed to sync wishlist');
    }
  });
export const addToWishlistDb = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      userId: z.number(),
      itemId: z.string(),
      itemType: z.enum(['package', 'stay', 'car']),
      name: z.string(),
      price: z.number(),
      imageKey: z.string(),
      detail: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.user_wishlists.upsert({
        where: {
          user_id_item_type_item_id: {
            user_id: data.userId,
            item_type: data.itemType,
            item_id: data.itemId,
          },
        },
        create: {
          user_id: data.userId,
          item_id: data.itemId,
          item_type: data.itemType,
          name: data.name,
          price: data.price,
          image_key: data.imageKey,
          detail: data.detail,
        },
        update: {
          name: data.name,
          price: data.price,
          image_key: data.imageKey,
          detail: data.detail,
        },
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to add to wishlist DB:', err);
      throw new Error('Failed to add to wishlist');
    }
  });
export const removeFromWishlistDb = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      userId: z.number(),
      itemType: z.enum(['package', 'stay', 'car']),
      itemId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.user_wishlists.deleteMany({
        where: { user_id: data.userId, item_type: data.itemType, item_id: data.itemId },
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to remove from wishlist DB:', err);
      throw new Error('Failed to remove from wishlist');
    }
  });
export const getUserWishlistDb = defineOperation({ method: 'GET' })
  .validator(
    z.object({
      userId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const rows = await prisma.user_wishlists.findMany({ where: { user_id: data.userId } });
      return rows.map((row) => ({
        id: row.item_id,
        type: row.item_type,
        name: row.name,
        price: row.price,
        imageKey: row.image_key,
        detail: row.detail,
      }));
    } catch (err) {
      console.error('Failed to load wishlist from DB:', err);
      return [];
    }
  });
export const getUserBookings = defineOperation({ method: 'GET' })
  .validator(
    z.object({
      userId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const rows = await prisma.bookings.findMany({
        where: { user_id: data.userId },
        orderBy: { travel_date: 'asc' },
      });
      return rows.map(({ travel_date, ...row }) => ({
        ...row,
        event_date: travel_date,
      }));
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      return [];
    }
  });
export const cancelBooking = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      bookingId: z.number(),
      userId: z.number(),
    }),
  )
  .handler(async () => {
    throw new Error(
      'Legacy cancellation is disabled. Use the authenticated customer cancellation endpoint, which creates an approval-bound request.',
    );
  });
export async function ensurePackageAdminTablesImpl() {
  const pool = await getDbPool();
  try {
    await resolve();
  } catch {
    // Column likely already exists.
  }
  try {
    await resolve();
  } catch {
    // Column likely already exists.
  }
  try {
    await resolve();
  } catch {
    // Column likely already exists.
  }
  try {
    await resolve();
  } catch {
    // Column likely already exists.
  }
  try {
    await resolve();
  } catch {
    // Column likely already exists.
  }
}
export async function ensureMasterCatalogTablesImpl() {
  const pool = await getDbPool();
  await ensureRichInventoryTables();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  await resolve();
  await resolve();
  await resolve();
}
export function masterTableFor(type) {
  return {
    stay: 'master_stays',
    room: 'master_rooms',
    activity: 'master_activities',
    car: 'master_cars',
  }[type];
}
export function normalizeCatalogType(type) {
  if (['stay', 'room', 'activity', 'car'].includes(type)) return type;
  throw new Error('Unsupported catalog type');
}
export function calculateSellingPrice(net, margin) {
  if (!Number.isFinite(net) || net <= 0) return 0;
  if (!Number.isFinite(margin) || margin <= 0) return Math.round(net);
  if (margin >= 100) return Math.round(net);
  return Math.round(net / (1 - margin / 100));
}
export async function getPackageLineItems(packageId) {
  await ensureMasterCatalogTables();
  const rows = await prisma.package_line_items.findMany({
    where: { package_id: packageId },
    orderBy: [{ day_number: 'asc' }, { id: 'asc' }],
  });
  const vendors = await prisma.vendors.findMany({
    where: { id: { in: rows.flatMap((row) => (row.vendor_id ? [row.vendor_id] : [])) } },
    select: { id: true, company_name: true },
  });
  const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
  return rows.map((row) => ({
    ...row,
    vendor_name: row.vendor_id ? vendorsById.get(row.vendor_id) || null : null,
    quantity: Number(row.quantity),
    net_cost: Number(row.net_cost),
    selling_price: Number(row.selling_price),
    total_net: Number(row.total_net),
    total_selling: Number(row.total_selling),
  }));
}
export const packageDetailInputSchema = z.object({
  id: z.number().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens'),
  name: z.string().min(1),
  description: z.string().min(1),
  country: z.string().min(1),
  location: z.string().min(1),
  nights: z.number().int().min(1),
  days: z.number().int().min(1),
  price: z.number().int().min(0),
  markup_percent: z.union([z.literal(15), z.literal(25)]).default(25),
  vendor_id: z.number().nullable().optional(),
  b2b_price: z.number().nullable().optional(),
  category: z.enum(['Economy', 'Premium', 'Luxury']),
  // Images can be assigned after the package is initially created. The editor
  // and AI builder both intentionally submit empty strings until that happens.
  image_url: z.string(),
  image_key: z.string(),
  is_active: z.boolean(),
  images: z.array(z.string()).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  meta_keywords: z.string().nullable().optional(),
  themes: z.array(z.string().min(1)).max(20),
  runOfShow: z
    .array(
      z.object({
        day_number: z.number().int().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        city: z.string().nullable().optional(),
        slot_morning: z.string().max(200).nullable().optional(),
        slot_afternoon: z.string().max(200).nullable().optional(),
        slot_evening: z.string().max(200).nullable().optional(),
      }),
    )
    .min(1),
  inclusions: z.array(
    z.object({
      category: z.string().min(1),
      item: z.string().min(1),
    }),
  ),
  exclusions: z.array(
    z.object({
      item: z.string().min(1),
    }),
  ),
  line_items: z
    .array(
      z.object({
        id: z.number().optional(),
        day_number: z.number().nullable().optional(),
        catalog_type: z.literal('vendor'),
        catalog_id: z.number(),
        rate_card_id: z.number().nullable().optional(),
        vendor_id: z.number().nullable().optional(),
        vendor_service_id: z.number(),
        item_name: z.string().min(1),
        unit_type: z.enum([
          'per_person',
          'per_room_per_night',
          'per_vehicle',
          'per_group',
          'fixed',
        ]),
        quantity: z.number().min(0),
        net_cost: z.number().min(0),
        selling_price: z.number().positive('A confirmed vendor selling price is required'),
        total_net: z.number().min(0),
        total_selling: z.number().positive('A confirmed vendor total is required'),
        notes: z.string().nullable().optional(),
      }),
    )
    .min(1, 'Choose at least one approved Master Catalog vendor')
    .optional(),
});
export const getPackages = defineOperation({ method: 'GET' }).handler(async () => {
  const packages = await prisma.packages.findMany({
    where: { is_active: true },
    orderBy: [{ location: 'asc' }, { price: 'asc' }],
  });
  const themes = await prisma.package_themes.findMany({
    where: { package_id: { in: packages.map((item) => item.id) } },
    orderBy: { theme: 'asc' },
  });
  const themesByPackage = Map.groupBy(themes, (theme) => theme.package_id);
  return packages.map((item) => ({
    ...item,
    themes: (themesByPackage.get(item.id) || []).map((theme) => theme.theme),
  }));
});
export const getPackageBySlug = defineOperation({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    await ensurePackageAdminTables();
    const pkg = await prisma.packages.findFirst({ where: { slug: data.slug, is_active: true } });
    if (!pkg) return null;
    const [themeRows, itinRows, inclRows, exclRows, packageServices] = await Promise.all([
      prisma.package_themes.findMany({ where: { package_id: pkg.id }, orderBy: { theme: 'asc' } }),
      prisma.package_itinerary.findMany({
        where: { package_id: pkg.id },
        orderBy: { day_number: 'asc' },
      }),
      prisma.package_inclusions.findMany({
        where: { package_id: pkg.id },
        orderBy: [{ category: 'asc' }, { id: 'asc' }],
      }),
      prisma.package_exclusions.findMany({ where: { package_id: pkg.id }, orderBy: { id: 'asc' } }),
      getPackageLineItems(pkg.id),
    ]);
    return {
      ...pkg,
      themes: themeRows.map((theme) => theme.theme),
      runOfShow: itinRows,
      inclusions: inclRows,
      exclusions: exclRows,
      services: packageServices.map((service) => ({
        name: service.item_name,
        unit_type: service.unit_type,
        quantity: service.quantity,
        vendor_name: service.vendor_name,
      })),
    };
  });
export const logUserActivity = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      sessionId: z.string(),
      eventType: z.string(),
      pageUrl: z.string(),
      metadata: z.any().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.user_activity_logs.create({
      data: {
        session_id: data.sessionId,
        event_type: data.eventType,
        page_url: data.pageUrl,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
    return { success: true };
  });
export const adminAuthSchema = z.object({
  email: z.string().email(),
  sessionToken: z.string().min(32),
});
export async function ensureAuthSessionTableImpl() {}
export async function createUserSession(userId) {
  await ensureAuthSessionTable();
  const crypto = await import('node:crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.auth_sessions.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}
export async function ensureAdminTablesImpl() {
  await ensureAuthSessionTable();
  await resolve();
  await resolve();
  await resolve();
  if (process.env.ADMIN_EMAIL) {
    const bootstrapEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    await prisma.admin_users.upsert({
      where: { email: bootstrapEmail },
      create: { email: bootstrapEmail, role: 'admin', is_active: true },
      update: {},
    });
  }
}
export let deployTablesEnsured = false;
export async function ensureRemoteDeployTablesImpl() {
  if (deployTablesEnsured) return;
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  try {
    await resolve();
  } catch (e) {}
  await resolve();
  await resolve();
  await resolve();
  await resolve();
  // Existing databases were created with a USD default before the INR switch.
  await resolve();
  await prisma.quotes.updateMany({ where: { currency: 'USD' }, data: { currency: 'INR' } });
  await resolve();
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  deployTablesEnsured = true;
}
// Shared crm_users / crm_user_roles maintenance for the admin auth guards.
// The legacy guards re-ran this schema and seed work on every request, and
// their 6-role enum MODIFYs fought the canonical 10-role enum managed by
// auth.functions.ts — so this runs once per process and the MODIFYs are gone.
export async function ensureCrmRoleTablesImpl() {
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  await resolve();
  const users = await prisma.crmUser.findMany({ select: { id: true, role: true, email: true } });
  await prisma.crmUserRoleLink.createMany({
    data: users.map((user) => ({ userId: user.id, role: user.role })),
    skipDuplicates: true,
  });
}
export const ensureCrmRoleTables = __memoizeEnsure(ensureCrmRoleTablesImpl);
export async function requireAdmin(auth) {
  await ensureAdminTables();
  await ensureRemoteDeployTables();
  await ensureCrmRoleTables();
  const crypto = await import('node:crypto');
  const tokenHash = crypto.createHash('sha256').update(auth.sessionToken).digest('hex');
  const allowed = ['admin', 'editor', 'approver'];
  const user = await prisma.crmUser.findFirst({
    where: {
      email: auth.email.toLowerCase(),
      sessions: { some: { tokenHash, expiresAt: { gt: new Date() } } },
      OR: [{ role: { in: allowed } }, { roles: { some: { role: { in: allowed } } } }],
    },
    select: { email: true, role: true },
  });
  if (!user) {
    throw new Error('Admin access denied');
  }
  return { email: user.email, role: user.role };
}
export async function requireSecurityAdmin(auth) {
  const admin = await requireAdmin(auth);
  if (admin.role !== 'admin') {
    throw new Error('Security Center access requires admin role');
  }
  return admin;
}
export const securityAuthSchema = z.object({ auth: adminAuthSchema });
export const ipRuleSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-zA-Z0-9:./-]+$/, 'Enter a valid IP or CIDR rule');
export async function requireLeadStaff(auth) {
  await ensureAdminTables();
  await ensureRemoteDeployTables();
  await ensureCrmRoleTables();
  const crypto = await import('node:crypto');
  const tokenHash = crypto.createHash('sha256').update(auth.sessionToken).digest('hex');
  const allowed = ['admin', 'editor', 'approver', 'sales', 'support'];
  const user = await prisma.crmUser.findFirst({
    where: {
      email: auth.email.toLowerCase(),
      sessions: { some: { tokenHash, expiresAt: { gt: new Date() } } },
      OR: [{ role: { in: allowed } }, { roles: { some: { role: { in: allowed } } } }],
    },
    select: { email: true, role: true },
  });
  if (!user) {
    throw new Error('Unauthorized admin request');
  }
  return { email: user.email, role: user.role };
}
export async function logAdminAction(
  adminEmail,
  action,
  targetType,
  targetId,
  beforeValue,
  afterValue,
) {
  await prisma.admin_audit_logs.create({
    data: {
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId == null ? null : String(targetId),
      before_json: beforeValue == null ? null : JSON.stringify(beforeValue),
      after_json: afterValue == null ? null : JSON.stringify(afterValue),
    },
  });
}
export async function requireAdminFromLooseData(data) {
  const auth =
    data?.auth ||
    (data?.adminEmail && data?.sessionToken
      ? { email: data.adminEmail, sessionToken: data.sessionToken }
      : null);
  if (!auth) throw new Error('Unauthorized admin request');
  return await requireAdmin(auth);
}
export const authRegisterUser = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  )
  .handler(async ({ data }) => {
    const crypto = await import('node:crypto');
    // Check if user already exists
    const existing = await prisma.customerUser.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: 'Email is already registered' };
    }
    // Hash password
    const salt = getRequiredPasswordPepper();
    const password_hash = crypto
      .createHash('sha256')
      .update(data.password + salt)
      .digest('hex');
    // Insert user
    const user = await prisma.customerUser.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: password_hash,
        points_balance: 500,
      },
    });
    const sessionToken = await createUserSession(user.id);
    return {
      success: true,
      user: {
        id: user.id,
        name: data.name,
        email: data.email,
        points_balance: 500,
        oauth_provider: null,
        avatar_url: null,
        session_token: sessionToken,
      },
    };
  });
export const authLoginUser = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  )
  .handler(async ({ data }) => {
    const crypto = await import('node:crypto');
    // Query user
    const user = await prisma.customerUser.findUnique({ where: { email: data.email } });
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    // Check if social-only user
    if (!user.passwordHash && user.oauthProvider) {
      return {
        success: false,
        error: `This account uses ${user.oauthProvider} sign-in. Please use that method instead.`,
      };
    }
    // Verify password
    const salt = getRequiredPasswordPepper();
    const password_hash = crypto
      .createHash('sha256')
      .update(data.password + salt)
      .digest('hex');
    if (user.passwordHash !== password_hash) {
      return { success: false, error: 'Invalid email or password' };
    }
    const sessionToken = await createUserSession(user.id);
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points_balance: user.points_balance,
        oauth_provider: user.oauthProvider,
        avatar_url: user.avatar_url,
        session_token: sessionToken,
      },
    };
  });
export const authSocialLogin = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      provider: z.string(),
      providerId: z.string(),
      avatarUrl: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    let user = await prisma.customerUser.findUnique({ where: { email: data.email } });
    if (user) {
      // Update provider fields if not set
      if (!user.oauthProvider) {
        user = await prisma.customerUser.update({
          where: { id: user.id },
          data: {
            oauthProvider: data.provider,
            oauthId: data.providerId,
            avatar_url: user.avatar_url || data.avatarUrl || null,
          },
        });
      }
      const sessionToken = await createUserSession(user.id);
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          points_balance: user.points_balance,
          oauth_provider: user.oauthProvider,
          avatar_url: user.avatar_url,
          session_token: sessionToken,
        },
      };
    } else {
      // Create new user (seed 500 points welcome bonus)
      const created = await prisma.customerUser.create({
        data: {
          name: data.name,
          email: data.email,
          oauthProvider: data.provider,
          oauthId: data.providerId,
          points_balance: 500,
          avatar_url: data.avatarUrl || null,
        },
      });
      const sessionToken = await createUserSession(created.id);
      return {
        success: true,
        user: {
          id: created.id,
          name: data.name,
          email: data.email,
          points_balance: 500,
          oauth_provider: data.provider,
          avatar_url: data.avatarUrl || null,
          session_token: sessionToken,
        },
      };
    }
  });
export const getSupportBuddy = defineOperation({ method: 'POST' })
  .validator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    await ensureCrmRoleTables();
    const staffRows = await prisma.crmUser.findMany({
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
    const staff = staffRows
      .filter((row) => row.mobile?.trim())
      .map((row) => {
        const assignedRoles = row.roles.map((link) => link.role);
        const role = assignedRoles.includes('support')
          ? 'support'
          : assignedRoles.includes('sales')
            ? 'sales'
            : row.role;
        return {
          id: row.id,
          name: row.name?.trim() || row.email.split('@')[0],
          avatar_url: null,
          phone_number: row.mobile,
          rating: null,
          role,
          badge_key: row.badgeKey || null,
        };
      })
      .sort((a, b) =>
        a.role === b.role ? a.name.localeCompare(b.name) : a.role === 'support' ? -1 : 1,
      );
    if (staff.length === 0) return null;
    return staff[Math.abs(data.userId) % staff.length];
  });
export const getUserRefunds = defineOperation({ method: 'POST' })
  .validator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    return await prisma.user_refunds.findMany({
      where: { user_id: data.userId },
      orderBy: { id: 'desc' },
    });
  });
export const updateRefundStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      refundId: z.number(),
      status: z.enum(['initiated', 'admin_review', 'settled']),
    }),
  )
  .handler(async ({ data }) => {
    const settledAt = data.status === 'settled' ? new Date() : null;
    await prisma.user_refunds.update({
      where: { id: data.refundId },
      data: { status: data.status, settled_at: settledAt },
    });
    return { success: true };
  });
export const createBookingWithPayment = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      userId: z.number(),
      itemType: z.enum(['package', 'stay']),
      itemName: z.string().min(1),
      amount: z.number().positive(),
      eventDate: z.string().min(1),
      clientsCount: z.number().min(1),
      utrReference: z.string().min(1),
      location: z.string().min(1),
      customizations: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      // Generate a unique booking reference
      const refPrefix = 'TPY';
      const refRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingRef = `${refPrefix}-${refRandom}`;
      // 1. Look up the operator_id from packages table if booking a package
      let operatorId = null;
      if (data.itemType === 'package') {
        operatorId =
          (
            await prisma.packages.findFirst({
              where: { name: data.itemName },
              select: { operator_id: true },
            })
          )?.operator_id ?? null;
      }
      // 2. Initialize Escrow milestones: 50% deposit, 35% commencement, 15% completion
      const m50 = Math.round(data.amount * 0.5);
      const m35 = Math.round(data.amount * 0.35);
      const m15 = data.amount - m50 - m35; // remainder to prevent rounding issues
      const tDate = new Date(data.eventDate);
      const scheduledCommencement = data.eventDate;
      const completionDate = new Date(tDate.getTime() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.bookings.create({
          data: {
            user_id: data.userId,
            booking_reference: bookingRef,
            item_type: data.itemType,
            item_name: data.itemName,
            amount: data.amount,
            travel_date: new Date(data.eventDate),
            status: 'pending',
            operator_id: operatorId,
          },
        });
        await tx.payment_orders.create({
          data: {
            user_id: data.userId,
            booking_id: created.id,
            amount: data.amount,
            utr_reference: data.utrReference,
            clients_count: data.clientsCount,
            location: data.location,
            customizations: data.customizations || null,
            status: 'pending_verification',
          },
        });
        await tx.escrow_ledger.createMany({
          data: [
            {
              booking_id: created.id,
              milestone_type: 'deposit_50',
              amount: m50,
              status: 'held',
              scheduled_release_date: new Date(),
            },
            {
              booking_id: created.id,
              milestone_type: 'commencement_35',
              amount: m35,
              status: 'held',
              scheduled_release_date: new Date(scheduledCommencement),
            },
            {
              booking_id: created.id,
              milestone_type: 'completion_15',
              amount: m15,
              status: 'held',
              scheduled_release_date: new Date(completionDate),
            },
          ],
        });
        if (data.customizations) {
          try {
            const parsed = JSON.parse(data.customizations);
            if (parsed.paceMode || parsed.customRunOfShow) {
              await tx.runOfShow_customizations.create({
                data: {
                  booking_id: created.id,
                  pace_mode: parsed.paceMode || 'Balanced',
                  custom_runOfShow: parsed.customRunOfShow
                    ? JSON.stringify(parsed.customRunOfShow)
                    : null,
                },
              });
            }
          } catch (error) {
            console.warn('Failed to parse customization JSON:', error);
          }
        }
        return created;
      });
      return { success: true, bookingReference: bookingRef, bookingId: booking.id };
    } catch (err) {
      console.error('Failed to create booking with payment:', err);
      throw new Error('Failed to submit payment');
    }
  });
export const getUserPaymentOrders = defineOperation({ method: 'POST' })
  .validator(z.object({ userId: z.number() }))
  .handler(async ({ data }) => {
    try {
      return await prisma.payment_orders.findMany({
        where: { user_id: data.userId },
        orderBy: { id: 'desc' },
      });
    } catch {
      return [];
    }
  });
export const adminGetPendingPayments = defineOperation({ method: 'GET' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    try {
      const orders = await prisma.payment_orders.findMany({ orderBy: { id: 'desc' } });
      const userIds = [...new Set(orders.map((order) => order.user_id))];
      const bookingIds = orders.flatMap((order) => (order.booking_id ? [order.booking_id] : []));
      const [users, bookings] = await Promise.all([
        prisma.customerUser.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        }),
        prisma.bookings.findMany({
          where: { id: { in: bookingIds } },
          select: { id: true, booking_reference: true, item_name: true, travel_date: true },
        }),
      ]);
      const usersById = new Map(users.map((user) => [user.id, user]));
      const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));
      return orders.map((order) => ({
        ...order,
        user_name: usersById.get(order.user_id)?.name || '',
        user_email: usersById.get(order.user_id)?.email || '',
        booking_reference: order.booking_id
          ? bookingsById.get(order.booking_id)?.booking_reference || null
          : null,
        item_name: order.booking_id ? bookingsById.get(order.booking_id)?.item_name || null : null,
        event_date: order.booking_id
          ? bookingsById.get(order.booking_id)?.travel_date || null
          : null,
      }));
    } catch (err) {
      console.error('Failed to fetch admin payment claims:', err);
      return [];
    }
  });
// Booking lifecycle emails (confirmed / payment-issue) — shared by both
// admin verification paths. Fire-and-forget: failures only log a warning.
export async function sendBookingLifecycleEmail(bookingId, kind, notes) {
  try {
    const booking = await prisma.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) return;
    const [user, latestPayment] = await Promise.all([
      prisma.customerUser.findUnique({ where: { id: booking.user_id } }),
      prisma.payment_orders.findFirst({
        where: { booking_id: bookingId },
        orderBy: { id: 'desc' },
      }),
    ]);
    const eb = {
      ...booking,
      customer_name: user?.name || '',
      customer_email: user?.email || '',
      customer_phone: user?.phone || booking.customer_phone || '',
      clients_count: latestPayment?.clients_count || 1,
      utr_reference: latestPayment?.utr_reference || '',
    };
    const { sendBookingEmail, formatInr } = await import('../booking-emails.server');
    let invoiceNumber = '';
    if (kind === 'booking-confirmed') {
      // Generate or fetch invoice
      const invoice = await prisma.invoices.findFirst({ where: { booking_id: bookingId } });
      if (invoice) {
        invoiceNumber = invoice.invoice_number;
      } else {
        invoiceNumber = `INV-${bookingId}-${Date.now()}`;
        await prisma.invoices.create({
          data: {
            invoice_number: invoiceNumber,
            booking_id: bookingId,
            user_id: eb.user_id,
            amount: eb.amount,
          },
        });
      }
    }
    const emailVars = {
      customer_name: eb.customer_name || 'client',
      reference: eb.booking_reference,
      item_name: eb.item_name,
      amount: formatInr(eb.amount),
      amount_raw: Number(eb.amount || 0),
      event_date: eb.event_date
        ? new Date(eb.event_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '',
      clients: String(eb.clients_count || 1),
      utr: eb.utr_reference || '',
      notes: notes || '',
      invoice_number: invoiceNumber,
      invoice_date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customer_email: eb.customer_email || '',
      customer_phone: eb.customer_phone || '',
    };
    await sendBookingEmail(kind, eb.customer_email, emailVars);
    // Maya auto-sends the full tax invoice as a separate email once payment is verified.
    if (kind === 'booking-confirmed' && invoiceNumber) {
      const invoiceSent = await sendBookingEmail('booking-invoice', eb.customer_email, emailVars);
      if (invoiceSent) {
        await prisma.invoices.update({
          where: { invoice_number: invoiceNumber },
          data: { status: 'sent' },
        });
        try {
          await prisma.maya_activity_log.create({
            data: {
              action: 'invoice.sent',
              area: 'finance',
              status: 'done',
              summary: `Sent tax invoice ${invoiceNumber} (${formatInr(eb.amount)}) to ${eb.customer_name || eb.customer_email} for booking ${eb.booking_reference}`,
            },
          });
        } catch {
          /* activity log is best-effort */
        }
      }
    }
  } catch (e) {
    console.warn(`${kind} email skipped:`, e.message);
  }
}
export const adminVerifyPaymentOrder = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    const payment = await prisma.payment_orders.findUnique({ where: { id: data.id } });
    if (!payment) throw new Error('Payment order not found');
    await prisma.$transaction(async (tx) => {
      await tx.payment_orders.update({
        where: { id: data.id },
        data: { status: 'verified', verified_at: new Date() },
      });
      if (payment.booking_id)
        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: { status: 'confirmed' },
        });
    });
    if (payment.booking_id) {
      await provisionEventPlanSafely(payment.booking_id);
      void sendBookingLifecycleEmail(payment.booking_id, 'booking-confirmed');
    }
    await logAdminAction(
      admin.email,
      'payment.verify',
      'payment_order',
      String(data.id),
      null,
      null,
    );
    return { success: true };
  });
export const adminRejectPaymentOrder = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number(), reason: z.string().optional() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    const payment = await prisma.payment_orders.findUnique({ where: { id: data.id } });
    if (!payment) throw new Error('Payment order not found');
    await prisma.$transaction(async (tx) => {
      await tx.payment_orders.update({
        where: { id: data.id },
        data: {
          status: 'rejected',
          verified_at: new Date(),
          admin_notes: data.reason || null,
        },
      });
      if (payment.booking_id)
        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: { status: 'cancelled' },
        });
    });
    if (payment.booking_id)
      void sendBookingLifecycleEmail(payment.booking_id, 'booking-payment-issue', data.reason);
    await logAdminAction(admin.email, 'payment.reject', 'payment_order', String(data.id), null, {
      reason: data.reason,
    });
    return { success: true };
  });
export const adminGetPendingRefunds = defineOperation({ method: 'GET' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    try {
      const refunds = await prisma.user_refunds.findMany({ orderBy: { id: 'desc' } });
      const users = await prisma.customerUser.findMany({
        where: { id: { in: [...new Set(refunds.map((refund) => refund.user_id))] } },
        select: { id: true, name: true, email: true },
      });
      const usersById = new Map(users.map((user) => [user.id, user]));
      return refunds.map((refund) => ({
        ...refund,
        user_name: usersById.get(refund.user_id)?.name || '',
        user_email: usersById.get(refund.user_id)?.email || '',
      }));
    } catch (err) {
      console.error('Failed to fetch admin refunds:', err);
      return [];
    }
  });
export const verifyPaymentByAdmin = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      paymentId: z.number(),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    try {
      const payment = await prisma.payment_orders.findUnique({ where: { id: data.paymentId } });
      if (!payment) throw new Error('Payment order not found');
      const bookingId = payment.booking_id;
      await prisma.$transaction(async (tx) => {
        await tx.payment_orders.update({
          where: { id: data.paymentId },
          data: {
            status: 'verified',
            verified_at: new Date(),
            admin_notes: data.notes || null,
          },
        });
        if (!bookingId) return;
        const booking = await tx.bookings.update({
          where: { id: bookingId },
          data: { status: 'confirmed' },
        });
        if (await tx.escrow_ledger.count({ where: { booking_id: bookingId } })) return;
        const m50 = Math.round(booking.amount * 0.5);
        const m35 = Math.round(booking.amount * 0.35);
        const completion = new Date(booking.travel_date.getTime() + 5 * 24 * 60 * 60 * 1000);
        await tx.escrow_ledger.createMany({
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
              scheduled_release_date: booking.travel_date,
            },
            {
              booking_id: bookingId,
              milestone_type: 'completion_15',
              amount: booking.amount - m50 - m35,
              status: 'held',
              scheduled_release_date: completion,
            },
          ],
        });
      });
      if (bookingId) {
        await provisionEventPlanSafely(bookingId);
        void sendBookingLifecycleEmail(bookingId, 'booking-confirmed');
      }
      await logAdminAction(admin.email, 'payment.verify', 'payment_order', data.paymentId, null, {
        notes: data.notes || null,
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to verify payment by admin:', err);
      throw new Error('Failed to verify payment');
    }
  });
export const adminRejectPayment = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      paymentId: z.number(),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    try {
      const payment = await prisma.payment_orders.findUnique({ where: { id: data.paymentId } });
      if (!payment) throw new Error('Payment order not found');
      const bookingId = payment.booking_id;
      await prisma.$transaction(async (tx) => {
        await tx.payment_orders.update({
          where: { id: data.paymentId },
          data: {
            status: 'rejected',
            verified_at: new Date(),
            admin_notes: data.notes || null,
          },
        });
        if (bookingId)
          await tx.bookings.update({
            where: { id: bookingId },
            data: { status: 'cancelled' },
          });
      });
      if (bookingId) void sendBookingLifecycleEmail(bookingId, 'booking-payment-issue', data.notes);
      await logAdminAction(admin.email, 'payment.reject', 'payment_order', data.paymentId, null, {
        notes: data.notes || null,
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to reject payment by admin:', err);
      throw new Error('Failed to reject payment');
    }
  });
export const adminSettleRefund = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      refundId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    try {
      const refund = await prisma.user_refunds.update({
        where: { id: data.refundId },
        data: { status: 'settled', settled_at: new Date() },
      });
      await logAdminAction(admin.email, 'refund.settle', 'refund', data.refundId, null, {
        status: 'settled',
      });
      // Transactional SMS receipt to the customer (fire-and-forget).
      void (async () => {
        try {
          const user = await prisma.customerUser.findUnique({ where: { id: refund.user_id } });
          if (user?.phone) {
            const { smsService } = await import('../../services/smsService.js');
            const { normalizeForSms } = await import('../../services/customerMessagingService.js');
            await smsService.sendSMS(
              normalizeForSms(user.phone),
              `Hi ${user.name || 'client'}, your MooN Events refund of ₹${Number(refund.amount).toLocaleString('en-IN')} for booking ${refund.booking_reference} has been processed. It will reflect per your bank's timeline.`,
            );
          }
        } catch (e) {
          console.warn('Refund SMS skipped:', e?.message);
        }
      })();
      return { success: true };
    } catch (err) {
      console.error('Failed to settle refund by admin:', err);
      throw new Error('Failed to settle refund');
    }
  });
export const adminMoveRefundToReview = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      refundId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    try {
      await prisma.user_refunds.update({
        where: { id: data.refundId },
        data: { status: 'admin_review' },
      });
      await logAdminAction(admin.email, 'refund.review', 'refund', data.refundId, null, {
        status: 'admin_review',
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to move refund to review:', err);
      throw new Error('Failed to update refund status');
    }
  });
// ────────────────────────────────────────────────────────────
// Promo Codes
// ────────────────────────────────────────────────────────────
export const adminCreatePromoCode = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      code: z.string().min(3),
      type: z.enum(['general', 'referral', 'single_use']),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.number().positive(),
      maxUses: z.number().nonnegative(),
      validUntil: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await prisma.promo_codes.create({
        data: {
          code: data.code.toUpperCase(),
          type: data.type,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          max_uses: data.maxUses,
          valid_until: data.validUntil ? new Date(data.validUntil) : null,
          is_active: true,
        },
      });
      return { success: true };
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return { success: false, error: 'Promo code already exists' };
      }
      return { success: false, error: e.message };
    }
  });
export const adminListPromoCodes = defineOperation({ method: 'GET' }).handler(async () => {
  return await prisma.promo_codes.findMany({ orderBy: { created_at: 'desc' } });
});
export const adminTogglePromoCode = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number(), isActive: z.boolean() }))
  .handler(async ({ data }) => {
    await prisma.promo_codes.update({
      where: { id: data.id },
      data: { is_active: data.isActive },
    });
    return { success: true };
  });
// ────────────────────────────────────────────────────────────
// OTP Phone Verification System
// ────────────────────────────────────────────────────────────
export const sendOtpToPhone = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      phone: z.string().min(10, 'Phone number must be at least 10 digits'),
      email: z.string().email('Invalid email address'),
    }),
  )
  .handler(async ({ data }) => {
    const crypto = await import('node:crypto');
    const nodemailer = await import('nodemailer');
    // Normalize phone: sevent spaces, dashes, and leading +91
    const cleanPhone = data.phone.replace(/[\s\-]/g, '').replace(/^\+91/, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number' };
    }
    // Ensure phone column exists on users table
    try {
      await resolve();
    } catch {
      // Column likely already exists — ignore
    }
    // Check if phone is already registered
    const existingPhone = await prisma.customerUser.findUnique({ where: { phone: cleanPhone } });
    if (existingPhone) {
      return { success: false, error: 'This mobile number is already registered' };
    }
    // Check if email is already registered
    const existingEmail = await prisma.customerUser.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return { success: false, error: 'This email is already registered' };
    }
    // Create verifications table
    await resolve();
    // Clean up any expired OTPs for this phone
    await prisma.phone_verifications.deleteMany({ where: { phone: cleanPhone } });
    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await prisma.phone_verifications.create({
      data: { phone: cleanPhone, otp_code: otpCode, expires_at: expiresAt },
    });
    // ─── SMTP Dispatch Config ───
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpFrom = process.env.SMTP_FROM || 'no-reply@example.com';
    let transporter = null;
    let isRealSmtp = false;
    if (smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      isRealSmtp = true;
    }
    const mailOptions = {
      from: `"MooN Accounts" <${smtpFrom}>`,
      to: data.email,
      subject: `MooN Sign-up Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; background-color: #ffffff; color: #111111;">
          <h2 style="font-size: 24px; font-weight: 300; margin-top: 0;">Confirm your <span style="font-style: italic; font-weight: 600;">MooN</span> account</h2>
          <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 24px;">
            Thank you for starting your registration with MooN! Please use the following 6-digit verification code to complete your signup process.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 0.15em; color: #000000; background-color: #f3f4f6; padding: 12px 28px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); display: inline-block;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #888888; line-height: 1.5; margin-bottom: 0;">
            This verification code was generated for phone number <strong>+91 ${cleanPhone}</strong>. It is valid for 5 minutes. If you did not request this registration, you can safely ignore this message.
          </p>
        </div>
      `,
    };
    let emailSent = false;
    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        emailSent = true;
        if (!isRealSmtp) {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`\n✉️ [MOON TEST EMAIL] Ethereal Preview URL: ${previewUrl}\n`);
        }
      } catch (err) {
        console.error('Failed to send OTP verification email:', err);
      }
    }
    if (!isRealSmtp || !emailSent) {
      await prisma.phone_verifications.deleteMany({ where: { phone: cleanPhone } });
      return { success: false, error: 'Could not email the verification code. Please try again.' };
    }
    return { success: true };
  });
export const verifyOtpAndRegister = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().min(10, 'Phone number is required'),
      otpCode: z.string().length(6, 'OTP must be 6 digits'),
    }),
  )
  .handler(async ({ data }) => {
    const crypto = await import('node:crypto');
    const cleanPhone = data.phone.replace(/[\s\-]/g, '').replace(/^\+91/, '');
    // Verify OTP exists and is not expired
    const otp = await prisma.phone_verifications.findFirst({
      where: { phone: cleanPhone, otp_code: data.otpCode, expires_at: { gt: new Date() } },
    });
    if (!otp) {
      return { success: false, error: 'Invalid or expired OTP. Please request a new code.' };
    }
    // Double-check email and phone uniqueness at insert time
    const existingEmail = await prisma.customerUser.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return { success: false, error: 'Email is already registered' };
    }
    const existingPhone = await prisma.customerUser.findUnique({ where: { phone: cleanPhone } });
    if (existingPhone) {
      return { success: false, error: 'This mobile number is already registered' };
    }
    // Ensure phone column exists
    try {
      await resolve();
    } catch {
      // Column likely already exists
    }
    // Hash password
    const salt = getRequiredPasswordPepper();
    const password_hash = crypto
      .createHash('sha256')
      .update(data.password + salt)
      .digest('hex');
    // Insert user
    try {
      const created = await prisma.$transaction(async (tx) => {
        const user = await tx.customerUser.create({
          data: {
            name: data.name,
            email: data.email,
            passwordHash: password_hash,
            phone: cleanPhone,
            points_balance: 500,
          },
        });
        await tx.phone_verifications.deleteMany({ where: { phone: cleanPhone } });
        return user;
      });
      const sessionToken = await createUserSession(created.id);
      return {
        success: true,
        user: {
          id: created.id,
          name: data.name,
          email: data.email,
          points_balance: 500,
          oauth_provider: null,
          avatar_url: null,
          session_token: sessionToken,
        },
      };
    } catch (err) {
      console.error('Failed to register user with OTP:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return { success: false, error: 'Email or phone number is already in use' };
      }
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  });
export async function ensureCareersTablesExistImpl() {}
export const getCareersJobs = defineOperation({ method: 'GET' }).handler(async () => {
  await ensureCareersTablesExist();
  return await prisma.careers_jobs.findMany({
    orderBy: { created_at: 'desc' },
  });
});
export const getCareersJobById = defineOperation({ method: 'GET' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    return await prisma.careers_jobs.findUnique({
      where: { id: data.id },
    });
  });
export const submitJobApplication = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      jobId: z.number(),
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(10, 'Phone number must be at least 10 digits'),
      resumeUrl: z.string().optional(),
      resumeFile: z
        .object({
          name: z.string(),
          base64: z.string(),
        })
        .optional(),
      coverLetter: z.string().min(1, 'Cover letter / statement of purpose is required'),
    }),
  )
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    if (!data.resumeUrl && !data.resumeFile) {
      throw new Error('Please upload a resume file or provide a portfolio link.');
    }
    let resumeUrlToSave = data.resumeUrl || '';
    if (data.resumeFile) {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const crypto = await import('node:crypto');
      const { name, base64 } = data.resumeFile;
      const ext = path.extname(name).toLowerCase();
      if (ext !== '.pdf' && ext !== '.docx') {
        throw new Error('Invalid file type. Only PDF and DOCX formats are allowed.');
      }
      // Extract base64 clean data (remove data URL prefixes if present)
      let base64Clean = base64;
      if (base64.includes(';base64,')) {
        base64Clean = base64.split(';base64,')[1];
      }
      const fileBuffer = decodeBase64Strict(base64Clean);
      // 1. File Size Validation (Max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (fileBuffer.length > MAX_SIZE) {
        throw new Error('File exceeds the maximum limit of 5MB.');
      }
      // 2. Magic Bytes Check (validate header signatures)
      const firstFourHex = fileBuffer.subarray(0, 4).toString('hex').toUpperCase();
      const firstFiveHex = fileBuffer.subarray(0, 5).toString('hex').toUpperCase();
      if (ext === '.pdf') {
        // PDF must start with '%PDF-' (0x25 0x50 0x44 0x46 0x2D -> 255044462D)
        if (!firstFiveHex.startsWith('255044462D')) {
          throw new Error(
            'Security check failed: File header does not match PDF structure. Spoofed files are prohibited.',
          );
        }
      } else if (ext === '.docx') {
        // DOCX is a zip archive, must start with 'PK\x03\x04' (0x50 0x4B 0x03 0x04 -> 504B0304)
        if (firstFourHex !== '504B0304') {
          throw new Error(
            'Security check failed: File header does not match Word Document structure. Spoofed files are prohibited.',
          );
        }
      }
      // 3. EICAR Test Malware Signature Check
      const bufferText = fileBuffer.toString('utf8');
      if (
        bufferText.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')
      ) {
        throw new Error(
          'Security scan failed: File contains the standard EICAR test malware signature.',
        );
      }
      // 4. Executable PE / ELF Header Checks
      const firstTwoHex = fileBuffer.subarray(0, 2).toString('hex').toUpperCase();
      if (firstTwoHex === '4D5A') {
        throw new Error('Security scan failed: Windows executable binary header (MZ) detected.');
      }
      if (firstFourHex === '7F454C46') {
        throw new Error('Security scan failed: Linux executable binary header (ELF) detected.');
      }
      // 5. Shell Injection / Script Tags Check
      const suspiciousPatterns = [
        '<?php',
        '<script',
        'eval(base64_decode',
        'exec(',
        'system(',
        'passthru(',
        'shell_exec(',
        '#!/bin/sh',
        '#!/bin/bash',
      ];
      for (const pattern of suspiciousPatterns) {
        if (bufferText.toLowerCase().includes(pattern)) {
          throw new Error(`Security scan failed: Suspicious code pattern detected (${pattern}).`);
        }
      }
      // 6. DOCX Macro Check (scan zip entries for VBA project binary)
      if (ext === '.docx') {
        // If a DOCX contains macros, "vbaProject.bin" is inside the zip structures
        if (fileBuffer.toString('binary').includes('vbaProject.bin')) {
          throw new Error(
            'Security scan failed: Macro-enabled document detected. Only macro-free .docx files are permitted.',
          );
        }
      }
      // 7. Save file with secure randomized name
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
        job_id: data.jobId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        resume_url: resumeUrlToSave,
        cover_letter: data.coverLetter,
      },
    });
    return { success: true };
  });
export const adminGetApplications = defineOperation({ method: 'GET' }).handler(async () => {
  await ensureCareersTablesExist();
  const applications = await prisma.careers_applications.findMany({
    orderBy: { created_at: 'desc' },
  });
  const jobs = await prisma.careers_jobs.findMany({
    where: { id: { in: [...new Set(applications.map((application) => application.job_id))] } },
    select: { id: true, title: true, department: true },
  });
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  return applications.map((application) => ({
    ...application,
    job_title: jobsById.get(application.job_id)?.title,
    job_department: jobsById.get(application.job_id)?.department,
  }));
});
export const adminCreateJobPosting = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      title: z.string().min(1, 'Title is required'),
      department: z.string().min(1, 'Department is required'),
      location: z.string().min(1, 'Location is required'),
      type: z.string().min(1, 'Job type is required'),
      salary: z.string().optional().nullable(),
      openings: z.number().int().min(1).default(1),
      description: z.string().min(1, 'Description is required'),
      requirements: z.string().min(1, 'Requirements are required'),
      responsibilities: z.string().min(1, 'Responsibilities are required'),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.careers_jobs.create({ data });
    return { success: true };
  });
export const adminUpdateJobPosting = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      title: z.string().min(1, 'Title is required'),
      department: z.string().min(1, 'Department is required'),
      location: z.string().min(1, 'Location is required'),
      type: z.string().min(1, 'Job type is required'),
      salary: z.string().optional().nullable(),
      openings: z.number().int().min(1).default(1),
      description: z.string().min(1, 'Description is required'),
      requirements: z.string().min(1, 'Requirements are required'),
      responsibilities: z.string().min(1, 'Responsibilities are required'),
      isActive: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    const { id, isActive, ...job } = data;
    await prisma.careers_jobs.update({ where: { id }, data: { ...job, is_active: isActive } });
    return { success: true };
  });
export const adminDeleteJobPosting = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    await prisma.careers_jobs.delete({ where: { id: data.id } });
    return { success: true };
  });
export const adminUpdateApplicationStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      status: z.enum(['pending', 'shortlisted', 'scheduled', 'rejected']),
    }),
  )
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    await prisma.careers_applications.update({
      where: { id: data.id },
      data: { status: data.status },
    });
    return { success: true };
  });
export const adminScheduleInterview = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      applicationId: z.number(),
      interviewDate: z.string(),
      interviewType: z.string(),
      interviewLink: z.string().optional(),
      interviewNotes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureCareersTablesExist();
    const application = await prisma.careers_applications.findUnique({
      where: { id: data.applicationId },
    });
    if (!application) {
      throw new Error('Application not found');
    }
    const job = await prisma.careers_jobs.findUnique({ where: { id: application.job_id } });
    const app = { ...application, job_title: job?.title || '' };
    await prisma.careers_applications.update({
      where: { id: data.applicationId },
      data: {
        status: 'scheduled',
        interview_date: new Date(data.interviewDate),
        interview_type: data.interviewType,
        interview_link: data.interviewLink || null,
        interview_notes: data.interviewNotes || null,
      },
    });
    // 3. Dispatch automated email
    const nodemailer = await import('nodemailer');
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpFrom = process.env.SMTP_FROM || 'no-reply@example.com';
    let transporter = null;
    let isRealSmtp = false;
    if (smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      isRealSmtp = true;
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.warn(
          'Failed to create Ethereal SMTP account. Falling back to console logging:',
          err,
        );
      }
    }
    const formattedDate =
      new Date(data.interviewDate).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';
    const mailOptions = {
      from: `"MooN Careers" <${smtpFrom}>`,
      to: app.email,
      subject: `Interview Invitation: ${app.job_title} at MooN Holidays`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid rgba(0,0,0,0.08); border-radius: 24px; background-color: #ffffff; color: #111111; line-height: 1.6;">
          <h2 style="font-size: 26px; font-weight: 300; margin-top: 0; color: #000000;">Interview <span style="font-style: italic; font-weight: 600;">Invitation</span></h2>
          
          <p style="font-size: 15px; color: #333333; margin-bottom: 24px;">
            Dear <strong>${app.name}</strong>,
          </p>
          
          <p style="font-size: 14px; color: #555555; margin-bottom: 24px;">
            Thank you for applying for the <strong>${app.job_title}</strong> position with MooN Holidays. We were highly impressed with your background and would love to schedule a virtual interview to discuss how your skills align with our goals.
          </p>
          
          <div style="background-color: #f9fafb; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; padding: 24px; margin-bottom: 28px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; margin-top: 0; margin-bottom: 16px; font-weight: 700;">Interview Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333333;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 120px; vertical-align: top; color: #666666;">Date & Time:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #000000;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600; vertical-align: top; color: #666666;">Format:</td>
                <td style="padding: 6px 0;">${data.interviewType}</td>
              </tr>
              ${
                data.interviewLink
                  ? `
              <tr>
                <td style="padding: 6px 0; font-weight: 600; vertical-align: top; color: #666666;">Meeting Link:</td>
                <td style="padding: 6px 0;">
                  <a href="${data.interviewLink}" target="_blank" style="color: #ea580c; font-weight: 600; text-decoration: underline;">
                    Join Interview Session
                  </a>
                </td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          ${
            data.interviewNotes
              ? `
          <div style="margin-bottom: 28px;">
            <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; margin-bottom: 8px;">HR Preparation Notes:</h4>
            <p style="font-size: 13px; color: #555555; background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 10px; margin: 0; font-style: italic;">
              "${data.interviewNotes}"
            </p>
          </div>
          `
              : ''
          }

          <p style="font-size: 14px; color: #555555; margin-bottom: 32px;">
            If this schedule does not work for you, please reply directly to this email suggesting 2-3 alternative time slots.
          </p>

          <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.06); margin-bottom: 24px;" />
          
          <div style="font-size: 12px; color: #888888; text-align: center;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #111111;">MooN Events</p>
            <p style="margin: 0;">Demo Events Studio, Hyderabad, Telangana, India</p>
          </div>
        </div>
      `,
    };
    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        if (!isRealSmtp) {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(
            `\n✉️ [MOON TEST EMAIL] Interview Invite Ethereal Preview URL: ${previewUrl}\n`,
          );
        }
      } catch (err) {
        console.error('Failed to send interview invitation email:', err);
      }
    }
    return { success: true };
  });
export const adminGetInquiries = defineOperation({ method: 'GET' }).handler(async () => {
  const [contacts, callbacks, consultations] = await Promise.all([
    prisma.contact_submissions.findMany({ orderBy: { created_at: 'desc' } }),
    prisma.callback_requests.findMany({ orderBy: { requested_at: 'desc' } }),
    prisma.scheduled_calls.findMany({ orderBy: { created_at: 'desc' } }),
  ]);
  return {
    contacts: contacts,
    callbacks: callbacks,
    consultations: consultations,
  };
});
export const adminGetLeads = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
    }),
  )
  .handler(async ({ data }) => {
    await requireLeadStaff(data.auth);
    const rows = await prisma.lead_submissions.findMany({
      orderBy: { created_at: 'desc' },
    });
    return rows.map((lead) => ({
      ...lead,
      location: lead.destination,
      event_month: lead.travel_month,
      clients_count: lead.travelers_count,
    }));
  });
export const adminCreateLead = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    const admin = await requireLeadStaff(data.auth);
    // Auto-assign to first sales/support employee if no owner specified
    let assignedOwner = data.assignedOwner?.trim() || '';
    if (!assignedOwner) {
      try {
        const staffRows = await prisma.crmUser.findMany({
          where: {
            OR: [
              { role: { in: ['sales', 'support'] } },
              { roles: { some: { role: { in: ['sales', 'support'] } } } },
            ],
          },
          select: { name: true, email: true },
        });
        const firstStaff = staffRows[Math.floor(Math.random() * staffRows.length)];
        if (firstStaff) assignedOwner = firstStaff.name || firstStaff.email;
      } catch (e) {}
      if (!assignedOwner) assignedOwner = admin.email;
    }
    const lead = await prisma.lead_submissions.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        destination: data.location?.trim() || 'Open',
        travel_month: data.eventMonth?.trim() || null,
        travelers_count: Number(data.clientsCount || 2),
        budget_range: data.budgetRange?.trim() || 'Not specified',
        notes: data.notes?.trim() || null,
        lead_source: data.leadSource?.trim() || 'manual',
        priority: data.priority || 'medium',
        assigned_owner: assignedOwner,
        next_follow_up_at: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
      },
    });
    const leadId = lead.id;
    if (data.nextFollowUpAt) {
      await prisma.lead_followups.create({
        data: {
          lead_id: leadId,
          user_id: null,
          follow_up_date: new Date(data.nextFollowUpAt),
          follow_up_type: 'call',
          channel: 'phone',
          notes: data.followUpNotes?.trim() || data.notes?.trim() || 'Initial follow-up',
          status: 'pending',
        },
      });
    }
    await logAdminAction(admin.email, 'create_lead', 'lead_submission', leadId, null, {
      id: leadId,
      name: data.name,
    });
    return { success: true, id: leadId };
  });
export const adminUpdateLeadStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      id: z.number(),
      status: z.enum(['new', 'contacted', 'quote_sent', 'qualified', 'converted', 'lost']),
      adminNotes: z.string().optional(),
      assignedOwner: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireLeadStaff(data.auth);
    const before = await prisma.lead_submissions.findUnique({ where: { id: data.id } });
    if (!before) throw new Error('Lead not found');
    const after = await prisma.lead_submissions.update({
      where: { id: data.id },
      data: {
        status: data.status,
        admin_notes: data.adminNotes?.trim() || null,
        assigned_owner: data.assignedOwner?.trim() || null,
      },
    });
    await logAdminAction(admin.email, 'update_lead', 'lead_submission', data.id, before, after);
    return { success: true };
  });
export const adminUpdateLeadDetails = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    const admin = await requireLeadStaff(data.auth);
    const before = await prisma.lead_submissions.findUnique({ where: { id: data.id } });
    if (!before) throw new Error('Lead not found');
    const after = await prisma.lead_submissions.update({
      where: { id: data.id },
      data: {
        name: data.name?.trim() ?? before.name,
        phone: data.phone?.trim() ?? before.phone,
        email: data.email?.trim() ?? before.email,
        destination: data.location?.trim() ?? before.destination,
        travel_month:
          data.eventMonth !== undefined ? data.eventMonth?.trim() || null : before.travel_month,
        travelers_count: data.clientsCount ?? before.travelers_count,
        budget_range: data.budgetRange?.trim() ?? before.budget_range,
        notes: data.notes !== undefined ? data.notes?.trim() || null : before.notes,
        status: data.status || before.status,
        admin_notes:
          data.adminNotes !== undefined ? data.adminNotes?.trim() || null : before.admin_notes,
        assigned_owner:
          data.assignedOwner !== undefined
            ? data.assignedOwner?.trim() || null
            : before.assigned_owner,
        lead_source:
          data.leadSource !== undefined ? data.leadSource?.trim() || null : before.lead_source,
        priority: data.priority || before.priority || 'medium',
        ...(data.aiMode !== undefined ? { ai_mode: data.aiMode } : {}),
        ...(data.aiManaged !== undefined ? { ai_managed: data.aiManaged } : {}),
      },
    });
    await logAdminAction(
      admin.email,
      'update_lead_details',
      'lead_submission',
      data.id,
      before,
      after,
    );
    return { success: true };
  });
export const adminGetLeadFollowups = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireLeadStaff(data.auth);
    const rows = await prisma.lead_followups.findMany({
      where: {
        ...(data.leadId ? { lead_id: data.leadId } : {}),
        ...(data.status && data.status !== 'all' ? { status: data.status } : {}),
      },
      orderBy: [{ follow_up_date: 'asc' }, { created_at: 'desc' }],
    });
    const leads = await prisma.lead_submissions.findMany({
      where: { id: { in: rows.map((r) => r.lead_id) } },
    });
    const leadById = new Map(leads.map((lead) => [lead.id, lead]));
    return rows
      .map((row) => {
        const lead = leadById.get(row.lead_id);
        return {
          ...row,
          lead_name: lead?.name,
          phone: lead?.phone,
          email: lead?.email,
          location: lead?.destination,
          lead_status: lead?.status,
          priority: lead?.priority,
          assigned_owner: lead?.assigned_owner,
        };
      })
      .sort((a, b) => Number(a.status !== 'pending') - Number(b.status !== 'pending'));
  });
export const adminCreateLeadFollowup = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    const admin = await requireLeadStaff(data.auth);
    const created = await prisma.lead_followups.create({
      data: {
        lead_id: data.leadId,
        user_id: null,
        follow_up_date: new Date(data.followUpDate),
        follow_up_type: data.followUpType || 'call',
        channel: data.channel?.trim() || null,
        notes: data.notes?.trim() || null,
        status: 'pending',
      },
    });
    await refreshLeadNextFollowup(data.leadId);
    await logAdminAction(
      admin.email,
      'create_lead_followup',
      'lead_followup',
      created.id,
      null,
      data,
    );
    return { success: true, id: created.id };
  });
export const adminUpdateLeadFollowupStatus = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    const admin = await requireLeadStaff(data.auth);
    const before = await prisma.lead_followups.findUnique({ where: { id: data.id } });
    if (!before) throw new Error('Follow-up not found');
    await prisma.lead_followups.update({
      where: { id: data.id },
      data: {
        status: data.status,
        outcome: data.outcome?.trim() || before.outcome || null,
        ...(data.status === 'completed' ? { completed_at: new Date() } : {}),
      },
    });
    if (data.status === 'completed') {
      await prisma.lead_submissions.update({
        where: { id: before.lead_id },
        data: { last_contacted_at: new Date() },
      });
    }
    if (data.updateLeadStatus) {
      await prisma.lead_submissions.update({
        where: { id: before.lead_id },
        data: { status: data.updateLeadStatus },
      });
    }
    await refreshLeadNextFollowup(before.lead_id);
    await logAdminAction(
      admin.email,
      'update_lead_followup',
      'lead_followup',
      data.id,
      before,
      data,
    );
    return { success: true };
  });
export const adminGetLeadCrmBoard = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireLeadStaff(data.auth);
    const [leadData, followupData] = await Promise.all([
      prisma.lead_submissions.findMany({
        orderBy: [{ next_follow_up_at: 'asc' }, { created_at: 'desc' }],
      }),
      prisma.lead_followups.findMany({
        where: { status: 'pending' },
        orderBy: { follow_up_date: 'asc' },
        take: 200,
      }),
    ]);
    const leadRows = leadData;
    const leadById = new Map(leadData.map((lead) => [lead.id, lead]));
    const followups = followupData.map((row) => {
      const lead = leadById.get(row.lead_id);
      return {
        ...row,
        lead_name: lead?.name,
        phone: lead?.phone,
        email: lead?.email,
        location: lead?.destination,
        lead_status: lead?.status,
        priority: lead?.priority,
        assigned_owner: lead?.assigned_owner,
      };
    });
    const now = new Date();
    return {
      leads: leadRows,
      followups,
      stats: {
        total: leadRows.length,
        active: leadRows.filter((lead) => ['new', 'contacted', 'qualified'].includes(lead.status))
          .length,
        overdue: followups.filter((item) => new Date(item.follow_up_date).getTime() < now.getTime())
          .length,
        converted: leadRows.filter((lead) => lead.status === 'converted').length,
      },
    };
  });
export const adminGetLeadAssignees = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireLeadStaff(data.auth);
    const rows = await prisma.crmUser.findMany({
      where: {
        OR: [
          { role: { in: ['admin', 'editor', 'sales', 'support'] } },
          { roles: { some: { role: { in: ['admin', 'editor', 'sales', 'support'] } } } },
        ],
      },
      include: { roles: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
    const rank = { sales: 0, support: 1, editor: 2, admin: 3 };
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        mobile: row.mobile,
        role: row.role,
        roles: row.roles.length ? row.roles.map((item) => item.role) : [row.role],
      }))
      .sort((a, b) => (rank[a.role] ?? 9) - (rank[b.role] ?? 9));
  });
export const adminUpdateCallbackStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      status: z.enum(['pending', 'called']),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.callback_requests.update({
      where: { id: data.id },
      data: { status: data.status },
    });
    return { success: true };
  });
export const adminCreateLocation = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      country: z.string().min(1, 'Country is required'),
      price: z.string().min(1, 'Price is required'),
      nights: z.number().min(1, 'Nights must be at least 1'),
      image_key: z.string().min(1, 'Image key is required'),
      tag: z.string().min(1, 'Tag is required'),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.destinations.create({ data });
    return { success: true };
  });
export const adminUpdateLocation = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      name: z.string().min(1, 'Name is required'),
      country: z.string().min(1, 'Country is required'),
      price: z.string().min(1, 'Price is required'),
      nights: z.number().min(1, 'Nights must be at least 1'),
      image_key: z.string().min(1, 'Image key is required'),
      tag: z.string().min(1, 'Tag is required'),
    }),
  )
  .handler(async ({ data }) => {
    const { id, ...update } = data;
    await prisma.destinations.update({ where: { id }, data: update });
    return { success: true };
  });
export const adminDeleteLocation = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await prisma.destinations.delete({ where: { id: data.id } });
    return { success: true };
  });
export const adminCreateStay = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      venue: z.string().min(1, 'Venue name is required'),
      rate: z.string().min(1, 'Rate is required'),
      name: z.string().min(1, 'Location name is required'),
      country: z.string().min(1, 'Country is required'),
      image_key: z.string().min(1, 'Image key is required'),
      tag: z.string().min(1, 'Tag is required'),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.stays.create({
      data: {
        venue: data.venue,
        rate: data.rate,
        name: data.name,
        country: data.country,
        image_key: data.image_key,
        tag: data.tag,
      },
    });
    return { success: true };
  });
export const adminUpdateStay = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      venue: z.string().min(1, 'Venue name is required'),
      rate: z.string().min(1, 'Rate is required'),
      name: z.string().min(1, 'Location name is required'),
      country: z.string().min(1, 'Country is required'),
      image_key: z.string().min(1, 'Image key is required'),
      tag: z.string().min(1, 'Tag is required'),
    }),
  )
  .handler(async ({ data }) => {
    const { id, ...update } = data;
    await prisma.stays.update({ where: { id }, data: update });
    return { success: true };
  });
export const adminDeleteStay = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await prisma.stays.delete({ where: { id: data.id } });
    return { success: true };
  });
export const adminCheckAccess = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    return { success: true, role: admin.role };
  });
export async function loadPackageDetail(id) {
  const pkg = await prisma.packages.findUnique({ where: { id } });
  if (!pkg) return null;
  const [vendor, themes, runOfShow, inclusions, exclusions, lineItems] = await Promise.all([
    pkg.vendor_id
      ? prisma.vendors.findUnique({ where: { id: pkg.vendor_id }, select: { company_name: true } })
      : null,
    prisma.package_themes.findMany({ where: { package_id: id }, orderBy: { theme: 'asc' } }),
    prisma.package_itinerary.findMany({
      where: { package_id: id },
      orderBy: { day_number: 'asc' },
    }),
    prisma.package_inclusions.findMany({
      where: { package_id: id },
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    }),
    prisma.package_exclusions.findMany({ where: { package_id: id }, orderBy: { id: 'asc' } }),
    getPackageLineItems(id),
  ]);
  return {
    ...pkg,
    location: pkg.destination,
    vendor_name: vendor?.company_name || null,
    images: typeof pkg.images === 'string' ? JSON.parse(pkg.images) : pkg.images || [],
    themes: themes.map((theme) => theme.theme),
    runOfShow: runOfShow,
    inclusions: inclusions,
    exclusions: exclusions,
    line_items: lineItems,
  };
}
export const adminGetPackagesAll = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    const rows = await prisma.packages.findMany({
      orderBy: [{ updated_at: 'desc' }, { destination: 'asc' }, { price: 'asc' }],
    });
    const [themes, vendors] = await Promise.all([
      prisma.package_themes.findMany({
        where: { package_id: { in: rows.map((row) => row.id) } },
        orderBy: { theme: 'asc' },
      }),
      prisma.vendors.findMany({
        where: { id: { in: rows.flatMap((row) => (row.vendor_id ? [row.vendor_id] : [])) } },
        select: { id: true, company_name: true },
      }),
    ]);
    const themesByPackage = Map.groupBy(themes, (theme) => theme.package_id);
    const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
    return rows.map((row) => ({
      ...row,
      location: row.destination,
      vendor_name: row.vendor_id ? vendorsById.get(row.vendor_id) || null : null,
      themes: (themesByPackage.get(row.id) || []).map((theme) => theme.theme),
    }));
  });
export const adminGetPackageDetail = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensurePackageAdminTables();
    return await loadPackageDetail(data.id);
  });
export const publicGetPackageDetail = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await ensurePackageAdminTables();
    return await loadPackageDetail(data.id);
  });
export const adminUpsertPackageDetail = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, package: packageDetailInputSchema }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensurePackageAdminTables();
    const duplicate = await prisma.packages.findFirst({
      where: {
        slug: data.package.slug,
        ...(data.package.id ? { id: { not: data.package.id } } : {}),
      },
      select: { id: true },
    });
    if (duplicate) throw new Error('A package with this slug already exists.');
    const beforeValue = data.package.id
      ? await prisma.packages.findUnique({ where: { id: data.package.id } })
      : null;
    const lineItems = data.package.line_items || [];
    if (!lineItems.length)
      throw new Error('Packages must contain at least one approved Master Catalog vendor.');
    if (
      !/(telangana|andhra pradesh|hyderabad|secunderabad|warangal|nizamabad|karimnagar|khammam|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|amaravati)/i.test(
        data.package.location,
      )
    )
      throw new Error('Packages are currently limited to Telangana and Andhra Pradesh.');
    const catalogVendorIds = [...new Set(lineItems.map((item) => item.catalog_id))];
    const approvedVendors = await prisma.vendors.findMany({
      where: { id: { in: catalogVendorIds }, status: 'approved' },
      select: { id: true },
    });
    const approvedVendorIds = new Set(approvedVendors.map((vendor) => vendor.id));
    if (
      approvedVendorIds.size !== catalogVendorIds.length ||
      lineItems.some((item) => item.vendor_id !== item.catalog_id)
    )
      throw new Error('Every package line must map directly to an approved Master Catalog vendor.');
    const vendorServices = await prisma.vendor_service_offerings.findMany({
      where: {
        id: { in: lineItems.map((item) => item.vendor_service_id) },
        is_active: true,
      },
    });
    const serviceById = new Map(vendorServices.map((service) => [service.id, service]));
    if (serviceById.size !== new Set(lineItems.map((item) => item.vendor_service_id)).size)
      throw new Error(
        'Every package line must use an active vendor service from the Master Catalog.',
      );
    const markupPercent = data.package.markup_percent;
    const normalizedLineItems = lineItems.map((item) => {
      const service = serviceById.get(item.vendor_service_id);
      if (!service || service.vendor_id !== item.vendor_id || service.vendor_id !== item.catalog_id)
        throw new Error('Selected vendor service does not belong to the selected vendor.');
      const quantity = Number(item.quantity || 1);
      const netCost = Number(service.net_cost);
      if (netCost <= 0)
        throw new Error(`${service.name} needs a confirmed vendor net cost before it can be used.`);
      const sellingPrice = Math.round(netCost * (1 + markupPercent / 100));
      return {
        ...item,
        item_name: service.name,
        unit_type: service.unit_type,
        quantity,
        net_cost: netCost,
        selling_price: sellingPrice,
        total_net: quantity * netCost,
        total_selling: quantity * sellingPrice,
      };
    });
    const computedNetPrice = Math.round(
      normalizedLineItems.reduce((sum, item) => sum + item.total_net, 0),
    );
    const computedPrice = Math.round(
      normalizedLineItems.reduce((sum, item) => sum + item.total_selling, 0),
    );
    const packageId = await prisma.$transaction(async (tx) => {
      const packageData = {
        slug: data.package.slug,
        name: data.package.name,
        description: data.package.description,
        country: 'India',
        destination: data.package.location,
        nights: data.package.nights,
        days: data.package.days,
        price: computedPrice,
        markup_percent: markupPercent,
        vendor_id: data.package.vendor_id ?? null,
        b2b_price: computedNetPrice,
        category: data.package.category,
        image_url: data.package.image_url,
        image_key: data.package.image_key,
        is_active: data.package.is_active,
        meta_title: data.package.meta_title ?? null,
        meta_description: data.package.meta_description ?? null,
        meta_keywords: data.package.meta_keywords ?? null,
        images: JSON.stringify(data.package.images || []),
      };
      const saved = data.package.id
        ? await tx.packages.update({ where: { id: data.package.id }, data: packageData })
        : await tx.packages.create({ data: packageData });
      const id = saved.id;
      await Promise.all([
        tx.package_themes.deleteMany({ where: { package_id: id } }),
        tx.package_itinerary.deleteMany({ where: { package_id: id } }),
        tx.package_inclusions.deleteMany({ where: { package_id: id } }),
        tx.package_exclusions.deleteMany({ where: { package_id: id } }),
        tx.package_line_items.deleteMany({ where: { package_id: id } }),
      ]);
      const themes = [...new Set(data.package.themes.map((theme) => theme.trim()).filter(Boolean))];
      if (themes.length)
        await tx.package_themes.createMany({
          data: themes.map((theme) => ({ package_id: id, theme })),
        });
      if (data.package.runOfShow.length)
        await tx.package_itinerary.createMany({
          data: data.package.runOfShow.map((day) => ({
            package_id: id,
            day_number: day.day_number,
            title: day.title,
            description: day.description,
            city: day.city || null,
            slot_morning: day.slot_morning || null,
            slot_afternoon: day.slot_afternoon || null,
            slot_evening: day.slot_evening || null,
          })),
        });
      if (data.package.inclusions.length)
        await tx.package_inclusions.createMany({
          data: data.package.inclusions.map((item) => ({
            package_id: id,
            category: item.category,
            item: item.item,
          })),
        });
      if (data.package.exclusions.length)
        await tx.package_exclusions.createMany({
          data: data.package.exclusions.map((item) => ({ package_id: id, item: item.item })),
        });
      if (normalizedLineItems.length)
        await tx.package_line_items.createMany({
          data: normalizedLineItems.map((item) => {
            const quantity = Number(item.quantity || 1);
            const netCost = Number(item.net_cost || 0);
            const sellingPrice = Number(item.selling_price || 0);
            return {
              package_id: id,
              day_number: item.day_number || null,
              catalog_type: item.catalog_type,
              catalog_id: item.catalog_id,
              rate_card_id: item.rate_card_id || null,
              vendor_id: item.vendor_id || null,
              vendor_service_id: item.vendor_service_id,
              item_name: item.item_name,
              unit_type: item.unit_type,
              quantity,
              net_cost: netCost,
              selling_price: sellingPrice,
              total_net: Number(item.total_net || quantity * netCost),
              total_selling: Number(item.total_selling || quantity * sellingPrice),
              notes: item.notes || null,
            };
          }),
        });
      return id;
    });
    await logAdminAction(
      admin.email,
      data.package.id ? 'package.update' : 'package.create',
      'package',
      packageId,
      beforeValue,
      data.package,
    );
    return { success: true, id: packageId };
  });
export const adminSetPackageActive = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number(), is_active: z.boolean() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    const beforeValue = await prisma.packages.findUnique({
      where: { id: data.id },
      select: { id: true, slug: true, is_active: true },
    });
    await prisma.packages.update({ where: { id: data.id }, data: { is_active: data.is_active } });
    await logAdminAction(
      admin.email,
      data.is_active ? 'package.publish' : 'package.unpublish',
      'package',
      data.id,
      beforeValue,
      { is_active: data.is_active },
    );
    return { success: true };
  });
export const adminCreatePackage = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1, 'Description is required'),
      country: z.string().min(1, 'Country is required'),
      location: z.string().min(1, 'Location is required'),
      nights: z.number().min(1, 'Nights is required'),
      days: z.number().min(1, 'Days is required'),
      price: z.number().min(1, 'Price is required'),
      category: z.enum(['Economy', 'Premium', 'Luxury']),
      image_url: z.string().min(1, 'Image is required'),
      image_key: z.string().min(1, 'Image key is required'),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return await adminUpsertPackageDetail({
      data: {
        auth: data.auth,
        package: {
          slug,
          name: data.name,
          description: data.description,
          country: data.country,
          location: data.location,
          nights: data.nights,
          days: data.days,
          price: data.price,
          category: data.category,
          image_url: data.image_url,
          image_key: data.image_key,
          is_active: true,
          themes: [],
          runOfShow: [
            {
              day_number: 1,
              title: 'Arrival',
              description: 'Arrival, transfers, and check-in.',
              city: data.location,
            },
          ],
          inclusions: [],
          exclusions: [],
        },
      },
    });
  });
export const adminDeletePackage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    return await adminSetPackageActive({
      data: { auth: data.auth, id: data.id, is_active: false },
    });
  });
export const adminUploadAsset = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      originalFilename: z.string().min(1).max(255),
      mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const crypto = await import('node:crypto');
    const bytes = decodeBase64Strict(data.base64);
    const maxBytes = 5 * 1024 * 1024;
    if (bytes.byteLength > maxBytes) throw new Error('Image must be 5 MB or smaller.');
    const signatures = {
      'image/jpeg': (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
      'image/png': (buf) =>
        buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      'image/webp': (buf) =>
        buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buf.subarray(8, 12).toString('ascii') === 'WEBP',
      'image/avif': (buf) => buf.subarray(4, 12).toString('ascii').includes('ftyp'),
    };
    if (!signatures[data.mimeType](bytes))
      throw new Error('Uploaded file content does not match the selected image type.');
    const ext = data.mimeType === 'image/jpeg' ? 'jpg' : data.mimeType.split('/')[1];
    const storedFilename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storedFilename), bytes, { flag: 'wx' });
    const publicUrl = `/uploads/${storedFilename}`;
    await prisma.uploaded_assets.create({
      data: {
        original_filename: data.originalFilename,
        stored_filename: storedFilename,
        mime_type: data.mimeType,
        byte_size: bytes.byteLength,
        public_url: publicUrl,
        uploaded_by: admin.email,
      },
    });
    await logAdminAction(admin.email, 'asset.upload', 'uploaded_asset', storedFilename, null, {
      publicUrl,
      mimeType: data.mimeType,
      byteSize: bytes.byteLength,
    });
    return { success: true, publicUrl };
  });
export const uploadChatAttachment = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      originalFilename: z.string().min(1).max(255),
      mimeType: z.enum([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const crypto = await import('node:crypto');
    // Check size limit: 10MB
    const bytes = decodeBase64Strict(data.base64);
    if (bytes.byteLength > 10 * 1024 * 1024) {
      throw new Error('File must be 10 MB or smaller.');
    }
    const signatures = {
      'image/jpeg': [(buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff],
      'image/png': [
        (buf) =>
          buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      ],
      'image/webp': [
        (buf) =>
          buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
          buf.subarray(8, 12).toString('ascii') === 'WEBP',
      ],
      'image/avif': [(buf) => buf.subarray(4, 12).toString('ascii').includes('ftyp')],
      'application/pdf': [(buf) => buf.subarray(0, 4).toString('ascii') === '%PDF'],
      // Text files don't have magic numbers reliably, skip strict binary check for them.
      'text/plain': [(buf) => true],
      'text/csv': [(buf) => true],
      // DOC/XLS (Legacy OLE)
      'application/msword': [
        (buf) =>
          buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
      ],
      'application/vnd.ms-excel': [
        (buf) =>
          buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
      ],
      // DOCX/XLSX (ZIP based)
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        (buf) => buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
      ],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        (buf) => buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
      ],
    };
    const isMatch = signatures[data.mimeType]?.some((check) => check(bytes));
    if (!isMatch) {
      throw new Error('Uploaded file content does not match the expected file type.');
    }
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/csv': 'csv',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };
    const ext = mimeToExt[data.mimeType] || 'bin';
    const storedFilename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storedFilename), bytes, { flag: 'wx' });
    return { public_url: `/uploads/${storedFilename}` };
  });
export const adminListAssets = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureAdminTables();
    return await prisma.uploaded_assets.findMany({
      orderBy: { id: 'desc' },
    });
  });
export const adminArchiveAsset = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensureAdminTables();
    const beforeValue = await prisma.uploaded_assets.findUnique({ where: { id: data.id } });
    await prisma.uploaded_assets.update({ where: { id: data.id }, data: { is_archived: true } });
    await logAdminAction(admin.email, 'asset.archive', 'uploaded_asset', data.id, beforeValue, {
      is_archived: true,
    });
    return { success: true };
  });
export const defaultPermitCmsPage = {
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
      description:
        'Comprehensive document verification, application prep, and portal submission support.',
      sort_order: 1,
      is_active: true,
    },
    {
      plan_key: 'premium',
      title: 'Premium VIP fast-track',
      description:
        'Includes immediate checklist review, timeline dummy ticket uploads, and personal counselor call coordination.',
      sort_order: 2,
      is_active: true,
    },
  ],
  locations: [
    {
      location_key: 'Bali',
      location_label: 'Bali (Indonesia)',
      status_text: 'Permit on Arrival (VoA) / e-VoA',
      duration_text: '30 Days (Extendable once for 30 more days)',
      processing_time: 'Instant at EventSite (or 24 hours online via e-VoA)',
      average_cost: 'IDR 500,000 (~₹2,700)',
      notes:
        'We highly recommend applying for the e-VoA online 48 hours before departure to skip the long physical queue at Denpasar eventSite.',
      epermit_available: true,
      sort_order: 1,
      requirements: [
        'Credential valid for at least 6 months from arrival date',
        'Confirmed return or onward ticket out of Indonesia',
        'e-VoA receipt or cash in IDR/USD for payment at counter',
        'Completed Customs Declaration form QR code',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Dubai',
      location_label: 'Dubai (UAE)',
      status_text: 'Pre-arranged ePermit Required',
      duration_text: '30 or 60 Days (Single/Multiple Entry)',
      processing_time: '3 to 5 Working Days',
      average_cost: '₹7,200 (30 Days Single Entry)',
      notes:
        'If you have evented to US, UK, Schengen, or EU countries in the past 5 years, processing is fast-tracked. MooN handles files directly with Dubai immigration authorities.',
      epermit_available: true,
      sort_order: 2,
      requirements: [
        'Color scanned copy of credential front and back pages',
        'Credential-sized photo with white background',
        'Confirmed return timeline ticket',
        'Venue reservation proof or host details',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Thailand',
      location_label: 'Thailand',
      status_text: 'Permit-Free Entry for Indians',
      duration_text: 'Up to 30 Days',
      processing_time: 'Instant at immigration counters',
      average_cost: '₹0 (Permit fees waived)',
      notes:
        'The Thai government has extended permit-free entry for Indian tourists. Make sure your credential is in excellent condition to avoid check-in refusals.',
      epermit_available: false,
      sort_order: 3,
      requirements: [
        'Credential valid for at least 6 months with 2 blank pages',
        'Confirmed return timeline ticket within 30 days of arrival',
        'Proof of funds',
        'Venue booking voucher/confirmation',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Kazakhstan',
      location_label: 'Kazakhstan',
      status_text: 'Permit-Free Entry for Indians',
      duration_text: 'Up to 14 Days',
      processing_time: 'Instant at border checkpoints',
      average_cost: '₹0 (No permit fee)',
      notes:
        'Ensure your events vouchers are printed. Immigration teams may verify round-event timelines before stamping.',
      epermit_available: false,
      sort_order: 4,
      requirements: [
        'Credential valid for at least 6 months',
        'Confirmed round-event timeline booking',
        'Venue voucher or letter of invitation if staying with hosts',
        'Events insurance cover',
      ],
      conditional_rules: [],
    },
    {
      location_key: 'Azerbaijan',
      location_label: 'Azerbaijan',
      status_text: 'ASAN ePermit Required',
      duration_text: 'Up to 30 Days (Single Entry)',
      processing_time: '3 Working Days (Standard) or 3 Hours (Urgent)',
      average_cost: '$26 (~₹2,200) Standard / $60 (~₹5,000) Urgent',
      notes:
        'Applying via the official ASAN e-Permit is simple, but names must exactly match the credential MRZ code to avoid cancellation at the boarding gate.',
      epermit_available: true,
      sort_order: 5,
      requirements: [
        'High-resolution scan of credential bio-data page',
        'Intended date of entry',
        'Venue voucher/booking showing address',
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
      average_cost: '$20 (~₹1,700) + filing assistance',
      notes:
        'Indian citizens holding a valid permit or residence permit from US, UK, Schengen countries, UAE, Saudi Arabia, or other GCC states can enter Georgia permit-free for up to 90 days.',
      epermit_available: true,
      sort_order: 6,
      requirements: [
        'Scanned credential copy',
        'Recent credential photograph',
        'Events and health insurance',
        'Bank statements',
        'Confirmed return timelines and runOfShow',
      ],
      conditional_rules: [
        {
          trigger_label: 'I hold a valid US/UK/Schengen/UAE permit or PR',
          status_text: 'Permit-Free (Conditional)',
          average_cost: '₹0 (No permit fee)',
          notes:
            'You are exempt from permit filing. Carry a printed copy of your valid permit/PR with venue and timeline bookings.',
        },
      ],
    },
    {
      location_key: 'Turkey',
      location_label: 'Turkey',
      status_text: 'ePermit (Conditional) or Sticker Permit',
      duration_text: '30 Days (ePermit) / 90 Days (Sticker)',
      processing_time: '24 Hours (ePermit) / 10-12 Working Days (Sticker)',
      average_cost: '$43 (~₹3,600) for ePermit / ₹16,500 for Sticker Permit',
      notes:
        'Indians without a valid US/UK/Schengen permit must apply for a physical sticker permit via VFS Global. Let MooN manage your appointment and file compilation.',
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
          average_cost: '$43 (~₹3,600)',
          notes:
            'You qualify for an instant ePermit and do not need the VFS physical sticker permit route.',
        },
      ],
    },
  ],
};
export async function ensurePermitCmsTablesImpl() {}
export async function replacePermitCmsPage(page) {
  await prisma.$transaction(async (tx) => {
    const pageData = {
      hero_eyebrow: page.hero_eyebrow,
      hero_title: page.hero_title,
      hero_italic: page.hero_italic,
      hero_body: page.hero_body,
      form_eyebrow: page.form_eyebrow,
      form_title: page.form_title,
      form_body: page.form_body,
      guarantee_title: page.guarantee_title,
      guarantee_body: page.guarantee_body,
    };
    await tx.permit_cms_page.upsert({
      where: { id: 1 },
      create: { id: 1, ...pageData },
      update: pageData,
    });
    const locationIds = (await tx.permit_cms_locations.findMany({ select: { id: true } })).map(
      (item) => item.id,
    );
    await Promise.all([
      tx.permit_cms_sections.deleteMany(),
      tx.permit_cms_service_plans.deleteMany(),
      tx.permit_cms_conditional_rules.deleteMany({
        where: { location_id: { in: locationIds } },
      }),
      tx.permit_cms_requirements.deleteMany({ where: { location_id: { in: locationIds } } }),
    ]);
    await tx.permit_cms_locations.deleteMany();
    if (page.sections.length) await tx.permit_cms_sections.createMany({ data: page.sections });
    if (page.service_plans.length)
      await tx.permit_cms_service_plans.createMany({ data: page.service_plans });
    for (const location of page.locations) {
      const { requirements, conditional_rules, ...locationData } = location;
      const created = await tx.permit_cms_locations.create({ data: locationData });
      if (requirements.length)
        await tx.permit_cms_requirements.createMany({
          data: requirements.map((item, index) => ({
            location_id: created.id,
            item,
            sort_order: index + 1,
          })),
        });
      if (conditional_rules.length)
        await tx.permit_cms_conditional_rules.createMany({
          data: conditional_rules.map((rule) => ({ location_id: created.id, ...rule })),
        });
    }
  });
}
export async function seedPermitCmsIfEmpty() {
  if (await prisma.visa_cms_page.findUnique({ where: { id: 1 } })) return;
  await replacePermitCmsPage(defaultPermitCmsPage);
}
export const getPermitCmsPage = defineOperation({ method: 'GET' }).handler(async () => {
  try {
    await ensurePermitCmsTables();
    await seedPermitCmsIfEmpty();
    const page = await prisma.visa_cms_page.findUnique({ where: { id: 1 } });
    if (!page) return defaultPermitCmsPage;
    const locationRows = await prisma.visa_cms_destinations.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { location_label: 'asc' }],
    });
    const locationIds = locationRows.map((location) => location.id);
    const [requirements, rules, sectionRows, planRows] = await Promise.all([
      prisma.visa_cms_requirements.findMany({
        where: { location_id: { in: locationIds } },
        orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      }),
      prisma.visa_cms_conditional_rules.findMany({
        where: { location_id: { in: locationIds } },
        orderBy: { id: 'asc' },
      }),
      prisma.visa_cms_sections.findMany({
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      }),
      prisma.visa_cms_service_plans.findMany({
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
      }),
    ]);
    const requirementsByLocation = Map.groupBy(requirements, (item) => item.location_id);
    const rulesByLocation = Map.groupBy(rules, (item) => item.location_id);
    const locations = locationRows.map((dest) => ({
      location_key: dest.location_key,
      location_label: dest.location_label,
      status_text: dest.status_text,
      duration_text: dest.duration_text,
      processing_time: dest.processing_time,
      average_cost: dest.average_cost,
      notes: dest.notes,
      epermit_available: !!dest.epermit_available,
      sort_order: dest.sort_order,
      requirements: (requirementsByLocation.get(dest.id) || []).map((item) => item.item),
      conditional_rules: (rulesByLocation.get(dest.id) || []).map(
        ({ trigger_label, status_text, average_cost, notes }) => ({
          trigger_label,
          status_text,
          average_cost,
          notes,
        }),
      ),
    }));
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
  } catch (err) {
    console.error('Failed to load Permit CMS; falling back to static defaults:', err);
    return defaultPermitCmsPage;
  }
});
export const permitCmsInputSchema = z.object({
  hero_eyebrow: z.string().min(1),
  hero_title: z.string().min(1),
  hero_italic: z.string().min(1),
  hero_body: z.string().min(1),
  form_eyebrow: z.string().min(1),
  form_title: z.string().min(1),
  form_body: z.string().min(1),
  guarantee_title: z.string().min(1),
  guarantee_body: z.string().min(1),
  sections: z.array(
    z.object({
      section_key: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
      sort_order: z.number(),
      is_active: z.boolean(),
    }),
  ),
  service_plans: z.array(
    z.object({
      plan_key: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      sort_order: z.number(),
      is_active: z.boolean(),
    }),
  ),
  locations: z.array(
    z.object({
      location_key: z.string().min(1),
      location_label: z.string().min(1),
      status_text: z.string().min(1),
      duration_text: z.string().min(1),
      processing_time: z.string().min(1),
      average_cost: z.string().min(1),
      notes: z.string().min(1),
      epermit_available: z.boolean(),
      sort_order: z.number(),
      requirements: z.array(z.string().min(1)),
      conditional_rules: z.array(
        z.object({
          trigger_label: z.string().min(1),
          status_text: z.string().min(1),
          average_cost: z.string().min(1),
          notes: z.string().min(1),
        }),
      ),
    }),
  ),
});
export const adminGetPermitCmsPage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    return await getPermitCmsPage();
  });
export const adminSavePermitCmsPage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, page: permitCmsInputSchema }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensurePermitCmsTables();
    await replacePermitCmsPage(data.page);
    await logAdminAction(admin.email, 'permit_cms.save', 'permit_cms', 1, null, data.page);
    return { success: true };
  });
export const packingCategories = [
  { category_key: 'docs', label: 'Documents & Wallet', sort_order: 1, is_active: true },
  { category_key: 'clothing', label: 'Clothing & Shoes', sort_order: 2, is_active: true },
  { category_key: 'tech', label: 'Electronics & Tech', sort_order: 3, is_active: true },
  { category_key: 'health', label: 'Health & Wellness', sort_order: 4, is_active: true },
];
export const defaultPackingCmsPage = {
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
  categories: packingCategories,
  items: [
    'Credential (valid for at least 6 months)',
    'Printed Round-event Timeline Tickets',
    'Venue Booking Vouchers / Stays Printout',
    'ePermit Copy / e-VoA Document',
    'Events Insurance Policy Document',
    'International Forex Card / Cash (USD/Local)',
  ].map((item_text, index) => ({
    item_key: `docs-global-${index + 1}`,
    category_key: 'docs',
    item_text,
    location_key: null,
    season_key: null,
    sort_order: index + 1,
    is_active: true,
  })),
};
defaultPackingCmsPage.items.push(
  ...[
    'Universal Events Adapter (Plug Converter)',
    'Power Bank (Carry-on only, under 20k mAh)',
    'Mobile Charger & Charging Cables',
    'Noise-canceling headphones for the timeline',
  ].map((item_text, index) => ({
    item_key: `tech-global-${index + 1}`,
    category_key: 'tech',
    item_text,
    location_key: null,
    season_key: null,
    sort_order: index + 1,
    is_active: true,
  })),
  ...[
    'Prescribed medicines (with valid prescription copy)',
    'First-aid essentials (Paracetamol, Avomine, Antacids)',
    'Hand sanitizer & disinfectant wipes',
    'High-SPF Sunscreen (SPF 50+)',
    'Mosquito / insect repellent spray',
  ].map((item_text, index) => ({
    item_key: `health-global-${index + 1}`,
    category_key: 'health',
    item_text,
    location_key: null,
    season_key: null,
    sort_order: index + 1,
    is_active: true,
  })),
  ...[
    'Comfortable cotton tees & shirts',
    'Jeans, chinos, or lightweight trousers',
    'Light jacket or cardigan (layering)',
    'Walking sneakers with good cushioning',
    'Smart outfits for local sightseeing dinner',
  ].map((item_text, index) => ({
    item_key: `clothing-global-${index + 1}`,
    category_key: 'clothing',
    item_text,
    location_key: null,
    season_key: null,
    sort_order: index + 1,
    is_active: true,
  })),
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
    item_key: 'tech-europe-plug-bali',
    category_key: 'tech',
    item_text: 'Type C / F power plugs (European 2-pin)',
    location_key: 'Bali',
    season_key: null,
    sort_order: 20,
    is_active: true,
  },
  {
    item_key: 'tech-europe-plug-kazakhstan',
    category_key: 'tech',
    item_text: 'Type C / F power plugs (European 2-pin)',
    location_key: 'Kazakhstan',
    season_key: null,
    sort_order: 20,
    is_active: true,
  },
  {
    item_key: 'tech-europe-plug-azerbaijan',
    category_key: 'tech',
    item_text: 'Type C / F power plugs (European 2-pin)',
    location_key: 'Azerbaijan',
    season_key: null,
    sort_order: 20,
    is_active: true,
  },
  {
    item_key: 'tech-europe-plug-georgia',
    category_key: 'tech',
    item_text: 'Type C / F power plugs (European 2-pin)',
    location_key: 'Georgia',
    season_key: null,
    sort_order: 20,
    is_active: true,
  },
  {
    item_key: 'tech-europe-plug-turkey',
    category_key: 'tech',
    item_text: 'Type C / F power plugs (European 2-pin)',
    location_key: 'Turkey',
    season_key: null,
    sort_order: 20,
    is_active: true,
  },
  ...[
    'Heavy Thermal Innerwear (2-3 pairs)',
    'Windproof & waterproof goose-down winter coat',
    'Fleece sweaters or wool hoodies (mid-layers)',
    'Thermal gloves (waterproof/windproof)',
    'Woolen beanie & thermal neck gaiter/scarf',
    'Heavy woolen socks (4+ pairs)',
    'Insulated snow boots with slip-resistant soles',
    'Lip balm & cold cream (anti-chapping)',
  ].map((item_text, index) => ({
    item_key: `clothing-kazakhstan-winter-${index + 1}`,
    category_key: 'clothing',
    item_text,
    location_key: 'Kazakhstan',
    season_key: 'winter',
    sort_order: index + 20,
    is_active: true,
  })),
  ...[
    'Lightweight rain poncho or folding umbrella',
    'Quick-dry activewear (humidity is high)',
    'Waterproof dry bag for boat rides/waterfalls',
    'Water-resistant slides or sandals',
    'Lightweight cotton t-shirts & shorts',
    'Sarong or modest cover-up (mandatory for temples)',
  ].flatMap((item_text, index) =>
    ['Bali', 'Thailand'].map((location_key) => ({
      item_key: `clothing-${location_key.toLowerCase()}-rainy-${index + 1}`,
      category_key: 'clothing',
      item_text,
      location_key,
      season_key: 'rainy',
      sort_order: index + 20,
      is_active: true,
    })),
  ),
  ...[
    'Linen shirts, tank tops, and cotton tees',
    'Swimwear / Board shorts (2-3 pairs)',
    'Sunglasses (polarized) & wide-brim straw hat',
    'Comfortable flip-flops and walking sandals',
    'Smart-casual wear for beach clubs & fine dining',
    'Modest clothes covering shoulders & knees (temples)',
  ].flatMap((item_text, index) =>
    ['Bali', 'Thailand'].map((location_key) => ({
      item_key: `clothing-${location_key.toLowerCase()}-summer-${index + 1}`,
      category_key: 'clothing',
      item_text,
      location_key,
      season_key: 'summer',
      sort_order: index + 20,
      is_active: true,
    })),
  ),
  ...[
    'Ultra-lightweight linen & loose cotton clothes',
    'Polarized sunglasses & high UV block hat',
    'Swimwear (for venue pools/waterparks)',
    'Light cardigan (malls are heavily air-conditioned)',
    'Modest outfit covering knees & shoulders (mosques)',
    'Breathable walking sneakers',
  ].map((item_text, index) => ({
    item_key: `clothing-dubai-summer-${index + 1}`,
    category_key: 'clothing',
    item_text,
    location_key: 'Dubai',
    season_key: 'summer',
    sort_order: index + 20,
    is_active: true,
  })),
  ...[
    'Comfortable cotton tees and denims',
    'Light denim jacket or hoodie (desert safari nights)',
    'Stylish evening outfits for dinner venueProductions',
    'Comfortable flats or smart sneakers for malls',
    'Sunglasses & sun block',
  ].map((item_text, index) => ({
    item_key: `clothing-dubai-winter-${index + 1}`,
    category_key: 'clothing',
    item_text,
    location_key: 'Dubai',
    season_key: 'winter',
    sort_order: index + 20,
    is_active: true,
  })),
);
export async function ensurePackingCmsTablesImpl() {}
export async function replacePackingCmsPage(page) {
  await prisma.$transaction(async (tx) => {
    const pageData = {
      hero_eyebrow: page.hero_eyebrow,
      hero_title: page.hero_title,
      hero_italic: page.hero_italic,
      hero_body: page.hero_body,
      suggestion_title: page.suggestion_title,
      suggestion_body: page.suggestion_body,
    };
    await tx.packing_cms_page.upsert({
      where: { id: 1 },
      create: { id: 1, ...pageData },
      update: pageData,
    });
    await tx.packing_cms_items.deleteMany();
    await tx.packing_cms_seasons.deleteMany();
    await tx.packing_cms_categories.deleteMany();
    if (page.seasons.length) await tx.packing_cms_seasons.createMany({ data: page.seasons });
    if (page.categories.length)
      await tx.packing_cms_categories.createMany({ data: page.categories });
    if (page.items.length)
      await tx.packing_cms_items.createMany({
        data: page.items.map((item) => ({
          ...item,
          location_key: item.location_key || null,
          season_key: item.season_key || null,
        })),
      });
  });
}
export async function seedPackingCmsIfEmpty() {
  if (await prisma.packing_cms_page.findUnique({ where: { id: 1 } })) return;
  await replacePackingCmsPage(defaultPackingCmsPage);
}
export async function packingCmsPage() {
  await ensurePackingCmsTables();
  await seedPackingCmsIfEmpty();
  const [page, seasonRows, categoryRows, itemRows] = await Promise.all([
    prisma.packing_cms_page.findUnique({ where: { id: 1 } }),
    prisma.packing_cms_seasons.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
    }),
    prisma.packing_cms_categories.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
    }),
    prisma.packing_cms_items.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
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
export const packingCmsInputSchema = z.object({
  hero_eyebrow: z.string().min(1),
  hero_title: z.string().min(1),
  hero_italic: z.string().min(1),
  hero_body: z.string().min(1),
  suggestion_title: z.string().min(1),
  suggestion_body: z.string().min(1),
  seasons: z.array(
    z.object({
      season_key: z.string().min(1),
      label: z.string().min(1),
      sort_order: z.number(),
      is_active: z.boolean(),
    }),
  ),
  categories: z.array(
    z.object({
      category_key: z.enum(['docs', 'tech', 'health', 'clothing']),
      label: z.string().min(1),
      sort_order: z.number(),
      is_active: z.boolean(),
    }),
  ),
  items: z.array(
    z.object({
      item_key: z.string().min(1),
      category_key: z.enum(['docs', 'tech', 'health', 'clothing']),
      item_text: z.string().min(1),
      location_key: z.string().nullable(),
      season_key: z.string().nullable(),
      sort_order: z.number(),
      is_active: z.boolean(),
    }),
  ),
});
export const getPackingCmsPage = defineOperation({ method: 'GET' }).handler(async () => {
  return await packingCmsPage();
});
export const adminGetPackingCmsPage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    return await packingCmsPage();
  });
export const adminSavePackingCmsPage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema, page: packingCmsInputSchema }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensurePackingCmsTables();
    await replacePackingCmsPage(data.page);
    await logAdminAction(admin.email, 'packing_cms.save', 'packing_cms', 1, null, data.page);
    return { success: true };
  });
export const getOperators = defineOperation({ method: 'GET' }).handler(async () => {
  return await prisma.operators.findMany({
    orderBy: { company_name: 'asc' },
  });
});
export const getOperatorBookings = defineOperation({ method: 'POST' })
  .validator(z.object({ operatorId: z.number() }))
  .handler(async ({ data }) => {
    const bookings = await prisma.bookings.findMany({
      where: { operator_id: data.operatorId },
      orderBy: { travel_date: 'asc' },
    });
    const [users, customizations] = await Promise.all([
      prisma.customerUser.findMany({
        where: { id: { in: bookings.map((booking) => booking.user_id) } },
      }),
      prisma.itinerary_customizations.findMany({
        where: { booking_id: { in: bookings.map((booking) => booking.id) } },
      }),
    ]);
    const usersById = new Map(users.map((user) => [user.id, user]));
    const customizationsByBooking = new Map(customizations.map((item) => [item.booking_id, item]));
    return bookings.map(({ travel_date, ...booking }) => ({
      ...booking,
      event_date: travel_date,
      user_name: usersById.get(booking.user_id)?.name || '',
      user_email: usersById.get(booking.user_id)?.email || '',
      user_phone: usersById.get(booking.user_id)?.phone || '',
      pace_mode: customizationsByBooking.get(booking.id)?.pace_mode || null,
      custom_runOfShow: customizationsByBooking.get(booking.id)?.custom_runOfShow || null,
    }));
  });
export const saveRunOfShowCustomization = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      bookingId: z.number(),
      paceMode: z.enum(['Leisurely', 'Balanced', 'Active']),
      customRunOfShow: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const existing = await prisma.itinerary_customizations.findFirst({
      where: { booking_id: data.bookingId },
    });
    if (existing)
      await prisma.itinerary_customizations.update({
        where: { id: existing.id },
        data: { pace_mode: data.paceMode, custom_runOfShow: data.customRunOfShow },
      });
    else
      await prisma.itinerary_customizations.create({
        data: {
          booking_id: data.bookingId,
          pace_mode: data.paceMode,
          custom_runOfShow: data.customRunOfShow,
        },
      });
    return { success: true };
  });
export const getEscrowLedger = defineOperation({ method: 'GET' }).handler(async () => {
  const ledger = await prisma.escrow_ledger.findMany({ orderBy: { id: 'desc' } });
  const bookings = await prisma.bookings.findMany({
    where: { id: { in: ledger.map((item) => item.booking_id) } },
  });
  const operators = await prisma.operators.findMany({
    where: {
      id: {
        in: bookings.flatMap((booking) => (booking.operator_id ? [booking.operator_id] : [])),
      },
    },
  });
  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));
  const operatorsById = new Map(operators.map((operator) => [operator.id, operator]));
  return ledger.map((item) => {
    const booking = bookingsById.get(item.booking_id);
    return {
      ...item,
      booking_reference: booking?.booking_reference || '',
      operator_name: booking?.operator_id
        ? operatorsById.get(booking.operator_id)?.company_name || null
        : null,
    };
  });
});
export const releaseEscrowMilestone = defineOperation({ method: 'POST' })
  .validator(z.object({ ledgerId: z.number() }))
  .handler(async ({ data }) => {
    await prisma.escrow_ledger.update({
      where: { id: data.ledgerId },
      data: { status: 'released', actual_release_date: new Date() },
    });
    return { success: true };
  });
export const getEscrowStatusByBooking = defineOperation({ method: 'POST' })
  .validator(z.object({ bookingId: z.number() }))
  .handler(async ({ data }) => {
    try {
      const order = { deposit_50: 0, commencement_35: 1, completion_15: 2 };
      const rows = await prisma.escrow_ledger.findMany({ where: { booking_id: data.bookingId } });
      return rows.sort((a, b) => order[a.milestone_type] - order[b.milestone_type]);
    } catch {
      return [];
    }
  });
// ===================== Instant Refund Processing =====================
export const triggerInstantRefund = defineOperation({ method: 'POST' })
  .validator(z.object({ bookingId: z.number(), userId: z.number() }))
  .handler(async ({ data }) => {
    const booking = await prisma.bookings.findFirst({
      where: { id: data.bookingId, user_id: data.userId },
    });
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'cancelled') throw new Error('Only cancelled bookings can be refunded');
    await prisma.$transaction(async (tx) => {
      await tx.escrow_ledger.updateMany({
        where: { booking_id: data.bookingId, status: 'held' },
        data: { status: 'refunded', actual_release_date: new Date() },
      });
      await tx.payment_orders.create({
        data: {
          user_id: data.userId,
          booking_id: data.bookingId,
          amount: -booking.amount,
          utr_reference: `REFUND-${Date.now()}`,
          status: 'verified',
        },
      });
    });
    return { success: true, refundedAmount: booking.amount };
  });
// ===================== Operator RunOfShow Update (DMC-Facing) =====================
export const updateOperatorRunOfShow = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      bookingId: z.number(),
      operatorId: z.number(),
      updatedDays: z.string(), // JSON string of updated day objects
      operatorNotes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (
      !(await prisma.bookings.findFirst({
        where: { id: data.bookingId, operator_id: data.operatorId },
      }))
    )
      throw new Error('Unauthorized: Booking not assigned to this operator');
    const existing = await prisma.itinerary_customizations.findFirst({
      where: { booking_id: data.bookingId },
    });
    if (existing)
      await prisma.itinerary_customizations.update({
        where: { id: existing.id },
        data: { custom_runOfShow: data.updatedDays },
      });
    else
      await prisma.itinerary_customizations.create({
        data: {
          booking_id: data.bookingId,
          pace_mode: 'Balanced',
          custom_runOfShow: data.updatedDays,
        },
      });
    return { success: true };
  });
// ===================== Admin: Operator (DMC) Onboarding =====================
export const adminCreateOperator = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      companyName: z.string().min(1),
      contactName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(5),
      cityCoverage: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const operator = await prisma.operators.create({
      data: {
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        city_coverage: data.cityCoverage,
        is_verified: false,
      },
    });
    return { success: true, operatorId: operator.id };
  });
export const adminUpdateOperatorStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      operatorId: z.number(),
      isVerified: z.number().min(0).max(1),
    }),
  )
  .handler(async ({ data }) => {
    await prisma.operators.update({
      where: { id: data.operatorId },
      data: { is_verified: Boolean(data.isVerified) },
    });
    return { success: true };
  });
export const adminDeleteOperator = defineOperation({ method: 'POST' })
  .validator(z.object({ operatorId: z.number() }))
  .handler(async ({ data }) => {
    await prisma.$transaction([
      prisma.packages.updateMany({
        where: { operator_id: data.operatorId },
        data: { operator_id: null },
      }),
      prisma.bookings.updateMany({
        where: { operator_id: data.operatorId },
        data: { operator_id: null },
      }),
      prisma.operators.delete({ where: { id: data.operatorId } }),
    ]);
    return { success: true };
  });
export const CORE_LOCATIONS = [
  {
    location: 'Dubai',
    country: 'United Arab Emirates',
    imageKey: 'dubai',
    lat: 25.2048,
    lng: 55.2708,
    neighborhoods: [
      'Downtown Dubai',
      'Dubai Marina',
      'Palm Jumeirah',
      'Al Fahidi',
      'Jumeirah Beach',
      'Business Bay',
      'Deira Creek',
      'Bluewaters',
    ],
  },
  {
    location: 'Bali',
    country: 'Indonesia',
    imageKey: 'bali',
    lat: -8.3405,
    lng: 115.092,
    neighborhoods: [
      'Ubud',
      'Seminyak',
      'Nusa Dua',
      'Canggu',
      'Uluwatu',
      'Sanur',
      'Kintamani',
      'Jimbaran',
    ],
  },
  {
    location: 'Thailand',
    country: 'Thailand',
    imageKey: 'thailand',
    lat: 13.7563,
    lng: 100.5018,
    neighborhoods: [
      'Bangkok Riverside',
      'Phuket Kata',
      'Krabi Ao Nang',
      'Chiang Mai Old City',
      'Koh Samui',
      'Phi Phi',
      'Railay',
      'Sukhumvit',
    ],
  },
  {
    location: 'Kazakhstan',
    country: 'Kazakhstan',
    imageKey: 'kazakhstan',
    lat: 43.222,
    lng: 76.8512,
    neighborhoods: [
      'Almaty Centre',
      'Shymbulak',
      'Kolsai Lakes',
      'Charyn Canyon',
      'Big Almaty Lake',
      'Medeu',
      'Kok Tobe',
      'Panfilov Park',
    ],
  },
  {
    location: 'Azerbaijan',
    country: 'Azerbaijan',
    imageKey: 'azerbaijan',
    lat: 40.4093,
    lng: 49.8671,
    neighborhoods: [
      'Baku Old City',
      'Baku Boulevard',
      'Gabala',
      'Sheki',
      'Gobustan',
      'Absheron',
      'Nohur Lake',
      'Flame Towers',
    ],
  },
  {
    location: 'Georgia',
    country: 'Georgia',
    imageKey: 'kazakhstan',
    lat: 41.7151,
    lng: 44.8271,
    neighborhoods: [
      'Tbilisi Old Town',
      'Kazbegi',
      'Kakheti',
      'Mtskheta',
      'Sighnaghi',
      'Gudauri',
      'Borjomi',
      'Rustaveli',
    ],
  },
  {
    location: 'Turkey',
    country: 'Turkey',
    imageKey: 'dubai',
    lat: 41.0082,
    lng: 28.9784,
    neighborhoods: [
      'Sultanahmet',
      'Bosphorus',
      'Cappadocia',
      'Kadikoy',
      'Galata',
      'Antalya Marina',
      'Goreme',
      'Grand Bazaar',
    ],
  },
];
export const ACCOMMODATION_NAMES = [
  ['Atlas House', 'venue'],
  ['Casa Lumiere', 'villa'],
  ['The Quiet Inn', 'resort'],
  ['Maison Noir', 'apartment'],
  ['Villa Asha', 'villa'],
  ['Crescent View Retreat', 'venue'],
  ['Lantern Courtyard Stay', 'cabin'],
  ['Skyline Garden Suites', 'resort'],
];
export const CAR_TEMPLATES = [
  {
    name: 'EventSite Comfort Sedan',
    vehicleType: 'Sedan',
    seats: 4,
    luggage: 2,
    price: 3800,
    features: [
      'EventSite meet-and-greet',
      'Air conditioning',
      'English-speaking driver',
      'Bottled water',
    ],
  },
  {
    name: 'Family Touring SUV',
    vehicleType: 'SUV',
    seats: 5,
    luggage: 4,
    price: 6200,
    features: [
      'Child seat on request',
      'Large luggage bay',
      'Flexible day rental',
      'WhatsApp driver coordination',
    ],
  },
  {
    name: 'Luxury Van with Driver',
    vehicleType: 'Van',
    seats: 7,
    luggage: 6,
    price: 9100,
    features: [
      'Premium captain seats',
      'Private driver',
      'EventSite pickup',
      'Intercity route support',
    ],
  },
];
export const CURATED_IMAGE_SETS = {
  Dubai: {
    stays: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Bali: {
    stays: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529290130-4ca3753253ae?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Thailand: {
    stays: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552751753-0fc84ae8a0a6?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Kazakhstan: {
    stays: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Azerbaijan: {
    stays: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Georgia: {
    stays: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  Turkey: {
    stays: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    ],
    cars: [
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    ],
    experiences: [
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
};
export function curatedImage(location, kind, index) {
  const set = CURATED_IMAGE_SETS[location] || CURATED_IMAGE_SETS.Dubai;
  const images = set[kind];
  return images[index % images.length];
}
export function slugifyInventory(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
export function parseJsonArray(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
export async function addColumnIfMissing(table, column, definition) {
  const allowedTables = new Set(['accommodation_listings', 'car_listings', 'vendors']);
  const allowedColumnDefinitions = new Map([
    ['vendor_id', 'INT NULL'],
    [
      'approval_status',
      "ENUM('draft','pending_review','approved','rejected','unpublished') NOT NULL DEFAULT 'approved'",
    ],
    ['image_source', 'VARCHAR(80) NULL'],
    ['image_source_url', 'VARCHAR(500) NULL'],
    ['image_photographer', 'VARCHAR(160) NULL'],
    ['approved_at', 'DATETIME NULL'],
    ['updated_at', 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
    ['source_name', 'VARCHAR(255) NULL'],
    ['price_source_url', 'VARCHAR(500) NULL'],
    ['contact_source_url', 'VARCHAR(500) NULL'],
    ['google_search_url', 'VARCHAR(500) NULL'],
    ['last_checked_at', 'DATE NULL'],
    ['confidence', 'VARCHAR(40) NULL'],
    ['price_basis', 'VARCHAR(160) NULL'],
    ['research_notes', 'TEXT NULL'],
    ['phone', 'VARCHAR(100) NULL'],
    ['email', 'VARCHAR(220) NULL'],
  ]);
  if (!allowedTables.has(table) || allowedColumnDefinitions.get(column) !== definition) {
    throw new Error('Unsafe schema identifier rejected.');
  }
  const pool = await getDbPool();
  try {
    await resolve();
  } catch (err) {
    const message = String(err?.message || '');
    if (!message.includes('Duplicate column name') && !message.includes("doesn't exist")) throw err;
  }
}
export async function ensureInventoryUpgradeColumnsImpl() {
  const shared = [
    ['vendor_id', 'INT NULL'],
    [
      'approval_status',
      "ENUM('draft','pending_review','approved','rejected','unpublished') NOT NULL DEFAULT 'approved'",
    ],
    ['image_source', 'VARCHAR(80) NULL'],
    ['image_source_url', 'VARCHAR(500) NULL'],
    ['image_photographer', 'VARCHAR(160) NULL'],
    ['approved_at', 'DATETIME NULL'],
    ['updated_at', 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ];
  const research = [
    ['source_name', 'VARCHAR(255) NULL'],
    ['price_source_url', 'VARCHAR(500) NULL'],
    ['contact_source_url', 'VARCHAR(500) NULL'],
    ['google_search_url', 'VARCHAR(500) NULL'],
    ['last_checked_at', 'DATE NULL'],
    ['confidence', 'VARCHAR(40) NULL'],
    ['price_basis', 'VARCHAR(160) NULL'],
    ['research_notes', 'TEXT NULL'],
  ];
  for (const table of ['accommodation_listings', 'car_listings']) {
    for (const [column, definition] of shared) await addColumnIfMissing(table, column, definition);
    for (const [column, definition] of research)
      await addColumnIfMissing(table, column, definition);
    await addColumnIfMissing(table, 'phone', 'VARCHAR(100) NULL');
    await addColumnIfMissing(table, 'email', 'VARCHAR(220) NULL');
    await (
      await getDbPool()
    ).query(`UPDATE \`${table}\` SET approval_status = 'approved' WHERE approval_status IS NULL`);
  }
  for (const table of ['vendors']) {
    for (const [column, definition] of research)
      await addColumnIfMissing(table, column, definition);
  }
  await resolve();
}
export async function ensureVendorMarketplaceTablesImpl() {
  const pool = await getDbPool();
  await resolve();
  await resolve();
}
export async function backfillCuratedInventoryImages() {
  const accRows = await prisma.accommodation_listings.findMany({
    where: { OR: [{ image_url: null }, { image_url: '' }] },
    select: { id: true, location: true },
  });
  for (const [index, row] of accRows.entries()) {
    await prisma.accommodation_listings.update({
      where: { id: row.id },
      data: {
        image_url: curatedImage(row.location, 'stays', index),
        image_source: 'Unsplash',
        image_source_url: 'https://unsplash.com',
        image_photographer: 'Unsplash contributor',
      },
    });
  }
  const carRows = await prisma.car_listings.findMany({
    where: { OR: [{ image_url: null }, { image_url: '' }] },
    select: { id: true, location: true },
  });
  for (const [index, row] of carRows.entries()) {
    await prisma.car_listings.update({
      where: { id: row.id },
      data: {
        image_url: curatedImage(row.location, 'cars', index),
        image_source: 'Unsplash',
        image_source_url: 'https://unsplash.com',
        image_photographer: 'Unsplash contributor',
      },
    });
  }
}
export async function ensureRichInventoryTablesImpl() {
  await ensureVendorMarketplaceTables();
  await ensureInventoryUpgradeColumns();
}
export function mapAccommodation(row) {
  return {
    ...row,
    price_inr: Number(row.price_inr),
    rating: Number(row.rating),
    review_count: Number(row.review_count),
    beds: Number(row.beds),
    baths: Number(row.baths),
    guests: Number(row.guests),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    is_active: Number(row.is_active),
    amenities: parseJsonArray(row.amenities),
    tags: parseJsonArray(row.tags),
  };
}
export function mapCar(row) {
  return {
    ...row,
    location: row.location ?? row.destination,
    seats: Number(row.seats),
    luggage: Number(row.luggage),
    driver_included: Number(row.driver_included),
    eventSite_pickup: Number(row.eventSite_pickup ?? row.airport_pickup),
    price_inr: Number(row.price_inr),
    rating: Number(row.rating),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    is_active: Number(row.is_active),
    features: parseJsonArray(row.features),
  };
}
export const getAccommodationListings = defineOperation({ method: 'GET' }).handler(async () => {
  await ensureRichInventoryTables();
  const rows = await prisma.accommodation_listings.findMany({
    where: { is_active: true, approval_status: 'approved' },
    orderBy: [{ location: 'asc' }, { price_inr: 'asc' }],
  });
  const vendors = await prisma.vendors.findMany({
    where: { id: { in: rows.flatMap((row) => (row.vendor_id ? [row.vendor_id] : [])) } },
    select: { id: true, company_name: true },
  });
  const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
  return rows.map((row) =>
    mapAccommodation({
      ...row,
      vendor_name: row.vendor_id ? vendorsById.get(row.vendor_id) || null : null,
    }),
  );
});
export const getAccommodationBySlug = defineOperation({ method: 'GET' })
  .validator(z.object({ slug: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    const first = await prisma.accommodation_listings.findFirst({
      where: {
        ...(data?.slug ? { slug: data.slug } : {}),
        is_active: true,
        approval_status: 'approved',
      },
      ...(!data?.slug ? { orderBy: { review_count: 'desc' } } : {}),
    });
    if (!first) return null;
    const vendor = first.vendor_id
      ? await prisma.vendors.findUnique({
          where: { id: first.vendor_id },
          select: { company_name: true },
        })
      : null;
    return mapAccommodation({ ...first, vendor_name: vendor?.company_name || null });
  });
export const getCarListings = defineOperation({ method: 'GET' }).handler(async () => {
  await ensureRichInventoryTables();
  return (
    await prisma.car_listings.findMany({
      where: { is_active: true, approval_status: 'approved' },
      orderBy: [{ location: 'asc' }, { price_inr: 'asc' }],
    })
  ).map(mapCar);
});
export const getCarBySlug = defineOperation({ method: 'GET' })
  .validator(z.object({ slug: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    const first = await prisma.car_listings.findFirst({
      where: {
        ...(data?.slug ? { slug: data.slug } : {}),
        is_active: true,
        approval_status: 'approved',
      },
      ...(!data?.slug ? { orderBy: { rating: 'desc' } } : {}),
    });
    return first ? mapCar(first) : null;
  });
export const adminCreateAccommodation = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      type: z.enum(['venue', 'villa', 'resort', 'apartment', 'cabin']),
      name: z.string().min(1),
      location: z.string().min(1),
      country: z.string().min(1),
      venue_address: z.string().optional(),
      description: z.string().min(1),
      price_inr: z.number().min(1),
      image_key: z.string().min(1),
      image_url: z.string().nullable().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      vendor_id: z.number().nullable().optional(),
      b2b_price: z.number().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    const created = await prisma.accommodation_listings.create({
      data: {
        slug: slugifyInventory(`${data.location}-${data.name}`),
        type: data.type,
        name: data.name,
        destination: data.location,
        country: data.country,
        location: data.venue_address || data.location,
        description: data.description,
        price_inr: data.price_inr,
        phone: data.phone || null,
        email: data.email || null,
        vendor_id: data.vendor_id ?? null,
        b2b_price: data.b2b_price ?? 0,
        rating: 4.7,
        review_count: 0,
        beds: 1,
        baths: 1,
        guests: 2,
        amenities: JSON.stringify(['Wifi', 'Concierge']),
        image_key: data.image_key,
        image_url: data.image_url || null,
        latitude: 0,
        longitude: 0,
        tags: JSON.stringify([data.type]),
        host_name: 'MooN Local Host',
      },
    });
    return { success: true, id: created.id };
  });
export const adminUpdateAccommodation = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      type: z.enum(['venue', 'villa', 'resort', 'apartment', 'cabin']),
      name: z.string().min(1),
      location: z.string().min(1),
      country: z.string().min(1),
      venue_address: z.string().optional(),
      description: z.string().min(1),
      price_inr: z.number().min(1),
      image_key: z.string().min(1),
      image_url: z.string().nullable().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      vendor_id: z.number().nullable().optional(),
      b2b_price: z.number().nullable().optional(),
      is_active: z.number().min(0).max(1).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    await prisma.accommodation_listings.update({
      where: { id: data.id },
      data: {
        type: data.type,
        name: data.name,
        destination: data.location,
        country: data.country,
        location: data.venue_address || data.location,
        description: data.description,
        price_inr: data.price_inr,
        phone: data.phone || null,
        email: data.email || null,
        vendor_id: data.vendor_id ?? null,
        b2b_price: data.b2b_price ?? 0,
        image_key: data.image_key,
        image_url: data.image_url || null,
        is_active: Boolean(data.is_active ?? 1),
      },
    });
    return { success: true };
  });
export const adminDeleteAccommodation = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    await prisma.accommodation_listings.update({
      where: { id: data.id },
      data: { is_active: false },
    });
    return { success: true };
  });
export const adminCreateCar = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      country: z.string().min(1),
      vehicle_type: z.string().min(1),
      seats: z.number().min(1),
      luggage: z.number().min(0),
      price_inr: z.number().min(1),
      image_key: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    await prisma.car_listings.create({
      data: {
        slug: slugifyInventory(`${data.location}-${data.name}`),
        name: data.name,
        location: data.location,
        country: data.country,
        vehicle_type: data.vehicle_type,
        seats: data.seats,
        luggage: data.luggage,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        driver_included: true,
        eventSite_pickup: true,
        price_inr: data.price_inr,
        rating: 4.7,
        image_key: data.image_key,
        features: JSON.stringify(['Driver included', 'EventSite pickup']),
        latitude: 0,
        longitude: 0,
      },
    });
    return { success: true };
  });
export const adminUpdateCar = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.number(),
      name: z.string().min(1),
      location: z.string().min(1),
      country: z.string().min(1),
      vehicle_type: z.string().min(1),
      seats: z.number().min(1),
      luggage: z.number().min(0),
      price_inr: z.number().min(1),
      image_key: z.string().min(1),
      is_active: z.number().min(0).max(1).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    await prisma.car_listings.update({
      where: { id: data.id },
      data: {
        name: data.name,
        location: data.location,
        country: data.country,
        vehicle_type: data.vehicle_type,
        seats: data.seats,
        luggage: data.luggage,
        price_inr: data.price_inr,
        image_key: data.image_key,
        is_active: Boolean(data.is_active ?? 1),
      },
    });
    return { success: true };
  });
export const adminDeleteCar = defineOperation({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    await prisma.car_listings.update({ where: { id: data.id }, data: { is_active: false } });
    return { success: true };
  });
export const vendorApplicationSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  whatsapp: z.string().optional(),
  serviceCategories: z
    .array(
      z.enum([
        'venue',
        'photography',
        'decoration',
        'catering',
        'organizer',
        'production',
        'entertainment',
        'logistics',
        'staffing',
      ]),
    )
    .min(1),
  coverageAreas: z.string().min(2),
  address: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  imageKey: z.string().min(1).default('hyderabad'),
});
export const vendorAuthSchema = adminAuthSchema;
export async function requireVendor(auth) {
  await ensureRichInventoryTables();
  await ensureAuthSessionTable();
  const crypto = await import('node:crypto');
  const tokenHash = crypto.createHash('sha256').update(auth.sessionToken).digest('hex');
  const user = await prisma.customerUser.findUnique({ where: { email: auth.email.toLowerCase() } });
  if (!user) throw new Error('Vendor access denied');
  const session = await prisma.auth_sessions.findFirst({
    where: {
      user_id: user.id,
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
  });
  const vendor = session
    ? await prisma.vendors.findFirst({
        where: { email: auth.email.toLowerCase(), status: 'approved' },
      })
    : null;
  if (!vendor) throw new Error('Vendor access denied');
  return mapVendor(vendor);
}
export function mapVendor(row) {
  return {
    ...row,
    service_categories: parseJsonArray(row.service_categories),
  };
}
export function mapRevision(row) {
  return {
    ...row,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
  };
}
export const submitVendorApplication = defineOperation({ method: 'POST' })
  .validator(vendorApplicationSchema)
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    const slug = slugifyInventory(data.companyName);
    const existing = await prisma.vendors.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    const vendorData = {
      company_name: data.companyName,
      contact_name: data.contactName,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      service_categories: JSON.stringify(data.serviceCategories),
      coverage_areas: data.coverageAreas,
      address: data.address || null,
      website_url: data.websiteUrl || null,
      bio: data.bio || null,
      logo_url: data.logoUrl || null,
      cover_image_url: data.coverImageUrl || null,
      image_key: data.imageKey,
    };
    if (existing)
      await prisma.vendors.update({
        where: { id: existing.id },
        data: {
          ...vendorData,
          ...(existing.status === 'approved' ? {} : { status: 'pending_review' }),
        },
      });
    else
      await prisma.vendors.create({
        data: {
          slug,
          email: data.email.toLowerCase(),
          status: 'pending_review',
          ...vendorData,
        },
      });
    return { success: true };
  });
export const getApprovedVendors = defineOperation({ method: 'GET' }).handler(async () => {
  await ensureRichInventoryTables();
  return (
    await prisma.vendors.findMany({
      where: { status: 'approved' },
      include: {
        service_offerings: {
          where: { is_active: true, is_public: true },
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: { company_name: 'asc' },
    })
  ).map(mapVendor);
});
export const getVendorBySlug = defineOperation({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    await ensureRichInventoryTables();
    const vendor = await prisma.vendors.findFirst({
      where: { slug: data.slug, status: 'approved' },
      include: {
        service_offerings: {
          where: { is_active: true, is_public: true },
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
      },
    });
    return vendor ? mapVendor(vendor) : null;
  });
export const getMyVendorProfile = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: vendorAuthSchema }))
  .handler(async ({ data }) => requireVendor(data.auth));
export const revisionPayloadSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  type: z.enum(['venue', 'villa', 'resort', 'apartment', 'cabin']).optional(),
  location: z.string().min(1),
  country: z.string().min(1),
  venue_address: z.string().optional(),
  place: z.string().optional(),
  description: z.string().min(1),
  price_inr: z.number().min(1),
  rating: z.number().min(0).max(5).optional(),
  beds: z.number().min(0).optional(),
  baths: z.number().min(0).optional(),
  guests: z.number().min(1).optional(),
  seats: z.number().min(1).optional(),
  luggage: z.number().min(0).optional(),
  vehicle_type: z.string().optional(),
  transmission: z.string().optional(),
  fuel_type: z.string().optional(),
  driver_included: z.boolean().optional(),
  eventSite_pickup: z.boolean().optional(),
  duration: z.string().optional(),
  group_size: z.number().min(1).optional(),
  meeting_point: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  image_key: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal('')),
  image_source: z.string().optional(),
  image_source_url: z.string().url().optional().or(z.literal('')),
  image_photographer: z.string().optional(),
});
export const vendorSubmitListingRevision = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: vendorAuthSchema,
      listingType: z.enum(['accommodation', 'car']),
      listingId: z.number().optional(),
      payload: revisionPayloadSchema,
    }),
  )
  .handler(async ({ data }) => {
    const vendor = await requireVendor(data.auth);
    await prisma.listing_revisions.create({
      data: {
        vendor_id: vendor.id,
        listing_type: data.listingType,
        listing_id: data.listingId || null,
        payload: JSON.stringify(data.payload),
        status: 'pending_review',
      },
    });
    return { success: true };
  });
export const vendorGetMyListingRevisions = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: vendorAuthSchema }))
  .handler(async ({ data }) => {
    const vendor = await requireVendor(data.auth);
    return (
      await prisma.listing_revisions.findMany({
        where: { vendor_id: vendor.id },
        orderBy: { created_at: 'desc' },
      })
    ).map((row) => mapRevision({ ...row, vendor_name: vendor.company_name }));
  });
export const vendorUploadAsset = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: vendorAuthSchema,
      originalFilename: z.string().min(1).max(255),
      mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const vendor = await requireVendor(data.auth);
    await ensureAdminTables();
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const crypto = await import('node:crypto');
    const bytes = decodeBase64Strict(data.base64);
    const maxBytes = 5 * 1024 * 1024;
    if (bytes.byteLength > maxBytes) throw new Error('Image must be 5 MB or smaller.');
    const signatures = {
      'image/jpeg': (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
      'image/png': (buf) =>
        buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      'image/webp': (buf) =>
        buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buf.subarray(8, 12).toString('ascii') === 'WEBP',
      'image/avif': (buf) => buf.subarray(4, 12).toString('ascii').includes('ftyp'),
    };
    if (!signatures[data.mimeType](bytes))
      throw new Error('Uploaded file content does not match the selected image type.');
    const ext = data.mimeType === 'image/jpeg' ? 'jpg' : data.mimeType.split('/')[1];
    const storedFilename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storedFilename), bytes, { flag: 'wx' });
    const publicUrl = `/uploads/${storedFilename}`;
    await prisma.uploaded_assets.create({
      data: {
        original_filename: data.originalFilename,
        stored_filename: storedFilename,
        mime_type: data.mimeType,
        byte_size: bytes.byteLength,
        public_url: publicUrl,
        uploaded_by: vendor.email,
      },
    });
    return { success: true, publicUrl };
  });
export const adminUpdateVendor = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      vendorId: z.number(),
      companyName: z.string().min(1, 'Company name is required'),
      contactName: z.string().optional(),
      email: z.string().email('Invalid email').nullable().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      serviceCategories: z.array(z.string()),
      coverageAreas: z.string().optional(),
      address: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal('')),
      bio: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await prisma.vendors.update({
      where: { id: data.vendorId },
      data: {
        company_name: data.companyName,
        contact_name: data.contactName || '',
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || '',
        service_categories: JSON.stringify(data.serviceCategories),
        coverage_areas: data.coverageAreas || '',
        address: data.address || null,
        website_url: data.websiteUrl || null,
        bio: data.bio || '',
      },
    });
    return { success: true };
  });
export const adminGetVendorsAll = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureRichInventoryTables();
    const statusOrder = { pending_review: 0, approved: 1, rejected: 2, suspended: 3 };
    return (
      await prisma.vendors.findMany({
        include: { service_offerings: { orderBy: [{ category: 'asc' }, { name: 'asc' }] } },
        orderBy: { company_name: 'asc' },
      })
    )
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
      .map(mapVendor);
  });
export const adminUpdateVendorStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      vendorId: z.number(),
      status: z.enum(['pending_review', 'approved', 'rejected', 'suspended']),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensureRichInventoryTables();
    await prisma.vendors.update({
      where: { id: data.vendorId },
      data: {
        status: data.status,
        admin_notes: data.notes || null,
        ...(data.status === 'approved'
          ? { approved_by: admin.email, approved_at: new Date() }
          : {}),
      },
    });
    await logAdminAction(admin.email, `vendor_${data.status}`, 'vendor', data.vendorId, null, data);
    return { success: true };
  });
export const adminGetListingRevisions = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureRichInventoryTables();
    const rows = await prisma.listing_revisions.findMany({
      where: data.status ? { status: data.status } : {},
      orderBy: { created_at: 'desc' },
    });
    const vendors = await prisma.vendors.findMany({
      where: { id: { in: [...new Set(rows.map((row) => row.vendor_id))] } },
      select: { id: true, company_name: true },
    });
    const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
    return rows.map((row) =>
      mapRevision({ ...row, vendor_name: vendorsById.get(row.vendor_id) || '' }),
    );
  });
export async function approveListingRevision(revisionId, adminEmail) {
  const revision = await prisma.listing_revisions.findUnique({ where: { id: revisionId } });
  if (!revision) throw new Error('Revision not found');
  const payload =
    typeof revision.payload === 'string' ? JSON.parse(revision.payload) : revision.payload;
  const imageUrl = payload.image_url || null;
  const imageKey = payload.image_key || 'hyderabad';
  const listingId = await prisma.$transaction(async (tx) => {
    let id = revision.listing_id;
    if (revision.listing_type === 'accommodation') {
      const values = {
        vendor_id: revision.vendor_id,
        type: payload.type || 'venue',
        name: payload.name || payload.title,
        destination: payload.location,
        country: payload.country,
        location: payload.venue_address || payload.place || payload.location,
        description: payload.description,
        price_inr: payload.price_inr,
        rating: payload.rating || 4.7,
        beds: payload.beds || 1,
        baths: payload.baths || 1,
        guests: payload.guests || 2,
        amenities: JSON.stringify(payload.amenities || ['Wifi', 'Concierge']),
        image_url: imageUrl,
        image_key: imageKey,
        image_source: payload.image_source || null,
        image_source_url: payload.image_source_url || null,
        image_photographer: payload.image_photographer || null,
        tags: JSON.stringify(payload.tags || [payload.type || 'venue']),
        host_name: payload.host_name || 'MooN Vendor',
        approval_status: 'approved',
        is_active: true,
        approved_at: new Date(),
      };
      const saved = id
        ? await tx.accommodation_listings.update({ where: { id }, data: values })
        : await tx.accommodation_listings.create({
            data: {
              ...values,
              slug: slugifyInventory(`${payload.location}-${payload.name || payload.title}`),
              review_count: 0,
              latitude: 0,
              longitude: 0,
            },
          });
      id = saved.id;
    } else if (revision.listing_type === 'car') {
      const values = {
        vendor_id: revision.vendor_id,
        name: payload.name || payload.title,
        location: payload.location,
        country: payload.country,
        vehicle_type: payload.vehicle_type || 'Sedan',
        seats: payload.seats || 4,
        luggage: payload.luggage || 2,
        transmission: payload.transmission || 'Automatic',
        fuel_type: payload.fuel_type || 'Petrol',
        driver_included: payload.driver_included ?? true,
        eventSite_pickup: payload.eventSite_pickup ?? true,
        price_inr: payload.price_inr,
        rating: payload.rating || 4.7,
        image_url: imageUrl,
        image_key: imageKey,
        image_source: payload.image_source || null,
        image_source_url: payload.image_source_url || null,
        image_photographer: payload.image_photographer || null,
        features: JSON.stringify(payload.features || ['Driver included']),
        approval_status: 'approved',
        is_active: true,
        approved_at: new Date(),
      };
      const saved = id
        ? await tx.car_listings.update({ where: { id }, data: values })
        : await tx.car_listings.create({
            data: {
              ...values,
              slug: slugifyInventory(`${payload.location}-${payload.name || payload.title}`),
              latitude: 0,
              longitude: 0,
            },
          });
      id = saved.id;
    } else {
      throw new Error('Unsupported listing type');
    }
    await tx.listing_revisions.update({
      where: { id: revisionId },
      data: {
        status: 'approved',
        listing_id: id,
        reviewed_by: adminEmail,
        reviewed_at: new Date(),
      },
    });
    return id;
  });
  return { listingId };
}
export const adminReviewListingRevision = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      revisionId: z.number(),
      action: z.enum(['approve', 'reject']),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.auth);
    await ensureRichInventoryTables();
    if (data.action === 'approve') {
      const result = await approveListingRevision(data.revisionId, admin.email);
      await logAdminAction(
        admin.email,
        'listing_revision_approved',
        'listing_revision',
        data.revisionId,
        null,
        result,
      );
      return { success: true, ...result };
    }
    await prisma.listing_revisions.update({
      where: { id: data.revisionId },
      data: {
        status: 'rejected',
        admin_notes: data.notes || null,
        reviewed_by: admin.email,
        reviewed_at: new Date(),
      },
    });
    await logAdminAction(
      admin.email,
      'listing_revision_rejected',
      'listing_revision',
      data.revisionId,
      null,
      data,
    );
    return { success: true };
  });
// --- NEW DASHBOARD METRICS API ---
export const adminGetDashboardMetrics = defineOperation({ method: 'POST' })
  .validator(z.object({ adminEmail: z.string(), sessionToken: z.string() }))
  .handler(async ({ data }) => {
    await requireLeadStaff({ email: data.adminEmail, sessionToken: data.sessionToken });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    // Real lead metrics come from lead_submissions — the table the CRM
    // actually writes to (marketing_leads is a legacy landing-page table).
    const [
      totalLeads,
      activeLeads,
      todayLeads,
      weekLeads,
      prevWeekLeads,
      convertedLeads,
      totalBookings,
      pendingBookings,
      pendingPayments,
      overdueFollowups,
      quotesSent,
    ] = await Promise.all([
      prisma.lead_submissions.count(),
      prisma.lead_submissions.count({
        where: { status: { in: ['new', 'contacted', 'quote_sent', 'qualified'] } },
      }),
      prisma.lead_submissions.count({ where: { created_at: { gte: today } } }),
      prisma.lead_submissions.count({ where: { created_at: { gte: weekAgo } } }),
      prisma.lead_submissions.count({ where: { created_at: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.lead_submissions.count({ where: { status: 'converted' } }),
      prisma.bookings.count(),
      prisma.bookings.count({ where: { status: 'pending' } }),
      prisma.payment_orders.count({ where: { status: 'pending_verification' } }),
      prisma.lead_followups.count({ where: { status: 'pending', follow_up_date: { lt: now } } }),
      prisma.lead_submissions.count({ where: { status: 'quote_sent' } }),
    ]);
    const [gross, weekRevenueResult, prevWeekRevenueResult, pipeline] = await Promise.all([
      prisma.bookings.aggregate({ where: { status: 'confirmed' }, _sum: { amount: true } }),
      prisma.bookings.aggregate({
        where: { status: 'confirmed', created_at: { gte: weekAgo } },
        _sum: { amount: true },
      }),
      prisma.bookings.aggregate({
        where: { status: 'confirmed', created_at: { gte: twoWeeksAgo, lt: weekAgo } },
        _sum: { amount: true },
      }),
      prisma.crm_deals.aggregate({
        where: { status: 'open' },
        _sum: { value: true },
        _count: true,
      }),
    ]);
    const grossRevenue = Number(gross._sum.amount || 0);
    const weekRevenue = Number(weekRevenueResult._sum.amount || 0);
    const prevWeekRevenue = Number(prevWeekRevenueResult._sum.amount || 0);
    const openPipelineValue = Number(pipeline._sum.value || 0);
    const openDeals = pipeline._count;
    // 14-day pulse: leads created and confirmed revenue per day.
    const pulseStart = new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000);
    const [pulseLeadRows, pulseBookingRows] = await Promise.all([
      prisma.lead_submissions.findMany({
        where: { created_at: { gte: pulseStart } },
        select: { created_at: true },
      }),
      prisma.bookings.findMany({
        where: { status: 'confirmed', created_at: { gte: pulseStart } },
        select: { created_at: true, amount: true },
      }),
    ]);
    const leadsByDay = {};
    const revenueByDay = {};
    for (const row of pulseLeadRows) {
      const key = row.created_at.toISOString().split('T')[0];
      leadsByDay[key] = (leadsByDay[key] || 0) + 1;
    }
    for (const row of pulseBookingRows) {
      const key = row.created_at.toISOString().split('T')[0];
      revenueByDay[key] = (revenueByDay[key] || 0) + row.amount;
    }
    const pulse = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      pulse.push({
        day: label,
        leads: leadsByDay[key] || 0,
        revenue: revenueByDay[key] || 0,
      });
    }
    // Unified activity feed: leads, confirmed bookings, and Maya's actions.
    const [recentLeads, recentBookings, recentMaya] = await Promise.all([
      prisma.lead_submissions.findMany({
        orderBy: { created_at: 'desc' },
        take: 4,
        select: { name: true, location: true, created_at: true },
      }),
      prisma.bookings.findMany({
        where: { status: 'confirmed' },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: { item_name: true, amount: true, created_at: true },
      }),
      prisma.maya_activity_log.findMany({
        where: { status: 'done' },
        orderBy: { id: 'desc' },
        take: 4,
        select: { summary: true, area: true, created_at: true },
      }),
    ]);
    const recentActivity = [
      ...recentLeads.map((row) => ({
        kind: 'lead',
        title: 'New Lead',
        desc: `${row.name}${row.location ? ` · ${row.location}` : ''}`,
        at: row.created_at,
      })),
      ...recentBookings.map((row) => ({
        kind: 'booking',
        title: 'Booking Confirmed',
        desc: `${row.item_name} · ₹${Number(row.amount || 0).toLocaleString('en-IN')}`,
        at: row.created_at,
      })),
      ...recentMaya.map((row) => ({
        kind: 'maya',
        title: 'Maya Autopilot',
        desc: row.summary,
        at: row.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
    return {
      success: true,
      metrics: {
        totalLeads,
        activeLeads,
        todayLeads,
        weekLeads,
        prevWeekLeads,
        convertedLeads,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        totalQuotes: quotesSent,
        totalBookings,
        pendingBookings,
        pendingPayments,
        overdueFollowups,
        grossRevenue,
        weekRevenue,
        prevWeekRevenue,
        grossMargin: Math.round(grossRevenue * 0.25),
        openPipelineValue,
        openDeals,
        pulse,
        recentActivity,
      },
    };
  });
export const adminAiCopilot = defineOperation({ method: 'POST' })
  .validator((data) => {
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin({ email: data.adminEmail, sessionToken: data.sessionToken });
    const briefRes = await adminGetSoloOpsBrief({
      data: { adminEmail: data.adminEmail, sessionToken: data.sessionToken },
    });
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a Senior Events Agency AI Copilot. 
    The user is an agent in the "${data.mode}" mode.
    Here is their question: "${data.question}"
    
    Use the following CRM context to formulate your answer:
    Packages: ${JSON.stringify(briefRes.brief.packages.slice(0, 5))}
    Leads: ${JSON.stringify(briefRes.brief.leads.slice(0, 5))}
    
    Respond in raw JSON format with exactly these two keys:
    {
      "customerReply": "The exact text the agent should send to the customer. Be highly professional, empathetic, and persuasive. Use \\n\\n for paragraphs.",
      "internalActions": ["Action 1", "Action 2", "Action 3"]
    }`;
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('AI Error:', e);
      return {
        customerReply: 'AI Error: Could not generate response. ' + (e.message || ''),
        internalActions: ['Verify API Key', 'Check network connection'],
      };
    }
  });
export const adminGetSoloOpsBrief = defineOperation({ method: 'POST' })
  .validator((data) => {
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin({ email: data.adminEmail, sessionToken: data.sessionToken });
    const packageRows = await prisma.packages.findMany({
      orderBy: [{ is_active: 'desc' }, { id: 'desc' }],
      take: 30,
    });
    const themes = await prisma.package_themes.findMany({
      where: { package_id: { in: packageRows.map((item) => item.id) } },
      orderBy: { theme: 'asc' },
    });
    const themesByPackage = Map.groupBy(themes, (theme) => theme.package_id);
    const leadRows = await prisma.lead_submissions.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    const [pendingLeads, activePackages, bookings, callbacks, approvedVendors, pendingRefunds] =
      await Promise.all([
        prisma.lead_submissions.count({
          where: { status: { in: ['new', 'contacted', 'qualified'] } },
        }),
        prisma.packages.count({ where: { is_active: true } }),
        prisma.bookings.count(),
        prisma.callback_requests.count({ where: { status: 'pending' } }),
        prisma.vendors.count({ where: { status: 'approved' } }),
        prisma.user_refunds.count({
          where: { status: { in: ['initiated', 'admin_review', 'escrow_hold'] } },
        }),
      ]);
    const averagePackagePrice = Number(
      (await prisma.packages.aggregate({ where: { is_active: true }, _avg: { price: true } }))._avg
        .price || 0,
    );
    const brief = {
      packages: packageRows.map((r) => ({
        id: Number(r.id),
        slug: r.slug,
        name: r.name,
        location: r.location,
        country: r.country,
        nights: Number(r.nights || 0),
        days: Number(r.days || 0),
        price: Number(r.price || 0),
        category: r.category,
        is_active: !!r.is_active,
        themes: (themesByPackage.get(r.id) || []).map((theme) => theme.theme),
      })),
      leads: leadRows.map((lead) => ({
        id: Number(lead.id),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        budget_range: lead.budget_range,
        status: lead.status,
        assigned_owner: lead.assigned_owner,
        created_at: lead.created_at,
      })),
      counts: {
        pendingLeads,
        activePackages,
        bookings,
        callbacks,
        approvedVendors,
      },
      finance: {
        averagePackagePrice,
        pendingRefunds,
      },
      playbooks: {
        sales: [
          'Qualify location, dates, clients, budget range, venue level, and event purpose before quoting.',
          'Send one best-fit package and one custom option with clear inclusions, exclusions, and next payment step.',
          'Follow up within 24 hours with a comparison message, not a generic reminder.',
        ],
        product: [
          'Convert repeated customer questions into package FAQs and clearer inclusion copy.',
          'Review low-conversion packages for weak venue clarity, transfer gaps, missing permit notes, or vague pricing.',
          'Keep location pages aligned with live packages, stays, vendors, and permit guidance.',
        ],
        support: [
          'Confirm booking reference, client contact, vendor status, payment state, and promised SLA before replying.',
          'Move urgent events-day issues to phone or WhatsApp, then record the written summary in CRM.',
          'For refunds, verify policy window, vendor liability, payment received, and approval owner.',
        ],
        marketing: [
          'Turn common lead objections into short posts, FAQ snippets, location explainers, and WhatsApp follow-ups.',
          'Attach a specific package or consultation CTA to every campaign message.',
          'Track source, location, and budget so campaigns can be judged by qualified enquiries, not just clicks.',
        ],
        finance: [
          'Protect margin by changing venue level, private transfer count, activity count, or dates before discounting.',
          'Separate package price, vendor cost, deposit received, pending balance, and refund exposure.',
          'Document every discount, refund promise, and vendor penalty before confirming to the customer.',
        ],
        admin: [
          'Every lead needs a status, owner, next action, and next follow-up time.',
          'Keep packages, vendors, permit notes, and refund queues reviewed daily from the same operating screen.',
          'Escalate stale leads, pending callbacks, and refund-review items before starting new marketing pushes.',
        ],
      },
    };
    return { success: true, brief };
  });
// --- MASTER CATALOG & ERP CATALOG API ---
export const adminGetCatalogPricing = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const catalogType = normalizeCatalogType(data.catalogType);
    const rows = await prisma.catalog_rate_cards.findMany({
      where: { catalog_type: catalogType, catalog_id: data.catalogId },
      orderBy: [{ is_active: 'desc' }, { valid_from: 'desc' }, { id: 'desc' }],
    });
    const vendors = await prisma.vendors.findMany({
      where: { id: { in: rows.flatMap((row) => (row.vendor_id ? [row.vendor_id] : [])) } },
      select: { id: true, company_name: true },
    });
    const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
    return {
      success: true,
      pricing: rows.map((row) => ({
        ...row,
        vendor_name: row.vendor_id ? vendorsById.get(row.vendor_id) || null : null,
        vendor_id: row.vendor_id ? Number(row.vendor_id) : null,
        net_cost: Number(row.net_cost),
        margin_percent: Number(row.margin_percent),
        selling_price: Number(row.selling_price),
        is_active: Number(row.is_active),
      })),
    };
  });
export const adminSaveCatalogPricing = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const catalogType = normalizeCatalogType(data.catalogType);
    const catalogId = Number(data.catalogId);
    const rates = Array.isArray(data.rates)
      ? data.rates
      : [
          {
            id: data.id,
            vendor_id: data.vendorId || data.vendor_id || null,
            unit_type: data.unitType || data.unit_type || 'fixed',
            net_cost: data.netCost ?? data.net_cost ?? 0,
            margin_percent: data.marginPercent ?? data.margin_percent ?? 25,
            selling_price:
              data.sellingPrice ??
              data.selling_price ??
              calculateSellingPrice(
                Number(data.netCost ?? data.net_cost ?? 0),
                Number(data.marginPercent ?? data.margin_percent ?? 25),
              ),
            currency: data.currency || 'INR',
            valid_from: data.validFrom || data.valid_from || null,
            valid_to: data.validTo || data.valid_to || null,
            min_pax: data.minPax || data.min_pax || null,
            occupancy: data.occupancy || null,
            is_active: data.is_active ?? true,
          },
        ];
    if (data.replaceAll) {
      await prisma.catalog_rate_cards.deleteMany({
        where: { catalog_type: catalogType, catalog_id: catalogId },
      });
    }
    for (const rate of rates) {
      const vendorId = rate.vendor_id || rate.vendorId || null;
      const netCost = Number(rate.net_cost ?? rate.netCost ?? 0);
      const marginPercent = Number(rate.margin_percent ?? rate.marginPercent ?? 25);
      const sellingPrice = Number(
        rate.selling_price ?? rate.sellingPrice ?? calculateSellingPrice(netCost, marginPercent),
      );
      if (rate.id) {
        await prisma.catalog_rate_cards.update({
          where: { id: rate.id },
          data: {
            vendor_id: vendorId,
            unit_type: rate.unit_type || rate.unitType || 'fixed',
            net_cost: netCost,
            margin_percent: marginPercent,
            selling_price: sellingPrice,
            currency: rate.currency || 'INR',
            valid_from:
              rate.valid_from || rate.validFrom
                ? new Date(rate.valid_from || rate.validFrom)
                : null,
            valid_to:
              rate.valid_to || rate.validTo ? new Date(rate.valid_to || rate.validTo) : null,
            min_pax: rate.min_pax || rate.minPax || null,
            occupancy: rate.occupancy || null,
            is_active: rate.is_active ?? true,
          },
        });
      } else {
        await prisma.catalog_rate_cards.create({
          data: {
            catalog_type: catalogType,
            catalog_id: catalogId,
            vendor_id: vendorId,
            unit_type: rate.unit_type || rate.unitType || 'fixed',
            net_cost: netCost,
            margin_percent: marginPercent,
            selling_price: sellingPrice,
            currency: rate.currency || 'INR',
            valid_from:
              rate.valid_from || rate.validFrom
                ? new Date(rate.valid_from || rate.validFrom)
                : null,
            valid_to:
              rate.valid_to || rate.validTo ? new Date(rate.valid_to || rate.validTo) : null,
            min_pax: rate.min_pax || rate.minPax || null,
            occupancy: rate.occupancy || null,
            is_active: rate.is_active ?? true,
          },
        });
      }
    }
    return { success: true };
  });
export const adminGetCatalogMedia = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const rows = await prisma.catalog_media.findMany({
      where: {
        catalog_type: data.catalogType,
        catalog_id: data.catalogId,
      },
      orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }, { id: 'asc' }],
    });
    return { success: true, media: rows };
  });
export const adminSaveCatalogMedia = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const catalogType = data.catalogType;
    const catalogId = Number(data.catalogId);
    const media = Array.isArray(data.media) ? data.media : [];
    await prisma.$transaction(async (tx) => {
      await tx.catalog_media.deleteMany({
        where: { catalog_type: catalogType, catalog_id: catalogId },
      });
      const items = media.flatMap((item, index) =>
        item.media_path
          ? [
              {
                catalog_type: catalogType,
                catalog_id: catalogId,
                media_type: item.media_type || 'image',
                media_path: item.media_path,
                is_primary: Boolean(item.is_primary),
                sort_order: item.sort_order ?? index,
                alt_text: item.alt_text || null,
              },
            ]
          : [],
      );
      if (items.length) await tx.catalog_media.createMany({ data: items });
    });
    return { success: true };
  });
export const adminGetCatalogFeatures = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const rows = await prisma.catalog_features.findMany({
      where: { catalog_type: data.catalogType, catalog_id: data.catalogId },
      orderBy: { id: 'asc' },
    });
    return { success: true, features: rows };
  });
export const adminSaveCatalogFeatures = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureMasterCatalogTables();
    const features = Array.isArray(data.features) ? data.features : [];
    await prisma.$transaction(async (tx) => {
      await tx.catalog_features.deleteMany({
        where: { catalog_type: data.catalogType, catalog_id: data.catalogId },
      });
      const items = features.flatMap((feature) =>
        feature.title
          ? [
              {
                catalog_type: data.catalogType,
                catalog_id: data.catalogId,
                feature_type: feature.feature_type || 'inclusion',
                title: feature.title,
                description: feature.description || null,
                vendor_id: feature.vendor_id || null,
                net_cost: Number(feature.net_cost || 0),
                selling_price: Number(feature.selling_price || 0),
              },
            ]
          : [],
      );
      if (items.length) await tx.catalog_features.createMany({ data: items });
    });
    return { success: true };
  });
export const adminGetMasterCatalog = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureMasterCatalogTables();
    const types =
      data.catalogType && data.catalogType !== 'all'
        ? [data.catalogType]
        : ['stay', 'room', 'activity', 'car'];
    const items = [];
    for (const type of types) {
      const where = {
        ...(data.location ? { destination: data.location } : {}),
        ...(data.status && data.status !== 'all' ? { status: data.status } : {}),
      };
      const rows =
        type === 'stay'
          ? await prisma.master_stays.findMany({
              where,
              orderBy: [{ destination: 'asc' }, { name: 'asc' }],
            })
          : type === 'room'
            ? await prisma.master_rooms.findMany({
                where,
                orderBy: [{ destination: 'asc' }, { name: 'asc' }],
              })
            : type === 'activity'
              ? await prisma.master_activities.findMany({
                  where,
                  orderBy: [{ destination: 'asc' }, { name: 'asc' }],
                })
              : await prisma.master_cars.findMany({
                  where,
                  orderBy: [{ destination: 'asc' }, { name: 'asc' }],
                });
      for (const row of rows) {
        items.push({
          id: Number(row.id),
          catalog_type: type,
          name: row.name,
          location: row.destination,
          country: row.country,
          subtype: row.type || row.room_type || row.vehicle_type || null,
          parent_id: row.stay_id || null,
          venue_address: row.location || row.place || null,
          description: row.description || null,
          duration: row.duration || null,
          capacity: row.capacity || null,
          seats: row.seats || null,
          luggage: row.luggage || null,
          meal_plan: row.meal_plan || null,
          occupancy: row.occupancy || null,
          status: row.status,
          image_url: row.image_url || null,
        });
      }
    }
    const [vendorRows, coverageRows, amenityRows] = await Promise.all([
      prisma.vendors.findMany({ orderBy: { company_name: 'asc' } }),
      prisma.vendor_service_coverage.findMany({ orderBy: { destination: 'asc' } }),
      prisma.catalog_amenities.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
    ]);
    const vendorsById = new Map(vendorRows.map((vendor) => [vendor.id, vendor.company_name]));
    return {
      success: true,
      items,
      vendors: vendorRows.map(mapVendor),
      coverage: coverageRows.map((row) => ({
        ...row,
        location: row.destination,
        vendor_name: vendorsById.get(row.vendor_id) || null,
      })),
      amenities: amenityRows,
    };
  });
export const adminUpsertMasterCatalogItem = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureMasterCatalogTables();
    const item = data.item;
    const type = normalizeCatalogType(item.catalog_type);
    const status = item.status || 'active';
    if (type === 'stay') {
      const slug = slugifyInventory(`${item.location}-${item.name}`);
      const values = {
        name: item.name,
        type: item.subtype || 'venue',
        destination: item.location,
        country: item.country,
        location: item.venue_address || item.location,
        description: item.description || null,
        status,
        image_url: item.image_url || null,
      };
      const saved = item.id
        ? await prisma.master_stays.update({ where: { id: item.id }, data: values })
        : await prisma.master_stays.create({ data: { slug, ...values } });
      return { success: true, id: saved.id };
    }
    if (type === 'room') {
      const values = {
        stay_id: item.parent_id || null,
        name: item.name,
        room_type: item.subtype || 'standard',
        destination: item.location,
        country: item.country,
        occupancy: item.occupancy || 2,
        meal_plan: item.meal_plan || null,
        description: item.description || null,
        status,
        image_url: item.image_url || null,
      };
      const saved = item.id
        ? await prisma.master_rooms.update({ where: { id: item.id }, data: values })
        : await prisma.master_rooms.create({ data: values });
      return { success: true, id: saved.id };
    }
    if (type === 'activity') {
      const slug = slugifyInventory(`${item.location}-${item.name}`);
      const values = {
        name: item.name,
        destination: item.location,
        country: item.country,
        place: item.location || null,
        description: item.description || null,
        duration: item.duration || null,
        capacity: item.capacity || null,
        status,
        image_url: item.image_url || null,
      };
      const saved = item.id
        ? await prisma.master_activities.update({ where: { id: item.id }, data: values })
        : await prisma.master_activities.create({ data: { slug, ...values } });
      return { success: true, id: saved.id };
    }
    const slug = slugifyInventory(`${item.location}-${item.name}`);
    const values = {
      name: item.name,
      destination: item.location,
      country: item.country,
      vehicle_type: item.subtype || 'sedan',
      seats: item.seats || 4,
      luggage: item.luggage || 2,
      description: item.description || null,
      status,
      image_url: item.image_url || null,
    };
    const saved = item.id
      ? await prisma.master_cars.update({ where: { id: item.id }, data: values })
      : await prisma.master_cars.create({ data: { slug, ...values } });
    return { success: true, id: saved.id };
  });
export const adminArchiveMasterCatalogItem = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureMasterCatalogTables();
    if (data.catalogType === 'stay')
      await prisma.master_stays.update({ where: { id: data.id }, data: { status: 'archived' } });
    else if (data.catalogType === 'room')
      await prisma.master_rooms.update({ where: { id: data.id }, data: { status: 'archived' } });
    else if (data.catalogType === 'activity')
      await prisma.master_activities.update({
        where: { id: data.id },
        data: { status: 'archived' },
      });
    else await prisma.master_cars.update({ where: { id: data.id }, data: { status: 'archived' } });
    return { success: true };
  });
export const adminSaveVendorCoverage = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureMasterCatalogTables();
    for (const row of data.coverage || []) {
      if (!row.vendor_id || !row.location || !row.service_type) continue;
      await prisma.vendor_service_coverage.upsert({
        where: {
          vendor_id_service_type_destination: {
            vendor_id: row.vendor_id,
            service_type: row.service_type,
            destination: row.location,
          },
        },
        create: {
          vendor_id: row.vendor_id,
          service_type: row.service_type,
          destination: row.location,
          country: row.country || null,
          is_active: row.is_active ?? true,
          notes: row.notes || null,
        },
        update: {
          country: row.country || null,
          is_active: row.is_active ?? true,
          notes: row.notes || null,
          updated_at: new Date(),
        },
      });
    }
    return { success: true };
  });
export const adminGetPackageBuilderInventory = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    const statePattern =
      /(andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|amaravati)/i.test(
        data.location,
      )
        ? /(andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|amaravati)/i
        : /(telangana|hyderabad|secunderabad|warangal|nizamabad|karimnagar|khammam)/i;
    const vendors = (
      await prisma.vendors.findMany({
        where: { status: 'approved' },
        include: {
          service_offerings: {
            where: { is_active: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
          },
        },
        orderBy: { company_name: 'asc' },
      })
    ).filter((vendor) => statePattern.test(`${vendor.coverage_areas} ${vendor.address || ''}`));
    return {
      success: true,
      items: vendors.flatMap((vendor) =>
        vendor.service_offerings.map((service) => ({
          id: vendor.id,
          vendor_service_id: service.id,
          catalog_type: 'vendor',
          name: service.name,
          vendor_name: vendor.company_name,
          location: vendor.coverage_areas,
          country: 'India',
          subtype: service.category,
          description: service.description || vendor.bio,
          rates: [
            {
              id: null,
              vendor_service_id: service.id,
              vendor_id: vendor.id,
              vendor_name: vendor.company_name,
              unit_type: service.unit_type,
              net_cost: Number(service.net_cost),
              selling_price: Number(service.net_cost),
              currency: 'INR',
            },
          ],
        })),
      ),
      vendors,
    };
  });
export const adminImportMasterCatalog = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    await ensureMasterCatalogTables();
    const errors = [];
    const imported = [];
    for (const [index, raw] of (data.rows || []).entries()) {
      const rowNumber = index + 2;
      const catalogTypeRaw = String(raw.catalog_type || raw.type || '')
        .trim()
        .toLowerCase();
      let catalogType;
      try {
        catalogType = normalizeCatalogType(catalogTypeRaw);
      } catch {
        errors.push({ row: rowNumber, error: 'catalog_type must be stay, room, activity, or car' });
        continue;
      }
      const name = String(raw.name || raw.room_type || raw.stay_name || '').trim();
      const location = String(raw.location || '').trim();
      const country = String(raw.country || '').trim();
      if (!name || !location || !country) {
        errors.push({ row: rowNumber, error: 'name, location, and country are required' });
        continue;
      }
      if (!data.commit) continue;
      const upsert = await adminUpsertMasterCatalogItem({
        data: {
          auth: data.auth,
          item: {
            catalog_type: catalogType,
            name,
            location,
            country,
            subtype: raw.stay_type || raw.vehicle_type || raw.room_type || null,
            venue_address: raw.location || raw.place || null,
            description: raw.description || null,
            duration: raw.duration || null,
            capacity: raw.capacity ? Number(raw.capacity) : null,
            seats: raw.seats ? Number(raw.seats) : null,
            luggage: raw.luggage ? Number(raw.luggage) : null,
            occupancy: raw.occupancy ? Number(raw.occupancy) : null,
            meal_plan: raw.meal_plan || null,
            status: raw.status || 'active',
            image_url: raw.image_url || null,
          },
        },
      });
      imported.push(upsert.id);
      const netCost = Number(raw.net_cost || 0);
      const margin = Number(raw.markup_percent || raw.margin_percent || 25);
      const selling = Number(raw.selling_price || calculateSellingPrice(netCost, margin));
      if (netCost || selling) {
        await adminSaveCatalogPricing({
          data: {
            auth: data.auth,
            catalogType,
            catalogId: upsert.id,
            unitType: raw.unit_type || 'fixed',
            netCost,
            marginPercent: margin,
            sellingPrice: selling,
            currency: raw.currency || 'INR',
            validFrom: raw.valid_from || null,
            validTo: raw.valid_to || null,
          },
        });
      }
      if (raw.image_url) {
        await adminSaveCatalogMedia({
          data: {
            auth: data.auth,
            catalogType,
            catalogId: upsert.id,
            media: [
              {
                media_type: 'image',
                media_path: raw.image_url,
                is_primary: true,
                sort_order: 0,
                alt_text: name,
              },
            ],
          },
        });
      }
    }
    return {
      success: errors.length === 0,
      errors,
      importedCount: imported.length,
      validCount: (data.rows || []).length - errors.length,
    };
  });
// Also cars?
export const adminGetCarListingsAll = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureRichInventoryTables();
    const pool = await getDbPool();
    const [rows] = await pool.query(
      'SELECT c.*, c.destination AS location, v.company_name as vendor_name FROM car_listings c LEFT JOIN vendors v ON c.vendor_id = v.id ORDER BY c.destination ASC, c.name ASC',
    );
    return rows.map((r) => ({
      ...mapCar(r),
      vendor_id: r.vendor_id,
      b2b_price: r.b2b_price,
      vendor_name: r.vendor_name,
    }));
  });
export const adminCreateCarListing = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureRichInventoryTables();
    const pool = await getDbPool();
    const [result] = await pool.query(
      `INSERT INTO car_listings
     (slug, name, destination, country, vehicle_type, seats, luggage, transmission, fuel_type, phone, email, driver_included, airport_pickup, price_inr, vendor_id, b2b_price, rating, image_url, image_key, features, latitude, longitude, approval_status, is_active, approved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, 4.7, ?, ?, ?, 0, 0, 'approved', 1, NOW())`,
      [
        slugifyInventory(`${data.location}-${data.name}`),
        data.name,
        data.location,
        data.country || '',
        data.vehicle_type || data.type || 'sedan',
        Number(data.seats || 4),
        Number(data.luggage || 2),
        data.transmission || 'Automatic',
        data.fuel_type || 'Petrol',
        data.phone || null,
        data.email || null,
        Number(data.price_inr || 1),
        data.vendor_id || null,
        Number(data.b2b_price || 0),
        data.image_url || null,
        data.image_key || 'hyderabad',
        JSON.stringify(data.features || ['Driver included']),
      ],
    );
    return { success: true, id: result.insertId };
  });
export const adminUpdateCarListing = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureRichInventoryTables();
    const pool = await getDbPool();
    await pool.query(
      `UPDATE car_listings
     SET name = ?, destination = ?, country = ?, vehicle_type = ?, seats = ?, luggage = ?, transmission = ?, fuel_type = ?, phone = ?, email = ?, price_inr = ?, vendor_id = ?, b2b_price = ?, image_url = ?, image_key = ?, is_active = ?
     WHERE id = ?`,
      [
        data.name,
        data.location,
        data.country || '',
        data.vehicle_type || data.type || 'sedan',
        Number(data.seats || 4),
        Number(data.luggage || 2),
        data.transmission || 'Automatic',
        data.fuel_type || 'Petrol',
        data.phone || null,
        data.email || null,
        Number(data.price_inr || 1),
        data.vendor_id || null,
        Number(data.b2b_price || 0),
        data.image_url || null,
        data.image_key || 'hyderabad',
        data.is_active ?? 1,
        data.id,
      ],
    );
    return { success: true };
  });
export const adminDeleteCarListing = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async ({ data }) => {
    await requireAdminFromLooseData(data);
    await ensureRichInventoryTables();
    const pool = await getDbPool();
    await pool.query(
      "UPDATE car_listings SET is_active = 0, approval_status = 'unpublished' WHERE id = ?",
      [data.id],
    );
    return { success: true };
  });
// Packages?
export const adminCreatePackageFull = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async () => {
    return { success: true };
  });
export const adminUpdatePackageFull = defineOperation({ method: 'POST' })
  .validator((d) => d)
  .handler(async () => {
    return { success: true };
  });
// --- TEMPLATES API STUBS (removed to fix duplicate declaration error) ---
export const adminSaveEmailTemplate = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    return { success: true };
  });
export const adminGetBookingsAll = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    const pool = await getDbPool();
    const [rows] =
      await pool.query(`SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, o.company_name as operator_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN operators o ON b.operator_id = o.id
       ORDER BY b.created_at DESC`);
    return rows;
  });
// --- WHATSAPP QUOTE INTEGRATION STUB ---
export const sendWhatsAppQuote = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      leadId: z.number(),
      leadPhone: z.string(),
      leadName: z.string(),
      packageName: z.string(),
      packagePrice: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    // GUARDRAIL: a firm WhatsApp quote may only go out for a REAL, active
    // catalogue package — its price is a genuine, bindable number. Bespoke
    // runOfShows and any AI-estimated price must instead go through the
    // confidence-gated custom-quote flow (adminBuildCustomQuote), which refuses
    // to firm-quote anything not backed by a live rate card.
    const pkg = await prisma.packages.findFirst({
      where: { is_active: true, name: { contains: data.packageName } },
      select: { id: true, name: true, price: true },
    });
    if (!pkg) {
      throw new Error(
        `Refusing to send a firm quote for "${data.packageName}": no matching active catalogue package. ` +
          'Use the rate-card-backed custom-quote flow for bespoke runOfShows so a hallucinated or estimated price is never sent to a customer.',
      );
    }
    const message =
      `Hi ${data.leadName}, here's your quote for ${data.packageName}: ` +
      `₹${Number(data.packagePrice).toLocaleString('en-IN')}. ` +
      `Reply here and our team will help you book.\n\n— Maya, MooNs Events`;
    const delivery = await whatsappService.sendText(data.leadPhone, message);
    // Auto-progress pipeline
    try {
      const pool = await getDbPool();
      await pool.query(
        "UPDATE lead_submissions SET status = 'quote_sent' WHERE id = ? AND status IN ('new', 'contacted')",
        [data.leadId],
      );
    } catch (e) {
      console.error('Failed to auto-update lead status to quote_sent', e);
    }
    return { success: delivery.ok, channel: delivery.channel, packageId: pkg.id };
  });
// --- CLIENT LOUNGE INTEGRATION ---
export async function ensureLoungeCommentsTableImpl() {
  const pool = await getDbPool();
  await resolve();
}
export const submitLoungeComment = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      packageId: z.number(),
      author: z.string().min(1),
      commentText: z.string().min(1),
      dayNumber: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureLoungeCommentsTable();
    await pool.query(
      `INSERT INTO client_lounge_comments (package_id, author, comment_text, day_number)
       VALUES (?, ?, ?, ?)`,
      [data.packageId, data.author, data.commentText, data.dayNumber],
    );
    return { success: true };
  });
export const getLoungeComments = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      packageId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureLoungeCommentsTable();
    const [rows] = await pool.query(
      `SELECT * FROM client_lounge_comments
       WHERE package_id = ?
       ORDER BY created_at DESC`,
      [data.packageId],
    );
    return rows;
  });
// --- GLOBAL CHAT API ---
export async function ensureGlobalChatTablesImpl() {
  const pool = await getDbPool();
  await resolve();
  await resolve();
  await resolve();
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  await resolve();
  await resolve();
  await resolve();
  await resolve();
}
export async function attachGlobalChatReactions(pool, rows, currentEntityId, currentEntityType) {
  if (rows.length === 0) return rows.map((row) => ({ ...row, reactions: [], myReaction: null }));
  const messageIds = rows.map((row) => row.id).filter((id) => Number.isFinite(Number(id)));
  if (messageIds.length === 0)
    return rows.map((row) => ({ ...row, reactions: [], myReaction: null }));
  const placeholders = messageIds.map(() => '?').join(',');
  const [reactionRows] = await pool.query(
    `SELECT message_id, emoji, COUNT(*) AS count,
            MAX(CASE WHEN entity_id = ? AND entity_type = ? THEN 1 ELSE 0 END) AS is_mine
     FROM global_chat_reactions
     WHERE message_id IN (${placeholders})
     GROUP BY message_id, emoji
     ORDER BY MIN(created_at) ASC`,
    [currentEntityId, currentEntityType, ...messageIds],
  );
  const reactionsByMessage = new Map();
  let myReactionByMessage = new Map();
  for (const reaction of reactionRows) {
    const messageId = Number(reaction.message_id);
    const summary = {
      emoji: String(reaction.emoji),
      count: Number(reaction.count) || 0,
      isMine: Boolean(reaction.is_mine),
    };
    const existing = reactionsByMessage.get(messageId) || [];
    existing.push(summary);
    reactionsByMessage.set(messageId, existing);
    if (summary.isMine) myReactionByMessage.set(messageId, summary.emoji);
  }
  return rows.map((row) => ({
    ...row,
    reactions: reactionsByMessage.get(Number(row.id)) || [],
    myReaction: myReactionByMessage.get(Number(row.id)) || null,
  }));
}
export async function requireCustomerChatStaff(auth) {
  const staff = await requireLeadStaff(auth);
  const pool = await getDbPool();
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.role,
            GROUP_CONCAT(ur.role ORDER BY FIELD(ur.role, 'admin', 'sales', 'support', 'editor', 'approver', 'viewer')) AS roles_csv
     FROM crm_users u
     LEFT JOIN crm_user_roles ur ON ur.user_id = u.id
     WHERE LOWER(u.email) = LOWER(?)
     GROUP BY u.id, u.name, u.email, u.role
     LIMIT 1`,
    [staff.email],
  );
  const users = rows;
  if (!users[0]) throw new Error('Chat staff not found');
  const roles = new Set([users[0].role, ...(users[0].roles_csv || '').split(',').filter(Boolean)]);
  const chatRole = ['admin', 'sales', 'support'].find((role) => roles.has(role));
  if (!chatRole) throw new Error('Customer chats are restricted to admin, sales, and support');
  return {
    id: String(users[0].id),
    name: users[0].name || users[0].email,
    email: users[0].email,
    role: chatRole,
  };
}
export async function autoAssignExpiredCustomerChats(pool) {
  const [expiredRows] = await pool.query(`SELECT *
     FROM global_chat_requests
     WHERE status = 'pending' AND expires_at <= NOW()
     ORDER BY expires_at ASC`);
  const expired = expiredRows;
  if (expired.length === 0) return;
  const [adminRows] = await pool.query(`SELECT u.id, u.name, u.email, u.role
     FROM crm_users u
     WHERE u.role = 'admin'
        OR EXISTS (SELECT 1 FROM crm_user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin')
     ORDER BY u.id ASC
     LIMIT 1`);
  const admin = adminRows[0];
  for (const request of expired) {
    if (admin) {
      const adminName = admin.name || admin.email;
      await pool.query(
        `UPDATE global_chat_requests
         SET status = 'active',
             assigned_employee_id = ?,
             assigned_employee_name = ?,
             assigned_employee_role = 'admin',
             accepted_at = COALESCE(accepted_at, NOW())
         WHERE id = ? AND status = 'pending'`,
        [String(admin.id), adminName, request.id],
      );
      await pool.query(
        `INSERT INTO global_chat_messages
         (request_id, sender_id, sender_type, receiver_id, receiver_type, message_type, message_text)
         SELECT ?, ?, 'crm_user', ?, 'lead', 'system', ?
         WHERE NOT EXISTS (
           SELECT 1 FROM global_chat_messages
           WHERE request_id = ? AND message_type = 'system' AND message_text = ?
         )`,
        [
          request.id,
          String(admin.id),
          request.customer_id,
          `${adminName} joined the chat`,
          request.id,
          `${adminName} joined the chat`,
        ],
      );
    } else {
      await pool.query(
        "UPDATE global_chat_requests SET status = 'missed' WHERE id = ? AND status = 'pending'",
        [request.id],
      );
      await pool.query(
        `INSERT INTO global_chat_messages
         (request_id, sender_id, sender_type, receiver_id, receiver_type, message_type, message_text)
         VALUES (?, 'system', 'system', ?, 'lead', 'system', ?)`,
        [
          request.id,
          request.customer_id,
          'Our team is delayed. We will reply as soon as possible.',
        ],
      );
    }
  }
}
export const heartbeatPresence = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      entityId: z.string(),
      entityType: z.enum(['crm_user', 'lead']),
      entityName: z.string(),
      role: z.string().optional(),
      isIdle: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query(
      `INSERT INTO user_presence (entity_id, entity_type, entity_name, role, last_seen_at, is_idle) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE 
       entity_name = VALUES(entity_name), 
       role = VALUES(role), 
       last_seen_at = CURRENT_TIMESTAMP,
       is_idle = VALUES(is_idle)`,
      [data.entityId, data.entityType, data.entityName, data.role || 'client', data.isIdle ? 1 : 0],
    );
    return { success: true };
  });
export const getGlobalChatRoster = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      requestingEntityId: z.string(),
      requestingEntityType: z.enum(['crm_user', 'lead']),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    // For simplicity, CRM users see everyone, Leads only see CRM users.
    let query = `
      SELECT 
        up.entity_id, 
        up.entity_type, 
        up.entity_name, 
        up.role, 
        up.last_seen_at,
        up.typing_to,
        up.typing_updated_at,
        up.is_idle,
        (
          SELECT message_text 
          FROM global_chat_messages 
          WHERE (sender_id = up.entity_id AND receiver_id = ?) 
             OR (receiver_id = up.entity_id AND sender_id = ?)
          ORDER BY id DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM global_chat_messages 
          WHERE (sender_id = up.entity_id AND receiver_id = ?) 
             OR (receiver_id = up.entity_id AND sender_id = ?)
          ORDER BY id DESC 
          LIMIT 1
        ) as last_message_at,
        (
          SELECT sender_id 
          FROM global_chat_messages 
          WHERE (sender_id = up.entity_id AND receiver_id = ?) 
             OR (receiver_id = up.entity_id AND sender_id = ?)
          ORDER BY id DESC 
          LIMIT 1
        ) as last_message_sender_id,
        (
          SELECT read_at 
          FROM global_chat_messages 
          WHERE (sender_id = up.entity_id AND receiver_id = ?) 
             OR (receiver_id = up.entity_id AND sender_id = ?)
          ORDER BY id DESC 
          LIMIT 1
        ) as last_message_read_at,
        (
          SELECT delivered_at 
          FROM global_chat_messages 
          WHERE (sender_id = up.entity_id AND receiver_id = ?) 
             OR (receiver_id = up.entity_id AND sender_id = ?)
          ORDER BY id DESC
          LIMIT 1
        ) as last_message_delivered_at,
        (
          SELECT 1 FROM global_chat_conversation_pins
          WHERE user_id = ? AND target_id = up.entity_id AND target_type = 'team'
          LIMIT 1
        ) as is_pinned
      FROM user_presence up
    `;
    let params = Array(11).fill(data.requestingEntityId);
    if (data.requestingEntityType === 'lead') {
      query += " WHERE up.entity_type = 'crm_user'";
    }
    const [rows] = await pool.query(query, params);
    // Inject Maya into the Team Chat automatically
    if (data.requestingEntityType === 'crm_user') {
      const [mayaPin] = await pool.query(
        `SELECT 1 FROM global_chat_conversation_pins WHERE user_id = ? AND target_id = 'maya' AND target_type = 'team' LIMIT 1`,
        [data.requestingEntityId],
      );
      rows.unshift({
        entity_id: 'maya',
        entity_type: 'bot',
        entity_name: '🤖 Maya (AI)',
        role: 'admin',
        last_seen_at: new Date().toISOString(),
        last_message: 'I can authorize restricted actions. Ask me.',
        last_message_at: new Date().toISOString(),
        is_pinned: mayaPin.length > 0 ? 1 : 0,
      });
    }
    let groupRows = [];
    if (data.requestingEntityType === 'crm_user') {
      const groupQuery = `
        SELECT 
          g.id as entity_id, 
          'group' as entity_type, 
          g.name as entity_name, 
          'group' as role, 
          g.created_at as last_seen_at,
          (
            SELECT message_text 
            FROM global_chat_messages 
            WHERE receiver_id = g.id AND receiver_type = 'group'
            ORDER BY id DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT created_at 
            FROM global_chat_messages 
            WHERE receiver_id = g.id AND receiver_type = 'group'
            ORDER BY id DESC 
            LIMIT 1
          ) as last_message_at
        FROM global_chat_groups g
        JOIN global_chat_group_members gm ON g.id = gm.group_id
        WHERE gm.entity_id = ? AND gm.entity_type = ?
      `;
      const [gRows] = await pool.query(groupQuery, [
        data.requestingEntityId,
        data.requestingEntityType,
      ]);
      groupRows = gRows;
    }
    const combinedRows = [...rows, ...groupRows];
    return combinedRows;
  });
export const getGlobalChatUpdates = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      entityId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    const [rows] = await pool.query(
      `SELECT MAX(id) as max_id FROM global_chat_messages 
       WHERE receiver_id = ? OR (
         receiver_type = 'group' AND receiver_id IN (
           SELECT group_id FROM global_chat_group_members WHERE entity_id = ?
         )
       )`,
      [data.entityId, data.entityId],
    );
    return { maxTeamMsgId: rows[0]?.max_id || 0 };
  });
export const getGlobalChatSignals = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      entityId: z.string(),
      lastSignalId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    const [rows] = await pool.query(
      `SELECT id, sender_id, sender_type, message_text, created_at FROM global_chat_messages 
       WHERE receiver_id = ? AND id > ? AND message_text LIKE '__WEBRTC__:%'
       ORDER BY id ASC`,
      [data.entityId, data.lastSignalId],
    );
    // Fetch sender names
    const signals = rows;
    for (const sig of signals) {
      if (sig.sender_type === 'crm_user') {
        const [u] = await pool.query(`SELECT name FROM crm_users WHERE id = ?`, [sig.sender_id]);
        sig.sender_name = u[0]?.name || sig.sender_id;
      } else {
        sig.sender_name = sig.sender_id;
      }
    }
    return signals;
  });
export const sendGlobalChatMessage = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      senderId: z.string(),
      senderType: z.string(),
      receiverId: z.string(),
      receiverType: z.string(),
      messageText: z.string().min(1),
      auth: adminAuthSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query(
      `INSERT INTO global_chat_messages (sender_id, sender_type, receiver_id, receiver_type, message_text)
       VALUES (?, ?, ?, ?, ?)`,
      [data.senderId, data.senderType, data.receiverId, data.receiverType, data.messageText],
    );
    // Push the message to connected recipients instantly (clients also poll as fallback).
    let recipients = [data.receiverId];
    if (data.receiverType === 'group') {
      const [memberRows] = await pool.query(
        'SELECT entity_id FROM global_chat_group_members WHERE group_id = ?',
        [data.receiverId],
      );
      recipients = memberRows.map((row) => row.entity_id).filter((id) => id !== data.senderId);
    }
    void publishChatEvent({
      recipients,
      event: 'chat:global-message',
      payload: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        receiverType: data.receiverType,
      },
    });
    // Maya agent — executes admin operations after access-code verification.
    if (data.receiverId === 'maya' && !data.messageText.startsWith('__WEBRTC__')) {
      // Talking to Maya requires a real staff session: she performs privileged actions.
      if (!data.auth) {
        await insertMayaTeamReply(
          pool,
          data.senderId,
          data.senderType,
          "Please sign in again — I couldn't verify your session, so I can't act on requests.",
        );
        return { success: true };
      }
      const staff = await requireLeadStaff(data.auth);
      await ensureMayaAdminSessions(pool);
      const msg = data.messageText.trim();
      if (msg.toLowerCase().startsWith('/code')) {
        const code = msg.replace(/^\/code\s*/i, '').trim();
        const { identityOperationService } =
          await import('../../services/identityOperationService.js');
        const isValid =
          code.length > 0 && (await identityOperationService.verifyMayaAccessCode(code));
        if (isValid) {
          await pool.query(
            `INSERT INTO maya_admin_sessions (entity_id, verified_until) VALUES (?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))
             ON DUPLICATE KEY UPDATE verified_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE)`,
            [data.senderId],
          );
          await insertMayaTeamReply(
            pool,
            data.senderId,
            data.senderType,
            "✅ Access code verified — you're authorized for the next 30 minutes. Tell me what you need: change a user's role, settle a refund, look something up, or run a database query.",
          );
        } else {
          await insertMayaTeamReply(
            pool,
            data.senderId,
            data.senderType,
            '❌ Access denied. Invalid access code.',
          );
        }
      } else {
        // Run the agent asynchronously so the sender's message posts instantly.
        setTimeout(
          () =>
            runMayaTeamAgent(data.senderId, data.senderType, staff.email, data.messageText).catch(
              (e) => console.error('[Maya TeamAgent]', e),
            ),
          100,
        );
      }
    }
    return { success: true };
  });
export async function ensureMayaAdminSessionsImpl(pool) {
  await resolve();
}
export async function insertMayaTeamReply(pool, receiverId, receiverType, text) {
  await pool.query(
    `INSERT INTO global_chat_messages (sender_id, sender_type, receiver_id, receiver_type, message_text)
     VALUES ('maya', 'bot', ?, ?, ?)`,
    [receiverId, receiverType, text],
  );
  void publishChatEvent({
    recipients: [receiverId],
    event: 'chat:global-message',
    payload: { senderId: 'maya', receiverId, receiverType },
  });
}
export const MAYA_MUTATING_TOOLS = new Set(['update_user_role', 'settle_refund', 'run_sql']);
export const CRM_ROLES = ['admin', 'editor', 'approver', 'sales', 'support', 'viewer'];
export async function execMayaTeamTool(pool, name, args, verified, staffEmail) {
  if (MAYA_MUTATING_TOOLS.has(name) && !verified) {
    return {
      error: 'ACCESS_CODE_REQUIRED',
      hint: 'Ask the user to authorize with /code <access code> first.',
    };
  }
  switch (name) {
    case 'find_user': {
      const q = `%${String(args.query || '').trim()}%`;
      const [rows] = await pool.query(
        'SELECT id, name, email, role FROM crm_users WHERE name LIKE ? OR email LIKE ? LIMIT 10',
        [q, q],
      );
      return { users: rows };
    }
    case 'update_user_role': {
      const role = String(args.role || '').toLowerCase();
      if (!CRM_ROLES.includes(role))
        return { error: `Invalid role. Valid roles: ${CRM_ROLES.join(', ')}` };
      const email = String(args.email || '').trim();
      const [rows] = await pool.query(
        'SELECT id, name, role FROM crm_users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email],
      );
      const target = rows[0];
      if (!target) return { error: `No CRM user found with email ${email}` };
      await pool.query('UPDATE crm_users SET role = ? WHERE id = ?', [role, target.id]);
      await pool.query('INSERT IGNORE INTO crm_user_roles (user_id, role) VALUES (?, ?)', [
        target.id,
        role,
      ]);
      await logAdminAction(
        staffEmail,
        'maya_update_user_role',
        'crm_user',
        target.id,
        { role: target.role },
        { role },
      );
      try {
        await pool.query(
          "INSERT INTO maya_activity_log (summary, area, status) VALUES (?, 'team', 'done')",
          [
            `Changed ${target.name || email}'s role from ${target.role} to ${role} (requested by ${staffEmail})`,
          ],
        );
      } catch {}
      return {
        success: true,
        user: { id: target.id, name: target.name, email, previousRole: target.role, newRole: role },
      };
    }
    case 'list_refunds': {
      const status = ['initiated', 'admin_review', 'escrow_hold', 'settled'].includes(
        String(args.status),
      )
        ? String(args.status)
        : null;
      const [rows] = await pool.query(
        `SELECT r.id, r.booking_reference, r.amount, r.status, r.created_at, u.name AS customer_name
         FROM user_refunds r LEFT JOIN users u ON u.id = r.user_id
         ${status ? 'WHERE r.status = ?' : ''} ORDER BY r.id DESC LIMIT 15`,
        status ? [status] : [],
      );
      return { refunds: rows };
    }
    case 'settle_refund': {
      const id = Number(args.refund_id);
      const [rows] = await pool.query('SELECT * FROM user_refunds WHERE id = ? LIMIT 1', [id]);
      const refund = rows[0];
      if (!refund) return { error: `Refund #${id} not found` };
      if (refund.status === 'settled') return { error: `Refund #${id} is already settled` };
      await pool.query(
        "UPDATE user_refunds SET status = 'settled', settled_at = NOW() WHERE id = ?",
        [id],
      );
      await logAdminAction(
        staffEmail,
        'maya_settle_refund',
        'user_refund',
        id,
        { status: refund.status },
        { status: 'settled' },
      );
      try {
        await pool.query(
          "INSERT INTO maya_activity_log (summary, area, status) VALUES (?, 'finance', 'done')",
          [
            `Settled refund #${id} (₹${refund.amount}, booking ${refund.booking_reference}) — authorized by ${staffEmail}`,
          ],
        );
      } catch {}
      return {
        success: true,
        refund: { id, amount: refund.amount, booking: refund.booking_reference, status: 'settled' },
      };
    }
    case 'business_snapshot': {
      const [[b]] = await pool.query(
        "SELECT COUNT(*) AS total, SUM(status='pending') AS pending, SUM(status='confirmed') AS confirmed FROM bookings",
      );
      const [[l]] = await pool
        .query('SELECT COUNT(*) AS total FROM lead_submissions')
        .catch(() => [[{ total: 'n/a' }]]);
      const [[p]] = await pool.query(
        "SELECT COUNT(*) AS pending FROM payment_orders WHERE status = 'pending_verification'",
      );
      const [[r]] = await pool.query(
        "SELECT COUNT(*) AS open FROM user_refunds WHERE status != 'settled'",
      );
      return { bookings: b, leads: l, pendingPayments: p.pending, openRefunds: r.open };
    }
    case 'run_sql': {
      const sql = String(args.sql || '')
        .trim()
        .replace(/;+\s*$/, '');
      if (sql.includes(';')) return { error: 'Only a single SQL statement is allowed.' };
      const verb = sql.split(/\s+/)[0]?.toLowerCase();
      if (!['select', 'show', 'describe', 'insert', 'update', 'delete'].includes(verb)) {
        return {
          error:
            'Only SELECT/SHOW/DESCRIBE/INSERT/UPDATE/DELETE are allowed. Schema changes (DROP/ALTER/TRUNCATE) must be done by a developer.',
        };
      }
      try {
        const [result] = await pool.query(
          verb === 'select' && !/\blimit\s+\d+/i.test(sql) ? `${sql} LIMIT 50` : sql,
        );
        if (['insert', 'update', 'delete'].includes(verb)) {
          await logAdminAction(staffEmail, 'maya_run_sql', 'database', null, null, { sql });
          try {
            await pool.query(
              "INSERT INTO maya_activity_log (summary, area, status) VALUES (?, 'team', 'done')",
              [`Ran SQL for ${staffEmail}: ${sql.slice(0, 180)}`],
            );
          } catch {}
          return {
            success: true,
            affectedRows: result.affectedRows,
            insertId: result.insertId || undefined,
          };
        }
        return { rows: result.slice(0, 50) };
      } catch (e) {
        return { error: `SQL error: ${e.message}` };
      }
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}
export async function runMayaTeamAgent(senderId, senderType, staffEmail, latestMessage) {
  const pool = await getDbPool();
  if (getGeminiKeys().length === 0) {
    const reply =
      "My AI engine isn't configured (missing Gemini API key). Ask a developer to set GEMINI_API_KEY.";
    await insertMayaTeamReply(pool, senderId, senderType, reply);
    return reply;
  }
  const [sessRows] = await pool.query(
    'SELECT verified_until FROM maya_admin_sessions WHERE entity_id = ? AND verified_until > NOW() LIMIT 1',
    [senderId],
  );
  const verified = sessRows.length > 0;
  // Last 12 messages between this staff member and Maya, oldest first
  const [msgRows] = await pool.query(
    `SELECT sender_id, message_text FROM (
       SELECT id, sender_id, message_text FROM global_chat_messages
       WHERE (sender_id = ? AND receiver_id = 'maya') OR (sender_id = 'maya' AND receiver_id = ?)
       ORDER BY id DESC LIMIT 12
     ) sub ORDER BY id ASC`,
    [senderId, senderId],
  );
  const history = msgRows.filter((m) => !m.message_text.startsWith('__WEBRTC__'));
  const { SchemaType } = await import(/* @vite-ignore */ '@google/generative-ai');
  const tools = [
    {
      functionDeclarations: [
        {
          name: 'find_user',
          description: 'Find CRM team users by name or email.',
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              query: { type: SchemaType.STRING, description: 'Name or email fragment' },
            },
            required: ['query'],
          },
        },
        {
          name: 'update_user_role',
          description: `Change a CRM user's role. Valid roles: ${CRM_ROLES.join(', ')}. RESTRICTED: requires verified access code.`,
          parameters: {
            type: SchemaType.OBJECT,
            properties: { email: { type: SchemaType.STRING }, role: { type: SchemaType.STRING } },
            required: ['email', 'role'],
          },
        },
        {
          name: 'list_refunds',
          description:
            'List customer refunds, optionally by status (initiated, admin_review, escrow_hold, settled).',
          parameters: {
            type: SchemaType.OBJECT,
            properties: { status: { type: SchemaType.STRING } },
          },
        },
        {
          name: 'settle_refund',
          description:
            'Settle (approve & mark paid) a refund by id. RESTRICTED: requires verified access code.',
          parameters: {
            type: SchemaType.OBJECT,
            properties: { refund_id: { type: SchemaType.NUMBER } },
            required: ['refund_id'],
          },
        },
        {
          name: 'business_snapshot',
          description:
            'Get live counts: bookings, leads, pending payment verifications, open refunds.',
          parameters: { type: SchemaType.OBJECT, properties: {} },
        },
        {
          name: 'run_sql',
          description:
            "Run one SQL statement on the MooNsEvents MySQL database (SELECT/SHOW/DESCRIBE/INSERT/UPDATE/DELETE — no schema changes). Use for anything the other tools don't cover. RESTRICTED: requires verified access code.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: { sql: { type: SchemaType.STRING } },
            required: ['sql'],
          },
        },
      ],
    },
  ];
  const systemInstruction = `You are Maya, MooNs Events's internal operations agent inside the TEAM chat. You talk to verified staff members, not customers.
You can EXECUTE admin operations using your tools. Current requester: ${staffEmail}. Access code verified: ${verified ? 'YES (authorized for restricted actions)' : 'NO'}.
Rules:
- If a restricted tool returns ACCESS_CODE_REQUIRED, tell the user to authorize with: /code <access code> — never guess or skip it.
- Confirm exactly what you did after acting (who/what/before→after). If a tool errors, report the error plainly.
- For destructive-sounding requests (deleting data), restate what will be affected and ask for a "yes" before running it.
- Be concise and practical. No corporate filler. You may use the run_sql tool to answer any data question or perform changes the dedicated tools don't cover.`;
  try {
    const replyText = await withMayaGeminiRotation('gemini-2.5-flash', async (model) => {
      const contents = [];
      for (const m of history) {
        const role = m.sender_id === 'maya' ? 'model' : 'user';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + m.message_text;
        } else {
          contents.push({ role, parts: [{ text: m.message_text }] });
        }
      }
      if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({ role: 'user', parts: [{ text: latestMessage }] });
      }
      while (contents.length > 0 && contents[0].role === 'model') contents.shift();
      let res = await model.generateContent({
        contents,
        tools: tools,
        systemInstruction: { parts: [{ text: systemInstruction }] },
      });
      // Tool-execution loop (max 4 rounds)
      for (let round = 0; round < 4; round++) {
        const calls = res.response.functionCalls?.() || [];
        if (calls.length === 0) break;
        const responses = [];
        for (const call of calls) {
          const result = await execMayaTeamTool(
            pool,
            call.name,
            call.args || {},
            verified,
            staffEmail,
          );
          responses.push({ name: call.name, response: result });
        }
        contents.push({
          role: 'model',
          parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args || {} } })),
        });
        contents.push({
          role: 'function',
          parts: responses.map((r) => ({
            functionResponse: { name: r.name, response: r.response },
          })),
        });
        res = await model.generateContent({
          contents,
          tools: tools,
          systemInstruction: { parts: [{ text: systemInstruction }] },
        });
      }
      return res.response.text().trim();
    });
    const reply = replyText || 'Done. Anything else?';
    await insertMayaTeamReply(pool, senderId, senderType, reply);
    return reply;
  } catch (e) {
    console.error('[Maya TeamAgent] failed:', e);
    const reply = `I hit an error while working on that: ${String(e.message || e).slice(0, 200)}. Please try again.`;
    await insertMayaTeamReply(pool, senderId, senderType, reply);
    return reply;
  }
}
export const adminMayaVoiceTurn = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: adminAuthSchema,
      senderId: z.string().min(1),
      transcript: z.string().trim().min(1).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireSecurityAdmin(data.auth);
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query(
      `INSERT INTO global_chat_messages (sender_id, sender_type, receiver_id, receiver_type, message_text)
       VALUES (?, 'crm_user', 'maya', 'bot', ?)`,
      [data.senderId, data.transcript],
    );
    void publishChatEvent({
      recipients: [data.senderId],
      event: 'chat:global-message',
      payload: { senderId: data.senderId, receiverId: 'maya', receiverType: 'bot' },
    });
    const reply = await runMayaTeamAgent(data.senderId, 'crm_user', admin.email, data.transcript);
    return { reply };
  });
export const toggleGlobalChatReaction = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      messageId: z.number().int().positive(),
      entityId: z.string().min(1),
      entityType: z.string().min(1),
      emoji: z.string().min(1).max(32),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    const [existingRows] = await pool.query(
      `SELECT emoji FROM global_chat_reactions
       WHERE message_id = ? AND entity_id = ? AND entity_type = ?
       LIMIT 1`,
      [data.messageId, data.entityId, data.entityType],
    );
    const existing = existingRows[0];
    if (existing?.emoji === data.emoji) {
      await pool.query(
        `DELETE FROM global_chat_reactions
         WHERE message_id = ? AND entity_id = ? AND entity_type = ?`,
        [data.messageId, data.entityId, data.entityType],
      );
      return { success: true, reaction: null };
    }
    await pool.query(
      `INSERT INTO global_chat_reactions (message_id, entity_id, entity_type, emoji)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE emoji = VALUES(emoji), updated_at = CURRENT_TIMESTAMP`,
      [data.messageId, data.entityId, data.entityType, data.emoji],
    );
    return { success: true, reaction: data.emoji };
  });
export const toggleMessagePin = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      messageId: z.number().int().positive(),
      isPinned: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query('UPDATE global_chat_messages SET is_pinned = ? WHERE id = ?', [
      data.isPinned ? 1 : 0,
      data.messageId,
    ]);
    return { success: true, isPinned: data.isPinned };
  });
export const toggleConversationPin = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      userId: z.string().min(1),
      targetId: z.string().min(1),
      targetType: z.enum(['team', 'customer']),
      isPinned: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    if (data.isPinned) {
      await pool.query(
        `INSERT IGNORE INTO global_chat_conversation_pins (user_id, target_id, target_type) VALUES (?, ?, ?)`,
        [data.userId, data.targetId, data.targetType],
      );
    } else {
      await pool.query(
        `DELETE FROM global_chat_conversation_pins WHERE user_id = ? AND target_id = ? AND target_type = ?`,
        [data.userId, data.targetId, data.targetType],
      );
    }
    return { success: true, isPinned: data.isPinned };
  });
export const getGlobalChatHistory = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      entity1Id: z.string(),
      entity1Type: z.string().optional(),
      entity2Id: z.string(),
      isGroup: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    const currentEntityType = data.entity1Type || 'crm_user';
    if (data.isGroup) {
      const [rows] = await pool.query(
        `SELECT * FROM global_chat_messages
         WHERE receiver_id = ? AND receiver_type = 'group'
         ORDER BY created_at ASC`,
        [data.entity2Id],
      );
      return attachGlobalChatReactions(pool, rows, data.entity1Id, currentEntityType);
    }
    const [rows] = await pool.query(
      `SELECT * FROM global_chat_messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [data.entity1Id, data.entity2Id, data.entity2Id, data.entity1Id],
    );
    return attachGlobalChatReactions(pool, rows, data.entity1Id, currentEntityType);
  });
export const markGlobalChatAsRead = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      senderId: z.string(),
      receiverId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query(
      `UPDATE global_chat_messages 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL`,
      [data.senderId, data.receiverId],
    );
    return { success: true };
  });
export const markGlobalChatsAsDelivered = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      receiverId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query(
      `UPDATE global_chat_messages 
       SET delivered_at = CURRENT_TIMESTAMP 
       WHERE receiver_id = ? AND delivered_at IS NULL`,
      [data.receiverId],
    );
    return { success: true };
  });
export const setGlobalChatTypingStatus = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      entityId: z.string(),
      entityType: z.string(),
      typingTo: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    if (data.typingTo) {
      await pool.query(
        `UPDATE user_presence 
         SET typing_to = ?, typing_updated_at = CURRENT_TIMESTAMP 
         WHERE entity_id = ? AND entity_type = ?`,
        [data.typingTo, data.entityId, data.entityType],
      );
    } else {
      await pool.query(
        `UPDATE user_presence 
         SET typing_to = NULL, typing_updated_at = NULL 
         WHERE entity_id = ? AND entity_type = ?`,
        [data.entityId, data.entityType],
      );
    }
    return { success: true };
  });
export const createGlobalChatGroup = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      createdBy: z.string(),
      members: z.array(
        z.object({
          entityId: z.string(),
          entityType: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    await pool.query('INSERT INTO global_chat_groups (id, name, created_by) VALUES (?, ?, ?)', [
      data.id,
      data.name,
      data.createdBy,
    ]);
    for (const member of data.members) {
      await pool.query(
        'INSERT INTO global_chat_group_members (group_id, entity_id, entity_type) VALUES (?, ?, ?)',
        [data.id, member.entityId, member.entityType],
      );
    }
    return { success: true };
  });
export let chatTablesEnsured = false;
export async function ensureChatTablesImpl() {
  if (chatTablesEnsured) return;
  // Support chat lists join the global conversation-pin table. Initialise the
  // global-chat schema first so a fresh migrated database has every dependency.
  await ensureGlobalChatTables();
  const pool = await getDbPool();
  await resolve();
  await resolve();
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  try {
    await resolve();
  } catch {}
  chatTablesEnsured = true;
}
// Staff replies in support chats are stored with a `users` table id. CRM staff
// don't always have a site-user row, so create one on demand instead of crashing.
export async function resolveStaffUsersId(pool, email) {
  const [userRows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  const existing = userRows[0];
  if (existing) return existing.id;
  const [crmRows] = await pool.query(
    'SELECT name FROM crm_users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    [email],
  );
  const name = crmRows[0]?.name || email.split('@')[0];
  const [inserted] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [
    name,
    email,
  ]);
  return inserted.insertId;
}
// Marketing and performance operations
export async function ensureOperationsTablesImpl() {
  const pool = await getDbPool();
  await resolve();
  await resolve();
  await resolve();
  await resolve();
}
export const campaignInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(['email', 'sms', 'social_ad', 'promo']),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  budget: z.coerce.number().min(0).optional(),
  spent: z.coerce.number().min(0).default(0),
  reach: z.coerce.number().int().min(0).default(0),
  conversions: z.coerce.number().int().min(0).default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});
// --- Marketing Offers & Promotions ---
// =====================================================================
// AI Chat Intelligence: Smart Replies + Autonomous AI Support Agent
// =====================================================================
async function legacyTriggerAutonomousAIResponseDisabled(requestId, customerId) {
  const pool = await getDbPool();
  try {
    const pool = await getDbPool();
    await ensureGlobalChatTables();
    const [updateResult] = await pool.query(
      "UPDATE global_chat_requests SET ai_is_typing = 1 WHERE id = ? AND (ai_is_typing = 0 OR ai_is_typing IS NULL) AND status IN ('pending', 'active') AND (assigned_employee_id IS NULL OR assigned_employee_id = 'ai_assistant')",
      [requestId],
    );
    if (updateResult.affectedRows === 0) return;
    // Pulse typing status to frontend
    await pool.query(
      "INSERT INTO user_presence (entity_id, entity_type, entity_name, typing_to, typing_updated_at) VALUES ('ai_assistant', 'system', 'Maya', ?, NOW()) ON DUPLICATE KEY UPDATE typing_to=VALUES(typing_to), typing_updated_at=VALUES(typing_updated_at)",
      [customerId],
    );
    const [requestRows] = await pool.query(
      'SELECT * FROM global_chat_requests WHERE id = ? LIMIT 1',
      [requestId],
    );
    const request = requestRows[0];
    if (!request) return;
    const [messagesRows] = await pool.query(
      `SELECT sender_id, sender_type, message_text, created_at 
       FROM (SELECT * FROM global_chat_messages WHERE request_id = ? ORDER BY id DESC LIMIT 15) AS sub
       ORDER BY id ASC`,
      [requestId],
    );
    const messages = messagesRows;
    if (messages.length === 0) return;
    // Prevent AI replying to itself
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_id === 'ai_assistant') return;
    // Format history for Gemini chat
    const historyForGemini = [];
    for (const m of messages) {
      const role = m.sender_type === 'lead' ? 'user' : 'model';
      // Skip consecutive same-role messages by merging
      if (
        historyForGemini.length > 0 &&
        historyForGemini[historyForGemini.length - 1].role === role
      ) {
        historyForGemini[historyForGemini.length - 1].parts[0].text += '\n' + m.message_text;
      } else {
        historyForGemini.push({ role, parts: [{ text: m.message_text }] });
      }
    }
    // If history starts with model, remove it (Gemini requires user first)
    while (historyForGemini.length > 0 && historyForGemini[0].role === 'model') {
      historyForGemini.shift();
    }
    // Ensure alternating roles
    const cleanHistory = [];
    for (let i = 0; i < historyForGemini.length; i++) {
      if (i === 0 || historyForGemini[i].role !== cleanHistory[cleanHistory.length - 1].role) {
        cleanHistory.push(historyForGemini[i]);
      } else {
        cleanHistory[cleanHistory.length - 1].parts[0].text +=
          '\n' + historyForGemini[i].parts[0].text;
      }
    }
    if (getGeminiKeys().length === 0) return;
    const searchCRMUserDecl = {
      name: 'searchCRMUser',
      description:
        'Search the CRM database to verify a customer by email or phone number. Use when they provide identity details.',
      parameters: {
        type: 'OBJECT',
        properties: {
          email: { type: 'STRING', description: 'Customer email address' },
          phone: { type: 'STRING', description: 'Customer phone number' },
        },
      },
    };
    const generatePromoCodeDecl = {
      name: 'generatePromoCode',
      description:
        'Generate a single-use promotional discount code (INR) to resolve customer dissatisfaction, loss, or poor experience. Max ₹1000.',
      parameters: {
        type: 'OBJECT',
        properties: {
          discountAmount: { type: 'NUMBER', description: 'Fixed discount in INR, max 1000' },
          reason: { type: 'STRING', description: 'Brief reason for promo code' },
        },
        required: ['discountAmount', 'reason'],
      },
    };
    const lookupBookingDecl = {
      name: 'lookupBooking',
      description:
        "Look up a customer's booking/deal by their client name or email in the CRM system.",
      parameters: {
        type: 'OBJECT',
        properties: {
          customerName: { type: 'STRING', description: 'Customer name to search' },
          customerEmail: { type: 'STRING', description: 'Customer email to search' },
        },
      },
    };
    const searchPackagesDecl = {
      name: 'searchPackages',
      description:
        'Search for available events packages by location, country, or theme in our database to recommend to the customer.',
      parameters: {
        type: 'OBJECT',
        properties: {
          location: { type: 'STRING', description: 'Location city or country' },
          theme: {
            type: 'STRING',
            description: 'Event type such as wedding, conference, exhibition, concert, or gala.',
          },
        },
      },
    };
    const getPackageDetailsDecl = {
      name: 'getPackageDetails',
      description:
        'Get full details (runOfShow, inclusions, exclusions) of a specific events package by ID or exact name. If ID is unknown, provide the packageName.',
      parameters: {
        type: 'OBJECT',
        properties: {
          packageId: { type: 'NUMBER', description: 'The ID of the package' },
          packageName: { type: 'STRING', description: 'The name of the package if ID is unknown' },
        },
      },
    };
    const searchInventoryDecl = {
      name: 'searchInventory',
      description: 'Search approved event vendors in the Master Catalog.',
      parameters: {
        type: 'OBJECT',
        properties: {
          category: {
            type: 'STRING',
            description:
              "One of: 'venue', 'photography', 'decoration', 'catering', 'organizer', 'production', 'entertainment', 'logistics', 'staffing'",
          },
          query: {
            type: 'STRING',
            description: 'Telangana or Andhra Pradesh city, vendor name, or service keyword.',
          },
        },
        required: ['category'],
      },
    };
    const searchWebDecl = {
      name: 'searchWeb',
      description:
        'Search the live web for general events information (weather, permit process, local transport, currency, tips) not present in our internal database.',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: { type: 'STRING', description: 'The web search query' },
        },
        required: ['query'],
      },
    };
    const generateFormalQuoteDecl = {
      name: 'generateFormalQuote',
      description:
        'Generate a formal quote/proposal for the customer in the system. Use this when the customer confirms the package and client count.',
      parameters: {
        type: 'OBJECT',
        properties: {
          packageId: { type: 'NUMBER', description: 'The ID of the chosen package' },
          clients: { type: 'NUMBER', description: 'Number of clients' },
          totalPrice: { type: 'NUMBER', description: 'Total price of the package' },
        },
        required: ['packageId', 'clients', 'totalPrice'],
      },
    };
    const sendEmailDecl = {
      name: 'sendEmail',
      description:
        'Send an email to the customer. Useful for sending formal proposals, runOfShows, or follow-ups.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerEmail: { type: 'STRING', description: "The customer's email address" },
          subject: { type: 'STRING', description: 'Email subject' },
          htmlBody: { type: 'STRING', description: 'Email body in HTML format' },
        },
        required: ['customerEmail', 'subject', 'htmlBody'],
      },
    };
    const sendWhatsAppDecl = {
      name: 'sendWhatsApp',
      description: 'Send a WhatsApp message to the customer.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerPhone: { type: 'STRING', description: "The customer's phone number" },
          message: { type: 'STRING', description: 'The text message to send via WhatsApp' },
        },
        required: ['customerPhone', 'message'],
      },
    };
    const updateLeadStatusDecl = {
      name: 'updateLeadStatus',
      description: 'Update the CRM lead status.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerEmail: {
            type: 'STRING',
            description: "The customer's email address to identify their lead record",
          },
          status: {
            type: 'STRING',
            description: "The new status (e.g., 'quote_sent', 'negotiation', 'won', 'lost')",
          },
        },
        required: ['customerEmail', 'status'],
      },
    };
    const scheduleFollowupDecl = {
      name: 'scheduleFollowup',
      description: 'Schedule a follow-up reminder in the CRM.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerEmail: {
            type: 'STRING',
            description: "The customer's email address to identify their lead record",
          },
          notes: { type: 'STRING', description: 'Notes for the follow-up' },
          daysFromNow: {
            type: 'NUMBER',
            description: 'Number of days from today to schedule the follow-up',
          },
        },
        required: ['customerEmail', 'notes', 'daysFromNow'],
      },
    };
    const createBookingDecl = {
      name: 'createBooking',
      description: 'Convert the lead into an active booking when the customer agrees to proceed.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerEmail: { type: 'STRING', description: "The customer's email address" },
          packageId: { type: 'NUMBER', description: 'The package ID being booked' },
          finalPrice: { type: 'NUMBER', description: 'The final negotiated price in INR' },
          clients: { type: 'NUMBER', description: 'Number of clients' },
        },
        required: ['customerEmail', 'packageId', 'finalPrice', 'clients'],
      },
    };
    // NOTE: Gemini rejects mixing native googleSearch with functionDeclarations in
    // one request (400), so web search is exposed as a normal function tool instead.
    const mayaModelOptions = {
      tools: [
        {
          functionDeclarations: [
            searchCRMUserDecl,
            generatePromoCodeDecl,
            lookupBookingDecl,
            searchPackagesDecl,
            getPackageDetailsDecl,
            searchInventoryDecl,
            searchWebDecl,
            generateFormalQuoteDecl,
            sendEmailDecl,
            sendWhatsAppDecl,
            updateLeadStatusDecl,
            scheduleFollowupDecl,
            createBookingDecl,
          ],
        },
      ],
    };
    const systemInstruction = `You are "Maya", a warm, empathetic, and highly capable human Events Consultant at MooNs Events — a premium Indian events company.

CRITICAL PERSONALITY & STYLE RULES:
- Sound like a real human. Use casual warmth ("Hey!", "Sure thing!", "Let me check that for you real quick").
- Keep replies SHORT (2-4 sentences max). Never write essays.
- NEVER say "I'm an AI", "As an AI", or "I'm a chatbot". You are Maya.
- When suggesting multiple packages or options, always use a numbered list (1., 2., etc.) for clear, structured formatting.
- For all other casual conversation, write naturally without excessive bullet points.
CRITICAL CONSULTATION RULES:
1. Before recommending a package or creating a formal quote, YOU MUST ASK for the necessary details if missing: Location, Events Dates, Budget, Number of Clients, and Venue Preferences.
2. DO NOT hallucinate prices, availability, or permit rules. Always use tools ('searchWeb', 'searchPackages', 'searchInventory') for live public info and our catalog.
3. If you lack information, tell the user: "Let me check our live inventory for that..." and use a tool.
4. Use the provided tools to send quotes ('generateFormalQuote', 'sendEmail'), manage the pipeline ('updateLeadStatus', 'scheduleFollowup', 'sendWhatsApp'), and finalize sales ('createBooking') without restrictions. 

WORKFLOW:
1. Greet warmly on first contact. Ask how you can help.
2. For general events questions (e.g., weather, permit process), use the 'searchWeb' tool. Never say "I cannot provide".
3. When customers ask for packages, ALWAYS use 'searchPackages', then present those exact MooNs packages. Use 'getPackageDetails' for specifics.
4. If they ask about specific inventory like venues or cars, use 'searchInventory' first. If not found, fallback to Google Search.
5. If they ask about personal bookings, use 'searchCRMUser' to verify them, then 'lookupBooking'.
6. If the customer is unhappy, offer a goodwill discount using 'generatePromoCode' (up to ₹1000).
7. If the customer confirms a package and clients, generate a quote, send an email, update their lead status, and if they agree to buy, create a booking.

IMPORTANT: All prices and amounts are in INR (₹). This is an Indian events company.`;
    const chatHistory = cleanHistory.length > 1 ? cleanHistory.slice(0, -1) : [];
    const lastUserMessage = cleanHistory.length > 0 ? cleanHistory[cleanHistory.length - 1] : null;
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;
    const replyText = await withMayaGeminiRotation(
      'gemini-2.5-flash',
      async (model) => {
        const chat = model.startChat({
          history: structuredClone(chatHistory),
          systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        });
        let result = await chat.sendMessage(lastUserMessage.parts[0].text);
        // Handle up to 5 rounds of function calling
        for (let round = 0; round < 5; round++) {
          const functionCalls = result.response.functionCalls();
          if (!functionCalls || functionCalls.length === 0) break;
          const call = functionCalls[0];
          let functionResponseData = {};
          if (call.name === 'searchCRMUser') {
            const args = call.args || {};
            const conditions = [];
            const params = [];
            if (args.email) {
              conditions.push('LOWER(email) = LOWER(?)');
              params.push(args.email);
            }
            if (args.phone) {
              conditions.push('phone = ?');
              params.push(args.phone);
            }
            if (conditions.length > 0) {
              const [users] = await pool.query(
                `SELECT id, name, email, phone, status, lifetime_value, last_active FROM crm_clients WHERE ${conditions.join(' OR ')} LIMIT 1`,
                params,
              );
              if (users.length > 0) {
                const u = users[0];
                functionResponseData = {
                  verified: true,
                  customer: {
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    status: u.status,
                    lifetimeValue: u.lifetime_value,
                    lastActive: u.last_active,
                  },
                };
              } else {
                functionResponseData = {
                  verified: false,
                  message: 'No customer found with those details in our system.',
                };
              }
            } else {
              functionResponseData = { verified: false, message: 'No email or phone provided.' };
            }
          } else if (call.name === 'generatePromoCode') {
            const args = call.args || {};
            const amount = Math.min(Number(args.discountAmount) || 500, 1000);
            const code = 'MAYA' + Math.floor(1000 + Math.random() * 9000);
            await pool.query(
              "INSERT INTO promo_codes (code, type, discount_type, discount_value, max_uses, is_active) VALUES (?, 'single_use', 'fixed', ?, 1, 1)",
              [code, amount],
            );
            functionResponseData = {
              success: true,
              promoCode: code,
              discountValueINR: amount,
              reason: args.reason,
            };
          } else if (call.name === 'lookupBooking') {
            const args = call.args || {};
            const conditions = [];
            const params = [];
            if (args.customerName) {
              conditions.push('LOWER(customer_name) LIKE LOWER(?)');
              params.push(`%${args.customerName}%`);
            }
            if (args.customerEmail) {
              conditions.push('LOWER(customer_email) = LOWER(?)');
              params.push(args.customerEmail);
            }
            if (conditions.length > 0) {
              const [deals] = await pool.query(
                `SELECT id, title, value, status, customer_name, customer_email, notes, created_at FROM crm_deals WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC LIMIT 5`,
                params,
              );
              functionResponseData = { found: deals.length > 0, bookings: deals };
            } else {
              functionResponseData = { found: false, message: 'No search criteria provided.' };
            }
          } else if (call.name === 'searchPackages') {
            const args = call.args || {};
            const conditions = ['is_active = 1'];
            const params = [];
            if (args.location) {
              conditions.push('(LOWER(destination) LIKE LOWER(?) OR LOWER(country) LIKE LOWER(?))');
              params.push(`%${args.location}%`, `%${args.location}%`);
            }
            if (args.theme) {
              conditions.push('(LOWER(description) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?))');
              params.push(`%${args.theme}%`, `%${args.theme}%`);
            }
            const [packages] = await pool.query(
              `SELECT id, name, destination AS location, country, days, nights, category, price FROM packages WHERE ${conditions.join(' AND ')} LIMIT 5`,
              params,
            );
            functionResponseData = { found: packages.length > 0, packages };
          } else if (call.name === 'getPackageDetails') {
            const args = call.args || {};
            let pId = args.packageId;
            if (!pId && args.packageName) {
              const [rows] = await pool.query(
                'SELECT id FROM packages WHERE name = ? OR name LIKE ? LIMIT 1',
                [args.packageName, `%${args.packageName}%`],
              );
              if (rows.length > 0) pId = rows[0].id;
            }
            if (pId) {
              const [runOfShow] = await pool.query(
                'SELECT day_number, title, description, city FROM package_itinerary WHERE package_id = ? ORDER BY day_number ASC',
                [pId],
              );
              const [inclusions] = await pool.query(
                'SELECT category, item FROM package_inclusions WHERE package_id = ?',
                [pId],
              );
              const [exclusions] = await pool.query(
                'SELECT item FROM package_exclusions WHERE package_id = ?',
                [pId],
              );
              functionResponseData = { success: true, runOfShow, inclusions, exclusions };
            } else {
              functionResponseData = {
                success: false,
                message: 'No packageId or valid packageName provided.',
              };
            }
          } else if (call.name === 'searchInventory') {
            const args = call.args || {};
            const cat = args.category;
            const q = args.query ? `%${args.query}%` : '%';
            const [rows] = await pool.query(
              "SELECT id, company_name, service_categories, coverage_areas, address, website_url, phone, email FROM vendors WHERE status = 'approved' AND (service_categories LIKE ? OR company_name LIKE ? OR coverage_areas LIKE ?) LIMIT 10",
              [`%${cat}%`, q, q],
            );
            functionResponseData = { found: rows.length > 0, vendors: rows };
          } else if (call.name === 'searchWeb') {
            const args = call.args || {};
            const results = await legacySearchDDGDisabled(String(args.query || ''));
            functionResponseData = { results };
          } else if (call.name === 'generateFormalQuote') {
            const args = call.args || {};
            // In a real implementation this would generate the PDF and attach it to the lead/CRM
            functionResponseData = {
              success: true,
              message:
                'Formal quote successfully generated and recorded in the system. You can now present the total price and details to the customer.',
            };
          } else if (call.name === 'sendEmail') {
            const args = call.args || {};
            await sendEmailOutbound(args.customerEmail, args.subject, args.htmlBody);
            functionResponseData = { success: true, message: 'Email sent successfully.' };
          } else if (call.name === 'sendWhatsApp') {
            const args = call.args || {};
            functionResponseData = { success: true, message: 'WhatsApp message dispatched.' };
          } else if (call.name === 'updateLeadStatus') {
            const args = call.args || {};
            if (args.customerEmail) {
              await pool.query('UPDATE lead_submissions SET status = ? WHERE email = ?', [
                args.status,
                args.customerEmail,
              ]);
              functionResponseData = { success: true, message: 'Lead status updated.' };
            } else {
              functionResponseData = { success: false, message: 'customerEmail required.' };
            }
          } else if (call.name === 'scheduleFollowup') {
            const args = call.args || {};
            if (args.customerEmail) {
              const [leads] = await pool.query(
                'SELECT id FROM lead_submissions WHERE email = ? LIMIT 1',
                [args.customerEmail],
              );
              if (leads.length > 0) {
                const leadId = leads[0].id;
                await pool.query(
                  "INSERT INTO lead_followups (lead_id, follow_up_date, notes, status, follow_up_type) VALUES (?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, 'pending', 'call')",
                  [leadId, args.daysFromNow, args.notes],
                );
                functionResponseData = { success: true, message: 'Follow-up scheduled.' };
              } else {
                functionResponseData = { success: false, message: 'Lead not found.' };
              }
            } else {
              functionResponseData = { success: false, message: 'customerEmail required.' };
            }
          } else if (call.name === 'createBooking') {
            const args = call.args || {};
            if (args.customerEmail) {
              await pool.query("UPDATE lead_submissions SET status = 'won' WHERE email = ?", [
                args.customerEmail,
              ]);
              functionResponseData = {
                success: true,
                message: 'Booking created and lead marked as won.',
              };
            } else {
              functionResponseData = { success: false, message: 'customerEmail required.' };
            }
          }
          result = await chat.sendMessage([
            {
              functionResponse: {
                name: call.name,
                response: functionResponseData,
              },
            },
          ]);
        }
        return result.response.text();
      },
      mayaModelOptions,
    );
    if (!replyText || replyText.trim().length === 0) return;
    // Insert AI reply into the chat
    await pool.query(
      `INSERT INTO global_chat_messages
       (request_id, sender_id, sender_type, receiver_id, receiver_type, message_type, message_text)
       VALUES (?, 'ai_assistant', 'crm_user', ?, 'lead', 'user', ?)`,
      [requestId, customerId, replyText.trim()],
    );
    await pool.query('UPDATE global_chat_requests SET updated_at = NOW() WHERE id = ?', [
      requestId,
    ]);
  } catch (e) {
    console.error('AI Auto-Responder failed for request', requestId, ':', e);
  } finally {
    const pool = await getDbPool();
    await pool.query('UPDATE global_chat_requests SET ai_is_typing = 0 WHERE id = ?', [requestId]);
    await pool.query(
      "UPDATE user_presence SET typing_to = NULL, typing_updated_at = NULL WHERE entity_id = 'ai_assistant'",
    );
  }
}
export async function triggerAutonomousAIResponse(requestId, customerId) {
  const { processGovernedGlobalChat } = await import('../../maya/support/globalChatProcessor.js');
  return processGovernedGlobalChat(requestId, customerId);
}
// =====================================================================
// AI Autonomous Lead Management Engine
// =====================================================================
// Add columns to lead_submissions table
export async function ensureAiLeadColumnsImpl() {
  const pool = await getDbPool();
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
  try {
    await resolve();
  } catch (e) {}
}
// Schema changes are applied by Prisma migrations, never during module import.
export async function sendEmailOutbound(to, subject, htmlContent, attachments) {
  try {
    const nodemailer = (await import('nodemailer')).default;
    // Standard SMTP configured via env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    let formattedHtml = htmlContent;
    if (!formattedHtml.includes('<br') && !formattedHtml.includes('<p>')) {
      formattedHtml = formattedHtml.replace(/\n/g, '<br />');
    }
    // Generate a clean plain text version by removing HTML tags and converting <br> to newlines
    const cleanText = formattedHtml
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<p\s*[\/]?>/gi, '\n\n')
      .replace(/<[^>]+>/g, '');
    const info = await transporter.sendMail({
      from: '"Maya (MooNs Events)" <' + (process.env.SMTP_FROM || 'hello@moonsevents.com') + '>',
      to,
      subject,
      html: formattedHtml,
      text: cleanText, // Clean plain text fallback
      attachments,
    });
    console.log('Email sent to', to, 'MessageId:', info.messageId);
    return true;
  } catch (e) {
    console.error('Failed to send outbound email:', e);
    return false;
  }
}
async function legacyProcessAutonomousAILeadsDisabled() {
  try {
    const pool = await getDbPool();
    // Get all leads assigned to Maya that are not closed/lost
    const [leadsRows] = await pool.query(`SELECT * FROM lead_submissions 
       WHERE assigned_owner LIKE '%Maya (AI Auto-Pilot)%' 
       AND status IN ('new', 'contacted', 'quote_sent')`);
    const leads = leadsRows;
    if (leads.length === 0) return;
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await getMayaGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    for (const lead of leads) {
      // Stage 1: New Lead -> Contacted
      if (lead.status === 'new') {
        const prompt = `You are Maya, an AI events agent for MooNs Events (India).
Write a very warm, human-sounding introductory email to a new lead.
Lead Name: ${lead.name}
Location: ${lead.location}
Events Month: ${lead.event_month || 'Not specified'}
Clients: ${lead.clients_count}
Budget: ${lead.budget_range}
Notes: ${lead.notes}

Draft an email subject and body (in HTML). Do not include markdown backticks.
Format strictly as JSON:
{
  "subject": "Email Subject",
  "htmlBody": "Email Body in HTML format (use <br> for newlines)"
}`;
        try {
          const res = await model.generateContent(prompt);
          const responseText = res.response
            .text()
            .replace(/\`\`\`json/gi, '')
            .replace(/\`\`\`/g, '')
            .trim();
          const emailData = JSON.parse(responseText);
          if (lead.ai_mode === 'autonomous') {
            await sendEmailOutbound(lead.email, emailData.subject, emailData.htmlBody);
            // Transactional follow-up SMS nudge to the lead (fire-and-forget).
            if (lead.phone) {
              void (async () => {
                try {
                  const { smsService } = await import('../../services/smsService.js');
                  const { normalizeForSms } =
                    await import('../../services/customerMessagingService.js');
                  await smsService.sendSMS(
                    normalizeForSms(lead.phone),
                    `Hi ${lead.name || 'there'}, MooN Events here following up on your ${lead.theme || 'events'} enquiry — we've emailed you details. Reply or call us to plan your event!`,
                  );
                } catch (e) {
                  console.warn('Follow-up SMS skipped:', e?.message);
                }
              })();
            }
            // Add a follow-up record
            await pool.query(
              `INSERT INTO lead_followups (lead_id, follow_up_date, follow_up_type, channel, notes, outcome, status, completed_at) 
               VALUES (?, NOW(), 'email', 'email', 'AI sent introductory email.', 'Email Sent', 'completed', NOW())`,
              [lead.id],
            );
            // Update lead status
            await pool.query(
              `UPDATE lead_submissions 
               SET status = 'contacted', last_contacted_at = NOW(), ai_last_action_at = NOW() 
               WHERE id = ?`,
              [lead.id],
            );
            console.log(`[AI Auto-Pilot] Processed new lead: ${lead.name}`);
          } else {
            // For requires_approval, just dump a note in admin_notes so they see it.
            const adminNote = `[AI DRAFT AWAITING APPROVAL]\\nSubject: ${emailData.subject}\\nBody: ${emailData.htmlBody}`;
            await pool.query('UPDATE lead_submissions SET admin_notes = ? WHERE id = ?', [
              adminNote,
              lead.id,
            ]);
          }
        } catch (e) {
          console.error('AI Lead Stage 1 Error for lead', lead.id, e);
        }
      }
      // Stage 2: Contacted -> Quote Sent (Wait 24h)
      else if (lead.status === 'contacted') {
        const lastContacted = new Date(lead.last_contacted_at || lead.created_at).getTime();
        const now = Date.now();
        const hoursPassed = (now - lastContacted) / (1000 * 60 * 60);
        if (hoursPassed >= 24) {
          const prompt = `You are Maya, an AI events agent for MooNs Events (India).
It has been 24 hours since we contacted this lead. We need to send them a formal quote/proposal.
Lead Name: ${lead.name}
Location: ${lead.location}
Budget: ${lead.budget_range}

Write an engaging email presenting a hypothetical events package (include 3 highlights) that fits their location.
End with a call to action asking if they want to book this.
Format strictly as JSON:
{
  "subject": "Email Subject",
  "htmlBody": "Email Body in HTML format (use <br> for newlines)",
  "quoteValueINR": 150000
}`;
          try {
            const res = await model.generateContent(prompt);
            const responseText = res.response
              .text()
              .replace(/\`\`\`json/gi, '')
              .replace(/\`\`\`/g, '')
              .trim();
            const emailData = JSON.parse(responseText);
            if (lead.ai_mode === 'autonomous') {
              await sendEmailOutbound(lead.email, emailData.subject, emailData.htmlBody);
              // Create CRM Deal & Quote
              const [dealRes] = await pool.query(
                `INSERT INTO crm_deals (title, value, pipeline_id, status, customer_name, customer_email, customer_phone)
                   VALUES (?, ?, 1, 'open', ?, ?, ?)`,
                [
                  `${lead.location} Package for ${lead.name}`,
                  emailData.quoteValueINR,
                  lead.name,
                  lead.email,
                  lead.phone,
                ],
              );
              await pool.query(
                `INSERT INTO crm_quotes (deal_id, total_amount, valid_until, status) 
                   VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'sent')`,
                [dealRes.insertId, emailData.quoteValueINR],
              );
              await pool.query(
                `INSERT INTO lead_followups (lead_id, follow_up_date, follow_up_type, channel, notes, outcome, status, completed_at) 
                   VALUES (?, NOW(), 'quote', 'email', 'AI sent quote email and created CRM Deal.', 'Quote Sent', 'completed', NOW())`,
                [lead.id],
              );
              // Update lead status
              await pool.query(
                `UPDATE lead_submissions 
                   SET status = 'quote_sent', last_contacted_at = NOW(), ai_last_action_at = NOW() 
                   WHERE id = ?`,
                [lead.id],
              );
              console.log(`[AI Auto-Pilot] Sent quote for lead: ${lead.name}`);
            }
          } catch (e) {
            console.error('AI Lead Stage 2 Error for lead', lead.id, e);
          }
        }
      }
      // Stage 3: Quote Sent -> Follow up (Wait 3 days)
      else if (lead.status === 'quote_sent') {
        const lastContacted = new Date(lead.last_contacted_at || lead.created_at).getTime();
        const now = Date.now();
        const daysPassed = (now - lastContacted) / (1000 * 60 * 60 * 24);
        if (daysPassed >= 3) {
          const prompt = `You are Maya, an AI events agent for MooNs Events (India).
It has been 3 days since we sent a quote to this lead. Write a polite, gentle follow-up email.
Lead Name: ${lead.name}
Location: ${lead.location}

Format strictly as JSON:
{
  "subject": "Email Subject",
  "htmlBody": "Email Body in HTML format (use <br> for newlines)"
}`;
          try {
            const res = await model.generateContent(prompt);
            const responseText = res.response
              .text()
              .replace(/\`\`\`json/gi, '')
              .replace(/\`\`\`/g, '')
              .trim();
            const emailData = JSON.parse(responseText);
            if (lead.ai_mode === 'autonomous') {
              await sendEmailOutbound(lead.email, emailData.subject, emailData.htmlBody);
              await pool.query(
                `INSERT INTO lead_followups (lead_id, follow_up_date, follow_up_type, channel, notes, outcome, status, completed_at) 
                   VALUES (?, NOW(), 'email', 'email', 'AI sent 3-day follow-up email.', 'Followup Sent', 'completed', NOW())`,
                [lead.id],
              );
              // Update last_contacted so it doesn't spam (could add a max followups count later)
              await pool.query(
                `UPDATE lead_submissions 
                   SET last_contacted_at = NOW(), ai_last_action_at = NOW() 
                   WHERE id = ?`,
                [lead.id],
              );
              console.log(`[AI Auto-Pilot] Sent 3-day follow-up for lead: ${lead.name}`);
            }
          } catch (e) {
            console.error('AI Lead Stage 3 Error for lead', lead.id, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('AI Autonomous Lead Loop failed:', e);
  }
}
// Compatibility export: the old lead agent could generate and send ungrounded
// commercial email autonomously. All scheduled callers now enter the governed,
// idempotent outbox runner; the legacy implementation above is unreachable.
export async function processAutonomousAILeads() {
  const { runEventAutomationBatch } = await import('../../services/eventAutomationService.js');
  return runEventAutomationBatch();
}
// Scheduling and IMAP lifecycle are owned by the dedicated worker process.
export async function isKnownVendor(email) {
  const pool = await getDbPool();
  const [rows] = await pool.query(`SELECT id FROM vendors WHERE email = ?`, [email]);
  return rows.length > 0;
}
/**
 * Resolve which vendor (and, ideally, which thread) an inbound reply belongs to.
 * Tolerant of replies from an alias address: tries exact email, then a match on
 * the RFQ subject (so "Re: <original subject>" threads correctly even from a
 * different sender), then the sender's email domain.
 */
export async function resolveVendorInbound(senderEmail, subject) {
  const pool = await getDbPool();
  // 1) Exact email match.
  const [exact] = await pool.query('SELECT id FROM vendors WHERE email = ? LIMIT 1', [senderEmail]);
  if (exact.length) return { vendorId: exact[0].id, method: 'email' };
  // 2) Subject → the most recent outbound thread with a matching RFQ subject.
  const cleanSubject = (subject || '').replace(/^\s*(re|fw|fwd)\s*:\s*/gi, '').trim();
  if (cleanSubject.length >= 4) {
    const [thread] = await pool.query(
      `SELECT vendor_id, thread_id FROM vendor_communications
       WHERE direction = 'outbound' AND subject LIKE ?
       ORDER BY created_at DESC LIMIT 1`,
      [`%${cleanSubject.slice(0, 120)}%`],
    );
    if (thread.length) {
      const row = thread[0];
      return { vendorId: row.vendor_id, threadId: row.thread_id || undefined, method: 'thread' };
    }
  }
  // 3) Same email domain as a known vendor (e.g. sales@ vs b2b@ same company).
  const domain = senderEmail.includes('@') ? senderEmail.split('@')[1] : '';
  if (domain) {
    const [dom] = await pool.query(
      'SELECT id FROM vendors WHERE email LIKE ? ORDER BY id DESC LIMIT 1',
      [`%@${domain}`],
    );
    if (dom.length) return { vendorId: dom[0].id, method: 'domain' };
  }
  return null;
}
/**
 * Log an inbound vendor reply into the conversation thread so it appears in
 * Maya's inbox. Resolves the vendor tolerantly, threads the message, and
 * de-duplicates so reprocessing or duplicate IMAP delivery never double-posts.
 */
export async function logInboundVendorReply(senderEmail, subject, body, receivedAt, options = {}) {
  const resolved = await resolveVendorInbound(senderEmail, subject);
  if (!resolved) {
    if (!options.quietUnknown)
      console.warn(
        `[Vendor AI] Could not resolve a vendor for inbound ${senderEmail}; not logged.`,
      );
    return { logged: false };
  }
  const pool = await getDbPool();
  let threadId = resolved.threadId;
  if (!threadId) {
    const [t] = await pool.query(
      `SELECT thread_id FROM vendor_communications
       WHERE vendor_id = ? AND thread_id IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [resolved.vendorId],
    );
    threadId = t[0]?.thread_id || `inbound_${Date.now()}`;
  }
  const safeSubject = (subject || '(no subject)').slice(0, 500);
  const safeBody = (body || '(no content)').slice(0, 20000);
  // Store the email's actual send time so the thread orders chronologically —
  // not the row-insert time (which clustered backfilled messages together).
  const sentAt = receivedAt && !Number.isNaN(receivedAt.getTime()) ? receivedAt : new Date();
  // De-dup on message identity: same vendor + subject + body + send time = the
  // same email (e.g. delivered twice, or re-seen by a backfill). Two genuinely
  // separate "hi" messages sent at different times differ in send time, so both
  // are kept. When no send time is known, fall back to a short guard window.
  const [dupe] = receivedAt
    ? await pool.query(
        `SELECT id FROM vendor_communications
         WHERE vendor_id = ? AND direction = 'inbound' AND subject = ? AND body_content = ?
           AND created_at = ? LIMIT 1`,
        [resolved.vendorId, safeSubject, safeBody, sentAt],
      )
    : await pool.query(
        `SELECT id FROM vendor_communications
         WHERE vendor_id = ? AND direction = 'inbound' AND subject = ? AND body_content = ?
           AND created_at > (NOW() - INTERVAL 2 MINUTE) LIMIT 1`,
        [resolved.vendorId, safeSubject, safeBody],
      );
  if (dupe.length) return { logged: false, vendorId: resolved.vendorId, threadId };
  await pool.query(
    `INSERT INTO vendor_communications (vendor_id, thread_id, direction, subject, body_content, status, created_at)
     VALUES (?, ?, 'inbound', ?, ?, 'delivered', ?)`,
    [resolved.vendorId, threadId, safeSubject, safeBody, sentAt],
  );
  console.log(
    `[Vendor AI] Logged inbound reply from ${senderEmail} (${resolved.method}) into thread ${threadId}`,
  );
  return { logged: true, vendorId: resolved.vendorId, threadId };
}
export async function processVendorReply(emailText, attachments, senderEmail, subject, receivedAt) {
  try {
    console.log(`[Vendor AI] Processing inbound reply from ${senderEmail}`);
    // Record the inbound reply into the vendor conversation thread FIRST, so it
    // always appears in Maya's inbox — even for a plain message like "hi" that
    // carries no rate data, or if the AI rate-extraction below fails.
    try {
      await logInboundVendorReply(senderEmail, subject, emailText, receivedAt);
    } catch (logErr) {
      console.error('[Vendor AI] Failed to log inbound vendor_communications:', logErr);
    }
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const { GoogleAIFileManager } = await import(/* @vite-ignore */ '@google/generative-ai/server');
    const genAI = await getGenAI();
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const parts = [
      {
        text: `You are Maya, AI Procurement Manager. Read this vendor email and any attached rate cards/brochures.
Email Sender: ${senderEmail}
Subject: ${subject}
Body: ${emailText}

Extract the vendor details, their main services, and generate a list of catalog items (rooms, cabs, activities) with their prices in INR.
Return STRICTLY in JSON format without markdown blocks:
{
  "vendor_name": "String",
  "contact_name": "String",
  "phone": "String (optional)",
  "whatsapp": "String (optional)",
  "bio": "String (short description of the vendor)",
  "service_categories": ["String (e.g., 'accommodation', 'car', 'experience', 'package')"],
  "coverage_areas": "String (e.g., 'Goa, Kerala')",
  "catalog_items": [
    {
      "item_name": "String",
      "catalog_type": "stay | car | activity",
      "location": "String",
      "net_cost": Number,
      "selling_price": Number,
      "description": "String"
    }
  ]
}`,
      },
    ];
    for (const att of attachments) {
      try {
        const uploadResponse = await fileManager.uploadFile(att.absolutePath, {
          mimeType: att.mimeType,
          displayName: att.filename,
        });
        parts.unshift({
          fileData: { mimeType: uploadResponse.file.mimeType, fileUri: uploadResponse.file.uri },
        });
      } catch (e) {
        console.error('[Vendor AI] Failed to upload attachment to Gemini:', e);
      }
    }
    const result = await model.generateContent(parts);
    const responseText = result.response
      .text()
      .replace(/\`\`\`json/gi, '')
      .replace(/\`\`\`/g, '')
      .trim();
    const data = JSON.parse(responseText);
    const pool = await getDbPool();
    // 1. Upsert Vendor
    const [vendorRes] = await pool.query(
      `INSERT INTO vendors (slug, company_name, contact_name, email, phone, whatsapp, service_categories, coverage_areas, bio, status)
       VALUES (LOWER(REPLACE(?, ' ', '-')), ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')
       ON DUPLICATE KEY UPDATE 
       company_name=VALUES(company_name), bio=VALUES(bio), status='pending_review'`,
      [
        data.vendor_name,
        data.vendor_name,
        data.contact_name || data.vendor_name || 'Unknown',
        senderEmail,
        data.phone || null,
        data.whatsapp || null,
        JSON.stringify(data.service_categories || []),
        data.coverage_areas,
        data.bio,
      ],
    );
    const vendorId = vendorRes.insertId || vendorRes.updateId; // simplistic ID retrieval, usually needs SELECT
    // 2. Fetch vendorId if update didn't return insertId
    let finalVendorId = vendorId;
    if (!finalVendorId) {
      const [vRows] = await pool.query('SELECT id FROM vendors WHERE email = ?', [senderEmail]);
      if (vRows.length > 0) finalVendorId = vRows[0].id;
    }
    if (!finalVendorId) return;
    // 3. Upsert Catalog Items
    for (const item of data.catalog_items) {
      await pool.query(
        `INSERT INTO catalog_items (vendor_id, item_name, catalog_type, location, description, net_cost, selling_price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          finalVendorId,
          item.item_name,
          item.catalog_type,
          item.location,
          item.description,
          item.net_cost,
          item.selling_price,
        ],
      );
    }
    console.log(`[Vendor AI] Successfully parsed and saved vendor ${data.vendor_name}`);
  } catch (err) {
    console.error('[Vendor AI] Failed to process vendor reply:', err);
  }
}
export async function processMayaAudioLead(leadId, audioFilePath, mimeType) {
  try {
    console.log(`[Maya Audio] Processing lead ${leadId} audio...`);
    const pool = await getDbPool();
    const [leadsRows] = await pool.query('SELECT * FROM lead_submissions WHERE id = ?', [leadId]);
    const leads = leadsRows;
    if (leads.length === 0) return;
    const lead = leads[0];
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const { GoogleAIFileManager } = await import(/* @vite-ignore */ '@google/generative-ai/server');
    const genAI = await getGenAI();
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const uploadResponse = await fileManager.uploadFile(audioFilePath, {
      mimeType: mimeType,
      displayName: `Call Recording for Lead ${leadId}`,
    });
    const prompt = `You are Maya, an expert AI events agent at MooNs Events (India).
Listen to the provided sales call recording between our agent and the customer. The customer might speak in Hindi, English, or a mix of both.
Extract their true events preferences, budget, exact location, and any objections or special requests.

Then, do the following:
1. Generate an updated 'notes' summary for the CRM.
2. Determine a realistic quote package price in INR based on what they discussed.
3. Write a highly persuasive, personalized WhatsApp message to send them immediately. The message MUST be naturally bilingual (Hindi written in English script + English), engaging, and use emojis like a real Indian events agent (e.g. "Namaste ${lead.name}! Kaise ho aap? I have designed the perfect package for your event...").
4. Write a formal email subject and HTML body summarizing the quote.

Format strictly as JSON without markdown blocks:
{
  "extracted": {
    "location": "String",
    "budget_range": "String",
    "clients_count": "Number",
    "crm_summary_notes": "String"
  },
  "quoteValueINR": "Number",
  "whatsappMessage": "String",
  "emailSubject": "String",
  "emailHtmlBody": "HTML String"
}`;
    const result = await model.generateContent([
      { fileData: { mimeType: uploadResponse.file.mimeType, fileUri: uploadResponse.file.uri } },
      { text: prompt },
    ]);
    const responseText = result.response
      .text()
      .replace(/\`\`\`json/gi, '')
      .replace(/\`\`\`/g, '')
      .trim();
    const data = JSON.parse(responseText);
    // Update CRM
    await pool.query(
      `UPDATE lead_submissions 
       SET location = ?, budget_range = ?, clients_count = ?, notes = CONCAT(notes, '\n\n[Maya Audio Summary]: ', ?), status = 'quote_sent', last_contacted_at = NOW(), ai_last_action_at = NOW()
       WHERE id = ?`,
      [
        data.extracted.location,
        data.extracted.budget_range,
        data.extracted.clients_count,
        data.extracted.crm_summary_notes,
        leadId,
      ],
    );
    // Create Deal & Quote
    const [dealRes] = await pool.query(
      `INSERT INTO crm_deals (title, value, pipeline_id, status, customer_name, customer_email, customer_phone)
       VALUES (?, ?, 1, 'open', ?, ?, ?)`,
      [
        `${data.extracted.location} Package for ${lead.name}`,
        data.quoteValueINR,
        lead.name,
        lead.email,
        lead.phone,
      ],
    );
    await pool.query(
      `INSERT INTO crm_quotes (deal_id, total_amount, valid_until, status) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'sent')`,
      [dealRes.insertId, data.quoteValueINR],
    );
    // Send Email
    await sendEmailOutbound(lead.email, data.emailSubject, data.emailHtmlBody);
    // Log WhatsApp and Email follow-ups
    await pool.query(
      `INSERT INTO lead_followups (lead_id, follow_up_date, follow_up_type, channel, notes, outcome, status, completed_at) 
       VALUES (?, NOW(), 'email', 'email', 'Maya sent audio-based quote email.', 'Quote Sent', 'completed', NOW()),
              (?, NOW(), 'whatsapp', 'whatsapp', 'Maya dispatched bilingual WhatsApp message.', 'Quote Sent', 'completed', NOW())`,
      [leadId, leadId],
    );
    console.log(`[WhatsApp API Stub] Message to ${lead.phone}:\n${data.whatsappMessage}`);
    console.log(
      `[Maya Audio] Successfully processed audio for lead ${leadId} and dispatched quotes.`,
    );
  } catch (e) {
    console.error('[Maya Audio] Failed to process audio lead:', e);
  }
}
export const adminGetOutreachQueue = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: adminAuthSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(data.auth);
    const pool = await getDbPool();
    const [rows] = await pool.query(`SELECT q.*, v.company_name, v.email 
       FROM vendor_outreach_queue q
       JOIN vendors v ON q.vendor_id = v.id
       ORDER BY q.created_at DESC LIMIT 100`);
    return rows;
  });
async function legacySearchDDGDisabled(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await globalThis.fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      throw new Error(`DDG search failed with status ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    const snippets = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const cleanSnippet = match[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      snippets.push(cleanSnippet);
      if (snippets.length >= 5) break;
    }
    return snippets;
  } catch (err) {
    console.error('DDG Error:', err);
    return [];
  }
}
export const chatRateLimitBackoff = new Map();
async function legacyProcessSingleSupportChatDisabled(chatId) {
  const pool = await getDbPool();
  // 1. Lock the chat
  const [updateResult] = await pool.query(
    "UPDATE support_chats SET ai_is_typing = 1 WHERE id = ? AND (ai_is_typing = 0 OR ai_is_typing IS NULL) AND status = 'open' AND (agent_id IS NULL OR agent_id = 0)",
    [chatId],
  );
  if (updateResult.affectedRows === 0) return;
  try {
    const [chatsRows] = await pool.query(
      `SELECT c.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM support_chats c 
       LEFT JOIN users u ON c.customer_id = u.id 
       WHERE c.id = ?`,
      [chatId],
    );
    const chats = chatsRows;
    if (chats.length === 0) return;
    const chat = chats[0];
    const backoffUntil = chatRateLimitBackoff.get(chat.id);
    if (backoffUntil && Date.now() < backoffUntil) {
      return; // Skip this chat while it's in silent backoff
    }
    // Get messages
    const [messagesRows] = await pool.query(
      'SELECT sender_id, content, created_at FROM support_messages WHERE chat_id = ? ORDER BY id DESC LIMIT 15',
      [chat.id],
    );
    const messages = messagesRows.reverse();
    if (messages.length === 0) return;
    // Don't reply if the last message was from an agent (including Maya with ID 0)
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_id !== chat.customer_id) {
      return;
    }
    // Format history
    const historyForGemini = [];
    for (const m of messages) {
      const role = m.sender_id === chat.customer_id ? 'user' : 'model';
      if (
        historyForGemini.length > 0 &&
        historyForGemini[historyForGemini.length - 1].role === role
      ) {
        historyForGemini[historyForGemini.length - 1].parts[0].text += '\n' + m.content;
      } else {
        historyForGemini.push({ role, parts: [{ text: m.content }] });
      }
    }
    while (historyForGemini.length > 0 && historyForGemini[0].role === 'model') {
      historyForGemini.shift();
    }
    const cleanHistory = [];
    for (let i = 0; i < historyForGemini.length; i++) {
      if (i === 0 || historyForGemini[i].role !== cleanHistory[cleanHistory.length - 1].role) {
        cleanHistory.push(historyForGemini[i]);
      } else {
        cleanHistory[cleanHistory.length - 1].parts[0].text +=
          '\n' + historyForGemini[i].parts[0].text;
      }
    }
    if (getGeminiKeys().length === 0) return;
    const { SchemaType } = await import(/* @vite-ignore */ '@google/generative-ai');
    const mayaTools = [
      {
        functionDeclarations: [
          {
            name: 'search_packages',
            description:
              'Search our live events packages database by location, country, name keyword, or category.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                location: {
                  type: SchemaType.STRING,
                  description: 'Location city or country',
                },
                category: {
                  type: SchemaType.STRING,
                  description: "Category like 'Luxury', 'Premium' or 'Economy' (optional)",
                },
                keyword: {
                  type: SchemaType.STRING,
                  description: "Keyword to match in the package name, e.g. 'conference' (optional)",
                },
              },
            },
          },
          {
            name: 'get_package_details',
            description:
              'Get the full day-by-day runOfShow, inclusions and exclusions of a specific package by its ID (from search_packages results).',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                package_id: { type: SchemaType.NUMBER, description: 'The package ID' },
              },
              required: ['package_id'],
            },
          },
          {
            name: 'search_stays',
            description: 'Search our live venues/stays inventory shown on the website.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                location: { type: SchemaType.STRING, description: 'Location, city or venue name' },
              },
              required: ['location'],
            },
          },
          {
            name: 'search_inventory',
            description: 'Search approved event vendors in the Master Catalog.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                category: {
                  type: SchemaType.STRING,
                  description:
                    "One of: 'venue', 'photography', 'decoration', 'catering', 'organizer', 'production', 'entertainment', 'logistics', 'staffing'",
                },
                query: {
                  type: SchemaType.STRING,
                  description: 'Location, country, or name keyword (optional)',
                },
              },
              required: ['category'],
            },
          },
          {
            name: 'get_locations',
            description:
              'List the locations we cover plus currently trending locations on the website.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: { type: SchemaType.STRING, description: 'Optional filter keyword' },
              },
            },
          },
          {
            name: 'get_active_offers',
            description:
              'Get the currently running promotional offers and discounts on the website (including the new-user welcome offer).',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {},
            },
          },
          {
            name: 'get_my_bookings',
            description:
              "Look up this customer's own bookings and payment status. Use when they ask about their booking, event status, or payment verification. Optionally filter by a booking reference like 'TPY-ABC123'.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                booking_reference: {
                  type: SchemaType.STRING,
                  description: 'Booking reference like TPY-XXXXXX (optional)',
                },
              },
            },
          },
          {
            name: 'create_crm_quote',
            description: 'Generate a quote, save to CRM, and email the customer.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                location: { type: SchemaType.STRING, description: 'The location quoted' },
                total_price: { type: SchemaType.NUMBER, description: 'Total price in INR' },
                email_subject: { type: SchemaType.STRING, description: 'Email subject line' },
                email_html_body: {
                  type: SchemaType.STRING,
                  description: 'Beautiful HTML email body for the quote',
                },
              },
              required: ['location', 'total_price', 'email_subject', 'email_html_body'],
            },
          },
          {
            name: 'search_web',
            description:
              'Search the web for live event information within Telangana and Andhra Pradesh.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: 'The search query to query DuckDuckGo with',
                },
              },
              required: ['query'],
            },
          },
        ],
      },
    ];
    const systemPrompt = `You are Maya, a professional and empathetic Events Consultant for MooNs Events — a premium Indian events company.
You are chatting with a customer named ${chat.customer_name} on the MooNs app/website.
Provide expert, friendly, and concise support. NEVER say "I'm an AI". Keep answers short (2-4 sentences).

CRITICAL CONSULTATION RULES:
1. Before recommending a package or creating a quote, YOU MUST ASK for the necessary details if missing: Location, Events Dates, Budget, Number of Clients, and Venue Preferences.
2. DO NOT hallucinate prices, availability, or permit rules. Always use tools for live public info and our catalog.
3. If you lack information, tell the user: "Let me check our live inventory for that..." and use a tool.
4. IMPORTANT FORMATTING: When suggesting packages, you MUST output them exactly in this markdown format so our UI can render cards: [PACKAGE:id:name:price] (e.g. [PACKAGE:12:Solo Saver Escape to Georgia:62000]). Do not use standard bullet points or text descriptions for the packages themselves.
5. When you create a quote using create_crm_quote, you MUST share the returned pdf_link in the chat so the customer can view it directly (e.g., "You can download your detailed quote here: [pdf_link]").

IMPORTANT KNOWLEDGE:
- MooNs sells event packages built only from approved Master Catalog vendors in Telangana and Andhra Pradesh. All prices are in INR.
- You can look up CRM bookings using the lookupBooking tool if they ask about their event.
- You can generate a Promo Code (generatePromoCode) up to ₹1000 if the user is extremely upset about a proven service failure.
- Always be polite.`;
    let currentContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
      ...cleanHistory,
    ];
    let replyContent = '';
    try {
      replyContent = await withMayaGeminiRotation('gemini-2.5-flash', async (model) => {
        let callCount = 0;
        const retryContents = structuredClone(currentContents);
        let res = await model.generateContent({ contents: retryContents, tools: mayaTools });
        while (res.response.functionCalls() && callCount < 4) {
          callCount++;
          const calls = res.response.functionCalls();
          const functionResponses = [];
          for (const call of calls) {
            console.log(`[Maya] Calling tool: ${call.name}`, call.args);
            let toolResult;
            try {
              const args = call.args;
              if (call.name === 'search_packages') {
                const dest = args.location ? `%${args.location}%` : '%';
                const cat = args.category ? `%${args.category}%` : '%';
                const kw = args.keyword ? `%${args.keyword}%` : '%';
                const [pkgs] = await pool.query(
                  'SELECT id, name, destination AS location, country, price, days, nights, category, description FROM packages WHERE is_active = 1 AND (destination LIKE ? OR country LIKE ?) AND category LIKE ? AND name LIKE ? LIMIT 5',
                  [dest, dest, cat, kw],
                );
                toolResult = { packages: pkgs };
              } else if (call.name === 'get_package_details') {
                const pkgId = Number(args.package_id);
                const [runOfShow] = await pool.query(
                  'SELECT day_number, title, description, city FROM package_itinerary WHERE package_id = ? ORDER BY day_number ASC',
                  [pkgId],
                );
                const [inclusions] = await pool.query(
                  'SELECT category, item FROM package_inclusions WHERE package_id = ?',
                  [pkgId],
                );
                const [exclusions] = await pool.query(
                  'SELECT item FROM package_exclusions WHERE package_id = ?',
                  [pkgId],
                );
                toolResult = { runOfShow, inclusions, exclusions };
              } else if (call.name === 'search_stays') {
                const loc = args.location ? `%${args.location}%` : '%';
                // The website's live stays inventory is accommodation_listings; the old `stays` table is legacy.
                const [stays] = await pool
                  .query(
                    "SELECT name, location, price_inr, rating, beds, guests FROM accommodation_listings WHERE is_active = 1 AND approval_status = 'approved' AND (location LIKE ? OR name LIKE ?) LIMIT 5",
                    [loc, loc],
                  )
                  .catch(() => [[]]);
                if (stays.length > 0) {
                  toolResult = { stays };
                } else {
                  const [legacy] = await pool
                    .query(
                      'SELECT name, location, price_per_night, stars FROM stays WHERE location LIKE ? OR name LIKE ? LIMIT 5',
                      [loc, loc],
                    )
                    .catch(() => [[]]);
                  toolResult = { stays: legacy };
                }
              } else if (call.name === 'search_inventory') {
                const q = args.query ? `%${args.query}%` : '%';
                const [rows] = await pool
                  .query(
                    "SELECT id, company_name, service_categories, coverage_areas, address, website_url, phone, email FROM vendors WHERE status = 'approved' AND (service_categories LIKE ? OR company_name LIKE ? OR coverage_areas LIKE ?) LIMIT 10",
                    [`%${args.category}%`, q, q],
                  )
                  .catch(() => [[]]);
                toolResult = { vendors: rows };
              } else if (call.name === 'get_locations') {
                const q = args.query ? `%${args.query}%` : '%';
                const [dests] = await pool
                  .query(
                    'SELECT name, country FROM locations WHERE name LIKE ? OR country LIKE ? LIMIT 10',
                    [q, q],
                  )
                  .catch(() => [[]]);
                toolResult = { locations: dests };
              } else if (call.name === 'get_active_offers') {
                const [offers] = await pool
                  .query(
                    'SELECT title, slug, description, discount_percent, target_scope, valid_until FROM promotional_offers WHERE is_active = 1',
                  )
                  .catch(() => [[]]);
                toolResult = {
                  offers,
                  note: 'The welcome offer is for NEW users with no booking history only: they claim it once on the website and it auto-applies on their first booking. Offer collection pages live at /collections/<slug>.',
                };
              } else if (call.name === 'get_my_bookings') {
                if (!chat.customer_id) {
                  toolResult = {
                    error:
                      "This visitor is not signed in, so account bookings can't be looked up. Ask them to sign in on the website, or share their booking reference and registered email so a team member can verify.",
                  };
                } else {
                  const params = [chat.customer_id];
                  let refFilter = '';
                  if (args.booking_reference) {
                    refFilter = ' AND b.booking_reference = ?';
                    params.push(String(args.booking_reference).trim().toUpperCase());
                  }
                  const [rows] = await pool
                    .query(
                      `SELECT b.booking_reference, b.item_type, b.item_name, b.amount, b.travel_date AS event_date, b.status,
                              (SELECT po.status FROM payment_orders po WHERE po.booking_id = b.id ORDER BY po.id DESC LIMIT 1) AS payment_status
                       FROM bookings b WHERE b.user_id = ?${refFilter} ORDER BY b.id DESC LIMIT 10`,
                      params,
                    )
                    .catch(() => [[]]);
                  toolResult = { bookings: rows };
                }
              } else if (call.name === 'create_crm_quote') {
                const q = args;
                const targetEmail = chat.customer_email || `guest-${chat.id}@moon.local`;
                const dealTitle = `${q.location} Package for ${chat.customer_name || 'Guest'}`;
                const dealName = chat.customer_name || 'Guest';
                const dealPhone = chat.customer_phone || chat.guest_phone || '';
                const [dealRes] = await pool.query(
                  `INSERT INTO crm_deals (title, value, customer_name, customer_email, customer_phone, pipeline_id, status) 
                     VALUES (?, ?, ?, ?, ?, 1, 'open')`,
                  [dealTitle, q.total_price, dealName, targetEmail, dealPhone],
                );
                const [quoteRes] = await pool.query(
                  `INSERT INTO crm_quotes (deal_id, total_amount, valid_until, status) 
                     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'draft')`,
                  [dealRes.insertId, q.total_price],
                );
                const quoteId = quoteRes.insertId;
                const hostUrl =
                  process.env.VITE_CONFIG_PUBLIC_URL ||
                  process.env.CONFIG_PUBLIC_URL ||
                  'http://localhost:3000';
                const pdfLink = `${hostUrl}/api/public/quotes/${quoteId}/pdf`;
                if (chat.customer_email) {
                  try {
                    const { generateQuotePdfStream } = await import('../pdf-generator');
                    const quoteObj = {
                      title: dealTitle,
                      value: q.total_price,
                      contact_name: dealName,
                      contact_email: targetEmail,
                    };
                    const pdfStream = await generateQuotePdfStream(quoteObj);
                    const chunks = [];
                    for await (const chunk of pdfStream) {
                      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                    }
                    const pdfBuffer = Buffer.concat(chunks);
                    const base64Pdf = pdfBuffer.toString('base64');
                    const attachments = [
                      {
                        filename: `MooNs_Event_Quote_${quoteId}.pdf`,
                        content: base64Pdf,
                        encoding: 'base64',
                      },
                    ];
                    const enhancedEmailBody = `${q.email_html_body}<br><br><div style="margin-top: 20px;"><a href="${pdfLink}" style="display:inline-block;padding:12px 24px;background-color:#10b981;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-family:sans-serif;">Download Full Quote (PDF)</a></div>`;
                    await sendEmailOutbound(
                      chat.customer_email,
                      q.email_subject,
                      enhancedEmailBody,
                      attachments,
                    );
                    console.log(
                      `[Maya] Emailed quote to ${chat.customer_email} with PDF attachment`,
                    );
                  } catch (emailErr) {
                    console.warn(
                      `[Maya] Failed to email quote (SMTP config error?), but quote was created: ${emailErr.message}`,
                    );
                  }
                }
                toolResult = {
                  success: true,
                  pdf_link: pdfLink,
                  message: 'Quote created successfully.',
                };
              } else if (call.name === 'search_web') {
                const results = await legacySearchDDGDisabled(args.query);
                toolResult = { results };
              } else {
                toolResult = { error: 'Tool not found' };
              }
            } catch (err) {
              toolResult = { error: err.message };
            }
            functionResponses.push({ name: call.name, response: toolResult });
          }
          retryContents.push({ role: 'model', parts: res.response.candidates[0].content.parts });
          retryContents.push({
            role: 'function',
            parts: functionResponses.map((fr) => ({
              functionResponse: { name: fr.name, response: fr.response },
            })),
          });
          res = await model.generateContent({ contents: retryContents, tools: mayaTools });
        }
        return res.response.text().trim();
      });
    } catch (e) {
      if (isGeminiRateLimitError(e)) {
        console.warn(
          '[Maya] All Gemini keys appear rate limited. Silently backing off chat',
          chat.id,
          'for 60s.',
        );
        chatRateLimitBackoff.set(chat.id, Date.now() + 60000);
        return; // Exit function so we don't hammer the API more this cycle
      }
      console.error('Maya generation error:', e);
      // On general error, backoff for 30s to prevent rapid crashing loops
      chatRateLimitBackoff.set(chat.id, Date.now() + 30000);
      return;
    }
    if (replyContent) {
      await pool.query(
        'INSERT INTO support_messages (chat_id, sender_id, content) VALUES (?, ?, ?)',
        [chat.id, 0, replyContent],
      );
      if (chat.agent_id === null) {
        await pool.query(
          'UPDATE support_chats SET agent_id = 0 WHERE id = ? AND agent_id IS NULL',
          [chat.id],
        );
      }
    }
  } catch (error) {
    if (isGeminiRateLimitError(error)) {
      console.warn(
        '[Maya] All Gemini keys appear rate limited. Silently backing off chat',
        chatId,
        'for 60s.',
      );
      chatRateLimitBackoff.set(chatId, Date.now() + 60000);
    } else {
      console.error('Maya generation error:', error);
      chatRateLimitBackoff.set(chatId, Date.now() + 30000);
    }
  } finally {
    await pool.query('UPDATE support_chats SET ai_is_typing = 0 WHERE id = ?', [chatId]);
  }
}
export async function processAutonomousSupportChats() {
  const { processGovernedSupportChats } =
    await import('../../maya/support/supportChatProcessor.js');
  return processGovernedSupportChats();
}
export async function processSingleSupportChat(chatId) {
  const { processGovernedSupportChat } = await import('../../maya/support/supportChatProcessor.js');
  return processGovernedSupportChat(chatId);
}
// =====================================================================
// Email Templates Management
// =====================================================================
// Ensure scope_tags and is_active columns exist, and migrate legacy templates
export async function ensureEmailTemplateScopeTagsImpl() {
  const pool = await getDbPool();
  try {
    await resolve();
  } catch {
    // Column likely already exists
  }
  try {
    await resolve();
  } catch {
    // Column likely already exists
  }
  // Migrate pre-existing default templates to correct scope tags if they are still set to 'full'
  try {
    await pool.query(
      "UPDATE email_templates SET scope_tags = 'venues' WHERE name LIKE 'Venue RFQ%' AND scope_tags = 'full'",
    );
    await pool.query(
      "UPDATE email_templates SET scope_tags = 'transport' WHERE name LIKE 'Transport RFQ%' AND scope_tags = 'full'",
    );
  } catch (err) {
    console.error('Failed to migrate legacy template scope tags', err);
  }
}
// Helper: fetch package data and build template variable map
export async function buildRfqTemplateVars(packageId, eventDates, customVenues) {
  const pool = await getDbPool();
  const [pkgRows] = await pool.query('SELECT * FROM packages WHERE id = ?', [packageId]);
  if (!pkgRows || pkgRows.length === 0) throw new Error('Package not found');
  const pkg = pkgRows[0];
  const [linesRows] = await pool.query(
    'SELECT * FROM package_line_items WHERE package_id = ? ORDER BY day_number ASC',
    [packageId],
  );
  const lines = linesRows;
  const [itinRows] = await pool.query(
    'SELECT day_number, title, description, city FROM package_itinerary WHERE package_id = ? ORDER BY day_number ASC',
    [packageId],
  );
  const runOfShow = itinRows;
  const [inclRows] = await pool.query(
    'SELECT category, item FROM package_inclusions WHERE package_id = ? ORDER BY category, id',
    [packageId],
  );
  const inclusions = inclRows;
  const [exclRows] = await pool.query(
    'SELECT item FROM package_exclusions WHERE package_id = ? ORDER BY id',
    [packageId],
  );
  const exclusions = exclRows;
  // Build runOfShow string
  let runOfShowStr = '';
  if (runOfShow.length > 0) {
    runOfShow.forEach((day) => {
      runOfShowStr += `Day ${day.day_number}: ${day.title}\n`;
      if (day.description) runOfShowStr += `  ${day.description}\n`;
    });
  } else {
    runOfShowStr = 'RunOfShow details to be confirmed.';
  }
  // Build venues string
  let venuesStr = '';
  if (customVenues && customVenues.length > 0) {
    customVenues.forEach((h) => {
      venuesStr += `• ${h}\n`;
    });
  } else {
    const venueItems = lines.filter((l) => l.catalog_type === 'stay' || l.catalog_type === 'room');
    if (venueItems.length > 0) {
      venueItems.forEach((h) => {
        venuesStr += `• ${h.item_name} (Night ${h.day_number})`;
        if (h.quantity && h.quantity > 1) venuesStr += ` × ${h.quantity}`;
        if (h.unit_type) venuesStr += ` [${h.unit_type.replace(/_/g, ' ')}]`;
        if (h.notes) venuesStr += ` — ${h.notes}`;
        venuesStr += `\n`;
      });
    } else if (runOfShow.length > 0) {
      const cities = [...new Set(runOfShow.filter((d) => d.city).map((d) => d.city))];
      venuesStr = `Venues needed in: ${cities.join(', ')} (${pkg.nights} nights total)\nPlease provide room categories, meal plan options (CP/MAP/AP), and net rates.`;
    } else {
      venuesStr = `Event venue requirements to be confirmed in ${pkg.destination}.`;
    }
  }
  // Build transport string
  let transportStr = '';
  if (runOfShow.length > 0) {
    const activityItems = lines.filter((l) => l.catalog_type === 'activity');
    runOfShow.forEach((day, index) => {
      const dayActivities = activityItems.filter((a) => a.day_number === day.day_number);
      let routeParts = [];
      // Start of day
      if (index === 0) routeParts.push('EventSite');
      else routeParts.push('Venue');
      // Activities
      if (dayActivities.length > 0) {
        dayActivities.forEach((a) => routeParts.push(a.item_name));
      } else if (index > 0 && index < runOfShow.length - 1 && day.title) {
        routeParts.push(day.title);
      }
      // End of day
      if (index === runOfShow.length - 1) routeParts.push('EventSite');
      else routeParts.push('Venue');
      const route = routeParts.join(' to ');
      transportStr += `• Day ${day.day_number}: ${route} (SIC & Private pricing)\n`;
    });
  } else {
    transportStr = `Event logistics, crew movement, and guest transfers for ${pkg.days} days in ${pkg.destination}.`;
  }
  // Build activities string
  let activitiesStr = '';
  const activityItems = lines.filter((l) => l.catalog_type === 'activity');
  if (activityItems.length > 0) {
    activityItems.forEach((a) => {
      activitiesStr += `• Day ${a.day_number}: ${a.item_name}`;
      if (a.notes) activitiesStr += ` — ${a.notes}`;
      activitiesStr += `\n`;
    });
  } else if (runOfShow.length > 0) {
    runOfShow.forEach((day, index) => {
      if (index === 0) {
        activitiesStr += `• Day ${day.day_number}: Arrival transfer SIC or Private\n`;
      } else if (index === runOfShow.length - 1) {
        activitiesStr += `• Day ${day.day_number}: Departure transfer SIC or Private\n`;
      } else {
        activitiesStr += `• Day ${day.day_number}: ${day.title}\n`;
      }
    });
  } else {
    activitiesStr = 'Activities to be confirmed.';
  }
  // Build inclusions string
  let inclusionsStr = '';
  if (inclusions.length > 0) {
    const byCategory = {};
    inclusions.forEach((inc) => {
      const cat = inc.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(inc.item);
    });
    Object.entries(byCategory).forEach(([cat, items]) => {
      inclusionsStr += `• ${cat}: ${items.join(', ')}\n`;
    });
  } else {
    inclusionsStr = 'Inclusions to be confirmed.';
  }
  // Build exclusions string
  let exclusionsStr = '';
  if (exclusions.length > 0) {
    exclusions.forEach((exc) => {
      exclusionsStr += `• ${exc.item}\n`;
    });
  } else {
    exclusionsStr = 'Exclusions to be confirmed.';
  }
  return {
    '{{package_name}}': pkg.name || '',
    '{{location}}': `${pkg.destination}, ${pkg.country}`,
    '{{duration}}': `${pkg.days} Days / ${pkg.nights} Nights`,
    '{{event_dates}}': eventDates || 'TBD',
    '{{days}}': String(pkg.days || ''),
    '{{nights}}': String(pkg.nights || ''),
    '{{category}}': pkg.category || 'General',
    '{{description}}': pkg.description || '',
    '{{runOfShow}}': runOfShowStr.trim(),
    '{{venues}}': venuesStr.trim(),
    '{{transport}}': transportStr.trim(),
    '{{activities}}': activitiesStr.trim(),
    '{{inclusions}}': inclusionsStr.trim(),
    '{{exclusions}}': exclusionsStr.trim(),
  };
}
// Render a template with real package data by replacing {{placeholders}}
// Seed built-in RFQ templates. Version-gated: bumping RFQ_SEED_VERSION
// refreshes the built-in templates (matched by name) with improved copy and
// inserts any new ones; templates the user created under other names are
// never touched.
export const RFQ_SEED_VERSION = '2';
export async function seedRfqTemplates() {
  await ensureMayaTables();
  const pool = await getDbPool();
  const [verRows] = await pool.query(
    "SELECT setting_value FROM maya_settings WHERE setting_key = 'rfq_seed_version'",
  );
  const refreshBuiltIns = (verRows[0]?.setting_value || '0') !== RFQ_SEED_VERSION;
  // ─── Shared building blocks ───
  const COMMERCIAL_TERMS = `💼 COMMERCIAL TERMS — PLEASE CONFIRM
• Net, non-commissionable B2B rates (state the currency; GST / taxes shown separately)
• Rate validity period and seasonal / festive / weekend supplements, if any
• Option (hold) period on the quoted availability
• Payment terms — advance %, balance due date, and credit facility for regular volume
• Cancellation & amendment policy with date-wise retention slabs
• Booking process and confirmation turnaround time (TAT)
• 24×7 emergency / on-ground contact for the events dates`;
  const SALES_SUPPORT = `📸 SALES SUPPORT MATERIAL
• High-resolution photos, brochures, or short videos we can use in our customer proposal
• Licenses, certifications, or awards we can highlight while selling
• Guest ratings / review highlights, if available`;
  const CLOSING = `We are quoting a live customer enquiry, so a response within 24–48 hours will help us close this booking. If any component is unavailable for these dates, please suggest the closest alternative with rates.

Best regards,
Maya
Procurement Manager, MooNs Events`;
  const INTRO = `Dear Partner,

I'm Maya, Procurement Manager at MooNs Events, a B2B events company based in India. We are pricing our "{{package_name}}" runOfShow for a confirmed customer enquiry and would like your best net rates and availability.`;
  const VENUE_BLOCK = `🏨 ACCOMMODATION — PLEASE QUOTE
{{venues}}

For each property, please provide:
✓ Star category and room categories with maximum occupancy (Standard / Deluxe / Suite / Villa)
✓ Net rate per room per night for each category, with meal plans priced clearly (EP / CP / MAP / AP)
✓ Child policy with age slabs — with bed and without bed — and extra-bed charges
✓ Check-in / check-out times, plus early check-in and late check-out charges
✓ What the rate includes (breakfast, WiFi, eventSite shuttle, pool / leisure access)
✓ Compulsory supplements (Christmas / New Year gala dinner) and blackout dates
✓ Group rates and FOC policy (e.g., 1 FOC per 15 paying pax), if applicable
✓ Honeymoon / anniversary inclusions (cake, decor, room upgrade), if available`;
  const TRANSPORT_BLOCK = `🚗 TRANSPORT — PLEASE QUOTE
{{transport}}

For each service, please provide:
✓ Vehicle options with make, model, and year (Sedan / SUV / Tempo Client / Minivan / Coach)
✓ Seating and luggage capacity per vehicle, with AC confirmation
✓ Per-transfer rates (one-way / return) and per-day disposal rates with km limits and extra-km charges
✓ Driver details — English-speaking availability, daily allowance, night-halt charges
✓ Tolls, parking, permits, and interstate taxes — included or extra
✓ EventSite meet & greet with name placard — availability and charges
✓ Waiting-time policy and night-driving charges
✓ Backup vehicle / breakdown replacement commitment and passenger insurance coverage`;
  const PACKAGE_ASKS = `🧾 LAND PACKAGE — PLEASE QUOTE
✓ Net per-person price on twin sharing, plus single and eventle supplements
✓ Child price with age slabs (with bed / without bed)
✓ SIC (shared) vs. private options, priced separately where relevant
✓ Entrance / monument fees — itemised list of what is covered
✓ Licensed English-speaking guide — included days and extra charges
✓ Permit assistance / documentation support, if you provide it
✓ FOC policy for groups (e.g., 1 FOC per 15 paying pax)
✓ Anything in the runOfShow you cannot operate — please flag it with an alternative`;
  const overviewBlock = (extra = '') => `📋 REQUIREMENT OVERVIEW
• Location: {{location}}
• Duration: {{duration}}
• Events Dates: {{event_dates}}
• Client Profile: {{category}}${extra}`;
  const seeds = [
    {
      name: 'Full Package RFQ',
      scope_tags: 'full',
      subject: 'RFQ: {{package_name}} | {{location}} | {{event_dates}}',
      body: `${INTRO}

${overviewBlock(`
• Concept: {{description}}`)}

📅 DAY-BY-DAY RUN_OF_SHOW
{{runOfShow}}

🎯 ACTIVITIES & EXPERIENCES
{{activities}}

✅ CURRENTLY INCLUDED
{{inclusions}}

❌ NOT INCLUDED
{{exclusions}}

${PACKAGE_ASKS}

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
    {
      name: 'Venues Only RFQ',
      scope_tags: 'venues',
      subject: 'RFQ: Venue rates — {{location}} | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

${VENUE_BLOCK}

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
    {
      name: 'Transport Only RFQ',
      scope_tags: 'transport',
      subject: 'RFQ: Ground transport — {{location}} | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

${TRANSPORT_BLOCK}

${COMMERCIAL_TERMS}

${CLOSING}`,
    },
    {
      name: 'Venues + Transport RFQ',
      scope_tags: 'venues,transport',
      subject: 'RFQ: Venues & transport — {{location}} | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

${VENUE_BLOCK}

${TRANSPORT_BLOCK}

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
    {
      name: 'Full Package + Venues RFQ',
      scope_tags: 'full,venues',
      subject: 'RFQ: {{package_name}} — package & venues | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

📅 DAY-BY-DAY RUN_OF_SHOW
{{runOfShow}}

${VENUE_BLOCK}

🎯 ACTIVITIES & EXPERIENCES
{{activities}}

✅ CURRENTLY INCLUDED
{{inclusions}}

${PACKAGE_ASKS}

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
    {
      name: 'Full Package + Transport RFQ',
      scope_tags: 'full,transport',
      subject: 'RFQ: {{package_name}} — package & transport | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

📅 DAY-BY-DAY RUN_OF_SHOW
{{runOfShow}}

${TRANSPORT_BLOCK}

🎯 ACTIVITIES & EXPERIENCES
{{activities}}

✅ CURRENTLY INCLUDED
{{inclusions}}

${PACKAGE_ASKS}

${COMMERCIAL_TERMS}

${CLOSING}`,
    },
    {
      name: 'Full Package + Venues + Transport RFQ',
      scope_tags: 'full,venues,transport',
      subject: 'RFQ: {{package_name}} — complete land arrangements | {{event_dates}}',
      body: `${INTRO}

${overviewBlock()}

📅 DAY-BY-DAY RUN_OF_SHOW
{{runOfShow}}

${VENUE_BLOCK}

${TRANSPORT_BLOCK}

🎯 ACTIVITIES & EXPERIENCES
{{activities}}

✅ CURRENTLY INCLUDED
{{inclusions}}

❌ NOT INCLUDED
{{exclusions}}

${PACKAGE_ASKS}

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
    {
      name: 'VenueProduction RFQ',
      scope_tags: 'venueProduction',
      subject: 'RFQ: VenueProduction — {{location}} | {{event_dates}}',
      body: `Dear Partner,

I'm Maya, Procurement Manager at MooNs Events, a B2B events company based in India. We are building a venueProduction proposal for a live customer enquiry ("{{package_name}}") and would like your best B2B fares and availability.

🚢 SAILING REQUIRED
• Location / Region: {{location}}
• Preferred Events Dates: {{event_dates}}
• Duration: {{duration}}
• Client Profile: {{category}} (final pax count shared on confirmation)

Please share matching sailings from the venueProduction lines you represent, covering:

🛏 CABINS & FARES
✓ Ship name, sailing date, and the full port-by-port runOfShow with embarkation / disembarkation ports and times
✓ Net per-person fares on twin sharing for each cabin category — Interior / Oceanview / Balcony / Suite
✓ 3rd / 4th berth rates, child rates with age slabs, and single-occupancy supplement
✓ Port charges, government taxes, and onboard gratuities — included or payable extra (with amounts)
✓ Current promotions applicable to B2B bookings (onboard credit, drinks package, cabin upgrades)

🍽 ONBOARD & ADD-ONS
✓ Meal plan included in the fare, and specialty-dining / beverage package prices
✓ Shore excursion options and rates at each port of call
✓ Pre / post-venueProduction venue nights and port transfers, if you can package them

📄 BOOKING & DOCUMENTATION
✓ Deposit amount, option (hold) period on cabins, and final payment deadline
✓ Cancellation slabs by date
✓ Credential validity and permit requirements per port for Indian credential holders
✓ Age, pregnancy, and medical policies we must inform guests about
✓ Group allocation (GAP) rates and showcase-conductor / FOC berth policy, if applicable
✓ Events insurance requirements

${COMMERCIAL_TERMS}

📸 SALES SUPPORT MATERIAL
• Ship deck plans, cabin photos, and brochures we can use in our customer proposal

We are quoting a live enquiry, so a response within 24–48 hours will help us close. If the exact dates are unavailable, please suggest the nearest alternative sailings with fares.

Best regards,
Maya
Procurement Manager, MooNs Events`,
    },
    {
      name: 'Activity RFQ: Day Showcases & City Excursions',
      scope_tags: 'full',
      subject: 'RFQ: Day showcases & activities — {{location}} | {{event_dates}}',
      body: `Dear Partner,

Greetings from MooNs Events!

I'm Maya, Procurement Manager at MooNs Events, a B2B events company based in India. We are integrating day showcases and excursions into our "{{package_name}}" runOfShow for a live customer enquiry and would like your confidential B2B tariff.

${overviewBlock()}

🎯 ACTIVITIES REQUIRED
{{activities}}

For each showcase / activity, please provide:
✓ Net non-commissionable rate — SIC (shared) and private, priced separately
✓ Duration, start times, and days of operation
✓ Inclusions / exclusions (entrance fees, meals, venue pick-up & drop-off)
✓ Guide qualifications — licensed, English-speaking (other languages if available)
✓ Child rates with age slabs, and minimum pax for the showcase to operate
✓ What guests must carry / wear, and any fitness or age restrictions we should tell customers

${COMMERCIAL_TERMS}

${SALES_SUPPORT}

${CLOSING}`,
    },
  ];
  for (const seed of seeds.filter((item) => item.name !== 'VenueProduction RFQ')) {
    const [existing] = await pool.query(
      "SELECT id FROM email_templates WHERE name = ? AND type = 'rfq' LIMIT 1",
      [seed.name],
    );
    if (existing.length > 0) {
      if (refreshBuiltIns) {
        await pool.query(
          'UPDATE email_templates SET subject = ?, body = ?, scope_tags = ? WHERE id = ?',
          [seed.subject, seed.body, seed.scope_tags, existing[0].id],
        );
      }
      continue;
    }
    await pool.query(
      "INSERT INTO email_templates (name, subject, body, type, scope_tags) VALUES (?, ?, ?, 'rfq', ?)",
      [seed.name, seed.subject, seed.body, seed.scope_tags],
    );
  }
  if (refreshBuiltIns) {
    await setMayaSetting('rfq_seed_version', RFQ_SEED_VERSION);
  }
}
// Seed built-in Outreach templates
export async function seedOutreachTemplates() {
  const pool = await getDbPool();
  const seeds = [
    {
      name: 'Outreach: General',
      scope_tags: 'general',
      subject: 'Partnership Inquiry: MooNs Events',
      body: `Dear Partner,

Greetings from MooNs Events!

My name is Maya, and I am a Senior Events Planner. We are currently curating new runOfShows and are highly interested in integrating your services.

Could you please provide your confidential B2B tariff sheet and latest catalog?

In your proposal, please clearly outline:
1. Standard B2B rates and commission structure
2. Inclusions/Exclusions
3. Booking and cancellation policies

We are looking to promote your services to our FIT clients and look forward to a mutually beneficial partnership.

Sincerely,

Maya
Procurement Manager
MooNs Events`,
    },
    {
      name: 'Outreach: Stays',
      scope_tags: 'accommodation',
      subject: 'Accommodation Partnership Inquiry: MooNs Events',
      body: `Dear Partner,

Greetings from MooNs Events!

My name is Maya, and I am a Senior Events Planner. We are currently curating accommodation options in {{coverage_areas}} for our clients and are highly interested in your property.

Could you please provide your confidential B2B tariff sheet? We are specifically interested in:
- Room categories and availability.
- Meal plan options (CP, MAP, AP).
- Group policies and blackout dates.

In your proposal, please clearly outline:
1. Room amenities and inclusions.
2. Your B2B commission structure or net non-commissionable rates.
3. Child and extra bed policies.

We are looking to promote your property heavily to our FIT clients and look forward to a mutually beneficial partnership.

Sincerely,

Maya
Procurement Manager
MooNs Events`,
    },
    {
      name: 'Outreach: Transport',
      scope_tags: 'car',
      subject: 'Transport Partnership Inquiry: MooNs Events',
      body: `Dear Partner,

Greetings from MooNs Events!

My name is Maya, and I am a Senior Events Planner. We are currently curating transport services in {{coverage_areas}} and are highly interested in integrating your fleet into our runOfShows.

Could you please provide your confidential B2B tariff sheet? We are specifically interested in:
- Vehicle types (Sedan, SUV, Van, Coach).
- Seating and luggage capacities.
- Per-transfer and disposal rates.

In your proposal, please clearly outline:
1. Toll, parking, and fuel inclusions.
2. English-speaking driver availability.
3. Your B2B commission structure or net non-commissionable rates.

We are looking to promote your services heavily to our FIT clients and look forward to a mutually beneficial partnership.

Sincerely,

Maya
Procurement Manager
MooNs Events`,
    },
    {
      name: 'Outreach: Experiences',
      scope_tags: 'experience',
      subject: 'Activities Partnership Inquiry: MooNs Events',
      body: `Dear Partner,

Greetings from MooNs Events!

My name is Maya, and I am a Senior Events Planner. We are currently curating a comprehensive guide for {{coverage_areas}} and are highly interested in integrating your day showcases and excursions into our runOfShows.

Could you please provide your confidential B2B tariff sheet for your primary activities?

In your proposal, please clearly outline:
1. Inclusions/Exclusions (e.g., entrance fees, meals).
2. Guide qualifications.
3. Your B2B commission structure or net non-commissionable rates.
4. Minimum pax requirements.

We are looking to promote your services heavily to our FIT clients and look forward to a mutually beneficial partnership.

Sincerely,

Maya
Procurement Manager
MooNs Events`,
    },
  ];
  for (const seed of seeds) {
    const [existing] = await pool.query(
      "SELECT COUNT(*) as cnt FROM email_templates WHERE scope_tags = ? AND type = 'outreach'",
      [seed.scope_tags],
    );
    if (existing[0].cnt > 0) continue;
    await pool.query(
      "INSERT INTO email_templates (name, subject, body, type, scope_tags) VALUES (?, ?, ?, 'outreach', ?)",
      [seed.name, seed.subject, seed.body, seed.scope_tags],
    );
  }
}
export const MAYA_AREAS = [
  'leads',
  'followups',
  'clients',
  'escrow',
  'refunds',
  'careers',
  'payments',
  'contingencies',
  'inactive_leads',
];
export async function ensureMayaTablesImpl() {
  const pool = await getDbPool();
  await resolve();
  await resolve();
  // The clients sweep writes into crm_clients before any UI has touched it.
  await resolve();
}
export async function logMayaActivity(area, action, refId, summary, status = 'done') {
  try {
    const pool = await getDbPool();
    await pool.query(
      `INSERT INTO maya_activity_log (area, action, ref_id, summary, status) VALUES (?, ?, ?, ?, ?)`,
      [area, action, refId, summary.slice(0, 590), status],
    );
  } catch (e) {
    console.error('[Maya] Failed to log activity:', e);
  }
}
export async function mayaHasRecentActivity(pool, area, action, hours) {
  const [rows] = await pool.query(
    `SELECT id FROM maya_activity_log WHERE area = ? AND action = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? HOUR) LIMIT 1`,
    [area, action, hours],
  );
  return rows.length > 0;
}
export async function getMayaSettings() {
  const pool = await getDbPool();
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM maya_settings');
  const map = {};
  for (const row of rows) map[row.setting_key] = row.setting_value;
  return map;
}
export function mayaAreaEnabled(settings, area) {
  return settings[`autopilot_${area}`] !== 'off';
}
export async function setMayaSetting(key, value) {
  const pool = await getDbPool();
  await pool.query(
    `INSERT INTO maya_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value],
  );
}
// Converted leads become CRM client profiles automatically, and lifetime
// value stays in sync with confirmed booking revenue matched by email.
export async function mayaSyncClients(pool) {
  let actions = 0;
  const [leadRows] = await pool.query(`
    SELECT l.id, l.name, l.email, l.phone FROM lead_submissions l
    WHERE l.status = 'converted'
      AND NOT EXISTS (
        SELECT 1 FROM crm_clients c
        WHERE (l.email IS NOT NULL AND l.email <> '' AND c.email = l.email)
           OR (l.phone IS NOT NULL AND l.phone <> '' AND c.phone = l.phone)
      )
  `);
  for (const lead of leadRows) {
    await pool.query(
      `INSERT INTO crm_clients (name, email, phone, status, last_active) VALUES (?, ?, ?, 'Active', 'Converted from lead')`,
      [lead.name, lead.email || null, lead.phone || null],
    );
    await logMayaActivity(
      'clients',
      'client_created',
      lead.id,
      `Created a client profile for converted lead "${lead.name}".`,
    );
    actions++;
  }
  try {
    const [ltvRows] = await pool.query(`
      SELECT c.id, c.name, c.status, c.lifetime_value, SUM(b.amount) AS revenue
      FROM crm_clients c
      JOIN users u ON u.email = c.email
      JOIN bookings b ON b.user_id = u.id AND b.status = 'confirmed'
      WHERE c.email IS NOT NULL AND c.email <> ''
      GROUP BY c.id, c.name, c.status, c.lifetime_value
    `);
    for (const row of ltvRows) {
      const revenue = Number(row.revenue || 0);
      if (revenue > 0 && Math.round(revenue) !== Math.round(Number(row.lifetime_value || 0))) {
        await pool.query('UPDATE crm_clients SET lifetime_value = ? WHERE id = ?', [
          revenue,
          row.id,
        ]);
        if (revenue >= 200000 && row.status !== 'VIP' && row.status !== 'Archived') {
          await pool.query("UPDATE crm_clients SET status = 'VIP' WHERE id = ?", [row.id]);
          await logMayaActivity(
            'clients',
            'vip_upgraded',
            row.id,
            `Upgraded ${row.name} to VIP — lifetime value crossed ₹${Math.round(revenue).toLocaleString('en-IN')}.`,
          );
        }
        actions++;
      }
    }
  } catch (e) {
    console.error('[Maya] Client LTV sync skipped:', e);
  }
  return actions;
}
// Releases escrow milestones whose scheduled date has arrived, but only for
// confirmed bookings — pending/cancelled bookings never auto-release.
export async function mayaSweepEscrow(pool) {
  const [dueRows] = await pool.query(`
    SELECT el.id, el.amount, el.milestone_type, b.booking_reference
    FROM escrow_ledger el
    JOIN bookings b ON el.booking_id = b.id
    WHERE el.status = 'held'
      AND el.scheduled_release_date IS NOT NULL
      AND el.scheduled_release_date <= NOW()
      AND b.status = 'confirmed'
  `);
  for (const row of dueRows) {
    await pool.query(
      "UPDATE escrow_ledger SET status = 'released', actual_release_date = NOW() WHERE id = ? AND status = 'held'",
      [row.id],
    );
    await logMayaActivity(
      'escrow',
      'milestone_released',
      row.id,
      `Released ${String(row.milestone_type).replace(/_/g, ' ')} of ₹${Number(row.amount || 0).toLocaleString('en-IN')} for booking ${row.booking_reference} — scheduled date reached.`,
    );
  }
  return dueRows.length;
}
// Escalates stale refunds into admin review so nothing sits forgotten.
// Settlement stays manual because it moves real money.
export async function mayaSweepRefunds(pool) {
  const [rows] = await pool.query(`
    SELECT id, booking_reference, amount FROM user_refunds
    WHERE status = 'initiated' AND created_at <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
  `);
  for (const row of rows) {
    await pool.query(
      "UPDATE user_refunds SET status = 'admin_review' WHERE id = ? AND status = 'initiated'",
      [row.id],
    );
    await logMayaActivity(
      'refunds',
      'moved_to_review',
      row.id,
      `Moved refund of ₹${Number(row.amount || 0).toLocaleString('en-IN')} for booking ${row.booking_reference} into review — settle it after finance confirmation.`,
      'attention',
    );
  }
  return rows.length;
}
// Maya-owned leads: overdue follow-ups are absorbed into her email cadence.
// Human-owned overdue follow-ups raise one attention flag per 12 hours.
export async function mayaSweepFollowups(pool) {
  let actions = 0;
  const [aiRows] = await pool.query(`
    SELECT f.id, f.lead_id, l.name FROM lead_followups f
    JOIN lead_submissions l ON l.id = f.lead_id
    WHERE f.status = 'pending'
      AND f.follow_up_date < DATE_SUB(NOW(), INTERVAL 2 HOUR)
      AND l.assigned_owner LIKE '%Maya (AI Auto-Pilot)%'
  `);
  for (const row of aiRows) {
    await pool.query(
      `UPDATE lead_followups SET status = 'completed', outcome = 'Absorbed into Maya autopilot cadence', completed_at = NOW() WHERE id = ?`,
      [row.id],
    );
    await logMayaActivity(
      'followups',
      'auto_resolved',
      row.lead_id,
      `Cleared an overdue follow-up for ${row.name} — Maya's email cadence covers this lead.`,
    );
    actions++;
  }
  const [overdueRows] = await pool.query(`
    SELECT COUNT(*) AS total FROM lead_followups f
    WHERE f.status = 'pending' AND f.follow_up_date < NOW()
  `);
  const overdue = Number(overdueRows[0]?.total || 0);
  if (overdue > 0 && !(await mayaHasRecentActivity(pool, 'followups', 'overdue_alert', 12))) {
    await logMayaActivity(
      'followups',
      'overdue_alert',
      null,
      `${overdue} follow-up(s) are overdue and waiting on you — open the Follow-ups queue.`,
      'attention',
    );
  }
  return actions;
}
// Auto-shortlists strong candidates (mock test >= 80%) and emails the
// interview invite; everyone else stays in the queue for a human decision.
export async function mayaSweepCareers(pool) {
  let rows = [];
  try {
    const [r] = await pool.query(`
      SELECT ca.id, ca.name, ca.email, ca.mock_test_score, cj.title AS job_title
      FROM careers_applications ca
      LEFT JOIN careers_jobs cj ON cj.id = ca.job_id
      WHERE ca.status = 'pending' AND ca.mock_test_score IS NOT NULL AND ca.mock_test_score >= 80
    `);
    rows = r;
  } catch {
    return 0; // careers tables or mock_test_score column not present yet
  }
  let actions = 0;
  for (const app of rows) {
    await pool.query(
      "UPDATE careers_applications SET status = 'shortlisted' WHERE id = ? AND status = 'pending'",
      [app.id],
    );
    await sendEmailOutbound(
      app.email,
      `Interview Invitation: ${app.job_title || 'MooNs Events'}`,
      `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Congratulations ${app.name}!</h2>
        <p>You have been shortlisted for the <strong>${app.job_title || 'open'}</strong> position at MooNs Events.</p>
        <p>Your mock test score of <strong>${app.mock_test_score}%</strong> impressed us. We would love to schedule an interview with you — our team will reach out shortly with available slots.</p>
        <br/><p>Best Regards,</p><p><strong>MooNs Events Talent Team</strong></p>
      </div>`,
    );
    await logMayaActivity(
      'careers',
      'auto_shortlisted',
      app.id,
      `Auto-shortlisted ${app.name} for ${app.job_title || 'a role'} (mock test ${app.mock_test_score}%) and sent the interview invite.`,
    );
    actions++;
  }
  return actions;
}
// Payment verification moves real money, so Maya only raises an attention
// flag when claims have been waiting too long — she never auto-approves.
export async function mayaSweepPayments(pool) {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS value FROM payment_orders
    WHERE status = 'pending_verification' AND created_at <= DATE_SUB(NOW(), INTERVAL 6 HOUR)
  `);
  const total = Number(rows[0]?.total || 0);
  const value = Number(rows[0]?.value || 0);
  if (total > 0 && !(await mayaHasRecentActivity(pool, 'payments', 'verification_alert', 12))) {
    await logMayaActivity(
      'payments',
      'verification_alert',
      null,
      `${total} payment claim(s) worth ₹${value.toLocaleString('en-IN')} have waited over 6 hours — approve or reject them in Bookings.`,
      'attention',
    );
  }
  return 0;
}
export let mayaCycleRunning = false;
async function legacyRunMayaAutopilotCycleDisabled() {
  if (mayaCycleRunning) return;
  mayaCycleRunning = true;
  try {
    await ensureMayaTables();
    const pool = await getDbPool();
    const settings = await getMayaSettings();
    if (settings['autopilot_master'] === 'off') return;
    const sweeps = [
      ['leads', () => processAutonomousAILeads()],
      ['followups', () => mayaSweepFollowups(pool)],
      ['clients', () => mayaSyncClients(pool)],
      ['escrow', () => mayaSweepEscrow(pool)],
      ['refunds', () => mayaSweepRefunds(pool)],
      ['careers', () => mayaSweepCareers(pool)],
      ['payments', () => mayaSweepPayments(pool)],
      ['contingencies', () => mayaSweepContingencies(pool)],
      ['inactive_leads', () => mayaSweepInactiveLeads(pool)],
    ];
    for (const [area, sweep] of sweeps) {
      if (!mayaAreaEnabled(settings, area)) continue;
      try {
        await sweep();
      } catch (e) {
        console.error(`[Maya] ${area} sweep failed:`, e);
        await logMayaActivity(
          area,
          'sweep_error',
          null,
          `Autopilot sweep failed: ${e instanceof Error ? e.message : 'unknown error'}`,
          'error',
        );
      }
    }
    await setMayaSetting('maya_last_run', new Date().toISOString());
  } catch (e) {
    console.error('[Maya] Autopilot cycle failed:', e);
  } finally {
    mayaCycleRunning = false;
  }
}
// Retain the historical operation name while enforcing the same governed
// channel-neutral automation boundary used by the worker and Maya Ops Center.
export async function runMayaAutopilotCycle() {
  const { runEventAutomationBatch } = await import('../../services/eventAutomationService.js');
  return runEventAutomationBatch();
}
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Memoized schema-setup wrappers. The ensure*Impl functions above run DDL and
// seed inserts; doing that on every request made all screens slow, so each one
// now runs once per server process (retried on failure).
// ─────────────────────────────────────────────────────────────────────────────
export function __memoizeEnsure(fn) {
  let ready = null;
  return (...args) => {
    if (!ready) {
      ready = fn(...args).catch((err) => {
        ready = null;
        throw err;
      });
    }
    return ready;
  };
}
export const ensureLeadSubmissionsTable = __memoizeEnsure(ensureLeadSubmissionsTableImpl);
export const ensureLeadCrmTables = __memoizeEnsure(ensureLeadCrmTablesImpl);
export const ensureWishlistTable = __memoizeEnsure(ensureWishlistTableImpl);
export const ensurePackageAdminTables = __memoizeEnsure(ensurePackageAdminTablesImpl);
export const ensureMasterCatalogTables = __memoizeEnsure(ensureMasterCatalogTablesImpl);
export const ensureAuthSessionTable = __memoizeEnsure(ensureAuthSessionTableImpl);
export const ensureAdminTables = __memoizeEnsure(ensureAdminTablesImpl);
export const ensureRemoteDeployTables = __memoizeEnsure(ensureRemoteDeployTablesImpl);
export const ensureCareersTablesExist = __memoizeEnsure(ensureCareersTablesExistImpl);
export const ensurePermitCmsTables = __memoizeEnsure(ensurePermitCmsTablesImpl);
export const ensurePackingCmsTables = __memoizeEnsure(ensurePackingCmsTablesImpl);
export const ensureInventoryUpgradeColumns = __memoizeEnsure(ensureInventoryUpgradeColumnsImpl);
export const ensureVendorMarketplaceTables = __memoizeEnsure(ensureVendorMarketplaceTablesImpl);
export const ensureRichInventoryTables = __memoizeEnsure(ensureRichInventoryTablesImpl);
export const ensureLoungeCommentsTable = __memoizeEnsure(ensureLoungeCommentsTableImpl);
export const ensureGlobalChatTables = __memoizeEnsure(ensureGlobalChatTablesImpl);
export const ensureMayaAdminSessions = __memoizeEnsure(ensureMayaAdminSessionsImpl);
export const ensureChatTables = __memoizeEnsure(ensureChatTablesImpl);
export const ensureOperationsTables = __memoizeEnsure(ensureOperationsTablesImpl);
export const ensureAiLeadColumns = __memoizeEnsure(ensureAiLeadColumnsImpl);
export const ensureEmailTemplateScopeTags = __memoizeEnsure(ensureEmailTemplateScopeTagsImpl);
export const ensureMayaTables = __memoizeEnsure(ensureMayaTablesImpl);
export async function mayaSweepInactiveLeads(pool) {
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  const [leads] = await pool.query(
    `SELECT id FROM lead_submissions 
     WHERE status IN ('new', 'contacted', 'quote_sent') 
     AND updated_at < ? 
     AND (assigned_to IS NULL OR assigned_to = '')`,
    [threeDaysAgo],
  );
  const lArr = leads;
  for (const lead of lArr) {
    await pool.query(
      `UPDATE lead_submissions SET assigned_to = 'Maya (AI Auto-Pilot)' WHERE id = ?`,
      [lead.id],
    );
    await logMayaActivity(
      'inactive_leads',
      'assignment',
      lead.id,
      `Assigned inactive lead ${lead.id} to Maya after 72 hours of inactivity.`,
      'success',
    );
  }
  return lArr.length;
}
export async function mayaSweepContingencies(pool) {
  const [unresolved] = await pool.query(
    `SELECT id, booking_id, issue_type FROM booking_contingencies WHERE resolved_at IS NULL AND plan_b_authorized = 0`,
  );
  const uArr = unresolved;
  for (const c of uArr) {
    // We would notify staff here. For now, log the activity.
    await logMayaActivity(
      'contingencies',
      'notification',
      c.booking_id,
      `Unresolved contingency #${c.id} (${c.issue_type}) flagged for staff review.`,
      'success',
    );
  }
  return uArr.length;
}
//# sourceMappingURL=db.functions.server.js.map
