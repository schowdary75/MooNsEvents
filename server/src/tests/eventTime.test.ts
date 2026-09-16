import { describe, expect, it } from 'vitest';
import { eventDayNumber, eventPhase } from '../utils/eventTime.js';

describe('event time calculations', () => {
  const eventDate = new Date('2026-07-20T00:00:00.000Z');

  it('uses the tenant timezone at a calendar-day boundary', () => {
    const now = new Date('2026-07-19T18:31:00.000Z');
    expect(eventDayNumber(eventDate, 'Asia/Kolkata', now)).toBe(1);
    expect(eventDayNumber(eventDate, 'America/New_York', now)).toBe(0);
  });

  it('falls back safely when a configured timezone is invalid', () => {
    const now = new Date('2026-07-19T18:31:00.000Z');
    expect(eventDayNumber(eventDate, 'Not/A-Timezone', now)).toBe(1);
  });

  it('separates inactive, upcoming, active, and completed phases', () => {
    expect(eventPhase('cancelled', 1, 5)).toBe('inactive');
    expect(eventPhase('confirmed', 0, 5)).toBe('upcoming');
    expect(eventPhase('confirmed', 3, 5)).toBe('active');
    expect(eventPhase('confirmed', 6, 5)).toBe('completed');
  });
});
