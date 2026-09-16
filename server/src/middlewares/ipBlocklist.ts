/**
 * IP Blocklist Middleware — Redis-backed IP blocking with auto-ban
 * for repeat rate-limit violators and a manual admin blocklist.
 *
 * Part of the MooNsEvents security layer.
 */
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

const PREFIX = 'ip:block:';
const VIOLATIONS_PREFIX = 'ip:violations:';
const WHITELIST_PREFIX = 'ip:whitelist:';

// Auto-ban thresholds
const MAX_VIOLATIONS = 10;             // violations before auto-ban
const VIOLATION_WINDOW_SECONDS = 600;  // 10 minute window for counting violations
const AUTO_BAN_DURATION_SECONDS = 3600; // 1 hour auto-ban

function getClientIp(request: Request): string {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    request.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

/**
 * Check if an IP is blocked. Returns true if blocked.
 */
async function isBlocked(ip: string): Promise<boolean> {
  if (env.nodeEnv !== 'production') return false;
  try {
    const result = await redis.get(`${PREFIX}${ip}`);
    return result !== null;
  } catch {
    // Redis failure should not block requests
    return false;
  }
}

/**
 * Check if an IP is whitelisted. Returns true if whitelisted.
 */
async function isWhitelisted(ip: string): Promise<boolean> {
  if (env.nodeEnv !== 'production') return true;
  try {
    const result = await redis.get(`${WHITELIST_PREFIX}${ip}`);
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * Record a rate-limit violation for an IP.
 * Auto-blocks the IP after MAX_VIOLATIONS within the window.
 */
export async function recordViolation(ip: string): Promise<void> {
  if (env.nodeEnv !== 'production') return;
  try {
    const key = `${VIOLATIONS_PREFIX}${ip}`;
    const violations = await redis.incr(key);
    if (violations === 1) {
      await redis.expire(key, VIOLATION_WINDOW_SECONDS);
    }
    if (violations >= MAX_VIOLATIONS) {
      await blockIp(ip, AUTO_BAN_DURATION_SECONDS, 'auto-ban: repeated rate limit violations');
      await redis.del(key);
    }
  } catch {
    // Silent failure — don't crash on Redis issues
  }
}

/**
 * Manually block an IP for a given duration (or permanently).
 */
export async function blockIp(
  ip: string,
  durationSeconds: number = AUTO_BAN_DURATION_SECONDS,
  reason: string = 'manual block',
): Promise<void> {
  try {
    if (durationSeconds > 0) {
      await redis.setex(`${PREFIX}${ip}`, durationSeconds, reason);
    } else {
      await redis.set(`${PREFIX}${ip}`, reason);
    }
  } catch {
    // Silent failure
  }
}

/**
 * Unblock an IP.
 */
export async function unblockIp(ip: string): Promise<void> {
  try {
    await redis.del(`${PREFIX}${ip}`);
    await redis.del(`${VIOLATIONS_PREFIX}${ip}`);
  } catch {
    // Silent failure
  }
}

/**
 * Add an IP to the whitelist (never blocked).
 */
export async function whitelistIp(ip: string): Promise<void> {
  try {
    await redis.set(`${WHITELIST_PREFIX}${ip}`, 'whitelisted');
  } catch {
    // Silent failure
  }
}

/**
 * Express middleware — checks IP against blocklist before processing requests.
 */
export function ipBlocklist(request: Request, _response: Response, next: NextFunction) {
  // Always allow health checks
  if (request.path === '/health' || request.path === '/readiness') {
    return next();
  }

  const ip = getClientIp(request);

  // Use an async check but don't block the event loop for too long
  Promise.all([isWhitelisted(ip), isBlocked(ip)])
    .then(([whitelisted, blocked]) => {
      if (whitelisted) return next();
      if (blocked) {
        return next(new AppError(403, 'Your IP has been temporarily blocked.', 'IP_BLOCKED'));
      }
      next();
    })
    .catch(() => next()); // Redis failure — allow through
}
