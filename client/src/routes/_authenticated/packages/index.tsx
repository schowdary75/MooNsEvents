// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@/lib/routerCompat';
import { Edit, Eye, Filter, Plus, Search, Share2, Sparkles, X, Sunrise } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useAuth } from '@/components/auth-context';
import { SendRfqModal } from '@/components/send-rfq-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VerificationChip } from '@/components/verification-chip';
import { RegionTabs, type RegionTab, matchesRegion } from '@/components/region-tabs';
import { usePagination, DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  adminGetPackagesAll,
  adminSetPackageActive,
  adminUpsertPackageDetail,
  type PackageRow,
  adminAiBuildPackage,
} from '@/lib/api/db.functions';
export const Route = createFileRoute('/_authenticated/packages/')({
  component: PackagesPage,
});

function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RegionTab>('telangana');
  const [loading, setLoading] = useState(true);
  const auth = user?.session_token ? { email: user.email, sessionToken: user.session_token } : null;
  const navigate = Route.useNavigate();
  const [rfqPackage, setRfqPackage] = useState<PackageRow | null>(null);

  // AI Builder State
  const [showAiBuilder, setShowAiBuilder] = useState(false);
  const [aiLocation, setAiLocation] = useState('');
  const [aiDays, setAiDays] = useState(5);
  const [isAiBuilding, setIsAiBuilding] = useState(false);

  const handleAiBuildPackage = async () => {
    if (!aiLocation || !aiDays || !auth) return;
    sessionStorage.setItem('moons-package-location', aiLocation);
    setShowAiBuilder(false);
    toast.info('Choose approved Master Catalog vendors and enter their confirmed prices.');
    navigate({ to: '/packages/$id', params: { id: 'new' } });
  };

  async function loadPackages() {
    if (!auth) return;
    setLoading(true);
    try {
      setPackages(await adminGetPackagesAll({ data: { auth } }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, [user?.session_token]);

  const filtered = useMemo(() => {
    const base = packages.filter((pkg) =>
      matchesRegion(`${pkg.location || pkg.destination || ''} ${pkg.country || ''}`, activeTab),
    );

    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((pkg) =>
      [pkg.name, pkg.location, pkg.country, pkg.category, pkg.slug, ...(pkg.themes || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [activeTab, packages, query]);

  const { currentPage, totalPages, setCurrentPage, paginatedItems } = usePagination(filtered, 15);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query, setCurrentPage]);

  async function togglePackage(pkg: PackageRow) {
    if (!auth) return;
    try {
      await adminSetPackageActive({
        data: { auth, id: pkg.id, is_active: !pkg.is_active },
      });
      toast.success(pkg.is_active ? 'Package unpublished' : 'Package published');
      await loadPackages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update package');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-8 text-xs shadow-sm"
          >
            <Filter className="mr-2 h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiBuilder(true)}
            className="h-8 text-xs shadow-sm text-primary border-primary/20 hover:bg-primary/5"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" /> AI Package Wizard
          </Button>
          <Button size="sm" asChild className="h-8 text-xs shadow-sm">
            <Link to="/packages/$id" params={{ id: 'new' }}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              New Package
            </Link>
          </Button>
        </div>
      </div>

      {/* AI Package Builder Modal */}
      {showAiBuilder && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className="flex justify-between items-center p-4 border-b bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-display font-bold">
                <Sparkles className="w-5 h-5" /> AI Package Architect
              </div>
              <button
                onClick={() => setShowAiBuilder(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground mb-4">
                Tell Gemini where you want to build a package, and it will generate the entire
                runOfShow and realistic base pricing instantly.
              </p>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                    Location / Country
                  </label>
                  <Input
                    placeholder="e.g. Hyderabad, Telangana"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    disabled={isAiBuilding}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                    Duration (Days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={aiDays}
                    onChange={(e) => setAiDays(Number(e.target.value))}
                    disabled={isAiBuilding}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAiBuilder(false)}
                  disabled={isAiBuilding}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAiBuildPackage}
                  disabled={isAiBuilding || !aiLocation || !aiDays}
                >
                  {isAiBuilding ? 'Architecting Package...' : 'Build Package'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <div className="flex gap-4 items-center bg-muted/30 p-3 rounded-md border">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background h-9"
              placeholder="Search location, theme, package..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      )}

      <RegionTabs value={activeTab} onValueChange={setActiveTab} />

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package & Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Pricing (B2B / B2C)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>SEO Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading packages...
                </TableCell>
              </TableRow>
            ) : paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No packages found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {pkg.image_url && (
                        <div className="h-12 w-20 shrink-0 overflow-hidden rounded border bg-muted">
                          <img
                            src={pkg.image_url}
                            alt={pkg.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pkg.days}D / {pkg.nights}N · {pkg.category}
                        </div>
                        {(pkg as any).vendor_name && (
                          <div className="text-xs font-semibold text-blue-600 mt-1">
                            Supplier: {(pkg as any).vendor_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>
                        {pkg.location}, {pkg.country}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Net:{' '}
                        <b className="text-destructive">
                          ₹{Number((pkg as any).b2b_price || 0).toLocaleString('en-IN')}
                        </b>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Sell:{' '}
                        <b className="text-emerald-600">
                          ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                        </b>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                      {pkg.is_active ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <VerificationChip
                      id={pkg.id}
                      tableName="packages"
                      initialVerified={Boolean((pkg as any).is_verified)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{pkg.slug}</TableCell>
                  <TableCell className="p-2 align-middle">
                    <div className="flex w-full items-center justify-end rounded-md shadow-sm border border-border overflow-hidden">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 rounded-none border-r border-border h-8 text-xs bg-background hover:bg-muted"
                        onClick={() => setRfqPackage(pkg)}
                        title="Send RFQ to Vendors"
                      >
                        <Sunrise className="mr-2 h-3.5 w-3.5" />
                        Send RFQ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 rounded-none border-r border-border h-8 text-xs bg-background hover:bg-muted"
                        onClick={() => {
                          const link = `${window.location.origin}/lounge?packageId=${pkg.id}`;
                          navigator.clipboard.writeText(link);
                          toast.success('Bespoke Lounge link copied to clipboard!');
                        }}
                        title="Copy Client Lounge Link"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 rounded-none border-r border-border h-8 text-xs bg-background hover:bg-muted"
                        onClick={() => togglePackage(pkg)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        {pkg.is_active ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 rounded-none h-8 text-xs bg-background hover:bg-muted"
                        asChild
                      >
                        <Link to="/packages/$id" params={{ id: String(pkg.id) }}>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
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

      <SendRfqModal
        isOpen={!!rfqPackage}
        onClose={() => setRfqPackage(null)}
        auth={auth}
        packageId={rfqPackage?.id || 0}
        location={rfqPackage?.location}
        country={rfqPackage?.country}
        packageDurationDays={rfqPackage?.days}
      />
    </div>
  );
}
