export interface HomeFeaturedLocation {
  name: string;
  country: string;
  slug: string;
  imageUrl: string;
  trendReason: string;
  season: string;
  startingPrice: number;
  packageCount: number;
  availablePrices: number[];
  packageUrl: string;
  latitude: number | null;
  longitude: number | null;
}

export interface HomeFeaturedLocationResponse {
  month: string;
  monthKey: string;
  generatedAt: string;
  locations: HomeFeaturedLocation[];
}

/** @deprecated Use HomeFeaturedLocation. */
export type HomeOrbitLocation = HomeFeaturedLocation;
/** @deprecated Use HomeFeaturedLocationResponse. */
export type HomeOrbitResponse = HomeFeaturedLocationResponse;

export interface OrbitPackageRow {
  location: string;
  country: string;
  slug: string;
  image_url: string;
  price: number;
}

export interface OrbitTrendRow {
  name: string;
  growth_signal?: string | null;
  best_months?: string | null;
  sort_order?: number | null;
}

export interface OrbitSeasonRow {
  slug: string;
  label: string;
  sell_now: unknown;
}

export interface OrbitEditorialRow {
  name: string;
  season?: string | null;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

export interface OrbitCoordinateRow {
  location: string;
  latitude: number | string | { toString(): string };
  longitude: number | string | { toString(): string };
}

const LOCATION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  secunderabad: { latitude: 17.4399, longitude: 78.4983 },
  warangal: { latitude: 17.9689, longitude: 79.5941 },
  vijayawada: { latitude: 16.5062, longitude: 80.648 },
  visakhapatnam: { latitude: 17.6868, longitude: 83.2185 },
  guntur: { latitude: 16.3067, longitude: 80.4365 },
  tirupati: { latitude: 13.6288, longitude: 79.4192 },
  rajahmundry: { latitude: 17.0005, longitude: 81.804 },
};

const ALIASES: Record<string, string> = {
  hyderabad: 'hyderabad',
  secunderabad: 'secunderabad',
  warangal: 'warangal',
  vijayawada: 'vijayawada',
  amaravati: 'vijayawada',
  vizag: 'visakhapatnam',
  visakhapatnam: 'visakhapatnam',
  guntur: 'guntur',
  tirupati: 'tirupati',
  rajahmundry: 'rajahmundry',
};

function words(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function canonicalLocation(value: string) {
  const normalized = words(value);
  const alias = Object.entries(ALIASES).find(([key]) =>
    new RegExp(`(^|_)${key}(_|$)`).test(normalized),
  );
  return alias?.[1] ?? normalized;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function monthContext(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  return {
    month,
    monthKey: `${year}-${String(month).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'long',
      year: 'numeric',
    }).format(now),
    quarter: `q${Math.ceil(month / 3)}`,
  };
}

function locationHints(value: string, packageKeys: Set<string>) {
  const normalized = words(value);
  return [...packageKeys].filter((key) => {
    if (normalized.includes(key)) return true;
    return Object.entries(ALIASES).some(
      ([alias, canonical]) => canonical === key && normalized.includes(alias),
    );
  });
}

export function buildHomeFeaturedLocationsResponse(input: {
  packages: OrbitPackageRow[];
  trends: OrbitTrendRow[];
  season: OrbitSeasonRow | null;
  editorial: OrbitEditorialRow[];
  coordinates?: OrbitCoordinateRow[];
  now?: Date;
}): HomeFeaturedLocationResponse {
  const now = input.now ?? new Date();
  const context = monthContext(now);
  const grouped = new Map<string, OrbitPackageRow[]>();
  const coordinatesByKey = new Map<string, { latitude: number; longitude: number }>();

  for (const row of input.coordinates ?? []) {
    const latitude = Number(row.latitude);
    const longitude = Number(row.longitude);
    const key = canonicalLocation(row.location);
    if (
      !coordinatesByKey.has(key) &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
    ) {
      coordinatesByKey.set(key, { latitude, longitude });
    }
  }

  for (const pkg of input.packages) {
    if (!pkg.image_url || !pkg.slug || !Number.isFinite(pkg.price) || pkg.price <= 0) continue;
    const key = canonicalLocation(pkg.location);
    const rows = grouped.get(key) ?? [];
    rows.push(pkg);
    grouped.set(key, rows);
  }

  const packageKeys = new Set(grouped.keys());
  const priority: string[] = [];
  const add = (key: string) => {
    if (packageKeys.has(key) && !priority.includes(key)) priority.push(key);
  };

  for (const item of parseStringArray(input.season?.sell_now)) {
    for (const key of locationHints(item, packageKeys)) add(key);
  }
  for (const trend of [...input.trends].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    add(canonicalLocation(trend.name));
  }
  for (const item of [...input.editorial].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )) {
    if (item.is_active !== false) add(canonicalLocation(item.name));
  }
  for (const key of packageKeys) add(key);

  const trendByKey = new Map(input.trends.map((row) => [canonicalLocation(row.name), row]));
  const editorialByKey = new Map(
    input.editorial.map((row) => [canonicalLocation(row.name), row]),
  );
  const enriched = priority.map((key) => {
    const packages = [...(grouped.get(key) ?? [])].sort((a, b) => a.price - b.price);
    const first = packages[0]!;
    const trend = trendByKey.get(key);
    const editorial = editorialByKey.get(key);
    const coordinates = coordinatesByKey.get(key) ?? LOCATION_COORDINATES[key] ?? null;
    return {
      key,
      domestic: first.country.trim().toLowerCase() === 'india',
      location: {
        name: first.location,
        country: first.country,
        slug: first.slug,
        imageUrl: first.image_url,
        trendReason:
          trend?.growth_signal ||
          editorial?.description ||
          `A strong ${context.label} match from the MooNs Events desk.`,
        season: trend?.best_months || editorial?.season || input.season?.label || context.label,
        startingPrice: first.price,
        packageCount: packages.length,
        availablePrices: [...new Set(packages.map((pkg) => pkg.price))].sort((a, b) => a - b),
        packageUrl: `/packages?location=${encodeURIComponent(first.location)}&themes=All`,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
      } satisfies HomeFeaturedLocation,
    };
  });

  const domestic = enriched.filter((item) => item.domestic);
  const selected = domestic.slice(0, 6);
  for (const item of enriched) {
    if (selected.length >= 6) break;
    if (!selected.some((selectedItem) => selectedItem.key === item.key)) selected.push(item);
  }

  return {
    month: context.label,
    monthKey: context.monthKey,
    generatedAt: now.toISOString(),
    locations: selected.slice(0, 6).map((item) => item.location),
  };
}

/** @deprecated Use buildHomeFeaturedLocationsResponse. */
export const buildHomeOrbitResponse = buildHomeFeaturedLocationsResponse;

export function quarterForIndiaDate(now = new Date()) {
  return monthContext(now).quarter;
}
