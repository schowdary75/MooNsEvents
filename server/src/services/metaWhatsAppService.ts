import { createHmac, timingSafeEqual } from 'node:crypto';
import type { MetaWhatsAppCredential } from './metaWhatsAppCredentialService.js';

interface MetaApiError {
  error?: { message?: string; code?: number; error_subcode?: number };
}

export interface MetaSendResult {
  ok: boolean;
  providerReference?: string;
  error?: string;
}

export interface MetaTemplate {
  name: string;
  language: string;
  category: string;
  status: string;
  components: Array<Record<string, unknown>>;
}

async function graphRequest<T>(
  credential: MetaWhatsAppCredential,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `https://graph.facebook.com/${credential.apiVersion}/${path.replace(/^\/+/, '')}`,
    {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${credential.accessToken}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const body = (await response.json().catch(() => ({}))) as T & MetaApiError;
  if (!response.ok) {
    throw new Error(body.error?.message || `Meta Graph API returned HTTP ${response.status}`);
  }
  return body;
}

function safeProviderError(error: unknown, credential: MetaWhatsAppCredential, fallback: string) {
  let message = error instanceof Error ? error.message : fallback;
  for (const sensitive of [credential.accessToken, credential.appSecret]) {
    if (sensitive) message = message.replaceAll(sensitive, '[redacted]');
  }
  return message.slice(0, 600);
}

export const metaWhatsAppService = {
  verifySignature(rawBody: Buffer, signature: string | undefined, appSecret: string) {
    if (!signature?.startsWith('sha256=') || !appSecret) return false;
    const supplied = signature.slice('sha256='.length);
    const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex');
    if (supplied.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  },

  async verifyCredential(credential: MetaWhatsAppCredential) {
    return graphRequest<{
      id: string;
      display_phone_number?: string;
      verified_name?: string;
    }>(credential, `${credential.phoneNumberId}?fields=id,display_phone_number,verified_name`);
  },

  async listTemplates(credential: MetaWhatsAppCredential): Promise<MetaTemplate[]> {
    const response = await graphRequest<{
      data?: Array<{
        name?: string;
        language?: string;
        category?: string;
        status?: string;
        components?: Array<Record<string, unknown>>;
      }>;
    }>(
      credential,
      `${credential.businessAccountId}/message_templates?fields=name,status,language,category,components&status=APPROVED&limit=100`,
    );
    return (response.data ?? [])
      .filter((item) => item.name && item.language && item.status === 'APPROVED')
      .map((item) => ({
        name: item.name!,
        language: item.language!,
        category: item.category || 'UTILITY',
        status: item.status!,
        components: item.components ?? [],
      }));
  },

  async sendText(
    credential: MetaWhatsAppCredential,
    to: string,
    text: string,
  ): Promise<MetaSendResult> {
    try {
      const response = await graphRequest<{ messages?: Array<{ id?: string }> }>(
        credential,
        `${credential.phoneNumberId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body: text },
          }),
        },
      );
      return { ok: true, providerReference: response.messages?.[0]?.id };
    } catch (error) {
      return {
        ok: false,
        error: safeProviderError(error, credential, 'WhatsApp send failed'),
      };
    }
  },

  async sendTemplate(
    credential: MetaWhatsAppCredential,
    to: string,
    template: { name: string; language: string; parameters: string[] },
  ): Promise<MetaSendResult> {
    try {
      const components = template.parameters.length
        ? [
            {
              type: 'body',
              parameters: template.parameters.map((text) => ({ type: 'text', text })),
            },
          ]
        : undefined;
      const response = await graphRequest<{ messages?: Array<{ id?: string }> }>(
        credential,
        `${credential.phoneNumberId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'template',
            template: {
              name: template.name,
              language: { code: template.language },
              ...(components ? { components } : {}),
            },
          }),
        },
      );
      return { ok: true, providerReference: response.messages?.[0]?.id };
    } catch (error) {
      return {
        ok: false,
        error: safeProviderError(error, credential, 'Template send failed'),
      };
    }
  },

  async markRead(credential: MetaWhatsAppCredential, providerReference: string) {
    await graphRequest(credential, `${credential.phoneNumberId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: providerReference,
      }),
    });
  },
};
