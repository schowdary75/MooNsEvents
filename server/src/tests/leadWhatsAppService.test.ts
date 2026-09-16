import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  lead_submissions: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  eventConversation: {
    upsert: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  conversationParticipant: { upsert: vi.fn() },
  channelMessage: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
};

const credential = {
  status: 'legacy' as const,
  accessToken: 'token',
  appSecret: 'secret',
  phoneNumberId: 'phone-id',
  businessAccountId: 'business-id',
  apiVersion: 'v21.0',
};

const sendText = vi.fn();
const sendTemplate = vi.fn();
const listTemplates = vi.fn();
const publishChatEvent = vi.fn();

vi.mock('../config/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../services/metaWhatsAppCredentialService.js', () => ({
  currentMetaCredential: vi.fn(async () => credential),
  metaCredentialConfigured: vi.fn(() => true),
}));
vi.mock('../services/metaWhatsAppService.js', () => ({
  metaWhatsAppService: {
    sendText,
    sendTemplate,
    listTemplates,
    markRead: vi.fn(),
  },
}));
vi.mock('../services/chatEventService.js', () => ({ publishChatEvent }));

const { leadWhatsAppService } = await import('../services/leadWhatsAppService.js');

const lead = {
  id: 7,
  name: 'Sample Client',
  phone: '9876543210',
  assigned_owner: 'MooN',
  status: 'new',
};
const conversation = { id: 'conversation-1', leadId: 7, status: 'open' };
const pending = {
  id: 'message-1',
  conversationId: conversation.id,
  direction: 'outbound',
  senderType: 'staff',
  senderRef: '3',
  body: 'Hello',
  deliveryStatus: 'pending',
  metadata: { messageType: 'text', senderName: 'MooN' },
  readAt: null,
  createdAt: new Date('2026-07-26T08:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.lead_submissions.findUnique.mockResolvedValue(lead);
  prismaMock.eventConversation.upsert.mockResolvedValue(conversation);
  prismaMock.conversationParticipant.upsert.mockResolvedValue({});
  prismaMock.channelMessage.findUnique.mockResolvedValue(null);
  prismaMock.eventConversation.update.mockResolvedValue(conversation);
  prismaMock.lead_submissions.update.mockResolvedValue(lead);
  publishChatEvent.mockResolvedValue(undefined);
});

describe('lead WhatsApp sending', () => {
  it('returns the stored response for a repeated client message id', async () => {
    prismaMock.channelMessage.findUnique.mockResolvedValue({
      ...pending,
      deliveryStatus: 'sent',
    });

    const result = await leadWhatsAppService.send(
      7,
      { type: 'text', text: 'Hello', clientMessageId: 'request-existing' },
      { id: 3, name: 'MooN' },
    );

    expect(result.deliveryStatus).toBe('sent');
    expect(prismaMock.channelMessage.create).not.toHaveBeenCalled();
    expect(sendText).not.toHaveBeenCalled();
  });

  it('requires an approved template when no inbound service window exists', async () => {
    prismaMock.channelMessage.findFirst.mockResolvedValue(null);
    await expect(
      leadWhatsAppService.send(
        7,
        { type: 'text', text: 'Hello', clientMessageId: 'request-1' },
        { id: 3, name: 'MooN' },
      ),
    ).rejects.toMatchObject({ code: 'WHATSAPP_TEMPLATE_REQUIRED', statusCode: 409 });
    expect(sendText).not.toHaveBeenCalled();
  });

  it('stores, sends, and updates a free-form reply inside the service window', async () => {
    prismaMock.channelMessage.findFirst.mockResolvedValue({ createdAt: new Date() });
    prismaMock.channelMessage.create.mockResolvedValue(pending);
    sendText.mockResolvedValue({ ok: true, providerReference: 'wamid.outbound-1' });
    prismaMock.channelMessage.update.mockResolvedValue({
      ...pending,
      providerReference: 'wamid.outbound-1',
      deliveryStatus: 'sent',
    });

    const result = await leadWhatsAppService.send(
      7,
      { type: 'text', text: ' Hello ', clientMessageId: 'request-2' },
      { id: 3, name: 'MooN' },
    );

    expect(sendText).toHaveBeenCalledWith(credential, '919876543210', 'Hello');
    expect(prismaMock.channelMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ idempotencyKey: 'agent:request-2' }),
      }),
    );
    expect(result.deliveryStatus).toBe('sent');
  });

  it('validates and sends approved templates', async () => {
    listTemplates.mockResolvedValue([
      {
        name: 'lead_greeting',
        language: 'en',
        status: 'APPROVED',
        category: 'UTILITY',
        components: [{ type: 'BODY', text: 'Hi {{1}} from {{2}}' }],
      },
    ]);
    prismaMock.channelMessage.create.mockResolvedValue({
      ...pending,
      body: '[Template: lead_greeting] Sample Client · MooN',
      metadata: { messageType: 'template', senderName: 'MooN' },
    });
    sendTemplate.mockResolvedValue({ ok: true, providerReference: 'wamid.template-1' });
    prismaMock.channelMessage.update.mockResolvedValue({
      ...pending,
      body: '[Template: lead_greeting] Sample Client · MooN',
      deliveryStatus: 'sent',
    });

    await leadWhatsAppService.send(
      7,
      {
        type: 'template',
        template: {
          name: 'lead_greeting',
          language: 'en',
          parameters: ['Sample Client', 'MooN'],
        },
        clientMessageId: 'request-3',
      },
      { id: 3, name: 'MooN' },
    );
    expect(sendTemplate).toHaveBeenCalledOnce();
  });
});

