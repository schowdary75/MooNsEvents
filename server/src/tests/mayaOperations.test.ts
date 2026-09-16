import { describe, expect, it } from 'vitest';
import {
  mayaCampaignRequestSchema,
  resolveMayaCampaignTrends,
} from '../operations/mayaOperations.js';

const inboundContext = {
  name: 'Golden Triangle & Rajasthan',
  region: 'Golden Triangle & Rajasthan',
  vertical: 'inbound' as const,
  demand: 'explosive' as const,
  confidence: 'proven' as const,
  trajectory: '2024: established → 2025: growing → 2026: scale',
  growthSignal: 'Strong multi-market demand for first-visit India circuits.',
  source: 'Ministry of Events Industry · Data Compendium 2025',
  entry: 'India e-Permit for eligible credentials',
  bestMonths: 'Oct–Mar',
  adWindow: 'Launch 90–180 days ahead',
  budget: 'US$900–2,800 pp · indicative land-only',
  audience: 'USA, UK, Australia, Germany and France culture clients.',
  angle: 'Private guides, heritage stays and seamless multi-city transfers.',
  googleKeywords: ['golden triangle private showcase India'],
  metaInterests: ['India events', 'Cultural events industry'],
  targetLocations: ['USA', 'United Kingdom', 'Australia'],
  languages: ['English'],
};

describe('Maya campaign trend contexts', () => {
  it('resolves a validated inbound context with foreign targeting', () => {
    const parsed = mayaCampaignRequestSchema.parse({
      auth: { email: 'admin@example.com', sessionToken: 'session-token' },
      locations: [inboundContext.name],
      budget: 50000,
      goal: 'leads',
      platform: 'meta',
      trendContexts: [inboundContext],
    });
    const resolved = resolveMayaCampaignTrends(parsed.locations, parsed.trendContexts);
    expect(resolved[0]).toMatchObject({
      name: inboundContext.name,
      vertical: 'inbound',
      targetLocations: inboundContext.targetLocations,
      languages: inboundContext.languages,
    });
  });

  it('rejects incomplete or unbounded client-supplied contexts', () => {
    const result = mayaCampaignRequestSchema.safeParse({
      auth: { email: 'admin@example.com', sessionToken: 'session-token' },
      locations: [inboundContext.name],
      budget: 50000,
      goal: 'leads',
      platform: 'meta',
      trendContexts: [{ ...inboundContext, targetLocations: [] }],
    });
    expect(result.success).toBe(false);
  });
});
