/**
 * Webhook Revalidation Service — triggers MooNsEWeb to refresh cached pages
 * whenever CRM data changes (event types, packages, vendors, offers, etc.).
 *
 * This ensures the customer website always shows fresh data from the CRM
 * without relying on short TTL caches alone.
 */
import { env } from '../config/env.js';

const WEBSITE_URL = process.env.WEBSITE_REVALIDATION_URL || process.env.MOONS_WEB_URL || '';
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || '';

/**
 * Path groups that should be revalidated when specific CRM entities change.
 */
const ENTITY_PATH_MAP: Record<string, string[]> = {
  themes: ['/', '/events', '/packages', '/plan-your-event'],
  packages: ['/', '/packages', '/events', '/plan-your-event', '/offers'],
  vendors: ['/', '/vendors', '/events'],
  offers: ['/', '/offers'],
  promotions: ['/', '/offers'],
  banners: ['/'],
  'promo-codes': ['/', '/offers'],
  careers: ['/careers'],
};

/**
 * Notify the customer website to revalidate cached pages.
 *
 * @param entity - The CRM entity type that was modified
 * @param additionalPaths - Extra paths to revalidate (e.g., specific package slugs)
 */
export async function revalidateWebsite(
  entity: keyof typeof ENTITY_PATH_MAP | string,
  additionalPaths: string[] = [],
): Promise<void> {
  if (!WEBSITE_URL || !REVALIDATION_SECRET) return;

  const basePaths = ENTITY_PATH_MAP[entity] || ['/'];
  const paths = [...new Set([...basePaths, ...additionalPaths])];

  try {
    const url = `${WEBSITE_URL.replace(/\/+$/, '')}/api/revalidate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidation-secret': REVALIDATION_SECRET,
      },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.warn(
        `[Revalidation] Website returned ${response.status} for entity=${entity}`,
      );
    }
  } catch (error) {
    // Non-critical — website will serve stale data until next natural refresh
    console.warn(
      `[Revalidation] Failed to notify website for entity=${entity}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Convenience function to revalidate after a package change.
 * Includes the specific package and event type paths.
 */
export async function revalidateAfterPackageChange(
  packageSlug?: string,
  eventTypeSlug?: string,
): Promise<void> {
  const extra: string[] = [];
  if (packageSlug) extra.push(`/packages/${packageSlug}`);
  if (eventTypeSlug) extra.push(`/events/${eventTypeSlug}`);
  await revalidateWebsite('packages', extra);
}

/**
 * Convenience function to revalidate after an offer/promotion change.
 */
export async function revalidateAfterOfferChange(offerSlug?: string): Promise<void> {
  const extra: string[] = [];
  if (offerSlug) extra.push(`/offers/${offerSlug}`);
  await revalidateWebsite('offers', extra);
}
