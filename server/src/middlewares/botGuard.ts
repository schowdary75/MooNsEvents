/**
 * Bot Guard Middleware — blocks known scraper bots, detects automated patterns,
 * and allows legitimate search engine crawlers through.
 *
 * Part of the MooNsEvents anti-scraping security layer.
 */
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

// Known scraper / bot user-agent substrings (case-insensitive match)
const BLOCKED_UA_PATTERNS = [
  'scrapy',
  'python-requests',
  'python-urllib',
  'httpclient',
  'java/',
  'wget',
  'curl/',
  'libwww-perl',
  'mechanize',
  'phantomjs',
  'headlesschrome',
  'selenium',
  'puppeteer',
  'nightmare',
  'casperjs',
  'httrack',
  'webcopier',
  'sitecopy',
  'teleport',
  'websauger',
  'netresearchserver',
  'dataminr',
  'ahrefsbot',
  'semrushbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'exabot',
  'gigabot',
  'ahrefsbot',
  'rogerbot',
  'linkdexbot',
  'aspiegelbot',
  'yandexbot',
  'baiduspider',
  'sogou',
  'go-http-client',
  'fasthttp',
  'httpie',
  'postmanruntime',
];

// Legitimate search engine bots to allow (by UA substring)
const ALLOWED_BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'google-inspectiontool',
  'google-structured-data-testing-tool',
  'chrome-lighthouse',
  'pagespeed',
  'apis-google',
  'adsbot-google',
  'mediapartners-google',
];

// Suspiciously fast request tracking per IP
const requestTimestamps = new Map<string, number[]>();
const WINDOW_MS = 5_000; // 5 second window
const MAX_BURST = 30; // max 30 requests in 5 seconds (very aggressive scraping)

function getClientIp(request: Request): string {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    request.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

function isAllowedBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return ALLOWED_BOT_PATTERNS.some((pattern) => lower.includes(pattern));
}

function isBlockedBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BLOCKED_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

function isAutomatedBurst(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  requestTimestamps.set(ip, recent.slice(-MAX_BURST * 2));
  return recent.length > MAX_BURST;
}

export function shouldApplyBurstGuard(request: Pick<Request, 'path'>): boolean {
  // Authenticated application operations have their own session-aware limiter.
  // Counting every dashboard request in one IP bucket locks out normal pages
  // that load several widgets in parallel (and every employee behind an office IP).
  return request.path.startsWith('/api/public');
}

// Honeypot header detection — real browsers never send these
function hasHoneypotIndicators(request: Request): boolean {
  // Check for the honeypot form field that should always be empty
  if (request.body && typeof request.body === 'object') {
    const body = request.body as Record<string, unknown>;
    if (body._hp_field && String(body._hp_field).length > 0) return true;
    if (body.website_url && String(body.website_url).length > 0) return true;
  }
  return false;
}

// Clean up stale entries periodically
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 2;
  for (const [ip, timestamps] of requestTimestamps.entries()) {
    const live = timestamps.filter((t) => t > cutoff);
    if (live.length === 0) requestTimestamps.delete(ip);
    else requestTimestamps.set(ip, live);
  }
}, 60_000);

export function botGuard(request: Request, response: Response, next: NextFunction) {
  const ua = request.headers['user-agent'] || '';
  const ip = getClientIp(request);

  // Always allow health checks and internal routes
  if (request.path === '/health' || request.path === '/readiness') {
    return next();
  }

  // Allow legitimate search engine bots
  if (ua && isAllowedBot(ua)) {
    return next();
  }

  // Block known scraper bots
  if (ua && isBlockedBot(ua)) {
    return next(new AppError(403, 'Access denied', 'BOT_BLOCKED'));
  }

  // Block requests with no User-Agent on public API endpoints
  if (!ua && request.path.startsWith('/api/public')) {
    return next(new AppError(403, 'Access denied', 'NO_USER_AGENT'));
  }

  // Detect automated burst patterns
  if (shouldApplyBurstGuard(request) && isAutomatedBurst(ip)) {
    return next(new AppError(429, 'Too many requests — slow down', 'BURST_BLOCKED'));
  }

  // Check honeypot fields on POST requests
  if (request.method === 'POST' && hasHoneypotIndicators(request)) {
    // Silently accept but don't process — bot thinks it succeeded
    response.status(200).json({ success: true });
    return;
  }

  next();
}
