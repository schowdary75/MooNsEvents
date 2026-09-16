import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController.js';

export const whatsappRoutes = Router();

whatsappRoutes.get('/unread-counts', whatsappController.unreadCounts);
whatsappRoutes.get('/templates', whatsappController.templates);
whatsappRoutes.get('/leads/:leadId/conversation', whatsappController.conversation);
whatsappRoutes.post('/leads/:leadId/messages', whatsappController.send);
whatsappRoutes.post('/leads/:leadId/read', whatsappController.markRead);
