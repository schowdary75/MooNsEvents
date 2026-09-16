// @ts-nocheck
import { z } from 'zod';
import { defineOperation } from './defineOperation.js';
import * as legacy from '../legacy/api/db.functions.server.js';
import { prisma } from '../config/prisma.js';

const eventEmailTemplates = [
  {
    name: 'Full Event Package RFQ',
    type: 'rfq',
    scope_tags: 'full',
    subject: 'RFQ: {{package_name}} | {{location}} | {{event_dates}}',
    body: `Dear Partner,

MooNs Events is sourcing itemised availability and net B2B rates for the following live event requirement.

EVENT BRIEF
Event: {{package_name}}
Location: {{location}}
Dates: {{event_dates}}
Delivery window: {{duration}}
Event category: {{category}}
Concept: {{description}}

RUN OF SHOW
{{runOfShow}}

SERVICES / EXPERIENCES
{{activities}}

CURRENT INCLUSIONS
{{inclusions}}

CURRENT EXCLUSIONS
{{exclusions}}

Please quote each applicable component separately, including specifications, quantities, crew, setup and strike windows, taxes, availability, payment milestones, cancellation terms, and the validity of your quote. Flag any unavailable item and recommend the closest operational alternative.

Please also share high-resolution portfolio material, licenses, safety documents, and a single on-ground escalation contact. A response within 24–48 hours will help us close this live requirement.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Event Venue RFQ',
    type: 'rfq',
    scope_tags: 'venues',
    subject: 'RFQ: Event venue | {{location}} | {{event_dates}}',
    body: `Dear Venue Team,

MooNs Events is evaluating venues for {{package_name}} in {{location}} on {{event_dates}}.

REQUIREMENT
{{venues}}

Please provide availability, capacity by layout, hall and breakout dimensions, furniture inventory, green rooms, loading access, setup and strike windows, power and rigging limits, in-house or empanelled production rules, catering policy, parking, permits, operating-hour restrictions, security requirements, venue rental, minimum commitments, taxes, payment milestones, and cancellation terms.

Please include floor plans, technical specifications, recent event photographs, and the venue operations contact.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Event Logistics RFQ',
    type: 'rfq',
    scope_tags: 'transport',
    subject: 'RFQ: Event logistics | {{location}} | {{event_dates}}',
    body: `Dear Logistics Partner,

Please quote guest, artist, crew, and equipment movement for {{package_name}} in {{location}} on {{event_dates}}.

MOVEMENT PLAN
{{transport}}

For every movement, provide vehicle type, seating or load capacity, quantity, reporting time, operating window, coordinator and driver allocation, permits, tolls, parking, overtime, night charges, standby terms, backup-vehicle commitment, insurance, taxes, and net B2B rates.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Venue + Logistics RFQ',
    type: 'rfq',
    scope_tags: 'venues,transport',
    subject: 'RFQ: Venue and event logistics | {{location}} | {{event_dates}}',
    body: `Dear Partner,

Please quote the venue and event-logistics requirements for {{package_name}} in {{location}} on {{event_dates}}.

VENUE REQUIREMENT
{{venues}}

LOGISTICS REQUIREMENT
{{transport}}

Provide itemised net rates, taxes, capacity and technical specifications, setup and strike access, operating windows, staffing, backup plans, availability, payment milestones, and cancellation terms.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Event Production RFQ',
    type: 'rfq',
    scope_tags: 'production',
    subject: 'RFQ: Event production | {{location}} | {{event_dates}}',
    body: `Dear Production Partner,

MooNs Events is sourcing production for {{package_name}} in {{location}} on {{event_dates}}.

RUN OF SHOW
{{runOfShow}}

Please provide an itemised proposal covering stage, audio, lighting, LED walls, projection, rigging, truss, power distribution, generators, comms, playback, show calling, technical crew, rehearsals, setup and strike, transport, consumables, backup equipment, safety documentation, taxes, payment milestones, and cancellation terms. Include equipment brands and models, quantities, crew strength, and a technical escalation contact.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Event Services & Experiences RFQ',
    type: 'rfq',
    scope_tags: 'full',
    subject: 'RFQ: Event services | {{location}} | {{event_dates}}',
    body: `Dear Event Partner,

Please quote the services required for {{package_name}} in {{location}} on {{event_dates}}.

SERVICES
{{activities}}

For each service, provide the exact scope, quantity or duration, inclusions, exclusions, staffing, equipment, operating requirements, setup time, guest capacity, contingency plan, taxes, net B2B rate, availability, payment terms, and cancellation policy.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Outreach: Event Partner',
    type: 'outreach',
    scope_tags: 'general',
    subject: 'Event partnership enquiry | MooNs Events',
    body: `Dear Partner,

Greetings from MooNs Events. We are expanding our verified partner network for weddings, corporate events, conferences, exhibitions, concerts, private celebrations, and cultural productions across India.

Please share your company profile, service catalog, coverage cities, portfolio, licenses, safety documentation, standard net B2B rate card, taxes, minimum order values, booking and cancellation policies, team capacity, and escalation contacts.

We look forward to building a reliable long-term event partnership.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Outreach: Venue Partner',
    type: 'outreach',
    scope_tags: 'accommodation',
    subject: 'Venue partnership enquiry | MooNs Events',
    body: `Dear Venue Team,

MooNs Events is onboarding event-ready venues across {{coverage_areas}}. Please share your venue profile, capacity charts by layout, floor plans, technical specifications, catering and production policies, parking, licenses, operating restrictions, portfolio, net B2B rental or minimum-commitment rates, taxes, payment terms, and cancellation policy.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Outreach: Event Logistics Partner',
    type: 'outreach',
    scope_tags: 'car',
    subject: 'Event logistics partnership enquiry | MooNs Events',
    body: `Dear Logistics Partner,

MooNs Events is onboarding dependable guest, artist, crew, and equipment logistics partners across {{coverage_areas}}. Please share fleet types, seating or load capacity, operating cities, permits, insurance, coordinator support, backup policy, rate card, taxes, overtime and night charges, payment terms, and cancellation policy.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
  {
    name: 'Outreach: Event Services Partner',
    type: 'outreach',
    scope_tags: 'experience',
    subject: 'Event services partnership enquiry | MooNs Events',
    body: `Dear Event Partner,

MooNs Events is onboarding event planners, decorators, caterers, entertainers, photographers, production teams, hosts, artists, and specialist suppliers across {{coverage_areas}}. Please share your service catalog, portfolio, technical rider, team capacity, licenses, safety documents, net B2B rates, taxes, minimum order, payment terms, and cancellation policy.

Best regards,
Maya
Procurement Manager, MooNs Events`,
  },
] as const;

const deprecatedTravelTemplateNames = [
  'Full Package RFQ',
  'Venues Only RFQ',
  'Transport Only RFQ',
  'Venues + Transport RFQ',
  'Full Package + Venues RFQ',
  'Full Package + Transport RFQ',
  'Full Package + Venues + Transport RFQ',
  'VenueProduction RFQ',
  'Activity RFQ: Day Showcases & City Excursions',
  'Outreach: General',
  'Outreach: Stays',
  'Outreach: Transport',
  'Outreach: Experiences',
];

async function seedEventEmailTemplates() {
  await legacy.ensureEmailTemplateScopeTags();

  for (const seed of eventEmailTemplates) {
    const existing = await prisma.email_templates.findMany({
      where: { name: seed.name, type: seed.type },
      orderBy: { id: 'asc' },
    });
    if (existing.length) {
      await prisma.email_templates.update({
        where: { id: existing[0].id },
        data: {
          subject: seed.subject,
          body: seed.body,
          scope_tags: seed.scope_tags,
          is_active: true,
        },
      });
      if (existing.length > 1) {
        await prisma.email_templates.deleteMany({
          where: { id: { in: existing.slice(1).map((template) => template.id) } },
        });
      }
    } else {
      await prisma.email_templates.create({ data: { ...seed, is_active: true } });
    }
  }

  await prisma.email_templates.deleteMany({
    where: { name: { in: deprecatedTravelTemplateNames } },
  });
}

export const adminGetEmailTemplates = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await seedEventEmailTemplates();
    return await prisma.email_templates.findMany({ orderBy: { created_at: 'desc' } });
  });

export const adminCreateEmailTemplate = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      name: z.string(),
      subject: z.string(),
      body: z.string(),
      type: z.string(),
      scope_tags: z.string().optional(),
      is_active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await legacy.ensureEmailTemplateScopeTags();
    const created = await prisma.email_templates.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        type: data.type,
        scope_tags: data.scope_tags || 'full',
        is_active: data.is_active !== false,
      },
    });
    return { success: true, insertId: created.id };
  });

export const adminUpdateEmailTemplate = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      id: z.number(),
      name: z.string(),
      subject: z.string(),
      body: z.string(),
      type: z.string(),
      scope_tags: z.string().optional(),
      is_active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await legacy.ensureEmailTemplateScopeTags();
    await prisma.email_templates.update({
      where: { id: data.id },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        type: data.type,
        scope_tags: data.scope_tags || 'full',
        is_active: data.is_active !== false,
      },
    });
    return { success: true };
  });

export const adminToggleEmailTemplateActive = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, id: z.number(), is_active: z.boolean() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.email_templates.update({
      where: { id: data.id },
      data: { is_active: data.is_active },
    });
    return { success: true };
  });

export const adminDeleteEmailTemplate = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, id: z.number() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await prisma.email_templates.delete({ where: { id: data.id } });
    return { success: true };
  });
