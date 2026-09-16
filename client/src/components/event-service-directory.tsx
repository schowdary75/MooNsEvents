import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Mail, MapPin, Phone, Search } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { RegionTabs, coverageMatchesRegion, type RegionTab } from '@/components/region-tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminGetVendorsAll } from '@/lib/api/db.functions';

export type EventServiceCategory =
  | 'venue'
  | 'photography'
  | 'decoration'
  | 'catering'
  | 'organizer'
  | 'production'
  | 'entertainment'
  | 'logistics'
  | 'staffing';

const categoryLabels: Record<EventServiceCategory, string> = {
  venue: 'Venue & Hall',
  photography: 'Photography',
  decoration: 'Decoration',
  catering: 'Catering & Hospitality',
  organizer: 'Event Organizer',
  production: 'Production & AV',
  entertainment: 'Entertainment & Artists',
  logistics: 'Transport & Logistics',
  staffing: 'Event Staffing',
};

function parseCategories(value: unknown): EventServiceCategory[] {
  if (Array.isArray(value)) return value as EventServiceCategory[];
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value as EventServiceCategory];
  } catch {
    return [value as EventServiceCategory];
  }
}

export function EventServiceDirectory({
  title,
  description,
  category,
}: {
  title: string;
  description: string;
  category?: EventServiceCategory;
}) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [serviceArea, setServiceArea] = useState<RegionTab>('telangana');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventServiceCategory | 'all'>(
    category || 'all',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = user?.session_token
      ? { email: user.email, sessionToken: user.session_token }
      : null;
    if (!auth) return;
    setLoading(true);
    adminGetVendorsAll({ data: { auth } })
      .then((rows) => setVendors(rows || []))
      .finally(() => setLoading(false));
  }, [user?.email, user?.session_token]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vendors.filter((vendor) => {
      if (vendor.status !== 'approved') return false;
      const categories = parseCategories(vendor.service_categories);
      const selectedCategory = category || categoryFilter;
      if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) return false;
      if (
        !coverageMatchesRegion(
          `${vendor.coverage_areas || ''} ${vendor.address || ''}`,
          serviceArea,
        )
      )
        return false;
      if (!needle) return true;
      return [
        vendor.company_name,
        vendor.address,
        vendor.coverage_areas,
        vendor.email,
        vendor.phone,
        ...categories,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [category, categoryFilter, query, serviceArea, vendors]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-center">
        <RegionTabs value={serviceArea} onValueChange={setServiceArea} />
        {!category && (
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as EventServiceCategory | 'all')
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All event services</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, city, service, phone or email"
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          Loading master catalog…
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map((vendor) => {
            const categories = parseCategories(vendor.service_categories);
            return (
              <article key={vendor.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{vendor.company_name}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {categories.map((item) => (
                        <Badge key={item} variant="secondary">
                          {categoryLabels[item] || item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {vendor.website_url && (
                    <a
                      href={vendor.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {vendor.bio && <p className="mt-3 text-sm text-muted-foreground">{vendor.bio}</p>}

                {(vendor.service_offerings || []).length > 0 && (
                  <div className="mt-4 space-y-2 rounded-md border bg-muted/20 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Available Services
                    </div>
                    {(vendor.service_offerings || [])
                      .filter((service: any) => service.is_active)
                      .map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs capitalize text-muted-foreground">
                              {categoryLabels[service.category as EventServiceCategory] ||
                                service.category}{' '}
                              · {String(service.unit_type || 'fixed').replaceAll('_', ' ')}
                            </div>
                          </div>
                          {Number(service.net_cost || 0) > 0 && (
                            <div className="shrink-0 text-xs font-semibold">
                              ₹{Number(service.net_cost).toLocaleString('en-IN')} net
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{vendor.address || vendor.coverage_areas}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" /> {vendor.phone}
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" /> {vendor.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t pt-3 text-[11px] text-muted-foreground">
                  Master Catalog ID #{vendor.id} · Contact checked{' '}
                  {String(vendor.last_checked_at || '').slice(0, 10)}
                </div>
              </article>
            );
          })}
          {rows.length === 0 && (
            <div className="col-span-full rounded-lg border p-10 text-center text-sm text-muted-foreground">
              No approved services match this state and category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
