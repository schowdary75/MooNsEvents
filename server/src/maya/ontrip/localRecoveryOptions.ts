export interface LocalRecoveryOption {
  name: string;
  kind: 'transport' | 'hotel';
  bookingUrl: string;
  note: string;
}

const REGIONAL_OPTIONS: LocalRecoveryOption[] = [
  { name: 'Uber India', kind: 'transport', bookingUrl: 'https://www.uber.com/global/en/r/india/cities/', note: 'Confirm pickup coverage in the Telangana or Andhra Pradesh event city.' },
  { name: 'MakeMyTrip Hotels', kind: 'hotel', bookingUrl: 'https://www.makemytrip.com/hotels/', note: 'Confirm availability and cancellation terms before booking.' },
];

export function localRecoveryOptions(issueType: string, _location?: string | null): LocalRecoveryOption[] {
  return REGIONAL_OPTIONS.filter((option) => /hotel/i.test(issueType) ? option.kind === 'hotel' : option.kind === 'transport').map((option) => ({ ...option }));
}
