import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  inboundCredential: vi.fn(),
  verifySignature: vi.fn(),
  processWebhook: vi.fn(),
  runWithTenant: vi.fn(async (_runtime, callback: () => Promise<void>) => callback()),
}));

vi.mock('../config/env.js', () => ({
  env: { metaWhatsapp: { verifyToken: 'deployment-verify-token' } },
}));
vi.mock('../config/tenantContext.js', () => ({ runWithTenant: mocks.runWithTenant }));
vi.mock('../logger/index.js', () => ({ logger: { warn: vi.fn() } }));
vi.mock('../services/leadWhatsAppService.js', () => ({
  leadWhatsAppService: { processWebhook: mocks.processWebhook },
}));
vi.mock('../services/metaWhatsAppCredentialService.js', () => ({
  inboundMetaCredential: mocks.inboundCredential,
}));
vi.mock('../services/metaWhatsAppService.js', () => ({
  metaWhatsAppService: { verifySignature: mocks.verifySignature },
}));

const { metaWhatsAppWebhookController } =
  await import('../controllers/metaWhatsAppWebhookController.js');

function response() {
  const result = {
    status: vi.fn(),
    type: vi.fn(),
    send: vi.fn(),
    json: vi.fn(),
  };
  result.status.mockReturnValue(result);
  result.type.mockReturnValue(result);
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifySignature.mockReturnValue(true);
  mocks.processWebhook.mockResolvedValue(undefined);
  mocks.inboundCredential.mockImplementation(async (phoneNumberId: string) => ({
    credential: { appSecret: `secret-${phoneNumberId}` },
    runtime: { tenantId: `tenant-${phoneNumberId}` },
  }));
});

describe('Meta WhatsApp webhook verification', () => {
  it('returns the challenge only for the deployment verification token', () => {
    const res = response();
    const next = vi.fn();
    metaWhatsAppWebhookController.verify(
      {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'deployment-verify-token',
          'hub.challenge': 'challenge-123',
        },
      } as never,
      res as never,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('challenge-123');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a mismatched verification token', () => {
    const next = vi.fn();
    metaWhatsAppWebhookController.verify(
      {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong',
          'hub.challenge': 'challenge-123',
        },
      } as never,
      response() as never,
      next,
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'WEBHOOK_FORBIDDEN' }),
    );
  });
});

describe('Meta WhatsApp inbound routing', () => {
  const value = (phoneNumberId: string, messageId: string) => ({
    metadata: { phone_number_id: phoneNumberId },
    messages: [{ id: messageId, from: '919876543210', type: 'text' }],
  });

  it('rejects content before processing when the app-secret signature is invalid', async () => {
    mocks.verifySignature.mockReturnValue(false);
    const next = vi.fn();
    await metaWhatsAppWebhookController.receive(
      {
        body: {
          object: 'whatsapp_business_account',
          entry: [{ changes: [{ field: 'messages', value: value('phone-a', 'wamid.1') }] }],
        },
        rawBody: Buffer.from('{}'),
        header: vi.fn().mockReturnValue('sha256=bad'),
      } as never,
      response() as never,
      next,
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: 'INVALID_WEBHOOK_SIGNATURE' }),
    );
    expect(mocks.processWebhook).not.toHaveBeenCalled();
  });

  it('resolves every phone-number id and processes it in the matching workspace', async () => {
    const first = value('phone-a', 'wamid.1');
    const second = value('phone-b', 'wamid.2');
    const res = response();
    const next = vi.fn();
    await metaWhatsAppWebhookController.receive(
      {
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              changes: [
                { field: 'messages', value: first },
                { field: 'messages', value: second },
              ],
            },
          ],
        },
        rawBody: Buffer.from('signed-body'),
        header: vi.fn().mockReturnValue('sha256=valid'),
      } as never,
      res as never,
      next,
    );

    expect(mocks.inboundCredential).toHaveBeenNthCalledWith(1, 'phone-a');
    expect(mocks.inboundCredential).toHaveBeenNthCalledWith(2, 'phone-b');
    expect(mocks.verifySignature).toHaveBeenCalledWith(
      expect.any(Buffer),
      'sha256=valid',
      'secret-phone-a',
    );
    expect(mocks.runWithTenant).toHaveBeenCalledTimes(2);
    expect(mocks.processWebhook).toHaveBeenNthCalledWith(1, first);
    expect(mocks.processWebhook).toHaveBeenNthCalledWith(2, second);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
