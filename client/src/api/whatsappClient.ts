import { apiClient } from './client';
import type { ApiSuccess } from '../types/api';

export interface LeadWhatsAppMessage {
  id: string;
  direction: 'inbound' | 'outbound' | 'internal';
  senderType: string;
  senderRef: string | null;
  senderName: string | null;
  kind: 'text' | 'template' | 'unsupported';
  body: string;
  deliveryStatus: 'received' | 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface LeadWhatsAppConversation {
  conversation: {
    id: string;
    leadId: number;
    customerName: string;
    phone: string;
    owner: string | null;
    status: string;
    unreadCount: number;
    canSendFreeform: boolean;
    serviceWindowExpiresAt: string | null;
  };
  provider: { configured: boolean; status: string };
  messages: LeadWhatsAppMessage[];
  nextCursor: string | null;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: string;
  status: string;
  components: Array<Record<string, unknown>>;
  parameterCount: number;
}

export async function getLeadWhatsAppConversation(
  leadId: number,
  options: { cursor?: string; limit?: number } = {},
) {
  const response = await apiClient.get<ApiSuccess<LeadWhatsAppConversation>>(
    `/whatsapp/leads/${leadId}/conversation`,
    { params: options },
  );
  return response.data.data;
}

export async function getWhatsAppUnreadCounts() {
  const response =
    await apiClient.get<ApiSuccess<Record<string, number>>>('/whatsapp/unread-counts');
  return response.data.data;
}

export async function getWhatsAppTemplates() {
  const response = await apiClient.get<ApiSuccess<WhatsAppTemplate[]>>('/whatsapp/templates');
  return response.data.data;
}

export async function sendLeadWhatsAppMessage(
  leadId: number,
  input:
    | { type: 'text'; text: string; clientMessageId: string }
    | {
        type: 'template';
        template: { name: string; language: string; parameters: string[] };
        clientMessageId: string;
      },
) {
  const response = await apiClient.post<ApiSuccess<LeadWhatsAppMessage>>(
    `/whatsapp/leads/${leadId}/messages`,
    input,
  );
  return response.data.data;
}

export async function markLeadWhatsAppRead(leadId: number) {
  const response = await apiClient.post<ApiSuccess<{ read: number }>>(
    `/whatsapp/leads/${leadId}/read`,
  );
  return response.data.data;
}

export async function saveMetaWhatsAppCredential(input: {
  accessToken: string;
  appSecret: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
}) {
  const response = await apiClient.post<
    ApiSuccess<{ provider: string; status: string; metadata: Record<string, string> }>
  >('/tenants/provider-credentials', {
    provider: 'meta',
    credentials: { accessToken: input.accessToken, appSecret: input.appSecret },
    metadata: {
      phoneNumberId: input.phoneNumberId,
      businessAccountId: input.businessAccountId,
      apiVersion: input.apiVersion,
    },
  });
  return response.data.data;
}

export async function verifyMetaWhatsAppCredential() {
  const response = await apiClient.post<
    ApiSuccess<{ provider: string; status: string; metadata: Record<string, string> }>
  >('/tenants/provider-credentials/meta/verify');
  return response.data.data;
}
