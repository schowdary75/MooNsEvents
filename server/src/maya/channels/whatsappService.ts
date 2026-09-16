import { logger } from '../../logger/index.js';
import { smsService } from '../../services/smsService.js';
import {
  currentMetaCredential,
  metaCredentialConfigured,
} from '../../services/metaWhatsAppCredentialService.js';
import { metaWhatsAppService } from '../../services/metaWhatsAppService.js';
import type { MessageDelivery } from '../types.js';

/**
 * WhatsApp delivery for Maya, with an automatic SMS fallback.
 *
 * The channel goes "live" the moment the WhatsApp Cloud API credentials are
 * present in the environment; until then (and on any WhatsApp failure) messages
 * transparently fall back to the existing local SMS gateway so nothing is ever
 * silently dropped — and, crucially, nothing fake is ever sent to a customer.
 *
 * Commercial workspaces resolve their encrypted Meta credential at request
 * time. Single-tenant compatibility deployments use the META_WHATSAPP_* env
 * variables documented in server/.env.example.
 */
export class WhatsAppService {
  /**
   * Send a free-form text message. Prefers WhatsApp; falls back to SMS on any
   * misconfiguration or delivery error. Never throws.
   */
  async sendText(to: string, message: string): Promise<MessageDelivery> {
    const credential = await currentMetaCredential();
    if (metaCredentialConfigured(credential) && credential) {
      const delivered = await metaWhatsAppService.sendText(
        credential,
        to.replace(/[^\d]/g, ''),
        message,
      );
      if (delivered.ok) {
        return {
          ok: true,
          channel: 'whatsapp',
          provider: 'whatsapp_cloud',
          providerReference: delivered.providerReference,
        };
      }
      logger.warn('WhatsApp send failed; falling back to SMS', { to, error: delivered.error });
    }
    return this.sendViaSms(to, message);
  }

  private async sendViaSms(to: string, message: string): Promise<MessageDelivery> {
    const ok = await smsService.sendSMS(to, message);
    return {
      ok,
      channel: 'sms',
      provider: 'sms_gateway',
      error: ok ? undefined : 'SMS gateway delivery failed or not configured',
    };
  }
}

export const whatsappService = new WhatsAppService();
