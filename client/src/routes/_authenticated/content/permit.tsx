// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { createFileRoute } from '@/lib/routerCompat';
import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { adminGetPermitCmsPage, adminSavePermitCmsPage, PermitCmsPage } from '@/lib/api/db.functions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/toast';

export const Route = createFileRoute('/_authenticated/content/permit')({
  component: PermitCMSPage,
});

type AdminAuth = { email: string; sessionToken: string };

function emptyLocation(order: number): PermitCmsPage['locations'][number] {
  return {
    location_key: `Location${order}`,
    location_label: 'New Location',
    status_text: 'Permit Required',
    duration_text: '30 Days',
    processing_time: '3 Working Days',
    average_cost: 'TBD',
    notes: 'Add current policy notes and filing guidance.',
    epermit_available: true,
    sort_order: order,
    requirements: ['Credential copy'],
    conditional_rules: [],
  };
}

function parseConditionalRules(
  value: string,
): PermitCmsPage['locations'][number]['conditional_rules'] {
  return value
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= 4 && parts.every(Boolean))
    .map(([trigger_label, status_text, average_cost, ...notes]) => ({
      trigger_label,
      status_text,
      average_cost,
      notes: notes.join(' | '),
    }));
}

export function PermitCMSPage() {
  const { user } = useAuth();
  const auth = useMemo<AdminAuth | null>(
    () => (user?.session_token ? { email: user.email, sessionToken: user.session_token } : null),
    [user?.email, user?.session_token],
  );
  const [page, setPage] = useState<PermitCmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocationKey, setSelectedLocationKey] = useState('');
  const [locationPage, setLocationPage] = useState(1);

  async function loadPage() {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      setPage(await adminGetPermitCmsPage({ data: { auth } }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Permit CMS';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function savePage() {
    if (!auth || !page) return;
    setSaving(true);
    try {
      await adminSavePermitCmsPage({ data: { auth, page } });
      toast.success('Permit CMS saved');
      await loadPage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Permit CMS');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [auth?.sessionToken]);

  useEffect(() => {
    if (!page?.locations.length) return;
    if (
      !selectedLocationKey ||
      !page.locations.some((dest) => dest.location_key === selectedLocationKey)
    ) {
      setSelectedLocationKey(page.locations[0].location_key);
    }
  }, [page?.locations, selectedLocationKey]);

  useEffect(() => {
    setLocationPage(1);
  }, [locationSearch]);

  if (!auth) {
    return (
      <p className="text-sm text-muted-foreground">Sign in again to manage Permit CMS content.</p>
    );
  }

  if (loading || !page) {
    return <p className="text-sm text-muted-foreground">Loading Permit CMS...</p>;
  }

  const locationRows = page.locations
    .map((dest, originalIndex) => ({ dest, originalIndex }))
    .filter(({ dest }) =>
      `${dest.location_label} ${dest.location_key} ${dest.status_text}`
        .toLowerCase()
        .includes(locationSearch.trim().toLowerCase()),
    );
  const locationPageSize = 8;
  const locationTotalPages = Math.max(
    1,
    Math.ceil(locationRows.length / locationPageSize),
  );
  const safeLocationPage = Math.min(locationPage, locationTotalPages);
  const pagedLocationRows = locationRows.slice(
    (safeLocationPage - 1) * locationPageSize,
    safeLocationPage * locationPageSize,
  );
  const selectedLocationIndex = Math.max(
    0,
    page.locations.findIndex((dest) => dest.location_key === selectedLocationKey),
  );
  const selectedLocation = page.locations[selectedLocationIndex];
  const activeLocations = page.locations.filter(
    (dest) => dest.location_label && dest.status_text,
  ).length;
  const epermitLocations = page.locations.filter((dest) => dest.epermit_available).length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-gradient-to-br from-background via-background to-muted/40 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl" />
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={loadPage} disabled={loading || saving}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={savePage} disabled={saving}>
              <Check className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Locations" value={page.locations.length} />
          <Metric label="Ready" value={activeLocations} />
          <Metric label="ePermit / online" value={epermitLocations} />
          <Metric label="Service plans" value={page.service_plans.length} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">Page Copy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <TextField
            label="Hero Eyebrow"
            value={page.hero_eyebrow}
            onChange={(value) => setPage({ ...page, hero_eyebrow: value })}
          />
          <TextField
            label="Hero Title"
            value={page.hero_title}
            onChange={(value) => setPage({ ...page, hero_title: value })}
          />
          <TextField
            label="Hero Italic Title"
            value={page.hero_italic}
            onChange={(value) => setPage({ ...page, hero_italic: value })}
          />
          <TextField
            label="Form Eyebrow"
            value={page.form_eyebrow}
            onChange={(value) => setPage({ ...page, form_eyebrow: value })}
          />
          <TextField
            label="Form Title"
            value={page.form_title}
            onChange={(value) => setPage({ ...page, form_title: value })}
          />
          <TextField
            label="Guarantee Title"
            value={page.guarantee_title}
            onChange={(value) => setPage({ ...page, guarantee_title: value })}
          />
          <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
            <TextAreaField
              label="Hero Body"
              value={page.hero_body}
              onChange={(value) => setPage({ ...page, hero_body: value })}
            />
            <TextAreaField
              label="Form Body"
              value={page.form_body}
              onChange={(value) => setPage({ ...page, form_body: value })}
            />
            <TextAreaField
              label="Guarantee Body"
              value={page.guarantee_body}
              onChange={(value) => setPage({ ...page, guarantee_body: value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle className="text-base">Service Plans</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setPage({
                ...page,
                service_plans: [
                  ...page.service_plans,
                  {
                    plan_key: `plan-${page.service_plans.length + 1}`,
                    title: 'New Plan',
                    description: 'Plan description',
                    sort_order: page.service_plans.length + 1,
                    is_active: true,
                  },
                ],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-3">
          {page.service_plans.map((plan, index) => (
            <div
              key={`${plan.plan_key}-${index}`}
              className="space-y-3 rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline">{plan.plan_key}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() =>
                    setPage({
                      ...page,
                      service_plans: page.service_plans.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <TextField
                label="Key"
                value={plan.plan_key}
                onChange={(value) => updatePlan(index, 'plan_key', value)}
              />
              <TextField
                label="Title"
                value={plan.title}
                onChange={(value) => updatePlan(index, 'title', value)}
              />
              <TextField
                label="Description"
                value={plan.description}
                onChange={(value) => updatePlan(index, 'description', value)}
              />
              <TextField
                label="Order"
                value={String(plan.sort_order)}
                onChange={(value) => updatePlan(index, 'sort_order', Number(value) || 0)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="overflow-hidden xl:sticky xl:top-4 xl:self-start">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Locations</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextLocation = emptyLocation(page.locations.length + 1);
                  setPage({ ...page, locations: [...page.locations, nextLocation] });
                  setSelectedLocationKey(nextLocation.location_key);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search locations..."
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-3">
            <div className="max-h-[56vh] space-y-2 overflow-auto pr-1">
              {pagedLocationRows.map(({ dest, originalIndex }) => {
                const selected = originalIndex === selectedLocationIndex;
                return (
                  <button
                    key={`${dest.location_key}-${originalIndex}`}
                    type="button"
                    onClick={() => setSelectedLocationKey(dest.location_key)}
                    className={`w-full rounded-xl border p-3 text-left transition hover:border-primary/40 hover:bg-muted/50 ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'bg-card'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium leading-none">{dest.location_label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{dest.location_key}</p>
                      </div>
                      <Badge variant={dest.epermit_available ? 'secondary' : 'outline'}>
                        {dest.epermit_available ? 'ePermit' : 'Manual'}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {dest.status_text}
                    </p>
                  </button>
                );
              })}
              {!locationRows.length && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No locations match your search.
                </div>
              )}
            </div>
            <PaginationControls
              page={safeLocationPage}
              totalPages={locationTotalPages}
              totalItems={locationRows.length}
              pageSize={locationPageSize}
              onPageChange={setLocationPage}
            />
          </CardContent>
        </Card>

        {selectedLocation ? (
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">
                      {selectedLocation.location_label}
                    </CardTitle>
                    <Badge variant={selectedLocation.epermit_available ? 'secondary' : 'outline'}>
                      {selectedLocation.epermit_available ? 'ePermit available' : 'Manual / offline'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedLocation.status_text}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextLocation =
                      page.locations[selectedLocationIndex + 1] ||
                      page.locations[selectedLocationIndex - 1];
                    setPage({
                      ...page,
                      locations: page.locations.filter(
                        (_, i) => i !== selectedLocationIndex,
                      ),
                    });
                    setSelectedLocationKey(nextLocation?.location_key || '');
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <TextField
                  label="Key"
                  value={selectedLocation.location_key}
                  onChange={(value) => {
                    updateLocation(selectedLocationIndex, 'location_key', value);
                    setSelectedLocationKey(value);
                  }}
                />
                <TextField
                  label="Label"
                  value={selectedLocation.location_label}
                  onChange={(value) =>
                    updateLocation(selectedLocationIndex, 'location_label', value)
                  }
                />
                <TextField
                  label="Order"
                  value={String(selectedLocation.sort_order)}
                  onChange={(value) =>
                    updateLocation(selectedLocationIndex, 'sort_order', Number(value) || 0)
                  }
                />
                <label className="flex items-end gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                  <Switch
                    checked={selectedLocation.epermit_available}
                    onCheckedChange={(checked) =>
                      updateLocation(selectedLocationIndex, 'epermit_available', checked)
                    }
                  />
                  ePermit available
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <TextField
                  label="Duration"
                  value={selectedLocation.duration_text}
                  onChange={(value) =>
                    updateLocation(selectedLocationIndex, 'duration_text', value)
                  }
                />
                <TextField
                  label="Processing Time"
                  value={selectedLocation.processing_time}
                  onChange={(value) =>
                    updateLocation(selectedLocationIndex, 'processing_time', value)
                  }
                />
                <TextField
                  label="Average Cost"
                  value={selectedLocation.average_cost}
                  onChange={(value) =>
                    updateLocation(selectedLocationIndex, 'average_cost', value)
                  }
                />
              </div>

              <TextAreaField
                label="Status"
                value={selectedLocation.status_text}
                onChange={(value) =>
                  updateLocation(selectedLocationIndex, 'status_text', value)
                }
              />
              <TextAreaField
                label="Notes"
                value={selectedLocation.notes}
                onChange={(value) => updateLocation(selectedLocationIndex, 'notes', value)}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border bg-muted/10 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Requirements</p>
                    <Badge variant="outline">{selectedLocation.requirements.length} items</Badge>
                  </div>
                  <TextAreaField
                    label="One per line"
                    value={selectedLocation.requirements.join('\n')}
                    onChange={(value) =>
                      updateLocation(
                        selectedLocationIndex,
                        'requirements',
                        value
                          .split('\n')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </div>
                <div className="rounded-xl border bg-muted/10 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Conditional Rules</p>
                    <Badge variant="outline">
                      {selectedLocation.conditional_rules.length} rules
                    </Badge>
                  </div>
                  <TextAreaField
                    label="trigger | status | cost | notes"
                    value={selectedLocation.conditional_rules
                      .map(
                        (rule) =>
                          `${rule.trigger_label} | ${rule.status_text} | ${rule.average_cost} | ${rule.notes}`,
                      )
                      .join('\n')}
                    onChange={(value) =>
                      updateLocation(
                        selectedLocationIndex,
                        'conditional_rules',
                        parseConditionalRules(value),
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Add a location to start editing permit guidance.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  function updatePlan<K extends keyof PermitCmsPage['service_plans'][number]>(
    index: number,
    key: K,
    value: PermitCmsPage['service_plans'][number][K],
  ) {
    if (!page) return;
    setPage({
      ...page,
      service_plans: page.service_plans.map((plan, i) =>
        i === index ? { ...plan, [key]: value } : plan,
      ),
    });
  }

  function updateLocation<K extends keyof PermitCmsPage['locations'][number]>(
    index: number,
    key: K,
    value: PermitCmsPage['locations'][number][K],
  ) {
    if (!page) return;
    setPage({
      ...page,
      locations: page.locations.map((dest, i) =>
        i === index ? { ...dest, [key]: value } : dest,
      ),
    });
  }
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const from = totalItems ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        {from}-{to} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <span>
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card/80 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24"
      />
    </label>
  );
}
