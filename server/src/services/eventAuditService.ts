import { createHash } from 'node:crypto';

export const EVENT_TYPES = [
  'LeadCaptured',
  'LeadQualified',
  'QuoteDrafted',
  'QuoteAccepted',
  'PaymentDue',
  'PaymentReceived',
  'BookingConfirmed',
  'EventProjectCreated',
  'RunOfShowApproved',
  'EventCompleted',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function eventAuditKey(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  discriminator = '1',
) {
  return createHash('sha256')
    .update(`${eventType}:${aggregateType}:${aggregateId}:${discriminator}`)
    .digest('hex');
}

export async function appendEventAuditEntry(
  db: any,
  input: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: any;
    idempotencyKey?: string;
    discriminator?: string;
  },
) {
  const idempotencyKey =
    input.idempotencyKey ??
    eventAuditKey(input.eventType, input.aggregateType, input.aggregateId, input.discriminator);
  return { idempotencyKey, ...input };
}