describe('inbound lead WhatsApp messages', () => {
  it('creates a WhatsApp-sourced lead for an unknown sender and deduplicates by wamid', async () => {
    prismaMock.lead_submissions.findMany.mockResolvedValue([]);
    prismaMock.lead_submissions.create.mockResolvedValue({ ...lead, phone: '919876543210' });
    prismaMock.channelMessage.upsert.mockResolvedValue({
      ...pending,
      id: 'inbound-1',
      direction: 'inbound',
      senderType: 'customer',
      senderRef: '919876543210',
      body: 'I need a Bali package',
      deliveryStatus: 'received',
      metadata: { messageType: 'text', senderName: 'Sample Client' },
    });

    await leadWhatsAppService.processWebhook({
      contacts: [{ wa_id: '919876543210', profile: { name: 'Sample Client' } }],
      messages: [
        {
          id: 'wamid.inbound-1',
          from: '919876543210',
          timestamp: '1785052800',
          type: 'text',
          text: { body: 'I need a Bali package' },
        },
      ],
    });

    expect(prismaMock.lead_submissions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ lead_source: 'whatsapp', phone: '919876543210' }),
    });
    expect(prismaMock.channelMessage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'meta:wamid.inbound-1' },
      }),
    );
  });

  it('keeps unsupported inbound media visible as a conversation placeholder', async () => {
    prismaMock.lead_submissions.findMany.mockResolvedValue([lead]);
    prismaMock.channelMessage.upsert.mockResolvedValue({
      ...pending,
      id: 'inbound-image',
      direction: 'inbound',
      body: 'Customer sent an unsupported WhatsApp image message.',
      metadata: { messageType: 'unsupported', providerType: 'image' },
    });

    await leadWhatsAppService.processWebhook({
      contacts: [{ wa_id: '919876543210', profile: { name: 'Sample Client' } }],
      messages: [
        {
          id: 'wamid.image-1',
          from: '919876543210',
          timestamp: '1785052800',
          type: 'image',
          image: { id: 'media-1' },
        },
      ],
    });

    expect(prismaMock.channelMessage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          body: 'Customer sent an unsupported WhatsApp image message.',
          metadata: expect.objectContaining({
            messageType: 'unsupported',
            providerType: 'image',
          }),
        }),
      }),
    );
  });

  it('advances provider delivery status without losing message metadata', async () => {
    prismaMock.channelMessage.findFirst.mockResolvedValue({
      ...pending,
      providerReference: 'wamid.outbound-1',
      deliveryStatus: 'sent',
    });
    prismaMock.channelMessage.update.mockResolvedValue({
      ...pending,
      providerReference: 'wamid.outbound-1',
      deliveryStatus: 'delivered',
    });
    prismaMock.eventConversation.findUnique.mockResolvedValue({ leadId: 7 });

    await leadWhatsAppService.processWebhook({
      statuses: [{ id: 'wamid.outbound-1', status: 'delivered' }],
    });

    expect(prismaMock.channelMessage.update).toHaveBeenCalledWith({
      where: { id: pending.id },
      data: {
        deliveryStatus: 'delivered',
        metadata: pending.metadata,
      },
    });
    expect(publishChatEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'whatsapp:message',
        payload: { leadId: 7, messageId: pending.id },
      }),
    );
  });
});
