import { defaultPrisma } from '../config/prisma.js';

export const healthRepository = {
  async ping() {
    await defaultPrisma.$queryRaw`SELECT 1`;
  },
};
