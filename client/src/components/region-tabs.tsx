import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type RegionTab = 'telangana' | 'andhra-pradesh';

const serviceAreaTerms: Record<RegionTab, string[]> = {
  telangana: [
    'telangana',
    'hyderabad',
    'secunderabad',
    'rangareddy',
    'warangal',
    'karimnagar',
    'nizamabad',
    'khammam',
  ],
  'andhra-pradesh': [
    'andhra pradesh',
    'andhra-pradesh',
    'vijayawada',
    'visakhapatnam',
    'vizag',
    'guntur',
    'tirupati',
    'nellore',
    'kakinada',
    'rajahmundry',
    'rajamahendravaram',
    'bhimavaram',
    'ongole',
  ],
};

export function RegionTabs({
  value,
  onValueChange,
}: {
  value: RegionTab;
  onValueChange: (value: RegionTab) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as RegionTab)}>
      <TabsList>
        <TabsTrigger value="telangana">Telangana</TabsTrigger>
        <TabsTrigger value="andhra-pradesh">Andhra Pradesh</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function matchesRegion(location: string | null | undefined, region: RegionTab) {
  const normalized = (location || '').trim().toLowerCase();
  return serviceAreaTerms[region].some((term) => normalized.includes(term));
}

export const coverageMatchesRegion = matchesRegion;
