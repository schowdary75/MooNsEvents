import { Router } from 'express';
import { metaWhatsAppWebhookController } from '../controllers/metaWhatsAppWebhookController.js';

export const metaWhatsAppWebhookRoutes = Router();

metaWhatsAppWebhookRoutes.get('/', metaWhatsAppWebhookController.verify);
metaWhatsAppWebhookRoutes.post('/', metaWhatsAppWebhookController.receive);
