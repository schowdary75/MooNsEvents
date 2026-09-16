import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../helpers/response.js';
import { AppError } from '../errors/AppError.js';
import { leadWhatsAppService } from '../services/leadWhatsAppService.js';

const textMessageSchema = z.object({
  type: z.literal('text'),
  text: z.string().trim().min(1).max(4096),
  clientMessageId: z.string().uuid(),
});

const templateMessageSchema = z.object({
  type: z.literal('template'),
  template: z.object({
    name: z.string().trim().min(1).max(512),
    language: z.string().trim().min(2).max(20),
    parameters: z.array(z.string().trim().min(1).max(1024)).max(20),
  }),
  clientMessageId: z.string().uuid(),
});

const messageSchema = z.discriminatedUnion('type', [textMessageSchema, templateMessageSchema]);

function leadId(request: Request) {
  const value = Number(request.params.leadId);
  if (!Number.isInteger(value) || value < 1) {
    throw new AppError(400, 'Invalid lead id', 'INVALID_LEAD_ID');
  }
  return value;
}

function parseMessage(input: unknown) {
  const result = messageSchema.safeParse(input);
  if (!result.success) {
    throw new AppError(
      400,
      result.error.issues[0]?.message || 'Invalid WhatsApp message',
      'INVALID_WHATSAPP_MESSAGE',
    );
  }
  return result.data;
}

async function agent(request: Request) {
  if (!request.auth || request.auth.principalType !== 'crm_user') {
    throw new AppError(403, 'Staff authentication required', 'FORBIDDEN');
  }
  const user = await prisma.crmUser.findUnique({
    where: { id: request.auth.userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) throw new AppError(403, 'Staff account not found', 'FORBIDDEN');
  return { id: user.id, name: user.name || user.email };
}

export const whatsappController = {
  conversation: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const limit = Number(request.query.limit || 50);
      sendSuccess(
        response,
        await leadWhatsAppService.conversation(
          leadId(request),
          typeof request.query.cursor === 'string' ? request.query.cursor : undefined,
          Number.isFinite(limit) ? limit : 50,
        ),
      );
    } catch (error) {
      next(error);
    }
  },

  unreadCounts: async (_request: Request, response: Response, next: NextFunction) => {
    try {
      sendSuccess(response, await leadWhatsAppService.unreadCounts());
    } catch (error) {
      next(error);
    }
  },

  templates: async (_request: Request, response: Response, next: NextFunction) => {
    try {
      sendSuccess(response, await leadWhatsAppService.templates());
    } catch (error) {
      next(error);
    }
  },

  send: async (request: Request, response: Response, next: NextFunction) => {
    try {
      sendSuccess(
        response,
        await leadWhatsAppService.send(
          leadId(request),
          parseMessage(request.body),
          await agent(request),
        ),
        201,
      );
    } catch (error) {
      next(error);
    }
  },

  markRead: async (request: Request, response: Response, next: NextFunction) => {
    try {
      sendSuccess(response, await leadWhatsAppService.markRead(leadId(request)));
    } catch (error) {
      next(error);
    }
  },
};
