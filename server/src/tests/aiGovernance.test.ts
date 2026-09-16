import { describe, expect, it } from 'vitest';
import { decideMayaTool, mayaToolRisk } from '../maya/governance/policy.js';
import {
  assessPassengerRights,
  resolvePassengerRightsJurisdiction,
} from '../maya/disruption/passengerRightsPolicy.js';
import { redactSensitiveEventData } from '../maya/support/supportChatProcessor.js';
import { eventAuditKey } from '../services/eventAuditService.js';

const cancelled = {
  timelineNumber: 'AI101',
  state: 'cancelled' as const,
  delayMinutes: 0,
  scheduledDeparture: new Date('2026-08-01T00:00:00Z'),
};

describe('Maya application policy', () => {
  it('keeps reads automatic and blocks writes behind the kill switch', () => {
    expect(
      decideMayaTool('find_packages', { channel: 'chat', externalWritesEnabled: false }),
    ).toMatchObject({ allowed: true, requiresApproval: false, riskClass: 'read_only' });
    expect(
      decideMayaTool('capture_lead', { channel: 'chat', externalWritesEnabled: false }),
    ).toMatchObject({ allowed: false, riskClass: 'low_risk_write' });
  });

  it('permanently classifies external sends as approval-bound', () => {
    expect(mayaToolRisk('send_whatsapp_summary')).toBe('human_approval');
    expect(
      decideMayaTool('send_whatsapp_summary', {
        channel: 'whatsapp',
        externalWritesEnabled: true,
      }),
    ).toMatchObject({ allowed: true, requiresApproval: true });
  });

  it('fails closed for unknown tools', () => {
    expect(mayaToolRisk('settle_refund')).toBe('high_risk');
  });
});

describe('jurisdiction-aware passenger rights', () => {
  it('resolves India, EU and U.S. runOfShows without applying one global threshold', () => {
    expect(resolvePassengerRightsJurisdiction({ originCountry: 'IN', crossBorder: true })).toBe(
      'india_dgca',
    );
    expect(resolvePassengerRightsJurisdiction({ originCountry: 'FR', crossBorder: true })).toBe(
      'eu_261',
    );
    expect(
      resolvePassengerRightsJurisdiction({ locationCountry: 'US', crossBorder: true }),
    ).toBe('us_dot');
  });

  it('requires client choice before a U.S. cancellation assessment is complete', () => {
    const pending = assessPassengerRights(cancelled, {
      originCountry: 'US',
      crossBorder: false,
    });
    expect(pending.refundChoiceMayApply).toBe(true);
    expect(pending.confirmationRequired).toBe(true);

    const choiceRecorded = assessPassengerRights(cancelled, {
      originCountry: 'US',
      crossBorder: false,
      clientDeclinedAlternative: true,
    });
    expect(choiceRecorded.confirmationRequired).toBe(false);
  });

  it('routes unmatched runOfShows to human confirmation', () => {
    expect(assessPassengerRights(cancelled, { crossBorder: true })).toMatchObject({
      jurisdiction: 'unmatched',
      confirmationRequired: true,
      refundChoiceMayApply: false,
    });
  });
});

describe('privacy and idempotency boundaries', () => {
  it('redacts credential and Aadhaar-like values before model context', () => {
    const safe = redactSensitiveEventData('credential number A1234567 and Aadhaar 1234 5678 9012');
    expect(safe).not.toContain('A1234567');
    expect(safe).not.toContain('1234 5678 9012');
  });

  it('creates stable event keys and separates different discriminators', () => {
    expect(eventAuditKey('BookingConfirmed', 'EventEvent', 'T1')).toBe(
      eventAuditKey('BookingConfirmed', 'EventEvent', 'T1'),
    );
    expect(eventAuditKey('BookingConfirmed', 'EventEvent', 'T1', '1')).not.toBe(
      eventAuditKey('BookingConfirmed', 'EventEvent', 'T1', '2'),
    );
  });
});
