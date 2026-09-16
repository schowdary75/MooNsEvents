import { logger } from '../../logger/index.js';

/**
 * Timeline-status feed for the disruption shield.
 *
 * Live status comes from a real provider (AeroDataBox via RapidAPI) when its key
 * is configured; otherwise the provider reports `unknown` and the shield simply
 * stays quiet. It never fabricates a delay — a false "your timeline is cancelled"
 * alert is worse than none.
 *
 * Env for live status:
 *   AERODATABOX_API_KEY   RapidAPI key for aerodatabox.p.rapidapi.com
 */

export type TimelineState = 'on_time' | 'delayed' | 'cancelled' | 'unknown';

export interface TimelineStatus {
  timelineNumber: string;
  state: TimelineState;
  /** Positive minutes of delay when known; 0 otherwise. */
  delayMinutes: number;
  scheduledDeparture: Date;
}

export interface TimelineStatusProvider {
  readonly configured: boolean;
  getStatus(timelineNumber: string, departureDate: Date): Promise<TimelineStatus>;
}

const UNKNOWN = (timelineNumber: string, scheduledDeparture: Date): TimelineStatus => ({
  timelineNumber,
  state: 'unknown',
  delayMinutes: 0,
  scheduledDeparture,
});

export class AeroDataBoxProvider implements TimelineStatusProvider {
  get configured(): boolean {
    return Boolean((process.env.AERODATABOX_API_KEY ?? '').trim());
  }

  async getStatus(timelineNumber: string, departureDate: Date): Promise<TimelineStatus> {
    if (!this.configured) return UNKNOWN(timelineNumber, departureDate);
    const key = (process.env.AERODATABOX_API_KEY ?? '').trim();
    const dateStr = departureDate.toISOString().slice(0, 10);
    const url = `https://aerodatabox.p.rapidapi.com/timelines/number/${encodeURIComponent(
      timelineNumber,
    )}/${dateStr}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        logger.warn('Timeline-status provider returned non-OK', {
          timelineNumber,
          status: response.status,
        });
        return UNKNOWN(timelineNumber, departureDate);
      }
      const body = (await response.json()) as unknown;
      return this.parse(timelineNumber, departureDate, body);
    } catch (error) {
      logger.warn('Timeline-status lookup failed', { timelineNumber, error });
      return UNKNOWN(timelineNumber, departureDate);
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Extract a normalised status from AeroDataBox's timeline array response. */
  private parse(timelineNumber: string, scheduledDeparture: Date, body: unknown): TimelineStatus {
    const timelines = Array.isArray(body) ? body : [];
    const timeline = timelines[0] as
      | {
          status?: string;
          departure?: { scheduledTime?: { utc?: string }; revisedTime?: { utc?: string } };
        }
      | undefined;
    if (!timeline) return UNKNOWN(timelineNumber, scheduledDeparture);

    const status = (timeline.status ?? '').toLowerCase();
    if (status.includes('cancel')) {
      return { timelineNumber, state: 'cancelled', delayMinutes: 0, scheduledDeparture };
    }

    const scheduled = timeline.departure?.scheduledTime?.utc;
    const revised = timeline.departure?.revisedTime?.utc;
    let delayMinutes = 0;
    if (scheduled && revised) {
      delayMinutes = Math.max(
        0,
        Math.round((new Date(revised).getTime() - new Date(scheduled).getTime()) / 60_000),
      );
    }
    return {
      timelineNumber,
      state: delayMinutes > 0 ? 'delayed' : 'on_time',
      delayMinutes,
      scheduledDeparture,
    };
  }
}

export const timelineStatusProvider: TimelineStatusProvider = new AeroDataBoxProvider();
