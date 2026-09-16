// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createFileRoute, Link, useNavigate } from '@/lib/routerCompat';
import { toast } from '@/lib/toast';
import {
  ArrowLeft,
  ImageUp,
  Save,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  Code,
  Sunrise,
  Compass,
  Sunset,
  Database,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import {
  adminGetPackageBuilderInventory,
  adminGetPackageDetail,
  adminUploadAsset,
  adminUpsertPackageDetail,
  adminAiGenerateRunOfShow,
  adminAiGenerateSEO,
  PackageDetail,
  PackageLineItem,
  adminGetMasterCatalog,
  adminAiComposeRfq,
  adminSendRfq,
} from '@/lib/api/db.functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { SendRfqModal } from '@/components/send-rfq-modal';
import { Label } from '@/components/ui/label';
export const Route = createFileRoute('/_authenticated/packages/$id')({
  component: PackageEditor,
});

type FormState = {
  id?: number;
  slug: string;
  name: string;
  description: string;
  country: string;
  location: string;
  nights: number;
  days: number;
  price: number;
  markup_percent: 15 | 25;
  vendor_id?: number;
  b2b_price: number;
  category: 'Economy' | 'Premium' | 'Luxury';
  image_url: string;
  image_key: string;
  is_active: boolean;
  themesText: string;
  runOfShowText: string;
  inclusionsText: string;
  exclusionsText: string;
  lineItems: PackageLineItem[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  images: string[];
};

type RunOfShowEditorDay = {
  day_number: number;
  title: string;
  description: string;
  city: string;
  slot_morning: string;
  slot_afternoon: string;
  slot_evening: string;
};

const emptyForm: FormState = {
  slug: '',
  name: '',
  description: '',
  country: 'India',
  location: '',
  nights: 1,
  days: 1,
  price: 0,
  markup_percent: 25,
  b2b_price: 40000,
  category: 'Premium',
  image_url: '',
  image_key: 'hyderabad',
  is_active: true,
  themesText: '',
  runOfShowText:
    '1 | Event setup & readiness | Vendor load-in, production checks and final styling | Main venue | Supplier load-in and technical checks | Guest arrival and live programme | Breakdown and venue handover',
  inclusionsText: 'Venue | Confirmed event venue\nServices | Approved vendor services',
  exclusionsText: 'Third-party services not selected\nStatutory fees, if applicable',
  lineItems: [],
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  images: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatRunOfShowDay(day: RunOfShowEditorDay) {
  return [
    day.day_number,
    day.title,
    day.description,
    day.city,
    day.slot_morning || '',
    day.slot_afternoon || '',
    day.slot_evening || '',
  ].join(' | ');
}

function parseRunOfShowText(text: string): RunOfShowEditorDay[] {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const [
        dayStr = '',
        title = '',
        description = '',
        city = '',
        slotMorning = '',
        slotAfternoon = '',
        slotEvening = '',
      ] = line.split('|').map((part) => part.trim());
      return {
        day_number: Number(dayStr) || index + 1,
        title: title || `Day ${index + 1}`,
        description: description || '',
        city,
        slot_morning: slotMorning,
        slot_afternoon: slotAfternoon,
        slot_evening: slotEvening,
      };
    });
}

function toForm(pkg: PackageDetail): FormState {
  return {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    country: pkg.country,
    location: pkg.location,
    nights: Number(pkg.nights),
    days: Number(pkg.days),
    price: Number(pkg.price),
    markup_percent: Number((pkg as any).markup_percent || 25) === 15 ? 15 : 25,
    vendor_id: (pkg as any).vendor_id ?? undefined,
    b2b_price: Number((pkg as any).b2b_price || 0),
    category: pkg.category as 'Economy' | 'Premium' | 'Luxury',
    image_url: pkg.image_url,
    image_key: pkg.image_key,
    is_active: Boolean(pkg.is_active),
    meta_title: pkg.meta_title || '',
    meta_description: pkg.meta_description || '',
    meta_keywords: pkg.meta_keywords || '',
    images: pkg.images || [],
    themesText: pkg.themes.join('\n'),
    runOfShowText: pkg.runOfShow
      .map((day) =>
        formatRunOfShowDay({
          day_number: day.day_number,
          title: day.title,
          description: day.description,
          city: day.city || '',
          slot_morning: (day as any).slot_morning || '',
          slot_afternoon: (day as any).slot_afternoon || '',
          slot_evening: (day as any).slot_evening || '',
        }),
      )
      .join('\n'),
    inclusionsText: pkg.inclusions.map((item) => `${item.category} | ${item.item}`).join('\n'),
    exclusionsText: pkg.exclusions.map((item) => item.item).join('\n'),
    lineItems: pkg.line_items || [],
  };
}

function parseForm(form: FormState) {
  const runOfShow = parseRunOfShowText(form.runOfShowText).map((day, index) => {
    return {
      day_number: Number(day.day_number) || index + 1,
      title: day.title || `Day ${index + 1}`,
      description: day.description || '',
      city: day.city || null,
      slot_morning: day.slot_morning || null,
      slot_afternoon: day.slot_afternoon || null,
      slot_evening: day.slot_evening || null,
    };
  });

  return {
    id: form.id,
    slug: form.slug || slugify(form.name),
    name: form.name,
    description: form.description,
    country: form.country,
    location: form.location,
    nights: Number(form.nights),
    days: Number(form.days),
    price: Number(form.price),
    markup_percent: form.markup_percent,
    vendor_id: form.vendor_id || undefined,
    b2b_price: Number(form.b2b_price || 0),
    category: form.category,
    image_url: form.image_url,
    image_key: form.image_key,
    images: form.images,
    is_active: form.is_active,
    meta_title: form.meta_title || null,
    meta_description: form.meta_description || null,
    meta_keywords: form.meta_keywords || null,
    themes: form.themesText
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
    runOfShow,
    inclusions: form.inclusionsText
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [category, item] = line.split('|').map((part) => part.trim());
        return { category: category || 'Included', item: item || category || '' };
      })
      .filter((item) => item.item),
    exclusions: form.exclusionsText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ item })),
    line_items: form.lineItems,
  };
}

function PackageEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';
  const auth = user?.session_token ? { email: user.email, sessionToken: user.session_token } : null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'visual' | 'raw'>('visual');
  const [builderItems, setBuilderItems] = useState<any[]>([]);
  const [isGeneratingRunOfShow, setIsGeneratingRunOfShow] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [catalogActivities, setCatalogActivities] = useState<any[]>([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  const handleOpenRfqModal = () => setIsRfqModalOpen(true);

  const handleOpenCatalog = async () => {
    setIsCatalogModalOpen(true);
    if (catalogActivities.length === 0) {
      if (!auth) return;
      setIsLoadingCatalog(true);
      try {
        const res = await adminGetMasterCatalog({
          data: {
            auth,
            catalogType: 'activity',
            status: 'active',
            location: form.location,
          } as any,
        });
        setCatalogActivities(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
  };

  const handleAddActivityToRunOfShow = (activity: any) => {
    const next = [...runOfShowDays];
    const newDayNum = next.length + 1;
    next.push({
      day_number: newDayNum,
      title: activity.name || activity.title || `Day ${newDayNum}`,
      description: activity.description || '',
      city: activity.location || activity.place || form.location || '',
      slot_morning: '',
      slot_afternoon: '',
      slot_evening: '',
    });
    saveRunOfShowDays(next);
    toast.success('Added to runOfShow');
    setIsCatalogModalOpen(false);
  };

  const runOfShowDays = useMemo(() => {
    return parseRunOfShowText(form.runOfShowText);
  }, [form.runOfShowText]);

  const saveRunOfShowDays = (days: RunOfShowEditorDay[]) => {
    update('runOfShowText', days.map(formatRunOfShowDay).join('\n'));
  };

  const handleUpdateDay = (index: number, field: string, value: any) => {
    const next = [...runOfShowDays];
    next[index] = { ...next[index], [field]: value };
    saveRunOfShowDays(next);
  };

  const handleAddDay = () => {
    const next = [...runOfShowDays];
    const newDayNum = next.length + 1;
    next.push({
      day_number: newDayNum,
      title: `Event Day ${newDayNum}`,
      description: 'Define setup, guest experience, live programme and close-out responsibilities.',
      city: form.location || '',
      slot_morning: '',
      slot_afternoon: '',
      slot_evening: '',
    });
    saveRunOfShowDays(next);
  };

  const handleRemoveDay = (index: number) => {
    let next = runOfShowDays.filter((_, idx) => idx !== index);
    next = next.map((d, idx) => ({ ...d, day_number: idx + 1 }));
    saveRunOfShowDays(next);
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === runOfShowDays.length - 1) return;
    const next = [...runOfShowDays];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    const renumbered = next.map((d, idx) => ({ ...d, day_number: idx + 1 }));
    saveRunOfShowDays(renumbered);
  };

  useEffect(() => {
    async function load() {
      if (!auth) return;
      setLoading(true);
      try {
        if (isNew) {
          const draftLocation = sessionStorage.getItem('moons-package-location');
          if (draftLocation) {
            setForm((current) => ({ ...current, location: draftLocation, country: 'India' }));
            sessionStorage.removeItem('moons-package-location');
          }
        }
        if (!isNew) {
          const detail = await adminGetPackageDetail({ data: { auth, id: Number(id) } });
          if (detail) setForm(toForm(detail));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user?.session_token]);

  const previewUrl = useMemo(() => form.image_url.trim(), [form.image_url]);
  const lineItemTotal = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + Number(item.total_selling || 0), 0),
    [form.lineItems],
  );
  const lineItemNetTotal = useMemo(
    () => form.lineItems.reduce((sum, item) => sum + Number(item.total_net || 0), 0),
    [form.lineItems],
  );

  function sellingFromNet(netCost: number, markupPercent = form.markup_percent) {
    return Math.round(netCost * (1 + markupPercent / 100));
  }

  async function loadBuilderItems(location = form.location) {
    if (!auth || !location) return;
    try {
      const res = await adminGetPackageBuilderInventory({ data: { auth, location } });
      setBuilderItems(res.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load master catalog items');
    }
  }

  function addLineItem(item: any, rate: any) {
    const quantity = 1;
    const netCost = Number(rate?.net_cost || 0);
    if (netCost <= 0) {
      toast.error('Add a confirmed vendor net price before selecting this service.');
      return;
    }
    const sellingPrice = sellingFromNet(netCost);
    setForm((current) => ({
      ...current,
      price: Math.round(
        current.lineItems.reduce((sum, row) => sum + Number(row.total_selling || 0), 0) +
          sellingPrice,
      ),
      b2b_price: Math.round(
        current.lineItems.reduce((sum, row) => sum + Number(row.total_net || 0), 0) + netCost,
      ),
      lineItems: [
        ...current.lineItems,
        {
          catalog_type: item.catalog_type,
          catalog_id: item.id,
          vendor_service_id: item.vendor_service_id,
          rate_card_id: rate?.id || null,
          vendor_id: rate?.vendor_id || null,
          vendor_name: rate?.vendor_name || null,
          item_name: item.name,
          unit_type: rate?.unit_type || 'fixed',
          quantity,
          net_cost: netCost,
          selling_price: sellingPrice,
          total_net: quantity * netCost,
          total_selling: quantity * sellingPrice,
          notes: '',
        },
      ],
    }));
  }

  function updateLineItem(index: number, patch: Partial<PackageLineItem>) {
    setForm((current) => {
      const next = current.lineItems.map((item, i) => {
        if (i !== index) return item;
        const merged = { ...item, ...patch };
        const quantity = Number(merged.quantity || 0);
        const netCost = Number(merged.net_cost || 0);
        const sellingPrice = sellingFromNet(netCost, current.markup_percent);
        return {
          ...merged,
          selling_price: sellingPrice,
          total_net: quantity * netCost,
          total_selling: quantity * sellingPrice,
        };
      });
      return {
        ...current,
        lineItems: next,
        price: Math.round(next.reduce((sum, item) => sum + Number(item.total_selling || 0), 0)),
        b2b_price: Math.round(next.reduce((sum, item) => sum + Number(item.total_net || 0), 0)),
      };
    });
  }

  function setMarkupPercent(markupPercent: 15 | 25) {
    setForm((current) => {
      const lineItems = current.lineItems.map((item) => {
        const quantity = Number(item.quantity || 0);
        const netCost = Number(item.net_cost || 0);
        const sellingPrice = sellingFromNet(netCost, markupPercent);
        return {
          ...item,
          selling_price: sellingPrice,
          total_net: quantity * netCost,
          total_selling: quantity * sellingPrice,
        };
      });
      return {
        ...current,
        markup_percent: markupPercent,
        lineItems,
        b2b_price: Math.round(
          lineItems.reduce((sum, item) => sum + Number(item.total_net || 0), 0),
        ),
        price: Math.round(
          lineItems.reduce((sum, item) => sum + Number(item.total_selling || 0), 0),
        ),
      };
    });
  }

  function removeLineItem(index: number) {
    setForm((current) => {
      const lineItems = current.lineItems.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        lineItems,
        b2b_price: Math.round(
          lineItems.reduce((sum, item) => sum + Number(item.total_net || 0), 0),
        ),
        price: Math.round(
          lineItems.reduce((sum, item) => sum + Number(item.total_selling || 0), 0),
        ),
      };
    });
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!auth) return;
    setSaving(true);
    setError(null);
    try {
      const payload = parseForm(form);
      const res = await adminUpsertPackageDetail({ data: { auth, package: payload } });
      await navigate({ to: '/packages/$id', params: { id: String(res.id) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save package');
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File | null) {
    if (!file || !auth) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const result = await adminUploadAsset({
      data: { auth, originalFilename: file.name, mimeType: file.type as any, base64 },
    });
    update('image_url', result.publicUrl);
  }

  async function uploadGalleryImage(file: File | null) {
    if (!file || !auth) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const result = await adminUploadAsset({
      data: { auth, originalFilename: file.name, mimeType: file.type as any, base64 },
    });
    setForm((current) => ({ ...current, images: [...current.images, result.publicUrl] }));
  }

  function removeGalleryImage(index: number) {
    setForm((current) => {
      const next = [...current.images];
      next.splice(index, 1);
      return { ...current, images: next };
    });
  }

  async function handleAiGenerateRunOfShow() {
    if (!auth || !form.location) return;
    setIsGeneratingRunOfShow(true);
    try {
      const text = await adminAiGenerateRunOfShow({
        data: { auth, location: form.location, days: form.days, category: form.category },
      });
      update('runOfShowText', text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingRunOfShow(false);
    }
  }

  async function handleAiGenerateSEO() {
    if (!auth || !form.location || !form.name) return;
    setIsGeneratingSEO(true);
    try {
      const res = await adminAiGenerateSEO({
        data: {
          auth,
          location: form.location,
          name: form.name,
          description: form.description,
        },
      });
      setForm((current) => ({
        ...current,
        meta_title: res.meta_title,
        meta_description: res.meta_description,
        meta_keywords: res.meta_keywords,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSEO(false);
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading package...</div>;

  return (
    <div className=" space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/packages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {isNew ? 'Create Package' : form.name || `Package ${id}`}
          </h1>
          <p className="text-muted-foreground">
            Changes save into MooNsEvents and appear on the public website through the Config API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOpenRfqModal} disabled={!form.id || !auth}>
            <Sunrise className="mr-2 h-4 w-4" /> Send RFQ
          </Button>
          <Button onClick={save} disabled={saving || !auth}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="runOfShow">Run of Show</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    name: e.target.value,
                    slug: current.slug || slugify(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value="India" disabled />
            </Field>
            <Field label="Event Days">
              <Input
                type="number"
                min="1"
                value={form.days}
                onChange={(e) => {
                  update('days', Number(e.target.value));
                  update('nights', 1);
                }}
              />
            </Field>
            <Field label="Package Tier">
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value as FormState['category'])}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option>Economy</option>
                <option>Premium</option>
                <option>Luxury</option>
              </select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="min-h-36"
            />
          </Field>
          <label className="flex items-center gap-3 rounded-md border p-4">
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => update('is_active', checked)}
            />
            <span className="text-sm font-medium">Published on public website</span>
          </label>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiGenerateSEO}
              disabled={isGeneratingSEO || !form.location || !form.name}
            >
              {isGeneratingSEO ? 'Generating...' : '✨ AI Generate SEO'}
            </Button>
          </div>
          <Field label="Meta Title">
            <Input
              value={form.meta_title}
              onChange={(e) => update('meta_title', e.target.value)}
              placeholder="Default will be generated if left blank"
            />
          </Field>
          <Field label="Meta Description">
            <Textarea
              value={form.meta_description}
              onChange={(e) => update('meta_description', e.target.value)}
              className="min-h-24"
              placeholder="Default will be generated if left blank"
            />
          </Field>
          <Field label="Meta Keywords">
            <Input
              value={form.meta_keywords}
              onChange={(e) => update('meta_keywords', e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </Field>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 pt-4">
          <div className="rounded-md border bg-muted/20 p-4">
            <h3 className="font-semibold">Automatic Package Pricing</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Calculated only from confirmed vendor service costs selected in Builder.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Vendor Net Cost
              </div>
              <div className="mt-2 text-2xl font-bold">
                ₹{lineItemNetTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Markup</div>
              <div className="mt-3 flex gap-2">
                {[15, 25].map((markup) => (
                  <Button
                    key={markup}
                    type="button"
                    variant={form.markup_percent === markup ? 'default' : 'outline'}
                    onClick={() => setMarkupPercent(markup as 15 | 25)}
                  >
                    {markup}%
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Website Selling Price
              </div>
              <div className="mt-2 text-2xl font-bold text-primary">
                ₹{lineItemTotal.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-5 pt-4">
          <div className="flex flex-col gap-3 rounded-md border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Database className="h-4 w-4 text-primary" /> Event Service Builder
              </div>
              <p className="text-xs text-muted-foreground">
                Choose specific priced services from approved Master Catalog vendors for{' '}
                {form.location || 'the selected location'}.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={form.location}
                onChange={(event) => {
                  const location = event.target.value;
                  update('location', location);
                  if (location) void loadBuilderItems(location);
                }}
                className="h-10 min-w-[240px] rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select event location</option>
                <optgroup label="Telangana">
                  <option value="Hyderabad, Telangana">Hyderabad</option>
                  <option value="Secunderabad, Telangana">Secunderabad</option>
                  <option value="Warangal, Telangana">Warangal</option>
                  <option value="Nizamabad, Telangana">Nizamabad</option>
                  <option value="Karimnagar, Telangana">Karimnagar</option>
                  <option value="Khammam, Telangana">Khammam</option>
                </optgroup>
                <optgroup label="Andhra Pradesh">
                  <option value="Vijayawada, Andhra Pradesh">Vijayawada</option>
                  <option value="Visakhapatnam, Andhra Pradesh">Visakhapatnam</option>
                  <option value="Guntur, Andhra Pradesh">Guntur</option>
                  <option value="Tirupati, Andhra Pradesh">Tirupati</option>
                  <option value="Nellore, Andhra Pradesh">Nellore</option>
                  <option value="Kakinada, Andhra Pradesh">Kakinada</option>
                  <option value="Rajahmundry, Andhra Pradesh">Rajahmundry</option>
                  <option value="Amaravati, Andhra Pradesh">Amaravati</option>
                </optgroup>
              </select>
              <Button
                variant="outline"
                onClick={() => loadBuilderItems()}
                disabled={!form.location}
              >
                Load Vendors & Services
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-md border bg-background">
              <div className="border-b px-3 py-2 text-sm font-semibold">
                Available Vendor Services
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                {builderItems.map((item) => (
                  <div
                    key={`${item.catalog_type}-${item.id}-${item.vendor_service_id}`}
                    className="border-b p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {item.subtype} · {item.vendor_name} · {item.location}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(item.rates || []).length === 0 ? (
                        <span className="text-xs text-muted-foreground">No rate card yet</span>
                      ) : (
                        item.rates.map((rate: any) => (
                          <Button
                            key={`${item.id}-${rate.id || 'vendor'}`}
                            size="sm"
                            variant="outline"
                            disabled={Number(rate.net_cost || 0) <= 0}
                            onClick={() => addLineItem(item, rate)}
                          >
                            {Number(rate.net_cost || 0) > 0
                              ? `Add · ₹${Number(rate.net_cost).toLocaleString('en-IN')} net`
                              : 'Price required'}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                {builderItems.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Load a location to see master catalog items.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-md border bg-background">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-semibold">Package Line Items</span>
                <span className="text-sm font-bold text-primary">
                  INR {lineItemTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                {form.lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 border-b p-3 md:grid-cols-[70px_1fr_80px_110px_110px_auto]"
                  >
                    <Input
                      type="number"
                      placeholder="Day"
                      value={item.day_number || ''}
                      onChange={(e) =>
                        updateLineItem(index, {
                          day_number: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                    <div>
                      <div className="text-sm font-medium">{item.item_name}</div>
                      <div className="text-xs capitalize text-muted-foreground">
                        {item.catalog_type} · {item.unit_type}{' '}
                        {item.vendor_name ? `· ${item.vendor_name}` : ''}
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) })}
                    />
                    <div className="rounded-md border bg-muted/30 px-2 py-2 text-xs">
                      Net ₹{Number(item.total_net || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="rounded-md border bg-primary/5 px-2 py-2 text-xs font-medium text-primary">
                      Sell ₹{Number(item.total_selling || 0).toLocaleString('en-IN')}
                    </div>
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.lineItems.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No package line items yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="runOfShow" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold font-display text-primary">Event Run of Show</h3>
              <p className="text-xs text-muted-foreground">
                Plan supplier load-in, setup, guest experience, live programme and event close-out.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted border">
              <button
                type="button"
                onClick={() => setEditMode('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  editMode === 'visual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual Cards
              </button>
              <button
                type="button"
                onClick={() => setEditMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  editMode === 'raw'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Raw Text
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenCatalog}>
                <Database className="w-4 h-4 mr-2 text-primary" /> Add from Catalog
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiGenerateRunOfShow}
                disabled={isGeneratingRunOfShow || !form.location}
              >
                {isGeneratingRunOfShow ? 'Generating...' : '✨ AI Generate RunOfShow'}
              </Button>
            </div>
          </div>

          {editMode === 'raw' ? (
            <Field label="Run of Show lines: day | title | responsibilities | venue/area | setup | live programme | close-out">
              <Textarea
                value={form.runOfShowText}
                onChange={(e) => update('runOfShowText', e.target.value)}
                className="min-h-80 font-mono text-sm border-border/60"
              />
            </Field>
          ) : (
            <div className="space-y-4">
              {/* Daily cards grid */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {runOfShowDays.map((day, idx) => (
                  <div
                    key={day.day_number}
                    className="relative p-5 rounded-xl border border-border/80 bg-card hover:shadow-md transition-all group flex flex-col gap-4"
                  >
                    {/* Header bar of day card */}
                    <div className="flex items-center justify-between border-b pb-3 border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                          DAY {String(day.day_number).padStart(2, '0')}
                        </span>
                        <input
                          type="text"
                          className="font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-0.5 text-foreground font-sans"
                          value={day.title}
                          placeholder="Day Title"
                          onChange={(e) => handleUpdateDay(idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveDay(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDay(idx, 'down')}
                          disabled={idx === runOfShowDays.length - 1}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(idx)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive/80 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Responsibilities & Deliverables
                        </span>
                        <Textarea
                          className="text-xs resize-none min-h-[64px] border-border/60"
                          value={day.description}
                          placeholder="Vendor responsibilities, approvals, guest flow and handovers..."
                          onChange={(e) => handleUpdateDay(idx, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Venue / Event Area
                        </span>
                        <input
                          type="text"
                          className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                          value={day.city}
                          placeholder="e.g. Grand Ballroom"
                          onChange={(e) => handleUpdateDay(idx, 'city', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-3">
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-dashed border-border/60 flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Sunrise className="w-3 h-3 text-amber-500" /> Setup & Load-in
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Stage, decor and AV checks"
                            value={day.slot_morning}
                            onChange={(e) => handleUpdateDay(idx, 'slot_morning', e.target.value)}
                            className="bg-transparent border-none text-[11px] focus:outline-none placeholder-muted-foreground text-foreground px-0.5"
                          />
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-dashed border-border/60 flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Compass className="w-3 h-3 text-blue-500" /> Live Programme
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Guest entry, ceremony, performances"
                            value={day.slot_afternoon}
                            onChange={(e) => handleUpdateDay(idx, 'slot_afternoon', e.target.value)}
                            className="bg-transparent border-none text-[11px] focus:outline-none placeholder-muted-foreground text-foreground px-0.5"
                          />
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-dashed border-border/60 flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Sunset className="w-3 h-3 text-purple-500" /> Close-out
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Guest departure, breakdown, handover"
                            value={day.slot_evening}
                            onChange={(e) => handleUpdateDay(idx, 'slot_evening', e.target.value)}
                            className="bg-transparent border-none text-[11px] focus:outline-none placeholder-muted-foreground text-foreground px-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add day button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDay}
                className="w-full h-11 border-dashed border-border/80 hover:bg-muted font-bold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Event Day
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="flex items-center justify-end gap-2 border-b pb-2">
            <span className="text-sm font-medium">Raw Edit</span>
            <Switch
              checked={editMode === 'visual'}
              onCheckedChange={(c) => setEditMode(c ? 'visual' : 'raw')}
            />
            <span className="text-sm font-medium text-muted-foreground">Visual Builder</span>
          </div>

          {editMode === 'raw' ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Themes">
                <Textarea
                  value={form.themesText}
                  onChange={(e) => update('themesText', e.target.value)}
                  className="min-h-64"
                />
              </Field>
              <Field label="Inclusions (Format: Category | Item)">
                <Textarea
                  value={form.inclusionsText}
                  onChange={(e) => update('inclusionsText', e.target.value)}
                  className="min-h-64"
                />
              </Field>
              <Field label="Exclusions">
                <Textarea
                  value={form.exclusionsText}
                  onChange={(e) => update('exclusionsText', e.target.value)}
                  className="min-h-64"
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {/* Themes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  Themes{' '}
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {form.themesText.split(/\r?\n|,/).filter((t) => t.trim()).length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {form.themesText
                    .split(/\r?\n|,/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((theme, i, arr) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={theme}
                          onChange={(e) => {
                            const next = [...arr];
                            next[i] = e.target.value;
                            update('themesText', next.join('\n'));
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = arr.filter((_, idx) => idx !== i);
                            update('themesText', next.join('\n'));
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update(
                        'themesText',
                        form.themesText + (form.themesText ? '\n' : '') + 'New Theme',
                      )
                    }
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" /> Add Theme
                  </Button>
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  Inclusions{' '}
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {form.inclusionsText.split(/\r?\n/).filter((t) => t.trim()).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {form.inclusionsText
                    .split(/\r?\n/)
                    .filter(Boolean)
                    .map((line, i, arr) => {
                      const [c = '', v = ''] = line.split('|').map((p) => p.trim());
                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-2 p-4 border rounded-xl bg-card relative group shadow-sm transition-shadow hover:shadow-md"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 bg-background/50 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              const next = arr.filter((_, idx) => idx !== i);
                              update('inclusionsText', next.join('\n'));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div>
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                              Category
                            </Label>
                            <Input
                              value={c}
                              className="h-8 font-medium bg-background/50"
                              placeholder="e.g. Timelines, Venue"
                              onChange={(e) => {
                                const next = [...arr];
                                next[i] = `${e.target.value} | ${v}`;
                                update('inclusionsText', next.join('\n'));
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                              Description
                            </Label>
                            <Textarea
                              value={v}
                              className="min-h-16 text-sm bg-background/50 resize-none"
                              placeholder="Description of inclusion..."
                              onChange={(e) => {
                                const next = [...arr];
                                next[i] = `${c} | ${e.target.value}`;
                                update('inclusionsText', next.join('\n'));
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update(
                        'inclusionsText',
                        form.inclusionsText +
                          (form.inclusionsText ? '\n' : '') +
                          'Category | Item description',
                      )
                    }
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" /> Add Inclusion
                  </Button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  Exclusions{' '}
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {form.exclusionsText.split(/\r?\n/).filter((t) => t.trim()).length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {form.exclusionsText
                    .split(/\r?\n/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((exc, i, arr) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={exc}
                          onChange={(e) => {
                            const next = [...arr];
                            next[i] = e.target.value;
                            update('exclusionsText', next.join('\n'));
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = arr.filter((_, idx) => idx !== i);
                            update('exclusionsText', next.join('\n'));
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update(
                        'exclusionsText',
                        form.exclusionsText + (form.exclusionsText ? '\n' : '') + 'New Exclusion',
                      )
                    }
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" /> Add Exclusion
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-8 pt-4">
          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Hero Image</h3>
              <Field label="Image URL">
                <Input
                  value={form.image_url}
                  onChange={(e) => update('image_url', e.target.value)}
                />
              </Field>
              <Field label="Image key fallback">
                <Input
                  value={form.image_key}
                  onChange={(e) => update('image_key', e.target.value)}
                />
              </Field>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                <ImageUp className="h-4 w-4" />
                Upload Hero Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(event) => upload(event.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted/30">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-64 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gallery Images</h3>
                <p className="text-sm text-muted-foreground">
                  These images will animate on the package card in the storefront.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted bg-primary/5 text-primary border-primary/20">
                <ImageUp className="h-4 w-4" />
                Add to Gallery
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(event) => uploadGalleryImage(event.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative group rounded-lg overflow-hidden border bg-muted/30 aspect-video"
                >
                  <img
                    src={imgUrl}
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.images.length === 0 && (
                <div className="col-span-full py-8 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                  No gallery images added yet. The storefront will fall back to auto-generating
                  curated images.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Select Activity from Catalog</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {isLoadingCatalog ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading catalog items...
                </div>
              ) : catalogActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found in catalog for this location.
                </div>
              ) : (
                <div className="space-y-3">
                  {catalogActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-semibold text-sm">{act.name || act.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {act.description}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleAddActivityToRunOfShow(act)}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setIsCatalogModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <SendRfqModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        auth={auth}
        packageId={form.id || 0}
        location={form.location}
        country={form.country}
        packageDurationDays={form.days}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
