import { createHash, createPublicKey, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prisma, PrismaClient } from '@prisma/client';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 4000);
const prefix = process.env.API_PREFIX || '/api/v1';
const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIRECTORY || '../uploads/events');

type EventRequest = Request & { tenantId?: string; consumer?: JwtPayload & { sub: string } };

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use((request, response, next) => {
  const origin = request.header('origin');
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:8080,http://localhost:3001').split(',');
  if (origin && allowed.includes(origin)) response.setHeader('access-control-allow-origin', origin);
  response.setHeader('access-control-allow-headers', 'authorization,content-type,idempotency-key,x-tenant-id,x-correlation-id');
  response.setHeader('access-control-allow-methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});
app.set('json replacer', (_key: string, value: unknown) => typeof value === 'bigint' ? value.toString() : value);

function asyncRoute(handler: (request: EventRequest, response: Response) => Promise<unknown>) {
  return (request: EventRequest, response: Response, next: NextFunction) => void handler(request, response).catch(next);
}

function tenant(request: EventRequest, _response: Response, next: NextFunction) {
  const tenantId = request.header('x-tenant-id') || process.env.EVENT_TENANT_ID;
  if (!tenantId || !/^[0-9a-f-]{36}$/i.test(tenantId)) return next(Object.assign(new Error('A valid event workspace is required'), { status: 400 }));
  request.tenantId = tenantId;
  next();
}

function admin(request: EventRequest, _response: Response, next: NextFunction) {
  const expected = process.env.CRM_API_TOKEN;
  if (expected && request.header('authorization') !== `Bearer ${expected}`) return next(Object.assign(new Error('CRM authentication required'), { status: 401 }));
  next();
}

type PublicJwk = Record<string, unknown> & { kid?: string };
let jwks: { keys: PublicJwk[]; expires: number } | undefined;
async function verifyConsumerToken(token: string): Promise<JwtPayload & { sub: string }> {
  const issuer = process.env.OIDC_ISSUER;
  if (!issuer && process.env.NODE_ENV !== 'production') {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return { ...(decoded || {}), sub: decoded?.sub || createHash('sha256').update(token).digest('hex') };
  }
  if (!issuer) throw new Error('OIDC_ISSUER is required');
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) throw new Error('Invalid consumer token');
  if (!jwks || jwks.expires < Date.now()) {
    const response = await fetch(`${issuer.replace(/\/$/, '')}/protocol/openid-connect/certs`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Identity provider keys are unavailable');
    jwks = { ...(await response.json() as { keys: PublicJwk[] }), expires: Date.now() + 300_000 };
  }
  const key = jwks.keys.find((item) => item.kid === decoded.header.kid);
  if (!key) throw new Error('Unknown token signing key');
  const claims = jwt.verify(token, createPublicKey({ key: key as never, format: 'jwk' }), {
    issuer,
    audience: process.env.OIDC_AUDIENCE || process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || 'moons-events-web',
  }) as JwtPayload;
  if (!claims.sub) throw new Error('Consumer identity is missing');
  return claims as JwtPayload & { sub: string };
}

async function consumer(request: EventRequest, _response: Response, next: NextFunction) {
  try {
    const token = request.header('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) throw Object.assign(new Error('Sign in is required'), { status: 401 });
    request.consumer = await verifyConsumerToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

async function account(request: EventRequest) {
  const identity = await prisma.identity.findUnique({ where: { oidcSubject: request.consumer!.sub } });
  if (!identity) throw Object.assign(new Error('Complete your customer profile first'), { status: 409 });
  const account = await prisma.customerAccount.findUnique({ where: { tenantId_identityId: { tenantId: request.tenantId!, identityId: identity.id } }, include: { customer: true } });
  if (!account) throw Object.assign(new Error('Complete your customer profile first'), { status: 409 });
  return account;
}

const packageInclude = {
  eventType: { include: { group: true } }, tiers: { where: { active: true }, orderBy: { sortOrder: 'asc' as const } },
  components: { where: { public: true }, orderBy: { sortOrder: 'asc' as const } }, addOns: { where: { active: true, customerSelectable: true }, orderBy: { sortOrder: 'asc' as const } },
  locations: { where: { active: true } },
} satisfies Prisma.EventPackageInclude;

function param(request: Request, key: string) {
  const value = request.params[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? item.toString() : item)) as Prisma.InputJsonValue;
}

app.get(`${prefix}/health`, (_request, response) => response.json({ status: 'ok', product: 'MooNsEvents', domain: 'events-crm' }));

app.get(`${prefix}/public/catalog/event-groups`, tenant, asyncRoute(async (request, response) => {
  response.json(await prisma.eventGroup.findMany({ where: { tenantId: request.tenantId, active: true }, orderBy: { sortOrder: 'asc' }, include: { eventTypes: { where: { active: true, published: true }, orderBy: { sortOrder: 'asc' }, include: { _count: { select: { packages: { where: { status: 'PUBLISHED' } } } } } } } }));
}));
app.get(`${prefix}/public/catalog/packages`, tenant, asyncRoute(async (request, response) => {
  const eventType = String(request.query.eventType || ''); const city = String(request.query.city || ''); const search = String(request.query.search || '');
  response.json(await prisma.eventPackage.findMany({ where: { tenantId: request.tenantId, status: 'PUBLISHED', ...(eventType ? { eventType: { slug: eventType } } : {}), ...(city ? { locations: { some: { city } } } : {}), ...(search ? { OR: [{ name: { contains: search } }, { summary: { contains: search } }] } : {}) }, orderBy: { publishedAt: 'desc' }, include: packageInclude }));
}));
app.get(`${prefix}/public/catalog/packages/:slug`, tenant, asyncRoute(async (request, response) => {
  const item = await prisma.eventPackage.findFirst({ where: { tenantId: request.tenantId, slug: param(request, 'slug'), status: 'PUBLISHED' }, include: packageInclude });
  if (!item) return response.status(404).json({ message: 'Event package not found' }); response.json(item);
}));
app.get(`${prefix}/public/catalog/packages/:slug/availability`, tenant, asyncRoute(async (request, response) => {
  const item = await prisma.eventPackage.findFirst({ where: { tenantId: request.tenantId, slug: param(request, 'slug'), status: 'PUBLISHED' }, include: { availabilityRules: true, dateOverrides: true } });
  if (!item) return response.status(404).json({ message: 'Event package not found' });
  const locationId = String(request.query.locationId || ''); const from = new Date(`${String(request.query.from)}T00:00:00Z`); const to = new Date(`${String(request.query.to)}T00:00:00Z`);
  if (!locationId || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return response.status(400).json({ message: 'Location and date range are required' });
  const holds = await prisma.packageHold.findMany({ where: { tenantId: request.tenantId, packageId: item.id, locationId, status: 'ACTIVE', expiresAt: { gt: new Date() }, startsOn: { lte: to }, endsOn: { gte: from } } });
  const rows: Array<{ date: string; available: boolean }> = [];
  for (const cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const override = item.dateOverrides.find(row => row.locationId === locationId && row.date.getTime() === cursor.getTime());
    const rule = item.availabilityRules.find(row => row.locationId === locationId && row.active && row.startsOn <= cursor && row.endsOn >= cursor && ((row.weekdays as number[]).length === 0 || (row.weekdays as number[]).includes(cursor.getUTCDay())));
    const capacity = override?.capacity ?? rule?.dailyCapacity ?? 0; const used = holds.filter(row => row.startsOn <= cursor && row.endsOn >= cursor).reduce((sum, row) => sum + row.units, 0);
    rows.push({ date: cursor.toISOString().slice(0, 10), available: override?.status !== 'BLOCKED' && capacity > used });
  }
  response.json(rows);
}));
app.get(`${prefix}/public/catalog/vendor-offerings`, tenant, asyncRoute(async (request, response) => {
  const slug = String(request.query.eventType || '');
  const rows = await prisma.vendorServicePublication.findMany({ where: { tenantId: request.tenantId, eventType: { slug, published: true }, vendorService: { vendor: { verificationStatus: 'APPROVED' } } }, include: { eventType: true, vendorService: { include: { vendor: true } } } });
  response.json(rows.map(({ vendorService, eventType, publishedAt, id }) => ({ id, name: vendorService.title, vendorName: vendorService.vendor.name, priceFromMinor: vendorService.priceFromMinor, currency: 'INR', city: vendorService.vendor.city, state: vendorService.vendor.state, verified: true, publishedAt, eventTypeSlug: eventType.slug })));
}));

app.use(`${prefix}/customer`, tenant, consumer);
app.post(`${prefix}/customer/profile`, asyncRoute(async (request, response) => {
  const claims = request.consumer!; const displayName = String(request.body.displayName || claims.name || 'Customer'); const phone = String(request.body.phone || '').trim();
  if (!phone) return response.status(400).json({ message: 'Phone is required' });
  const identity = await prisma.identity.upsert({ where: { oidcSubject: claims.sub }, update: { displayName, email: typeof claims.email === 'string' ? claims.email : undefined }, create: { oidcSubject: claims.sub, displayName, email: typeof claims.email === 'string' ? claims.email : undefined } });
  let link = await prisma.customerAccount.findUnique({ where: { tenantId_identityId: { tenantId: request.tenantId!, identityId: identity.id } } });
  if (!link) { const customer = await prisma.customer.create({ data: { tenantId: request.tenantId!, displayName, phone, email: identity.email } }); link = await prisma.customerAccount.create({ data: { tenantId: request.tenantId!, identityId: identity.id, customerId: customer.id } }); }
  response.json({ id: link.id });
}));
app.post(`${prefix}/customer/holds`, asyncRoute(async (request, response) => {
  const user = await account(request); const item = await prisma.eventPackage.findFirst({ where: { id: String(request.body.packageId), tenantId: request.tenantId, status: 'PUBLISHED' }, include: packageInclude });
  if (!item) return response.status(404).json({ message: 'Event package not found' });
  const location = item.locations.find((row) => row.id === request.body.locationId); if (!location) return response.status(400).json({ message: 'Location is unavailable' });
  const startsOn = new Date(`${request.body.startsOn}T00:00:00Z`); const endsOn = new Date(startsOn); endsOn.setUTCDate(endsOn.getUTCDate() + item.durationDays - 1);
  const tier = item.tiers.find((row) => row.id === request.body.tierId); const addOns = item.addOns.filter((row) => (request.body.addOnIds || []).includes(row.id));
  const subtotal = (tier?.priceMinor || item.basePriceMinor) + location.priceDeltaMinor + addOns.reduce((sum, row) => sum + row.priceMinor, 0n); const tax = subtotal * BigInt(item.taxRateBps) / 10000n; const total = subtotal + tax;
  const snapshot = jsonValue({ packageName: item.name, eventType: item.eventType.name, location, guestCount: Number(request.body.guestCount), tier, addOns, subtotalMinor: subtotal.toString(), taxMinor: tax.toString(), totalMinor: total.toString() });
  const idempotencyHash = createHash('sha256').update(`${user.id}:${request.header('idempotency-key') || randomUUID()}`).digest('hex');
  const hold = await prisma.packageHold.create({ data: { tenantId: request.tenantId!, packageId: item.id, packageVersion: item.version, locationId: location.id, customerAccountId: user.id, startsOn, endsOn, units: Math.max(1, Number(request.body.units || 1)), pricingSnapshot: snapshot, idempotencyHash, expiresAt: new Date(Date.now() + 15 * 60_000) } }); response.status(201).json(hold);
}));
app.post(`${prefix}/customer/holds/:id/checkout`, asyncRoute(async (request, response) => {
  const user = await account(request); const hold = await prisma.packageHold.findFirst({ where: { id: param(request, 'id'), tenantId: request.tenantId, customerAccountId: user.id, status: 'ACTIVE', expiresAt: { gt: new Date() } }, include: { package: { include: { eventType: true } } } });
  if (!hold) return response.status(409).json({ message: 'This date hold is unavailable or expired' });
  const pricing = hold.pricingSnapshot as Record<string, string>; const total = BigInt(pricing.totalMinor || '0'); const deposit = hold.package.depositKind === 'FIXED' ? (hold.package.depositFixedMinor || total) : total * BigInt(hold.package.depositRateBps) / 10000n;
  const result = await prisma.$transaction(async tx => { const lead = await tx.lead.create({ data: { tenantId: request.tenantId!, name: user.customer.displayName, email: user.customer.email, phone: user.customer.phone, source: 'customer-website', eventType: hold.package.eventType.name, eventDate: hold.startsOn, guestCount: Number((hold.pricingSnapshot as any).guestCount || 1), status: 'WON', convertedAt: new Date() } }); const quote = await tx.quotation.create({ data: { tenantId: request.tenantId!, leadId: lead.id, number: `WEB-${Date.now()}`, status: 'ACCEPTED', validUntil: hold.expiresAt, subtotalMinor: total, taxMinor: 0n, totalMinor: total, lines: { create: [{ tenantId: request.tenantId!, description: hold.package.name, quantity: 1, unitPriceMinor: total, taxRateBps: 0 }] } } }); const booking = await tx.booking.create({ data: { tenantId: request.tenantId!, customerId: user.customerId, quotationId: quote.id, eventDate: hold.startsOn, packageSnapshot: { create: { tenantId: request.tenantId!, packageId: hold.packageId, packageVersion: hold.packageVersion, eventTypeId: hold.package.eventTypeId, locationId: hold.locationId, snapshot: jsonValue(hold.pricingSnapshot) } }, eventProject: { create: { tenantId: request.tenantId!, name: `${hold.package.name} — ${user.customer.displayName}` } } } }); const session = await tx.checkoutSession.create({ data: { tenantId: request.tenantId!, bookingId: booking.id, amountMinor: deposit, currency: hold.package.currency, provider: process.env.RAZORPAY_KEY_ID ? 'razorpay' : 'manual', providerOrderId: `event_${randomUUID()}`, status: 'created', idempotencyHash: createHash('sha256').update(`${booking.id}:${request.header('idempotency-key') || randomUUID()}`).digest('hex'), expiresAt: hold.expiresAt, createdBy: user.identityId } }); await tx.packageHold.update({ where: { id: hold.id }, data: { status: 'CONVERTED', bookingId: booking.id } }); return { booking, session }; });
  response.json({ sessionId: result.session.id, bookingId: result.booking.id, provider: result.session.provider, keyId: process.env.RAZORPAY_KEY_ID || '', orderId: result.session.providerOrderId, amountMinor: result.session.amountMinor, currency: result.session.currency, expiresAt: result.session.expiresAt });
}));
app.get(`${prefix}/customer/bookings`, asyncRoute(async (request, response) => { const user = await account(request); response.json(await prisma.booking.findMany({ where: { tenantId: request.tenantId, customerId: user.customerId }, include: { packageSnapshot: true, eventProject: { include: { guests: true, tasks: true, runOfShow: true } }, payments: true, milestones: true, contracts: true, invoices: true, amendments: true }, orderBy: { eventDate: 'desc' } })); }));
async function ownedProject(request: EventRequest) { const user = await account(request); const booking = await prisma.booking.findFirst({ where: { id: param(request, 'bookingId'), tenantId: request.tenantId, customerId: user.customerId }, include: { eventProject: true } }); if (!booking?.eventProject) throw Object.assign(new Error('Event booking not found'), { status: 404 }); return { user, booking, project: booking.eventProject }; }
app.get(`${prefix}/customer/bookings/:bookingId/guests`, asyncRoute(async (request, response) => { const { project } = await ownedProject(request); response.json(await prisma.guest.findMany({ where: { tenantId: request.tenantId, eventProjectId: project.id }, orderBy: { createdAt: 'asc' } })); }));
app.post(`${prefix}/customer/bookings/:bookingId/guests`, asyncRoute(async (request, response) => { const { project } = await ownedProject(request); response.status(201).json(await prisma.guest.create({ data: { tenantId: request.tenantId!, eventProjectId: project.id, name: String(request.body.name), phone: request.body.phone || null, email: request.body.email || null, partySize: Math.max(1, Number(request.body.partySize || 1)), dietaryNotes: request.body.dietaryNotes || null, invitationCode: randomUUID() } })); }));
app.patch(`${prefix}/customer/bookings/:bookingId/guests/:guestId`, asyncRoute(async (request, response) => { const { project } = await ownedProject(request); const guest = await prisma.guest.findFirst({ where: { id: param(request, 'guestId'), eventProjectId: project.id } }); if (!guest) return response.status(404).json({ message: 'Guest not found' }); response.json(await prisma.guest.update({ where: { id: guest.id }, data: { name: request.body.name, phone: request.body.phone, email: request.body.email, partySize: request.body.partySize, dietaryNotes: request.body.dietaryNotes, rsvpStatus: request.body.rsvpStatus } })); }));
app.get(`${prefix}/customer/bookings/:bookingId/messages`, asyncRoute(async (request, response) => { const { booking } = await ownedProject(request); const thread = await prisma.conversation.findFirst({ where: { tenantId: request.tenantId, subjectType: 'booking', subjectId: booking.id }, include: { messages: { orderBy: { createdAt: 'asc' } } } }); response.json(thread?.messages || []); }));
app.post(`${prefix}/customer/bookings/:bookingId/messages`, asyncRoute(async (request, response) => { const { user, booking } = await ownedProject(request); const thread = await prisma.conversation.upsert({ where: { id: (await prisma.conversation.findFirst({ where: { tenantId: request.tenantId, subjectType: 'booking', subjectId: booking.id } }))?.id || randomUUID() }, update: { lastMessageAt: new Date() }, create: { tenantId: request.tenantId!, subjectType: 'booking', subjectId: booking.id, channel: 'IN_APP', externalAddress: user.customer.email || user.customer.phone } }); response.status(201).json(await prisma.message.create({ data: { tenantId: request.tenantId!, conversationId: thread.id, direction: 'INBOUND', channel: 'IN_APP', body: String(request.body.body), status: 'DELIVERED', createdBy: user.identityId } })); }));
app.get(`${prefix}/customer/bookings/:bookingId/documents`, asyncRoute(async (request, response) => { const { booking } = await ownedProject(request); response.json(await prisma.documentObject.findMany({ where: { tenantId: request.tenantId, ownerType: 'booking', ownerId: booking.id } })); }));
app.post(`${prefix}/customer/bookings/:bookingId/documents`, asyncRoute(async (request, response) => { const { user, booking } = await ownedProject(request); const document = await prisma.documentObject.create({ data: { tenantId: request.tenantId!, ownerType: 'booking', ownerId: booking.id, name: String(request.body.name), mimeType: String(request.body.mimeType || 'application/octet-stream'), sizeBytes: BigInt(request.body.sizeBytes || 0), objectKey: `${request.tenantId}/${booking.id}/${randomUUID()}`, uploadedBy: user.identityId } }); response.status(201).json({ document, upload: { url: `${process.env.APP_PUBLIC_URL || `http://localhost:${port}`}${prefix}/customer/uploads/${document.id}`, headers: { authorization: request.header('authorization')!, 'x-tenant-id': request.tenantId! } } }); }));
app.put(`${prefix}/customer/uploads/:documentId`, express.raw({ type: '*/*', limit: '15mb' }), asyncRoute(async (request, response) => { const document = await prisma.documentObject.findFirst({ where: { id: param(request, 'documentId'), tenantId: request.tenantId } }); if (!document) return response.status(404).json({ message: 'Document not found' }); await mkdir(path.dirname(path.join(uploadRoot, document.objectKey)), { recursive: true }); await writeFile(path.join(uploadRoot, document.objectKey), request.body as Buffer); response.sendStatus(204); }));
app.post(`${prefix}/customer/bookings/:bookingId/documents/:documentId/complete`, asyncRoute(async (request, response) => { await ownedProject(request); response.json(await prisma.documentObject.update({ where: { id: param(request, 'documentId') }, data: { scanStatus: 'CLEAN', scannedAt: new Date() } })); }));
app.post(`${prefix}/customer/bookings/:bookingId/amendments`, asyncRoute(async (request, response) => { const { user, booking } = await ownedProject(request); response.status(201).json(await prisma.bookingAmendment.create({ data: { tenantId: request.tenantId!, bookingId: booking.id, requestedByIdentityId: user.identityId, kind: `add-on-${String(request.body.action)}`, changeSnapshot: { addOnId: request.body.addOnId } } })); }));

app.use(`${prefix}/crm`, tenant, admin);
app.get(`${prefix}/crm/overview`, asyncRoute(async (request, response) => { const where = { tenantId: request.tenantId! }; const [leads, bookings, projects, vendors, packages, eventTypes] = await Promise.all([prisma.lead.count({ where }), prisma.booking.count({ where }), prisma.eventProject.count({ where }), prisma.vendorProfile.count({ where }), prisma.eventPackage.count({ where }), prisma.eventType.count({ where })]); response.json({ leads, bookings, projects, vendors, packages, eventTypes }); }));
app.get(`${prefix}/crm/leads`, asyncRoute(async (request, response) => response.json(await prisma.lead.findMany({ where: { tenantId: request.tenantId }, orderBy: { createdAt: 'desc' }, take: 200 }))));
app.post(`${prefix}/crm/leads`, asyncRoute(async (request, response) => response.status(201).json(await prisma.lead.create({ data: { tenantId: request.tenantId!, name: request.body.name, phone: request.body.phone, email: request.body.email || null, source: request.body.source || 'crm', eventType: request.body.eventType, eventDate: request.body.eventDate ? new Date(request.body.eventDate) : null, guestCount: Number(request.body.guestCount || 1), budgetMinor: request.body.budgetMinor ? BigInt(request.body.budgetMinor) : null, notes: request.body.notes || null } }))));
app.get(`${prefix}/crm/event-types`, asyncRoute(async (request, response) => response.json(await prisma.eventType.findMany({ where: { tenantId: request.tenantId }, include: { group: true }, orderBy: { sortOrder: 'asc' } }))));
app.post(`${prefix}/crm/event-types`, asyncRoute(async (request, response) => {
  const name = String(request.body.name || '').trim(); if (!name) return response.status(400).json({ message: 'Event type name is required' });
  const slug = String(request.body.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  response.status(201).json(await prisma.eventType.create({ data: { tenantId: request.tenantId!, name, slug, summary: request.body.summary || null, active: true, published: Boolean(request.body.published) } }));
}));
app.get(`${prefix}/crm/packages`, asyncRoute(async (request, response) => response.json(await prisma.eventPackage.findMany({ where: { tenantId: request.tenantId }, include: packageInclude, orderBy: { updatedAt: 'desc' } }))));
app.post(`${prefix}/crm/packages`, asyncRoute(async (request, response) => {
  const name = String(request.body.name || '').trim(); const eventTypeId = String(request.body.eventTypeId || '');
  if (!name || !eventTypeId) return response.status(400).json({ message: 'Package name and event type are required' });
  const eventType = await prisma.eventType.findFirst({ where: { id: eventTypeId, tenantId: request.tenantId } }); if (!eventType) return response.status(400).json({ message: 'Invalid event type' });
  const slug = `${name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const item = await prisma.eventPackage.create({ data: { tenantId: request.tenantId!, eventTypeId, slug, name, summary: String(request.body.summary || ''), description: String(request.body.description || request.body.summary || ''), basePriceMinor: BigInt(request.body.basePriceMinor || 0), minGuests: Math.max(1, Number(request.body.minGuests || 1)), maxGuests: request.body.maxGuests ? Number(request.body.maxGuests) : null, status: request.body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT', publishedAt: request.body.status === 'PUBLISHED' ? new Date() : null }, include: packageInclude });
  response.status(201).json(item);
}));
app.get(`${prefix}/crm/bookings`, asyncRoute(async (request, response) => response.json(await prisma.booking.findMany({ where: { tenantId: request.tenantId }, include: { customer: true, eventProject: true, packageSnapshot: true }, orderBy: { eventDate: 'asc' } }))));
app.get(`${prefix}/crm/projects`, asyncRoute(async (request, response) => response.json(await prisma.eventProject.findMany({ where: { tenantId: request.tenantId }, include: { booking: { include: { customer: true } }, tasks: true, guests: true, runOfShow: true }, orderBy: { createdAt: 'desc' } }))));
app.get(`${prefix}/crm/vendors`, asyncRoute(async (request, response) => response.json(await prisma.vendorProfile.findMany({ where: { tenantId: request.tenantId }, include: { services: { include: { category: true } } }, orderBy: { name: 'asc' } }))));

const aiTools: Record<string, string> = {
  plan: 'Create a practical event concept, scope, work breakdown, staffing plan, and run of show.',
  score_lead: 'Score this event lead from 0-100, explain signals, identify missing qualification data, and propose the next best action.',
  vendor_brief: 'Create a precise vendor brief with deliverables, quantities, timings, dependencies, acceptance criteria, and budget controls.',
  risk_review: 'Identify event delivery risks across venue, vendors, safety, crowd, weather, schedule, budget, and compliance. Rank and mitigate them.',
  communication: 'Draft a polished event-specific customer or vendor communication with a clear action and deadline.',
};
app.post(`${prefix}/crm/ai`, asyncRoute(async (request, response) => {
  const tool = String(request.body.tool || 'plan'); const instruction = aiTools[tool]; if (!instruction) return response.status(400).json({ message: 'Unknown event AI tool' });
  const context = JSON.stringify(request.body.context || {}, null, 2); const system = `You are Maya, the AI copilot inside MooNsEvents CRM. You are exclusively an event-planning and event-operations specialist. ${instruction} Use Indian event-industry conventions where relevant. Never invent availability, prices, approvals, permits, or vendor confirmations. Separate facts, assumptions, risks, and recommended actions. Any financial commitment, customer promise, vendor booking, refund, or external message requires human approval.`;
  const key = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS?.split(',')[0] || '').trim();
  if (!key) return response.json({ tool, model: 'event-rule-engine', requiresApproval: true, output: `${instruction}\n\nContext received:\n${context}\n\nRecommended next step: validate requirements, owners, budget, venue constraints, and approval gates before execution.` });
  const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: process.env.MAYA_BRAIN_MODEL || 'gemini-2.5-flash', systemInstruction: system }); const result = await model.generateContent(context); response.json({ tool, model: process.env.MAYA_BRAIN_MODEL || 'gemini-2.5-flash', requiresApproval: true, output: result.response.text() });
}));

app.get(`${prefix}/crm/ai/capabilities`, (_request, response) => response.json({
  domain: 'events-crm',
  tools: Object.entries(aiTools).map(([key, purpose]) => ({ key, purpose })),
  approvalRequiredFor: ['external_messages', 'customer_promises', 'vendor_commitments', 'bookings', 'payments', 'refunds', 'contract_changes'],
}));

app.use((error: Error & { status?: number }, _request: Request, response: Response, _next: NextFunction) => { console.error(error); response.status(error.status || 500).json({ message: error.message || 'Unexpected event CRM error' }); });

await mkdir(uploadRoot, { recursive: true });
const server = app.listen(port, () => console.log(`MooNsEvents event CRM API listening on http://localhost:${port}${prefix}`));
const close = async () => { server.close(); await prisma.$disconnect(); };
process.on('SIGINT', () => void close()); process.on('SIGTERM', () => void close());
