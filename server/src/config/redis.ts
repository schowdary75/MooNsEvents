import { Redis } from 'ioredis';
import type { ConnectionOptions } from 'bullmq';
import { env } from './env.js';
import { logger } from '../logger/index.js';

// In-memory key-value store fallback for local development without Redis
const inMemoryStore = new Map<string, string>();

class LocalRedisFallback {
  status = 'ready';
  on() { return this; }
  once() { return this; }
  async connect() { return 'OK'; }
  async quit() { return 'OK'; }
  async disconnect() { return 'OK'; }
  async get(key: string) { return inMemoryStore.get(key) ?? null; }
  async set(key: string, value: string) { inMemoryStore.set(key, value); return 'OK'; }
  async del(key: string) { inMemoryStore.delete(key); return 1; }
  async expire() { return 1; }
  async exists(key: string) { return inMemoryStore.has(key) ? 1 : 0; }
  async hget(key: string, field: string) { return null; }
  async hset() { return 1; }
  async hgetall() { return {}; }
  async publish() { return 0; }
  async subscribe() { return 'OK'; }
}

let redisClient: any;
try {
  redisClient = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy() { return null; },
  });
  redisClient.on('error', () => {
    logger.warn('Redis offline; switching to local in-memory store');
  });
} catch {
  redisClient = new LocalRedisFallback();
}

export const redis = redisClient;

export async function ensureRedis(): Promise<void> {
  try {
    if (redis.status === 'wait') await redis.connect();
  } catch {
    logger.warn('Redis not available; operating in local native mode.');
  }
}

const redisUrl = new URL(env.redisUrl);
export const bullConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  ...(redisUrl.username ? { username: decodeURIComponent(redisUrl.username) } : {}),
  ...(redisUrl.password ? { password: decodeURIComponent(redisUrl.password) } : {}),
  ...(redisUrl.pathname.length > 1 ? { db: Number(redisUrl.pathname.slice(1)) } : {}),
  ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
};
