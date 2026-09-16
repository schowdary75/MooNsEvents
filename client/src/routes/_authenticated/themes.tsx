// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { createFileRoute } from '@/lib/routerCompat';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePagination, DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  adminGetEventThemes,
  adminCreateEventTheme,
  adminUpdateEventTheme,
  adminDeleteEventTheme,
  EventTheme,
} from '@/lib/api/db.functions';
import { useAuth } from '@/components/auth-context';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const SERVICE_CATEGORIES = [
  { value: 'venue', label: 'Venues & Halls' },
  { value: 'photography', label: 'Photography' },
  { value: 'decoration', label: 'Decorations' },
  { value: 'catering', label: 'Catering & Hospitality' },
  { value: 'organizer', label: 'Event Organizers' },
  { value: 'production', label: 'Production & AV' },
  { value: 'entertainment', label: 'Entertainment & Artists' },
  { value: 'logistics', label: 'Transport & Logistics' },
  { value: 'staffing', label: 'Event Staffing' },
];

function getServiceCategories(theme: EventTheme): string[] {
  const value = (theme as any).service_categories ?? (theme as any).required_service_categories;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute('/_authenticated/themes')({
  component: ThemesPage,
});

function ThemesPage() {
  const { user } = useAuth();

  // List State
  const [themes, setThemes] = useState<EventTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    image_url: '',
    image_key: '',
    service_categories: [] as string[],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const auth = { email: user?.email!, sessionToken: user?.session_token! };
      const res = await adminGetEventThemes({ data: { auth } });
      setThemes(res || []);
    } catch (err) {
      toast.error('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (theme: EventTheme | null) => {
    if (theme) {
      setEditingId(theme.id);
      setFormData({
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        image_url: theme.image_url || '',
        image_key: theme.image_key || '',
        service_categories: getServiceCategories(theme),
      });
    } else {
      setEditingId(null);
      setFormData({
        slug: '',
        name: '',
        description: '',
        image_url: '',
        image_key: '',
        service_categories: [],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.description) {
      toast.error('Please fill in name, slug, and description');
      return;
    }

    setSaving(true);
    try {
      const auth = { email: user?.email!, sessionToken: user?.session_token! };
      if (editingId) {
        await adminUpdateEventTheme({
          data: {
            auth,
            id: editingId,
            ...formData,
            is_active: 1,
          },
        });
        toast.success('Event type updated successfully');
      } else {
        await adminCreateEventTheme({
          data: {
            auth,
            ...formData,
          },
        });
        toast.success('Event type created successfully');
      }
      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this event type?')) return;

    try {
      const auth = { email: user?.email!, sessionToken: user?.session_token! };
      await adminDeleteEventTheme({ data: { auth, id } });
      toast.success('Event type archived successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive event type');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  const filteredThemes = themes.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const { currentPage, totalPages, setCurrentPage, paginatedItems } = usePagination(
    filteredThemes,
    10,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Event Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define real event categories and map the Master Catalog services each one requires.
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => openEditor(null)} size="sm" className="shadow-sm h-8 text-xs">
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Event Type
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center bg-muted/30 p-3 rounded-md border">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, slug, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="max-w-[400px]">Description</TableHead>
              <TableHead>Required Services</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No event types found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="h-10 w-16 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={
                          t.image_url ||
                          `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop`
                        }
                        alt={t.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{t.name}</TableCell>
                  <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                  <TableCell
                    className="text-xs text-muted-foreground max-w-[400px] truncate"
                    title={t.description}
                  >
                    {t.description}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="flex flex-wrap gap-1">
                      {getServiceCategories(t).map((category) => (
                        <span
                          key={category}
                          className="rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-medium"
                        >
                          {SERVICE_CATEGORIES.find((item) => item.value === category)?.label ||
                            category}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}
                    >
                      {t.is_active ? 'Active' : 'Archived'}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 align-middle text-right">
                    <div className="inline-flex items-center justify-end rounded-md shadow-sm border border-border overflow-hidden bg-background">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none border-r border-border h-8 text-xs hover:bg-muted"
                        onClick={() => openEditor(t)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-none h-8 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 border-t">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="sm:overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{editingId ? 'Edit Event Type' : 'Create Event Type'}</SheetTitle>
            <SheetDescription>
              Configure the event category used by packages, leads, vendor matching, and planning.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type Name</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const computedSlug = val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                  setFormData({
                    ...formData,
                    name: val,
                    slug: editingId ? formData.slug : computedSlug,
                  });
                }}
                placeholder="e.g. Wedding, Conference, Concert"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL friendly)</label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''),
                  })
                }
                placeholder="e.g. corporate-conferences"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Required Master Catalog Services</label>
              <p className="text-xs text-muted-foreground">
                Packages for this event type can be assembled from these approved vendor categories.
              </p>
              <div className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-2">
                {SERVICE_CATEGORIES.map((category) => {
                  const checked = formData.service_categories.includes(category.value);
                  return (
                    <label
                      key={category.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            service_categories: checked
                              ? formData.service_categories.filter(
                                  (item) => item !== category.value,
                                )
                              : [...formData.service_categories, category.value],
                          })
                        }
                        className="h-4 w-4 rounded border-input"
                      />
                      {category.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this event type, its workflow, services, and planning requirements..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL (Primary background)</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image Key</label>
              <Input
                value={formData.image_key}
                onChange={(e) => setFormData({ ...formData, image_key: e.target.value })}
                placeholder="e.g. wellness-cover"
              />
            </div>

            <SheetFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Event Type'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
