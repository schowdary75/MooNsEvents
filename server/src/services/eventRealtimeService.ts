import { ensureRedis, redis } from '../config/redis.js';
import { getTenantRuntime } from '../config/tenantContext.js';
import { logger } from '../logger/index.js';

export const EVENT_UPDATES_CHANNEL = 'moonsevents:event-events';

export type EventInvalidationReason =
  | 'activity_status'
  | 'milestone_status'
  | 'incident_created'
  | 'incident_updated'
  | 'driver_updated';

export interface EventInvalidationPayload {
  bookingId: number;
  reason: EventInvalidationReason;
  occurredAt: string;
}

export interface EventRealtimeMessageMessage {
  tenantId?: string;
  userId: number;
  staffBroadcast: boolean;
  event: 'event:invalidate';
  payload: EventInvalidationPayload;
}

export async function publishEventInvalidation(
  userId: number,
  bookingId: number,
  reason: EventInvalidationReason,
): Promise<void> {
  const message: EventRealtimeMessageMessage = {
    tenantId: getTenantRuntime()?.tenantId,
    userId,
    staffBroadcast: true,
    event: 'event:invalidate',
    payload: { bookingId, reason, occurredAt: new Date().toISOString() },
  };

  try {
    await ensureRedis();
    await redis.publish(EVENT_UPDATES_CHANNEL, JSON.stringify(message));
  } catch (error) {
    logger.warn('Event invalidation publish failed', {
      bookingId,
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
