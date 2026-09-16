import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../errors/AppError.js';
import { publishChatEvent } from './chatEventService.js';
import {
  currentMetaCredential,
  metaCredentialConfigured,
} from './metaWhatsAppCredentialService.js';
import { metaWhatsAppService, type MetaTemplate } from './metaWhatsAppService.js';
import { normalizeWhatsAppPhone } from './whatsappPhone.js';

const SERVICE_WINDOW_MS = 24 * 60 * 60_000;
const ACTIVE_LEAD_STATUSES = ['new', 'contacted', 'quote_sent', 'qualified'] as const;
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
};

const conversationDelegate = () =>
  ((prisma as any).travelConversation ?? (prisma as any).eventConversation);

type MessageInput =
  | { type: 'text'; text: string; clientMessageId: string }
  | {
      type: 'template';
      template: { name: string; language: string; parameters: string[] };
      clientMessageId: string;
    };

function jsonObject(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function messageDto(message: {
  id: string;
  direction: string;
  senderType: string;
  senderRef: string | null;
  body: string;
  deliveryStatus: string | null;
  metadata: Prisma.JsonValue | null;
  readAt: Date | null;
  createdAt: Date;
}) {
  const metadata = jsonObject(message.metadata);
  return {
    id: message.id,
    direction: message.direction,
    senderType: message.senderType,
    senderRef: message.senderRef,
    senderName: typeof metadata.senderName === 'string' ? metadata.senderName : null,
    kind: typeof metadata.messageType === 'string' ? metadata.messageType : 'text',
    body: message.body,
    deliveryStatus: message.deliveryStatus || 'received',
    error: typeof metadata.error === 'string' ? metadata.error : null,
    readAt: message.readAt?.toISOString() ?? null,
    createdAt: message.createdAt.toISOString(),
  };
}

function templateParameterCount(template: MetaTemplate) {
  const body = template.components.find(
    (component) => String(component.type || '').toUpperCase() === 'BODY',
  );
  const text = typeof body?.text === 'string' ? body.text : '';
  const positions = [...text.matchAll(/\{\{(\d+)\}\}/g)].map((match) => Number(match[1]));
  return positions.length ? Math.max(...positions) : 0;
}

async function leadByPhone(phone: string) {
  const suffix = phone.slice(-10);
  const candidates = await prisma.lead_submissions.findMany({
    where: { phone: { contains: suffix } },
    orderBy: [{ created_at: 'desc' }],
    take: 50,
  });
  const matching = candidates.filter((lead) => normalizeWhatsAppPhone(lead.phone) === phone);
  return (
    matching.find((lead) =>
      ACTIVE_LEAD_STATUSES.includes(lead.status as (typeof ACTIVE_LEAD_STATUSES)[number]),
    ) ??
    matching[0] ??
    null
  );
}

async function conversationForLead(leadId: number) {
  const lead = await prisma.lead_submissions.findUnique({ where: { id: leadId } });
  if (!lead) throw new AppError(404, 'Lead not found', 'LEAD_NOT_FOUND');
  const phone = normalizeWhatsAppPhone(lead.phone);
  if (!phone) {
    throw new AppError(
      422,
      'Add a valid customer phone number before using WhatsApp',
      'INVALID_WHATSAPP_PHONE',
    );
  }
  const conversation = await conversationDelegate().upsert({
    where: { leadId },
    create: {
      leadId,
      subject: `WhatsApp with ${lead.name}`,
      status: 'open',
      mayaMode: 'human_only',
    },
    update: {},
  });
  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_participantType_participantRef: {
        conversationId: conversation.id,
        participantType: 'customer',
        participantRef: phone,
      },
    },
    create: {
      conversationId: conversation.id,
      participantType: 'customer',
      participantRef: phone,
      displayName: lead.name,
    },
    update: { displayName: lead.name, leftAt: null },
  });
  return { lead, phone, conversation };
}

