import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { metaWhatsAppService } from '../services/metaWhatsAppService.js';
import type { MetaWhatsAppCredential } from '../services/metaWhatsAppCredentialService.js';

const credential: MetaWhatsAppCredential = {
  status: 'legacy',
  accessToken: 'test-token',
  appSecret: 'test-app-secret',
  phoneNumberId: '12345',
  businessAccountId: '67890',
  apiVersion: 'v21.0',
};

afterEach(() => vi.unstubAllGlobals());

describe('Meta WhatsApp webhook signatures', () => {
  it('accepts the matching sha256 signature and rejects malformed signatures', () => {
    const body = Buffer.from('{"object":"whatsapp_business_account"}');
    const digest = createHmac('sha256', credential.appSecret).update(body).digest('hex');
    expect(
      metaWhatsAppService.verifySignature(body, `sha256=${digest}`, credential.appSecret),
    ).toBe(true);
    expect(metaWhatsAppService.verifySignature(body, 'sha256=bad', credential.appSecret)).toBe(
      false,
    );
    expect(metaWhatsAppService.verifySignature(body, undefined, credential.appSecret)).toBe(false);
  });
});

describe('Meta WhatsApp outbound requests', () => {
  it('sends text through the configured phone-number endpoint and returns the wamid', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: 'wamid.sent-1' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      metaWhatsAppService.sendText(credential, '919876543210', 'Hello'),
    ).resolves.toEqual({ ok: true, providerReference: 'wamid.sent-1' });
    expect(fetchMock).toHaveBeenCalledOnce();
    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const [url, init] = firstCall!;
    expect(url).toContain('/v21.0/12345/messages');
    expect(JSON.parse(String(init.body))).toMatchObject({
      messaging_product: 'whatsapp',
      to: '919876543210',
      type: 'text',
      text: { body: 'Hello' },
    });
    expect(init.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns a safe failure without exposing the access token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: `Provider rejected ${credential.accessToken}` },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );
    const result = await metaWhatsAppService.sendText(credential, '919876543210', 'Hello');
    expect(result).toEqual({ ok: false, error: 'Provider rejected [redacted]' });
    expect(JSON.stringify(result)).not.toContain(credential.accessToken);
  });

  it('filters the template list to approved named templates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                name: 'lead_greeting',
                language: 'en',
                category: 'UTILITY',
                status: 'APPROVED',
                components: [{ type: 'BODY', text: 'Hi {{1}}' }],
              },
              { name: 'draft', language: 'en', status: 'PENDING' },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    await expect(metaWhatsAppService.listTemplates(credential)).resolves.toEqual([
      {
        name: 'lead_greeting',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        components: [{ type: 'BODY', text: 'Hi {{1}}' }],
      },
    ]);
  });
});
