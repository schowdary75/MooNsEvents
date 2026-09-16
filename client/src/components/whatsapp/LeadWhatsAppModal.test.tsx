// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadWhatsAppModal } from './LeadWhatsAppModal';
import { WhatsAppIcon } from './WhatsAppIcon';

const api = vi.hoisted(() => ({
  getConversation: vi.fn(),
  getTemplates: vi.fn(),
  markRead: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@/api/whatsappClient', () => ({
  getLeadWhatsAppConversation: api.getConversation,
  getWhatsAppTemplates: api.getTemplates,
  markLeadWhatsAppRead: api.markRead,
  saveMetaWhatsAppCredential: vi.fn(),
  sendLeadWhatsAppMessage: api.sendMessage,
  verifyMetaWhatsAppCredential: vi.fn(),
}));
vi.mock('@/socket/socketClient', () => ({ getSocket: () => null }));
vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const lead = {
  id: 12,
  name: 'Ananya',
  phone: '+91 98765 43210',
  assigned_owner: 'MooN',
};

function conversation(overrides: Record<string, unknown> = {}) {
  return {
    conversation: {
      id: 'conversation-12',
      leadId: 12,
      customerName: 'Ananya',
      phone: '919876543210',
      owner: 'MooN',
      status: 'open',
      unreadCount: 0,
      canSendFreeform: true,
      serviceWindowExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      ...((overrides.conversation as Record<string, unknown>) ?? {}),
    },
    provider: { configured: true, status: 'active', ...(overrides.provider ?? {}) },
    messages: overrides.messages ?? [],
    nextCursor: null,
  };
}

async function renderModal(canConfigure = false) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LeadWhatsAppModal
        lead={lead}
        open
        onOpenChange={vi.fn()}
        agentName="MooN"
        canConfigure={canConfigure}
      />,
    );
    await Promise.resolve();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getTemplates.mockResolvedValue([]);
  api.markRead.mockResolvedValue({ read: 0 });
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  document.body.innerHTML = '';
  root = null;
  container = null;
});

describe('LeadWhatsAppModal', () => {
  it('shows configuration guidance instead of a composer when Meta is unavailable', async () => {
    api.getConversation.mockResolvedValue(
      conversation({ provider: { configured: false, status: 'unconfigured' } }),
    );

    await renderModal();

    expect(document.body.textContent).toContain('WhatsApp is not connected for this workspace.');
    expect(document.querySelector('#lead-whatsapp-message')).toBeNull();
  });

  it('prefills an editable greeting and sends it with Enter', async () => {
    api.getConversation.mockResolvedValue(conversation());
    api.sendMessage.mockResolvedValue({
      id: 'sent-1',
      direction: 'outbound',
      senderType: 'staff',
      senderRef: '3',
      senderName: 'MooN',
      kind: 'text',
      body: 'Hi Ananya',
      deliveryStatus: 'sent',
      error: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    await renderModal();
    const composer = document.querySelector<HTMLTextAreaElement>('#lead-whatsapp-message');
    expect(composer?.value).toContain('Hi Ananya, this is MooN');

    await act(async () => {
      composer!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await Promise.resolve();
    });

    expect(api.sendMessage).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        type: 'text',
        text: expect.stringContaining('Hi Ananya, this is MooN'),
        clientMessageId: expect.any(String),
      }),
    );
  });

  it('uses approved templates outside the customer-service window', async () => {
    api.getConversation.mockResolvedValue(
      conversation({ conversation: { canSendFreeform: false } }),
    );
    api.getTemplates.mockResolvedValue([
      {
        name: 'lead_greeting',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        components: [{ type: 'BODY', text: 'Hi {{1}} from {{2}}' }],
        parameterCount: 2,
      },
    ]);

    await renderModal();
    const select = document.querySelector('select')!;
    await act(async () => {
      select.value = 'lead_greeting:en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });

    const values = [...document.querySelectorAll<HTMLInputElement>('input')].map(
      (input) => input.value,
    );
    expect(values).toEqual(expect.arrayContaining(['Ananya', 'MooN']));
    expect(document.body.textContent).toContain('Send approved template');
  });
});

describe('WhatsAppIcon', () => {
  it('remains recognizable to assistive technology', () => {
    const markup = renderToStaticMarkup(<WhatsAppIcon aria-label="Open WhatsApp conversation" />);
    expect(markup).toContain('Open WhatsApp conversation');
    expect(markup).toContain('svg');
  });
});
