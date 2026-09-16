import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureRedis: vi.fn(),
  publish: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('../config/redis.js', () => ({
  ensureRedis: mocks.ensureRedis,
  redis: { publish: mocks.publish },
}));

vi.mock('../config/tenantContext.js', () => ({
  getTenantRuntime: () => ({ tenantId: 'tenant-a' }),
}));

vi.mock('../logger/index.js', () => ({
  logger: { warn: mocks.warn },
}));

import { publishEventInvalidation, EVENT_UPDATES_CHANNEL } from '../services/eventRealtimeService.js';

describe('event event publication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('publishes only identifiers in a tenant-scoped invalidation', async () => {
    await publishEventInvalidation(42, 91, 'milestone_status');

    expect(mocks.publish).toHaveBeenCalledOnce();
    const [channel, raw] = mocks.publish.mock.calls[0] as [string, string];
    expect(channel).toBe(EVENT_UPDATES_CHANNEL);
    expect(JSON.parse(raw)).toMatchObject({
      tenantId: 'tenant-a',
      userId: 42,
      staffBroadcast: true,
      event: 'event:invalidate',
      payload: { bookingId: 91, reason: 'milestone_status' },
    });
    expect(raw).not.toContain('schedule');
    expect(raw).not.toContain('driver');
  });

  it('does not fail the authoritative mutation when Redis is temporarily unavailable', async () => {
    mocks.ensureRedis.mockRejectedValueOnce(new Error('redis unavailable'));
    await expect(publishEventInvalidation(42, 91, 'incident_created')).resolves.toBeUndefined();
    expect(mocks.warn).toHaveBeenCalledOnce();
  });
});
