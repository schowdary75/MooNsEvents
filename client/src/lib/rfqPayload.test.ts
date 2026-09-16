import { describe, expect, it } from 'vitest';

import {
  RfqPayloadValidationError,
  buildRfqPayload,
  toRfqComposeRequest,
  toRfqSendRequest,
} from './rfqPayload';

const baseInput = {
  packageId: 42,
  scopes: ['full'],
  eventDates: {
    from: new Date(2026, 0, 10),
    to: new Date(2026, 0, 14),
  },
  vendorIds: [101],
};

describe('buildRfqPayload', () => {
  it('builds the full-package operation contract', () => {
    const payload = buildRfqPayload(baseInput);

    expect(toRfqComposeRequest(payload)).toEqual({
      packageId: 42,
      scope: ['full'],
      eventDates: 'Jan 10, 2026 - Jan 14, 2026',
      customVenues: [],
    });
  });

  it('builds a venue-only request with a fictional custom venue', () => {
    const payload = buildRfqPayload({
      ...baseInput,
      scopes: ['venues'],
      venueRequests: [{ name: 'Example Harbour Venue', source: 'custom' }],
    });

    expect(payload.scope).toEqual(['venues']);
    expect(payload.venueRequests).toEqual([{ name: 'Example Harbour Venue', source: 'custom' }]);
  });

  it('normalizes multi-scope and duplicate-scope requests in stable order', () => {
    const payload = buildRfqPayload({
      ...baseInput,
      scopes: ['production', 'venues', 'full', 'venues', 'catering'],
      vendorIds: [101, 101, 202],
    });

    expect(payload.scope).toEqual(['full', 'venues', 'catering', 'production']);
    expect(payload.vendorIds).toEqual([101, 202]);
  });

  it('builds a validated send request with message content', () => {
    const payload = buildRfqPayload({
      ...baseInput,
      message: {
        subject: ' Fictional group request ',
        htmlBody: ' <p>Please quote the sample production.</p> ',
      },
    });

    expect(toRfqSendRequest(payload)).toEqual({
      packageId: 42,
      vendorIds: [101],
      subject: 'Fictional group request',
      htmlBody: '<p>Please quote the sample production.</p>',
    });
  });

  it.each([
    [{ ...baseInput, vendorIds: [] }, 'vendors'],
    [{ ...baseInput, scopes: [] }, 'scope'],
    [
      {
        ...baseInput,
        eventDates: {
          from: new Date(2026, 0, 15),
          to: new Date(2026, 0, 10),
        },
      },
      'eventDates',
    ],
    [
      {
        ...baseInput,
        scopes: ['venues'],
        venueRequests: [{ name: 'Invalid\nVenue', source: 'custom' as const }],
      },
      'venues',
    ],
  ])('rejects invalid input before a request is built', (input, field) => {
    expect(() => buildRfqPayload(input)).toThrow(RfqPayloadValidationError);
    try {
      buildRfqPayload(input);
    } catch (error) {
      expect(error).toMatchObject({ field });
    }
  });

  it('rejects an empty message before send', () => {
    const payload = buildRfqPayload(baseInput);
    expect(() => toRfqSendRequest(payload)).toThrow(/Subject and message body are required/);
  });
});
