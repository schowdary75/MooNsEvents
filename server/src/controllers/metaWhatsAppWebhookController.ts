import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { runWithTenant } from '../config/tenantContext.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../logger/index.js';
import { leadWhatsAppService } from '../services/leadWhatsAppService.js';
import { inboundMetaCredential } from '../services/metaWhatsAppCredentialService.js';
import { metaWhatsAppService } from '../services/metaWhatsAppService.js';

function webhookValues(body: any): Array<Record<string, any>> {
  if (body?.object !== 'whatsapp_business_account' || !Array.isArray(body.entry)) return [];
  return body.entry.flatMap((entry: any) =>
    Array.isArray(entry?.changes)
      ? entry.changes
          .filter((change: any) => change?.field === 'messages' && change?.value)
          .map((change: any) => change.value)
      : [],
  );
}

export const metaWhatsAppWebhookController = {
  verify: (request: Request, response: Response, next: NextFunction) => {
    try {
      const mode = String(request.query['hub.mode'] || '');
      const token = String(request.query['hub.verify_token'] || '');
      const challenge = String(request.query['hub.challenge'] || '');
      if (
        mode !== 'subscribe' ||
        !env.metaWhatsapp.verifyToken ||
        token !== env.metaWhatsapp.verifyToken
      ) {
        throw new AppError(403, 'WhatsApp webhook verification failed', 'WEBHOOK_FORBIDDEN');
      }
      response.status(200).type('text/plain').send(challenge);
    } catch (error) {
      next(error);
    }
  },

  receive: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const values = webhookValues(request.body);
      if (!values.length) return response.status(200).json({ success: true });
      const rawBody = request.rawBody;
      if (!rawBody) {
        throw new AppError(401, 'Invalid WhatsApp webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
      }
      const signature = request.header('x-hub-signature-256');
      const grouped = new Map<string, Array<Record<string, any>>>();
      for (const value of values) {
        const phoneNumberId = String(value?.metadata?.phone_number_id || '');
        if (!phoneNumberId) {
          throw new AppError(400, 'WhatsApp phone-number id is missing', 'INVALID_WEBHOOK');
        }
        grouped.set(phoneNumberId, [...(grouped.get(phoneNumberId) ?? []), value]);
      }
      for (const [phoneNumberId, phoneValues] of grouped) {
        const resolved = await inboundMetaCredential(phoneNumberId);
        if (!resolved) {
          throw new AppError(404, 'WhatsApp endpoint is not registered', 'WEBHOOK_NOT_REGISTERED');
        }
        if (
          !metaWhatsAppService.verifySignature(rawBody, signature, resolved.credential.appSecret)
        ) {
          throw new AppError(
            401,
            'Invalid WhatsApp webhook signature',
            'INVALID_WEBHOOK_SIGNATURE',
          );
        }
        const process = async () => {
          for (const value of phoneValues) await leadWhatsAppService.processWebhook(value);
        };
        if (resolved.runtime) await runWithTenant(resolved.runtime, process);
        else await process();
      }
      response.status(200).json({ success: true });
    } catch (error) {
      logger.warn('WhatsApp webhook processing failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      next(error);
    }
  },
};
