import fs from 'node:fs';

const crmCareersCode = `// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { createFileRoute } from '@/lib/routerCompat';
import { getAdminApplications, updateApplicationStatus } from '@/lib/api/db.functions';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Loader2,
  Mail,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  Award,
  Users,
  Calendar,
  Send,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

export const Route = createFileRoute('/_authenticated/careers')({
  component: CareersAdminPage,
  loader: async () => await getAdminApplications(),
});

function CareersAdminPage() {
  const initialApps = Route.useLoaderData() || [];
  const [applications, setApplications] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'qualified' | 'all' | 'pending' | 'rejected'>('qualified');

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (filterTab === 'qualified') {
        return app.status === 'shortlisted' || (app.mock_test_score !== null && app.mock_test_score >= 75);
      }
      if (filterTab === 'pending') {
        return app.status === 'pending';
      }
      if (filterTab === 'rejected') {
        return app.status === 'rejected' || (app.mock_test_score !== null && app.mock_test_score < 75);
      }
      return true;
    });
  }, [applications, filterTab]);

  const stats = useMemo(() => {
    const total = applications.length;
    const qualified = applications.filter(
      (a) => a.status === 'shortlisted' || (a.mock_test_score !== null && a.mock_test_score >= 75)
    ).length;
    const scored = applications.filter((a) => a.mock_test_score !== null);
    const avgScore =
      scored.length > 0
        ? Math.round(scored.reduce((acc, curr) => acc + (curr.mock_test_score || 0), 0) / scored.length)
        : 0;

    return { total, qualified, avgScore };
  }, [applications]);

  const handleStatusUpdate = async (
    id: number,
    status: 'shortlisted' | 'rejected',
    email: string,
    name: string,
    jobTitle: string,
  ) => {
    try {
      setLoading(true);
      const res = await updateApplicationStatus({ data: { id, status, email, name, jobTitle } });
      if (res.success) {
        setApplications((apps) => apps.map((app) => (app.id === id ? { ...app, status } : app)));
        setSelectedApp((prev: any) => (prev ? { ...prev, status } : null));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Recruitment & Event Reasoning Talent Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review applicant profiles and situational reasoning assessment scores.
            <span className="inline-flex items-center gap-1 ml-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3 h-3" /> Auto-qualified candidates (75%+ score) are shortlisted for Round 2
            </span>
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{stats.qualified}</div>
            <div className="text-xs text-muted-foreground font-semibold">Qualified for Interview</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.avgScore}%</div>
            <div className="text-xs text-muted-foreground font-semibold">Avg Event Reasoning Score</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground font-semibold">Total Submissions</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          variant={filterTab === 'qualified' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterTab('qualified')}
          className="text-xs font-bold gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Qualified & Shortlisted ({stats.qualified})
        </Button>
        <Button
          variant={filterTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterTab('all')}
          className="text-xs font-bold"
        >
          All Applicants ({stats.total})
        </Button>
        <Button
          variant={filterTab === 'rejected' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterTab('rejected')}
          className="text-xs font-bold gap-1.5 text-muted-foreground"
        >
          <XCircle className="w-3.5 h-3.5" />
          Below Benchmark (Archived)
        </Button>
      </div>

      {/* Applications Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Role Applied</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Reasoning Score</TableHead>
              <TableHead>Recruitment Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => {
              const isQualified = app.mock_test_score !== null && app.mock_test_score >= 75;
              return (
                <TableRow key={app.id} className={isQualified ? 'bg-emerald-500/5' : ''}>
                  <TableCell>
                    <div className="font-semibold text-sm">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{app.job_title || 'Event Specialist'}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {app.mock_test_score !== null ? (
                      <Badge
                        variant={
                          app.mock_test_score >= 75
                            ? 'default'
                            : app.mock_test_score >= 50
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="font-bold text-xs gap-1"
                      >
                        {app.mock_test_score >= 75 && <CheckCircle2 className="w-3 h-3" />}
                        {app.mock_test_score}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Pending Test</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        app.status === 'shortlisted'
                          ? 'default'
                          : app.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                      }
                      className="capitalize text-xs font-semibold"
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 align-middle text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setSelectedApp(app)}
                    >
                      View Profile & Test
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredApps.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No candidates found in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Candidate Details Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent className="sm:overflow-y-auto sm:max-w-lg">
          {selectedApp && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-2xl font-display">{selectedApp.name}</SheetTitle>
                  {selectedApp.mock_test_score !== null && selectedApp.mock_test_score >= 75 && (
                    <Badge variant="default" className="bg-emerald-600 text-white gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Qualified Candidate
                    </Badge>
                  )}
                </div>
                <SheetDescription>
                  Applied for {selectedApp.job_title || 'Event Specialist Role'}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Pill Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm bg-muted/40 p-4 rounded-xl border border-border/50">
                  <div>
                    <span className="text-muted-foreground block text-xs font-semibold mb-1">
                      Email
                    </span>
                    <a
                      href={\`mailto:\${selectedApp.email}\`}
                      className="flex items-center gap-1.5 text-primary hover:underline font-medium text-xs truncate"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{selectedApp.email}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs font-semibold mb-1">
                      Phone Number
                    </span>
                    <span className="font-medium text-xs">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs font-semibold mb-1">
                      Application Date
                    </span>
                    <span className="text-xs">{format(new Date(selectedApp.created_at), 'PPP')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs font-semibold mb-1">
                      Current Status
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedApp.status}
                    </Badge>
                  </div>
                </div>

                {/* Event Reasoning Assessment Results */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm flex items-center gap-1.5 text-primary">
                      <Zap className="w-4 h-4" />
                      Event Scenario Reasoning Test
                    </h4>
                    {selectedApp.mock_test_score !== null && (
                      <Badge
                        className="font-bold text-xs"
                        variant={selectedApp.mock_test_score >= 75 ? 'default' : 'destructive'}
                      >
                        Score: {selectedApp.mock_test_score}%
                      </Badge>
                    )}
                  </div>
                  <div className="bg-card border rounded-xl p-4 text-sm shadow-sm space-y-3.5">
                    {selectedApp.mock_test_answers ? (
                      (() => {
                        let parsed = {};
                        try {
                          parsed = typeof selectedApp.mock_test_answers === 'string'
                            ? JSON.parse(selectedApp.mock_test_answers)
                            : selectedApp.mock_test_answers;
                        } catch {
                          parsed = {};
                        }
                        const entries = Object.entries(parsed);
                        if (entries.length === 0) {
                          return <p className="text-muted-foreground text-xs">{String(selectedApp.mock_test_answers)}</p>;
                        }
                        return entries.map(([key, val], idx) => (
                          <div key={key} className="border-b last:border-0 pb-3 last:pb-0">
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1 text-primary">
                              Scenario {idx + 1}
                            </p>
                            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                              {String(val)}
                            </p>
                          </div>
                        ));
                      })()
                    ) : (
                      <p className="text-muted-foreground text-xs">No test answers recorded.</p>
                    )}
                  </div>
                </div>

                {/* Cover Letter & Notes */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Profile & Experience Summary</h4>
                  <div className="bg-card border rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap shadow-sm text-foreground/90">
                    {selectedApp.cover_letter || 'No additional notes provided.'}
                  </div>
                </div>

                {/* Resume Link */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Resume / Portfolio</h4>
                  <a
                    href={
                      selectedApp.resume_url?.startsWith('http')
                        ? selectedApp.resume_url
                        : '#'
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" className="w-full flex justify-between items-center text-xs h-9">
                      <span>Open Candidate Document</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </a>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-border/50 flex gap-2">
                  {selectedApp.status !== 'shortlisted' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedApp.id,
                          'shortlisted',
                          selectedApp.email,
                          selectedApp.name,
                          selectedApp.job_title,
                        )
                      }
                      disabled={loading}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Shortlist for Round 2
                    </Button>
                  )}
                  {selectedApp.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-rose-500/40 text-rose-600 hover:bg-rose-50 text-xs gap-1.5"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedApp.id,
                          'rejected',
                          selectedApp.email,
                          selectedApp.name,
                          selectedApp.job_title,
                        )
                      }
                      disabled={loading}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
`;

fs.writeFileSync('C:/MooNsEvents/client/src/routes/_authenticated/careers.tsx', crmCareersCode, 'utf8');
console.log('Successfully updated CRM Careers page');