async function canSendFreeform(conversationId: string, now = new Date()) {
  const lastInbound = await prisma.channelMessage.findFirst({
    where: { conversationId, channel: 'whatsapp', direction: 'inbound' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  const expiresAt = lastInbound
    ? new Date(lastInbound.createdAt.getTime() + SERVICE_WINDOW_MS)
    : null;
  return {
    allowed: Boolean(expiresAt && expiresAt > now),
    expiresAt,
  };
}

async function emitConversationChange(leadId: number, messageId?: string) {
  await publishChatEvent({
    staffBroadcast: true,
    event: 'whatsapp:message',
    payload: { leadId, messageId },
  });
}

async function storeInbound(
  message: Record<string, any>,
  contact: Record<string, any> | undefined,
) {
  const phone = normalizeWhatsAppPhone(message.from);
  if (!phone || !message.id) return;
  let lead = await leadByPhone(phone);
  if (!lead) {
    lead = await prisma.lead_submissions.create({
      data: {
        name: String(contact?.profile?.name || `WhatsApp ${phone.slice(-4)}`).slice(0, 255),
        phone,
        email: '',
        destination: '',
        budget_range: '',
        lead_source: 'whatsapp',
        notes: 'Created automatically from an inbound WhatsApp conversation.',
        last_contacted_at: new Date(),
      },
    });
  }
  const { conversation } = await conversationForLead(lead.id);
  const messageType = String(message.type || 'unsupported');
  const text =
    messageType === 'text' && typeof message.text?.body === 'string'
      ? message.text.body.slice(0, 4096)
      : `Customer sent an unsupported WhatsApp ${messageType} message.`;
  const createdAt = /^\d+$/.test(String(message.timestamp || ''))
    ? new Date(Number(message.timestamp) * 1000)
    : new Date();
  const stored = await prisma.channelMessage.upsert({
    where: { idempotencyKey: `meta:${message.id}` },
    create: {
      conversationId: conversation.id,
      channel: 'whatsapp',
      direction: 'inbound',
      senderType: 'customer',
      senderRef: phone,
      body: text,
      providerReference: String(message.id),
      deliveryStatus: 'received',
      idempotencyKey: `meta:${message.id}`,
      metadata: {
        messageType: messageType === 'text' ? 'text' : 'unsupported',
        senderName: contact?.profile?.name || lead.name,
        providerType: messageType,
      },
      createdAt,
    },
    update: {},
  });
  await Promise.all([
    conversationDelegate().update({
      where: { id: conversation.id },
      data: { status: 'waiting_on_staff' },
    }),
    prisma.lead_submissions.update({
      where: { id: lead.id },
      data: { last_contacted_at: createdAt },
    }),
  ]);
  await emitConversationChange(lead.id, stored.id);
}

async function updateDeliveryStatus(status: Record<string, any>) {
  const providerReference = String(status.id || '');
  const nextStatus = String(status.status || '');
  if (!providerReference || !STATUS_RANK[nextStatus]) {
    if (nextStatus !== 'sent' && nextStatus !== 'pending') return;
  }
  const current = await prisma.channelMessage.findFirst({
    where: { channel: 'whatsapp', providerReference },
  });
  if (!current) return;
  const currentRank = STATUS_RANK[current.deliveryStatus || 'pending'] ?? 0;
  const nextRank = STATUS_RANK[nextStatus] ?? currentRank;
  if (nextStatus !== 'failed' && nextRank < currentRank) return;
  const metadata = {
    ...jsonObject(current.metadata),
    ...(status.errors?.[0]?.title ? { error: String(status.errors[0].title) } : {}),
  };
  const updated = await prisma.channelMessage.update({
    where: { id: current.id },
    data: { deliveryStatus: nextStatus, metadata },
  });
  const conversation = await conversationDelegate().findUnique({
    where: { id: updated.conversationId },
    select: { leadId: true },
  });
  if (conversation?.leadId) await emitConversationChange(conversation.leadId, updated.id);
}

export const leadWhatsAppService = {
  async conversation(leadId: number, cursor?: string, requestedLimit = 50) {
    const { lead, phone, conversation } = await conversationForLead(leadId);
    const limit = Math.max(1, Math.min(100, requestedLimit || 50));
    const credential = await currentMetaCredential({ activeOnly: false });
    const [messages, unreadCount, window] = await Promise.all([
      prisma.channelMessage.findMany({
        where: { conversationId: conversation.id, channel: 'whatsapp' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        take: limit,
      }),
      prisma.channelMessage.count({
        where: {
          conversationId: conversation.id,
          channel: 'whatsapp',
          direction: 'inbound',
          readAt: null,
        },
      }),
      canSendFreeform(conversation.id),
    ]);
    return {
      conversation: {
        id: conversation.id,
        leadId,
        customerName: lead.name,
        phone,
        owner: lead.assigned_owner,
        status: conversation.status,
        unreadCount,
        canSendFreeform: window.allowed,
        serviceWindowExpiresAt: window.expiresAt?.toISOString() ?? null,
      },
      provider: {
        configured: metaCredentialConfigured(credential),
        status: credential?.status ?? 'unconfigured',
      },
      messages: messages.reverse().map(messageDto),
      nextCursor: messages.length === limit ? (messages[0]?.id ?? null) : null,
    };
  },

  async unreadCounts() {
    const conversations = await conversationDelegate().findMany({
      where: { leadId: { not: null } },
      select: { id: true, leadId: true },
    });
    const result: Record<string, number> = {};
    await Promise.all(
      conversations.map(async (conversation: { id: string | number; leadId: number | null }) => {
        if (!conversation.leadId) return;
        result[String(conversation.leadId)] = await prisma.channelMessage.count({
          where: {
            conversationId: String(conversation.id),
            channel: 'whatsapp',
            direction: 'inbound',
            readAt: null,
          },
        });
      }),
    );
    return result;
  },

  async templates() {
    const credential = await currentMetaCredential();
    if (!metaCredentialConfigured(credential) || !credential) return [];
    const templates = await metaWhatsAppService.listTemplates(credential);
    return templates.map((template) => ({
      ...template,
      parameterCount: templateParameterCount(template),
    }));
  },

  async send(leadId: number, input: MessageInput, agent: { id: number; name: string }) {
    const credential = await currentMetaCredential();
    if (!metaCredentialConfigured(credential) || !credential) {
      throw new AppError(
        409,
        'WhatsApp is not configured for this workspace',
        'WHATSAPP_NOT_CONFIGURED',
      );
    }
    const { phone, conversation } = await conversationForLead(leadId);
    const idempotencyKey = `agent:${input.clientMessageId}`;
    const existing = await prisma.channelMessage.findUnique({ where: { idempotencyKey } });
    if (existing) return messageDto(existing);

    let body: string;
    if (input.type === 'text') {
      const window = await canSendFreeform(conversation.id);
      if (!window.allowed) {
        throw new AppError(
          409,
          'Use an approved template to start or reopen this WhatsApp conversation',
          'WHATSAPP_TEMPLATE_REQUIRED',
        );
      }
      body = input.text.trim();
    } else {
      const templates = await metaWhatsAppService.listTemplates(credential);
      const selected = templates.find(
        (template) =>
          template.name === input.template.name && template.language === input.template.language,
      );
      if (!selected) {
        throw new AppError(422, 'Choose an approved WhatsApp template', 'INVALID_TEMPLATE');
      }
      if (templateParameterCount(selected) !== input.template.parameters.length) {
        throw new AppError(
          422,
          'Complete every required template field',
          'INVALID_TEMPLATE_PARAMETERS',
        );
      }
      body = `[Template: ${selected.name}] ${input.template.parameters.join(' · ')}`.trim();
    }

    let pending;
    try {
      pending = await prisma.channelMessage.create({
        data: {
          conversationId: conversation.id,
          channel: 'whatsapp',
          direction: 'outbound',
          senderType: 'staff',
          senderRef: String(agent.id),
          body,
          deliveryStatus: 'pending',
          idempotencyKey,
          metadata: {
            messageType: input.type,
            senderName: agent.name,
            ...(input.type === 'template' ? { template: input.template } : {}),
          },
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2002') throw error;
      const duplicate = await prisma.channelMessage.findUnique({ where: { idempotencyKey } });
      if (!duplicate) throw error;
      return messageDto(duplicate);
    }
    const delivery =
      input.type === 'text'
        ? await metaWhatsAppService.sendText(credential, phone, body)
        : await metaWhatsAppService.sendTemplate(credential, phone, input.template);
    const updated = await prisma.channelMessage.update({
      where: { id: pending.id },
      data: {
        providerReference: delivery.providerReference,
        deliveryStatus: delivery.ok ? 'sent' : 'failed',
        metadata: {
          ...jsonObject(pending.metadata),
          ...(delivery.error ? { error: delivery.error.slice(0, 600) } : {}),
        },
      },
    });
    if (delivery.ok) {
      await Promise.all([
        conversationDelegate().update({
          where: { id: conversation.id },
          data: { status: 'waiting_on_traveller' },
        }),
        prisma.lead_submissions.update({
          where: { id: leadId },
          data: { last_contacted_at: new Date() },
        }),
      ]);
    }
    await emitConversationChange(leadId, updated.id);
    return messageDto(updated);
  },

  async markRead(leadId: number) {
    const credential = await currentMetaCredential();
    const { conversation } = await conversationForLead(leadId);
    const unread = await prisma.channelMessage.findMany({
      where: {
        conversationId: conversation.id,
        channel: 'whatsapp',
        direction: 'inbound',
        readAt: null,
      },
      select: { id: true, providerReference: true },
    });
    const now = new Date();
    await prisma.channelMessage.updateMany({
      where: { id: { in: unread.map((message) => message.id) } },
      data: { readAt: now },
    });
    if (credential) {
      await Promise.allSettled(
        unread
          .filter((message) => message.providerReference)
          .map((message) =>
            metaWhatsAppService.markRead(credential, message.providerReference as string),
          ),
      );
    }
    await emitConversationChange(leadId);
    return { read: unread.length };
  },

  async processWebhook(value: Record<string, any>) {
    const contacts = Array.isArray(value.contacts) ? value.contacts : [];
    const contactByPhone = new Map(
      contacts.map((contact: any) => [normalizeWhatsAppPhone(contact.wa_id), contact]),
    );
    for (const message of Array.isArray(value.messages) ? value.messages : []) {
      await storeInbound(message, contactByPhone.get(normalizeWhatsAppPhone(message.from)));
    }
    for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
      await updateDeliveryStatus(status);
    }
  },
};
