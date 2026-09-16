// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { createFileRoute } from '@/lib/routerCompat';
import { getAdminApplications, updateApplicationStatus } from '@/lib/api/db.functions';
import {
  getCareersJobs,
  adminCreateJobPosting,
  adminUpdateJobPosting,
  adminDeleteJobPosting,
} from '@/lib/api/operations';
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { format } from 'date-fns';

export const Route = createFileRoute('/_authenticated/careers')({
  component: CareersAdminPage,
  loader: async () => {
    const [applications, jobsResult] = await Promise.all([
      getAdminApplications(),
      getCareersJobs(),
    ]);
    return { applications: applications || [], jobs: jobsResult || [] };
  },
});

/* ─── Job Posting Form ─── */
function JobForm({
  job,
  onSave,
  onCancel,
}: {
  job: any | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: job?.title || '',
    department: job?.department || '',
    location: job?.location || '',
    type: job?.type || 'Full-time',
    salary: job?.salary || '',
    openings: job?.openings || 1,
    description: job?.description || '',
    requirements: job?.requirements || '',
    responsibilities: job?.responsibilities || '',
    isActive: job?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5 col-span-2">
          <span className="text-xs font-semibold text-muted-foreground">Job Title *</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Wedding Production & Stage Lead"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Department *</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            placeholder="e.g. Wedding Operations"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Location *</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Hyderabad / Pan-India"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Job Type *</span>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Salary Range</span>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.salary}
            onChange={(e) => update('salary', e.target.value)}
            placeholder="e.g. ₹8.5L – ₹14L / yr"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Number of Openings</span>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={form.openings}
            onChange={(e) => update('openings', Number(e.target.value) || 1)}
          />
        </label>
      </div>

      <label className="space-y-1.5 block">
        <span className="text-xs font-semibold text-muted-foreground">Job Description *</span>
        <textarea
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Detailed job description..."
        />
      </label>

      <label className="space-y-1.5 block">
        <span className="text-xs font-semibold text-muted-foreground">
          Responsibilities * <span className="text-muted-foreground/60 font-normal">(one per line — displayed as bullet points on the website)</span>
        </span>
        <textarea
          required
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y"
          value={form.responsibilities}
          onChange={(e) => update('responsibilities', e.target.value)}
          placeholder={"Orchestrate on-site decor, lighting, and stage crews\nLiaise with luxury banquet properties\nEnforce MooNs Zero No-Show SLA"}
        />
      </label>

      <label className="space-y-1.5 block">
        <span className="text-xs font-semibold text-muted-foreground">
          Requirements * <span className="text-muted-foreground/60 font-normal">(one per line)</span>
        </span>
        <textarea
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y"
          value={form.requirements}
          onChange={(e) => update('requirements', e.target.value)}
          placeholder={"3+ years experience in luxury event production\nBilingual fluency (English + Hindi / Telugu)"}
        />
      </label>

      {job && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
            className="rounded border-border"
          />
          <span className="font-medium">Published on website</span>
        </label>
      )}

      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Button type="submit" className="flex-1 font-bold text-xs gap-1.5" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {job ? 'Update Job Posting' : 'Create Job Posting'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="text-xs font-semibold">
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ─── Main Page ─── */
function CareersAdminPage() {
  const loaderData = Route.useLoaderData() || {};
  const initialApps = loaderData.applications || [];
  const initialJobs = loaderData.jobs || [];

  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  // Applications state
  const [applications, setApplications] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'qualified' | 'all' | 'pending' | 'rejected'>('qualified');

  // Jobs state
  const [jobs, setJobs] = useState(initialJobs);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (filterTab === 'qualified') {
        return app.status === 'shortlisted' || (app.mock_test_score !== null && app.mock_test_score >= 75);
      }
      if (filterTab === 'pending') return app.status === 'pending';
      if (filterTab === 'rejected') {
        return app.status === 'rejected' || (app.mock_test_score !== null && app.mock_test_score < 75);
      }
      return true;
    });
  }, [applications, filterTab]);

  const stats = useMemo(() => {
    const total = applications.length;
    const qualified = applications.filter(
      (a) => a.status === 'shortlisted' || (a.mock_test_score !== null && a.mock_test_score >= 75),
    ).length;
    const scored = applications.filter((a) => a.mock_test_score !== null);
    const avgScore =
      scored.length > 0
        ? Math.round(scored.reduce((acc, curr) => acc + (curr.mock_test_score || 0), 0) / scored.length)
        : 0;
    return { total, qualified, avgScore };
  }, [applications]);

  const handleStatusUpdate = async (id: number, status: 'shortlisted' | 'rejected', email: string, name: string, jobTitle: string) => {
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

  const handleCreateJob = async (form: any) => {
    try {
      await adminCreateJobPosting({ data: form });
      const refreshed = await getCareersJobs();
      setJobs(refreshed || []);
      setJobFormOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJob = async (form: any) => {
    if (!editingJob) return;
    try {
      await adminUpdateJobPosting({ data: { ...form, id: editingJob.id } });
      const refreshed = await getCareersJobs();
      setJobs(refreshed || []);
      setEditingJob(null);
      setJobFormOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await adminDeleteJobPosting({ data: { id } });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateForm = () => { setEditingJob(null); setJobFormOpen(true); };
  const openEditForm = (job: any) => { setEditingJob(job); setJobFormOpen(true); };

  const activeJobCount = jobs.filter((j) => j.is_active).length;
  const totalOpenings = jobs.filter((j) => j.is_active).reduce((sum, j) => sum + (j.openings || 1), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Careers & Recruitment Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage job postings that appear on the website and review candidate applications.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        <button type="button" onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'jobs' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />Job Postings ({jobs.length})
        </button>
        <button type="button" onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'applications' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Users className="w-3.5 h-3.5 inline mr-1.5" />Applications ({stats.total})
        </button>
      </div>

      {/* ─── JOB POSTINGS TAB ─── */}
      {activeTab === 'jobs' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Eye className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-primary">{activeJobCount}</div><div className="text-xs text-muted-foreground font-semibold">Published on Website</div></div>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-foreground">{totalOpenings}</div><div className="text-xs text-muted-foreground font-semibold">Total Openings</div></div>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"><Award className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-foreground">{stats.qualified}</div><div className="text-xs text-muted-foreground font-semibold">Qualified Candidates</div></div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={openCreateForm} className="gap-1.5 font-bold text-xs"><Plus className="w-4 h-4" /> Create New Job Posting</Button>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Openings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} className={!job.is_active ? 'opacity-50' : ''}>
                    <TableCell><div className="font-semibold text-sm">{job.title}</div><div className="text-xs text-muted-foreground">{job.type}</div></TableCell>
                    <TableCell className="text-sm">{job.department}</TableCell>
                    <TableCell className="text-sm">{job.location}</TableCell>
                    <TableCell className="text-sm font-medium">{job.salary || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm font-bold">{job.openings || 1}</TableCell>
                    <TableCell>
                      <Badge variant={job.is_active ? 'default' : 'secondary'} className="text-[10px] font-bold">
                        {job.is_active ? <><Eye className="w-3 h-3 mr-1" /> Live</> : <><EyeOff className="w-3 h-3 mr-1" /> Draft</>}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary hover:bg-primary/10" onClick={() => openEditForm(job)} title="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteJob(job.id)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />No job postings yet. Create your first job posting to display it on the website.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Sheet open={jobFormOpen} onOpenChange={(open) => { if (!open) { setJobFormOpen(false); setEditingJob(null); } }}>
            <SheetContent className="sm:overflow-y-auto sm:max-w-lg">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-display">{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</SheetTitle>
                <SheetDescription>{editingJob ? 'Update this job posting. Changes will reflect on the website immediately.' : 'Fill in the details below. This posting will appear on the MooNs Events website careers page.'}</SheetDescription>
              </SheetHeader>
              <JobForm job={editingJob} onSave={editingJob ? handleUpdateJob : handleCreateJob} onCancel={() => { setJobFormOpen(false); setEditingJob(null); }} />
            </SheetContent>
          </Sheet>
        </>
      )}

      {/* ─── APPLICATIONS TAB ─── */}
      {activeTab === 'applications' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Award className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-primary">{stats.qualified}</div><div className="text-xs text-muted-foreground font-semibold">Qualified for Interview</div></div>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-foreground">{stats.avgScore}%</div><div className="text-xs text-muted-foreground font-semibold">Avg Event Reasoning Score</div></div>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-foreground">{stats.total}</div><div className="text-xs text-muted-foreground font-semibold">Total Submissions</div></div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Button variant={filterTab === 'qualified' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterTab('qualified')} className="text-xs font-bold gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Qualified & Shortlisted ({stats.qualified})</Button>
            <Button variant={filterTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterTab('all')} className="text-xs font-bold">All Applicants ({stats.total})</Button>
            <Button variant={filterTab === 'rejected' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterTab('rejected')} className="text-xs font-bold gap-1.5 text-muted-foreground"><XCircle className="w-3.5 h-3.5" />Below Benchmark (Archived)</Button>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Candidate</TableHead><TableHead>Role Applied</TableHead><TableHead>Applied Date</TableHead><TableHead>Reasoning Score</TableHead><TableHead>Recruitment Status</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredApps.map((app) => {
                  const isQualified = app.mock_test_score !== null && app.mock_test_score >= 75;
                  return (
                    <TableRow key={app.id} className={isQualified ? 'bg-emerald-500/5' : ''}>
                      <TableCell><div className="font-semibold text-sm">{app.name}</div><div className="text-xs text-muted-foreground">{app.email}</div></TableCell>
                      <TableCell><span className="font-medium text-sm">{app.job_title || 'Event Specialist'}</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(app.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {app.mock_test_score !== null ? (
                          <Badge variant={app.mock_test_score >= 75 ? 'default' : app.mock_test_score >= 50 ? 'secondary' : 'destructive'} className="font-bold text-xs gap-1">
                            {app.mock_test_score >= 75 && <CheckCircle2 className="w-3 h-3" />}{app.mock_test_score}%
                          </Badge>
                        ) : (<span className="text-muted-foreground text-xs">Pending Test</span>)}
                      </TableCell>
                      <TableCell><Badge variant={app.status === 'shortlisted' ? 'default' : app.status === 'pending' ? 'outline' : 'destructive'} className="capitalize text-xs font-semibold">{app.status}</Badge></TableCell>
                      <TableCell className="p-2 align-middle text-right">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10" onClick={() => setSelectedApp(app)}>View Profile & Test</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredApps.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />No candidates found in this view.</TableCell></TableRow>)}
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
                        <Badge variant="default" className="bg-emerald-600 text-white gap-1 text-[11px]"><CheckCircle2 className="w-3 h-3" /> Qualified Candidate</Badge>
                      )}
                    </div>
                    <SheetDescription>Applied for {selectedApp.job_title || 'Event Specialist Role'}</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 text-sm bg-muted/40 p-4 rounded-xl border border-border/50">
                      <div><span className="text-muted-foreground block text-xs font-semibold mb-1">Email</span><a href={`mailto:${selectedApp.email}`} className="flex items-center gap-1.5 text-primary hover:underline font-medium text-xs truncate"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{selectedApp.email}</span></a></div>
                      <div><span className="text-muted-foreground block text-xs font-semibold mb-1">Phone Number</span><span className="font-medium text-xs">{selectedApp.phone}</span></div>
                      <div><span className="text-muted-foreground block text-xs font-semibold mb-1">Application Date</span><span className="text-xs">{format(new Date(selectedApp.created_at), 'PPP')}</span></div>
                      <div><span className="text-muted-foreground block text-xs font-semibold mb-1">Current Status</span><Badge variant="outline" className="capitalize text-xs">{selectedApp.status}</Badge></div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm flex items-center gap-1.5 text-primary"><Zap className="w-4 h-4" />Event Scenario Reasoning Test</h4>
                        {selectedApp.mock_test_score !== null && (<Badge className="font-bold text-xs" variant={selectedApp.mock_test_score >= 75 ? 'default' : 'destructive'}>Score: {selectedApp.mock_test_score}%</Badge>)}
                      </div>
                      <div className="bg-card border rounded-xl p-4 text-sm shadow-sm space-y-3.5">
                        {selectedApp.mock_test_answers ? (
                          (() => {
                            let parsed = {};
                            try { parsed = typeof selectedApp.mock_test_answers === 'string' ? JSON.parse(selectedApp.mock_test_answers) : selectedApp.mock_test_answers; } catch { parsed = {}; }
                            const entries = Object.entries(parsed);
                            if (entries.length === 0) return <p className="text-muted-foreground text-xs">{String(selectedApp.mock_test_answers)}</p>;
                            return entries.map(([key, val], idx) => (
                              <div key={key} className="border-b last:border-0 pb-3 last:pb-0">
                                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1 text-primary">Scenario {idx + 1}</p>
                                <p className="text-xs text-foreground/90 font-medium leading-relaxed">{String(val)}</p>
                              </div>
                            ));
                          })()
                        ) : (<p className="text-muted-foreground text-xs">No test answers recorded.</p>)}
                      </div>
                    </div>

                    <div><h4 className="font-semibold text-sm mb-2">Profile & Experience Summary</h4><div className="bg-card border rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap shadow-sm text-foreground/90">{selectedApp.cover_letter || 'No additional notes provided.'}</div></div>

                    <div><h4 className="font-semibold text-sm mb-2">Resume / Portfolio</h4>
                      <a href={selectedApp.resume_url?.startsWith('http') ? selectedApp.resume_url : '#'} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="w-full flex justify-between items-center text-xs h-9"><span>Open Candidate Document</span><ExternalLink className="w-3.5 h-3.5 ml-2" /></Button>
                      </a>
                    </div>

                    <div className="pt-4 border-t border-border/50 flex gap-2">
                      {selectedApp.status !== 'shortlisted' && (
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5" onClick={() => handleStatusUpdate(selectedApp.id, 'shortlisted', selectedApp.email, selectedApp.name, selectedApp.job_title)} disabled={loading}><CheckCircle2 className="w-3.5 h-3.5" />Shortlist for Round 2</Button>
                      )}
                      {selectedApp.status !== 'rejected' && (
                        <Button size="sm" variant="outline" className="flex-1 border-rose-500/40 text-rose-600 hover:bg-rose-50 text-xs gap-1.5" onClick={() => handleStatusUpdate(selectedApp.id, 'rejected', selectedApp.email, selectedApp.name, selectedApp.job_title)} disabled={loading}><XCircle className="w-3.5 h-3.5" />Reject</Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
