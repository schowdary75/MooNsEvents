import type { FlightStatus } from './flightStatusProvider.js';

export type PassengerRightsJurisdiction = 'us_dot' | 'india_dgca' | 'eu_261' | 'unmatched';

export interface PassengerRightsContext {
  jurisdiction?: string | null;
  originCountry?: string | null;
  destinationCountry?: string | null;
  carrierCountry?: string | null;
  crossBorder: boolean;
  travellerDeclinedAlternative?: boolean;
  /** Event-facing compatibility aliases. */
  locationCountry?: string | null;
  clientDeclinedAlternative?: boolean;
}

export interface PassengerRightsAssessment {
  jurisdiction: PassengerRightsJurisdiction;
  policyVersion: string;
  sourceRequired: true;
  confirmationRequired: boolean;
  refundChoiceMayApply: boolean;
  reason: string;
}

const EU_EEA = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
]);

export const PASSENGER_RIGHTS_POLICY_VERSION = 'passenger-rights-2026-07-22';

function countryCode(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) return null;
  const aliases: Record<string, string> = {
    INDIA: 'IN',
    'UNITED STATES': 'US',
    USA: 'US',
    'UNITED STATES OF AMERICA': 'US',
  };
  return aliases[normalized] ?? normalized;
}

export function resolvePassengerRightsJurisdiction(
  context: PassengerRightsContext,
): PassengerRightsJurisdiction {
  const explicit = context.jurisdiction?.trim().toLowerCase();
  if (explicit === 'us' || explicit === 'us_dot') return 'us_dot';
  if (explicit === 'india' || explicit === 'india_dgca') return 'india_dgca';
  if (explicit === 'eu' || explicit === 'eu_261') return 'eu_261';

  const origin = countryCode(context.originCountry);
  const destination = countryCode(context.destinationCountry ?? context.locationCountry);
  const carrier = countryCode(context.carrierCountry);
  if (origin && EU_EEA.has(origin)) return 'eu_261';
  if (destination && EU_EEA.has(destination) && carrier && EU_EEA.has(carrier)) return 'eu_261';
  if (origin === 'IN' || destination === 'IN') return 'india_dgca';
  if (origin === 'US' || destination === 'US') return 'us_dot';
  return 'unmatched';
}

/** Never promises compensation or a refund from flight status alone. */
export function assessPassengerRights(
  status: FlightStatus,
  context: PassengerRightsContext,
): PassengerRightsAssessment {
  const jurisdiction = resolvePassengerRightsJurisdiction(context);
  if (jurisdiction === 'unmatched') {
    return {
      jurisdiction,
      policyVersion: PASSENGER_RIGHTS_POLICY_VERSION,
      sourceRequired: true,
      confirmationRequired: true,
      refundChoiceMayApply: false,
      reason: 'The itinerary does not identify a supported passenger-rights jurisdiction.',
    };
  }

  if (jurisdiction === 'us_dot') {
    const threshold = context.crossBorder ? 360 : 180;
    const significant =
      status.state === 'cancelled' ||
      (status.state === 'delayed' && status.delayMinutes >= threshold);
    const choiceComplete =
      context.travellerDeclinedAlternative === true || context.clientDeclinedAlternative === true;
    return {
      jurisdiction,
      policyVersion: PASSENGER_RIGHTS_POLICY_VERSION,
      sourceRequired: true,
      confirmationRequired: !(significant && choiceComplete),
      refundChoiceMayApply: significant,
      reason: significant
        ? 'A significant U.S.-covered change may create a refund choice if the client does not accept the proposed alternative.'
        : 'The detected change is below the configured U.S. significant-change threshold.',
    };
  }

  if (jurisdiction === 'eu_261') {
    return {
      jurisdiction,
      policyVersion: PASSENGER_RIGHTS_POLICY_VERSION,
      sourceRequired: true,
      confirmationRequired: true,
      refundChoiceMayApply:
        status.state === 'cancelled' || (status.state === 'delayed' && status.delayMinutes >= 300),
      reason:
        'Available options depend on the supplier contract, notice, cause, delay, and the client’s refund or rescheduling choice.',
    };
  }

  return {
    jurisdiction,
    policyVersion: PASSENGER_RIGHTS_POLICY_VERSION,
    sourceRequired: true,
    confirmationRequired: true,
    refundChoiceMayApply: status.state === 'cancelled' || status.state === 'delayed',
    reason:
      'Indian event-service handling depends on contract terms, delay notice, supplier alternatives, and the client’s choice.',
  };
}
