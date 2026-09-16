import type { ResourceStatus } from '@moonsevents/platform-client';
import { env } from '../config/env.js';
import { platformPrisma } from '../config/platformPrisma.js';
import {
  getTenantRuntime,
  resolveTenantRuntime,
  type TenantRuntimeContext,
} from '../config/tenantContext.js';
import { secretStore } from './secretStore.js';

export interface MetaWhatsAppCredential {
  tenantId?: string;
  status: ResourceStatus | 'legacy';
  accessToken: string;
  appSecret: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function metadataOf(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function legacyCredential(): MetaWhatsAppCredential | null {
  const credential: MetaWhatsAppCredential = {
    status: 'legacy',
    accessToken: env.metaWhatsapp.accessToken.trim(),
    appSecret: env.metaWhatsapp.appSecret.trim(),
    phoneNumberId: env.metaWhatsapp.phoneNumberId.trim(),
    businessAccountId: env.metaWhatsapp.businessAccountId.trim(),
    apiVersion: env.metaWhatsapp.apiVersion.trim(),
  };
  return credential.accessToken && credential.phoneNumberId ? credential : null;
}

async function fromRecord(record: {
  tenantId: string;
  status: ResourceStatus;
  secretArn: string;
  externalAccountId: string | null;
  metadata: unknown;
}): Promise<MetaWhatsAppCredential> {
  const [secrets, metadata] = await Promise.all([
    secretStore.get(record.secretArn),
    Promise.resolve(metadataOf(record.metadata)),
  ]);
  return {
    tenantId: record.tenantId,
    status: record.status,
    accessToken: stringValue(secrets.accessToken || secrets.token),
    appSecret: stringValue(secrets.appSecret),
    phoneNumberId: stringValue(record.externalAccountId || metadata.phoneNumberId),
    businessAccountId: stringValue(metadata.businessAccountId),
    apiVersion: stringValue(metadata.apiVersion) || env.metaWhatsapp.apiVersion,
  };
}

export async function metaCredentialForTenant(
  tenantId: string,
  options: { activeOnly?: boolean } = {},
) {
  const record = await platformPrisma.providerCredential.findUnique({
    where: { tenantId_provider: { tenantId, provider: 'meta' } },
  });
  if (!record || (options.activeOnly !== false && record.status !== 'active')) return null;
  return fromRecord(record);
}

export async function currentMetaCredential(options: { activeOnly?: boolean } = {}) {
  const tenantId = getTenantRuntime()?.tenantId;
  return tenantId ? metaCredentialForTenant(tenantId, options) : legacyCredential();
}

export async function inboundMetaCredential(phoneNumberId: string): Promise<{
  credential: MetaWhatsAppCredential;
  runtime: TenantRuntimeContext | null;
} | null> {
  const record = await platformPrisma.providerCredential.findFirst({
    where: { provider: 'meta', externalAccountId: phoneNumberId, status: 'active' },
  });
  if (record) {
    return {
      credential: await fromRecord(record),
      runtime: await resolveTenantRuntime(record.tenantId),
    };
  }
  const legacy = legacyCredential();
  return legacy?.phoneNumberId === phoneNumberId ? { credential: legacy, runtime: null } : null;
}

export function metaCredentialConfigured(
  credential: MetaWhatsAppCredential | null,
  options: { allowInactive?: boolean } = {},
) {
  return Boolean(
    credential?.accessToken &&
    credential.appSecret &&
    credential.phoneNumberId &&
    credential.businessAccountId &&
    credential.apiVersion &&
    (options.allowInactive || credential.status === 'active' || credential.status === 'legacy'),
  );
}
