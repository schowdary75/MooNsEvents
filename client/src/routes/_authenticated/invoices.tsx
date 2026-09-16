// @ts-nocheck -- behavior-parity screen pending incremental type hardening.
import { useEffect, useState, type ReactNode } from 'react';
import { createFileRoute } from '@/lib/routerCompat';
import { toast } from '@/lib/toast';
import {
  FileText,
  IndianRupee,
  CheckCircle2,
  Copy,
  Send,
  Loader2,
  Eye,
  CalendarDays,
  MapPin,
  Phone,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAdminInvoices, adminResendInvoice, type AdminInvoiceRow } from '@/lib/api/db.functions';
import { useAuth } from '@/components/auth-context';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/_authenticated/invoices')({
  component: InvoicesPage,
});

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{display}</span>;
}

function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<AdminInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoiceRow | null>(null);
  const auth = user?.session_token ? { email: user.email, sessionToken: user.session_token } : null;

  async function load() {
    if (!auth) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setInvoices(await getAdminInvoices({ data: { auth } }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user?.session_token]);

  const copyInvoice = (invoiceNumber: string) => {
    navigator.clipboard.writeText(invoiceNumber);
    toast.success('Invoice number copied to clipboard');
  };

  const printInvoice = () => {
    const invoiceDocument = document.getElementById('invoice-document');
    if (!invoiceDocument) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      toast.error('Allow pop-ups to print this invoice');
      return;
    }

    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('');

    printWindow.document.write(`<!doctype html><html><head><title>Invoice</title>
      ${stylesheets}
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 32px; color: #18181b; font-family: Arial, sans-serif; }
        img { max-width: 100%; }
        button { display: none !important; }
        @page { size: A4; margin: 12mm; }
        @media print { body { padding: 0; } }
      </style></head><body>${invoiceDocument.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const [resendingId, setResendingId] = useState<number | null>(null);
  const resendInvoice = async (invoice: AdminInvoiceRow) => {
    if (!auth) return;
    setResendingId(invoice.id);
    try {
      await adminResendInvoice({ data: { auth, invoiceId: invoice.id } });
      toast.success(`Invoice ${invoice.invoice_number} sent to ${invoice.customer_email}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setResendingId(null);
    }
  };

  const totalInvoices = invoices.length;
  const sentInvoices = invoices.filter((i) => i.status === 'sent').length;
  const totalAmount = invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div />

      {/* Metric Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <div
          className="glass-card rounded-xl p-4 animate-slide-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Invoices
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            <AnimatedCounter value={totalInvoices} />
          </div>
        </div>
        <div
          className="glass-card rounded-xl p-4 animate-slide-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sent to Customers
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            <AnimatedCounter value={sentInvoices} />
          </div>
        </div>
        <div
          className="glass-card rounded-xl p-4 animate-slide-up"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Amount Billed
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                Invoice / Booking
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                Amount
              </TableHead>
              <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />{' '}
                    Loading invoices...
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No invoices generated yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice, idx) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer transition-all hover:bg-muted/30 animate-slide-up"
                  style={{ animationDelay: `${idx * 25}ms` }}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <TableCell>
                    <div className="font-semibold text-sm">
                      {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {invoice.invoice_number}
                      <Badge
                        variant={invoice.status === 'sent' ? 'default' : 'secondary'}
                        className={`text-[9px] uppercase ${invoice.status === 'sent' ? 'bg-emerald-600' : ''}`}
                      >
                        {invoice.status === 'sent' ? 'Sent' : 'Generated'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Booking Ref: {invoice.booking_reference}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                        {invoice.customer_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{invoice.customer_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {invoice.customer_email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-sm text-primary">
                      ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 align-middle text-right">
                    <div
                      className="flex w-full items-center justify-end gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs bg-background hover:bg-muted border border-border rounded-md"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs bg-background hover:bg-muted border border-border rounded-md"
                        onClick={() => copyInvoice(invoice.invoice_number)}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        Copy INV
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs bg-background hover:bg-muted border border-border rounded-md"
                        disabled={resendingId === invoice.id}
                        onClick={() => resendInvoice(invoice)}
                      >
                        {resendingId === invoice.id ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        {invoice.status === 'sent' ? 'Resend' : 'Send'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="max-h-[94vh] max-w-4xl overflow-y-auto p-0">
          {selectedInvoice && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Invoice {selectedInvoice.invoice_number}</DialogTitle>
                <DialogDescription>
                  Detailed invoice for booking {selectedInvoice.booking_reference}
                </DialogDescription>
              </DialogHeader>

              <div id="invoice-document" className="invoice-document bg-white text-zinc-900">
                <header className="invoice-header flex flex-col gap-6 border-b-2 border-zinc-900 px-6 pb-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
                  <div>
                    <img
                      src="/logo.png"
                      alt="MooN"
                      className="invoice-logo h-auto w-36 object-contain object-left"
                    />
                    <p className="mt-3 text-xs font-medium text-zinc-500">
                      Event experiences & production
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-2xl font-bold uppercase text-zinc-900">Tax invoice</div>
                    <div className="mt-2 font-mono text-sm font-semibold">
                      {selectedInvoice.invoice_number}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      {selectedInvoice.status === 'sent' ? 'Sent to customer' : 'Generated'}
                    </div>
                  </div>
                </header>

                <div className="invoice-body space-y-8 px-6 py-7 sm:px-10">
                  <section className="grid gap-7 sm:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <InvoiceSectionLabel>Billed to</InvoiceSectionLabel>
                      <div className="mt-3 text-base font-bold">
                        {selectedInvoice.customer_name || 'Customer'}
                      </div>
                      <div className="mt-1 break-all text-sm text-zinc-600">
                        {selectedInvoice.customer_email || 'Email not provided'}
                      </div>
                      {selectedInvoice.customer_phone && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                          <Phone className="h-3.5 w-3.5" />
                          {selectedInvoice.customer_phone}
                        </div>
                      )}
                      {formatBillingAddress(selectedInvoice) && (
                        <div className="mt-2 flex max-w-sm items-start gap-2 text-sm leading-5 text-zinc-600">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {formatBillingAddress(selectedInvoice)}
                        </div>
                      )}
                    </div>

                    <dl className="invoice-meta grid grid-cols-2 gap-x-4 gap-y-3 border-l-0 border-zinc-200 sm:border-l sm:pl-7">
                      <InvoiceMeta
                        label="Invoice date"
                        value={formatInvoiceDay(selectedInvoice.created_at)}
                      />
                      <InvoiceMeta label="Currency" value="INR" />
                      <InvoiceMeta label="Booking ref." value={selectedInvoice.booking_reference} />
                      <InvoiceMeta label="Invoice ID" value={`#${selectedInvoice.id}`} />
                    </dl>
                  </section>

                  <section className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
                    <InvoiceSectionLabel>Event booking</InvoiceSectionLabel>
                    <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="font-semibold">
                          {selectedInvoice.item_name || selectedInvoice.booking_reference}
                        </div>
                        <div className="mt-1 text-xs capitalize text-zinc-500">
                          {selectedInvoice.item_type || 'Event service'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                        <CalendarDays className="h-4 w-4" />
                        {formatEventDate(selectedInvoice.event_date)}
                      </div>
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-md border border-zinc-200">
                    <div className="invoice-line-header grid grid-cols-[1fr_56px_110px] bg-zinc-900 px-4 py-3 text-[10px] font-bold uppercase text-white sm:grid-cols-[1fr_70px_140px]">
                      <span>Description</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="invoice-line grid grid-cols-[1fr_56px_110px] items-start px-4 py-5 text-sm sm:grid-cols-[1fr_70px_140px]">
                      <div className="pr-3">
                        <div className="font-semibold">
                          {selectedInvoice.item_name || 'Event booking service'}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-zinc-500">
                          Booking {selectedInvoice.booking_reference}
                        </div>
                      </div>
                      <div className="text-center">1</div>
                      <div className="text-right font-mono font-semibold">
                        {formatCurrency(selectedInvoice.amount)}
                      </div>
                    </div>
                  </section>

                  <section className="flex justify-end">
                    <div className="invoice-totals w-full max-w-sm space-y-3">
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>Taxes</span>
                        <span>Included / as applicable</span>
                      </div>
                      <div className="flex items-center justify-between border-t-2 border-zinc-900 pt-3">
                        <div>
                          <div className="text-xs font-bold uppercase text-zinc-500">Total</div>
                          <div className="text-[10px] text-zinc-400">Indian Rupees</div>
                        </div>
                        <div className="font-mono text-xl font-bold">
                          {formatCurrency(selectedInvoice.amount)}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-5 border-t border-zinc-200 pt-6 sm:grid-cols-2">
                    <div>
                      <InvoiceSectionLabel>Payment status</InvoiceSectionLabel>
                      <p className="mt-2 text-sm font-semibold text-emerald-700">
                        Invoice {selectedInvoice.status === 'sent' ? 'delivered' : 'ready to send'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Quote this invoice number and booking reference in all payment
                        correspondence.
                      </p>
                    </div>
                    <div>
                      <InvoiceSectionLabel>Notes</InvoiceSectionLabel>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Thank you for choosing MooN. This invoice is linked to booking{' '}
                        {selectedInvoice.booking_reference}.
                      </p>
                    </div>
                  </section>
                </div>

                <footer className="invoice-footer flex flex-col gap-1 border-t border-zinc-200 bg-zinc-50 px-6 py-4 text-[10px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                  <span>MooN · Event experiences & production</span>
                  <span>System generated invoice · No signature required</span>
                </footer>
              </div>

              <DialogFooter className="flex-row flex-wrap gap-2 border-t border-border/60 px-6 py-4 sm:space-x-0">
                <Button variant="outline" onClick={printInvoice}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyInvoice(selectedInvoice.invoice_number)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy number
                </Button>
                <Button
                  onClick={() => resendInvoice(selectedInvoice)}
                  disabled={resendingId === selectedInvoice.id}
                >
                  {resendingId === selectedInvoice.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {selectedInvoice.status === 'sent' ? 'Resend invoice' : 'Send invoice'}
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatInvoiceDay(value: string | null) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatEventDate(value: string | null) {
  if (!value) return 'Date to be confirmed';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value: number | string) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatBillingAddress(invoice: AdminInvoiceRow) {
  return [
    invoice.customer_address,
    [invoice.customer_city, invoice.customer_state, invoice.customer_postal_code]
      .filter(Boolean)
      .join(' '),
    invoice.customer_country,
  ]
    .filter(Boolean)
    .join(', ');
}

function InvoiceSectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-bold uppercase text-zinc-500">{children}</div>;
}

function InvoiceMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-xs font-semibold text-zinc-900">{value}</dd>
    </div>
  );
}
