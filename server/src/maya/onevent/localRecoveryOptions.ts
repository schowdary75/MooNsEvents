export interface LocalRecoveryOption {
  name: string;
  kind: 'transport' | 'venue';
  bookingUrl: string;
  note: string;
}

const REGIONAL_OPTIONS: LocalRecoveryOption[] = [
  { name: 'Uber India', kind: 'transport', bookingUrl: 'https://www.uber.com/global/en/r/india/cities/', note: 'Confirm pickup coverage in the Telangana or Andhra Pradesh event city.' },
  { name: 'MooNs Master Catalog', kind: 'venue', bookingUrl: '/catalog', note: 'Choose an approved regional backup venue from the Master Catalog.' },
];

export function localRecoveryOptions(issueType: string, _location?: string | null): LocalRecoveryOption[] {
  return REGIONAL_OPTIONS.filter((option) => /venue/i.test(issueType) ? option.kind === 'venue' : option.kind === 'transport').map((option) => ({ ...option }));
}
