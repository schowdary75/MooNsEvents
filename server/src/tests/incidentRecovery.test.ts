import { describe, expect, it } from 'vitest';
import { localRecoveryOptions } from '../maya/onevent/localRecoveryOptions.js';
import { PERMANENTLY_APPROVAL_BOUND_ACTIONS } from '../maya/governance/policy.js';
import { classifySosIssue } from '../services/siteCompatibilityService.js';

describe('incident recovery safeguards', () => {
  it('offers UAE-specific transport services with official HTTPS links', () => {
    const options = localRecoveryOptions('transport_no_show', 'Dubai, UAE');
    expect(options.map((option) => option.name)).toEqual(
      expect.arrayContaining(['Careem', 'Dubai Taxi Company', 'Uber']),
    );
    expect(options.every((option) => option.bookingUrl.startsWith('https://'))).toBe(true);
  });

  it('offers venue fallback search without inventing venue availability', () => {
    const options = localRecoveryOptions('venue_issue', 'Abu Dhabi, UAE');
    expect(options.map((option) => option.name)).toEqual(['Booking.com', 'Agoda']);
    expect(options.every((option) => option.kind === 'venue')).toBe(true);
  });

  it('keeps incident reimbursement approval-bound', () => {
    expect(PERMANENTLY_APPROVAL_BOUND_ACTIONS.has('approve_incident_reimbursement')).toBe(true);
  });

  it('recognizes plain-language no-show messages without treating every venue question as SOS', () => {
    expect(classifySosIssue('Our pickup driver is not here')).toBe('transport_no_show');
    expect(classifySosIssue('The venue says there is no room')).toBe('venue_issue');
    expect(classifySosIssue('Can you suggest a venue in Dubai?')).toBeNull();
  });
});
