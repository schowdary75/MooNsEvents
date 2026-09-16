import { prisma } from '../config/prisma.js';

export async function provisionEventPlanSafely(...args: any[]) {
  return { ok: true };
}

export const eventPlanService = {
  async getRunOfShow(bookingId: string) {
    return {
      bookingId,
      events: [],
      packages: [],
    };
  },
  async updateSchedule(bookingId: string, schedule: any) {
    return { bookingId, schedule };
  },
};
