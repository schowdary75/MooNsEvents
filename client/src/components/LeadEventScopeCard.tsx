import { useEffect, useState } from 'react';
import {
  Armchair,
  Bus,
  Calendar,
  Camera,
  CheckCircle2,
  Crown,
  FileText,
  HeartHandshake,
  IndianRupee,
  Mail,
  Phone,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/lib/routerCompat';

interface LeadEventScopeProps {
  notes?: string | null;
  leadId: number;
  leadName: string;
  budgetRange?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function LeadEventScopeCard({
  notes,
  leadId,
  leadName,
  budgetRange,
  phone,
  email,
}: LeadEventScopeProps) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [confirmedItems, setConfirmedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPrices({});
    setConfirmedItems({});
  }, [leadId, notes]);

  if (!notes) return null;

  const isWizardBrief =
    notes.includes('[Wizard Event Brief]') ||
    notes.includes('Decor:') ||
    notes.includes('Seating:');

  if (!isWizardBrief) {
    return (
      <div className="rounded-lg bg-muted/40 p-3.5 text-sm border border-border/40 text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {notes}
      </div>
    );
  }

  const lines = notes.split('\n');
  const getVal = (prefix: string) => {
    const line = lines.find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!line) return '';
    return line.substring(line.indexOf(':') + 1).trim();
  };

  const occasion = getVal('Occasion') || getVal('[Wizard Event Brief] Occasion');
  const dateStr = getVal('Date');
  const isUrgent = notes.toLowerCase().includes('urgent');
  const estimatedTotal = getVal('Estimated Total') || budgetRange || '';
  const clientNotes = getVal('Client Notes');

  const scopeItems = [
    {
      id: 'decor',
      label: 'Décor & Stage Styling',
      value: getVal('Decor'),
      icon: Crown,
      iconClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'seating',
      label: 'Seating & Dining Layout',
      value: getVal('Seating'),
      icon: Armchair,
      iconClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'catering',
      label: 'Catering & Buffet',
      value: getVal('Catering'),
      icon: UtensilsCrossed,
      iconClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'media',
      label: 'Photography, Film & 4K Drone',
      value: getVal('Media & Drone') || getVal('Media'),
      icon: Camera,
      iconClass: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    },
    {
      id: 'transport',
      label: 'Guest Logistics & Vehicle Fleet',
      value: getVal('Transport Fleet') || getVal('Transport'),
      icon: Bus,
      iconClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'hospitality',
      label: 'Welcome Hostesses & Valet Staff',
      value: getVal('Hospitality Crew') || getVal('Hospitality'),
      icon: HeartHandshake,
      iconClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
  ].filter((item) => Boolean(item.value));

  const confirmedCount = scopeItems.filter((item) => confirmedItems[item.id]).length;
  const allPricesConfirmed = scopeItems.length > 0 && confirmedCount === scopeItems.length;
  const finalisedTotal = scopeItems.reduce(
    (total, item) => total + (Number(prices[item.id]) || 0),
    0,
  );

  const updatePrice = (itemId: string, value: string) => {
    setPrices((current) => ({ ...current, [itemId]: value }));
    setConfirmedItems((current) => ({ ...current, [itemId]: false }));
  };

  const confirmPrice = (itemId: string) => {
    if (Number(prices[itemId]) > 0) {
      setConfirmedItems((current) => ({ ...current, [itemId]: true }));
    }
  };

  const proposalPrices = scopeItems.map((item) => ({
    category: item.label,
    name: item.value,
    price: Number(prices[item.id]),
  }));

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/10 via-background to-muted/20 p-4 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Event Builder Scope</span>
        </div>
        {isUrgent ? (
          <Badge variant="destructive" className="animate-pulse gap-1 text-[11px] font-bold">
            <Zap className="w-3 h-3" /> URGENT RUSH LEAD
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[11px]">
            Price confirmation pending
          </Badge>
        )}
      </div>

      {(occasion || dateStr) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {occasion && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
              <Crown className="w-3.5 h-3.5" />
              <span>{occasion}</span>
            </div>
          )}
          {dateStr && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr.replace('(URGENT LAST-MINUTE BOOKING)', '').trim()}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-2 text-xs">
        {scopeItems.map((item) => {
          const Icon = item.icon;
          const isConfirmed = Boolean(confirmedItems[item.id]);
          const hasValidPrice = Number(prices[item.id]) > 0;

          return (
            <div
              key={item.id}
              className={`p-2 rounded-lg bg-background/80 border ${
                isConfirmed ? 'border-emerald-500/40' : 'border-border/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-6 h-6 rounded-md ${item.iconClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="font-semibold text-foreground">{item.value}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {phone ? (
                    <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                      <a
                        href={`tel:${phone}`}
                        aria-label={`Call ${leadName} about ${item.label}`}
                        title={`Call ${leadName}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled>
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {email ? (
                    <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(`Final price for ${item.label}`)}`}
                        aria-label={`Email ${leadName} about ${item.label}`}
                        title={`Email ${leadName}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled>
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-2 pl-8 flex items-center gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    className="h-8 pl-7 text-xs"
                    placeholder="Enter final price"
                    value={prices[item.id] ?? ''}
                    onChange={(event) => updatePrice(item.id, event.target.value)}
                    aria-label={`Final price for ${item.label}`}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isConfirmed ? 'secondary' : 'outline'}
                  className={`h-8 px-2 text-[11px] ${
                    isConfirmed ? 'text-emerald-700 dark:text-emerald-300' : ''
                  }`}
                  disabled={!hasValidPrice || isConfirmed}
                  onClick={() => confirmPrice(item.id)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isConfirmed ? 'Confirmed' : 'Confirm'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {clientNotes && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
          <span className="font-bold text-amber-700 dark:text-amber-300">Client Note: </span>
          <span className="text-foreground/90">{clientNotes}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border/40 space-y-2">
        <div className="flex items-end justify-between gap-3">
          {estimatedTotal && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Client Estimated Value
              </div>
              <div className="text-base font-extrabold text-primary">
                {estimatedTotal.startsWith('₹') ? estimatedTotal : `₹${estimatedTotal}`}
              </div>
            </div>
          )}
          <div className="text-right ml-auto">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Finalised total
            </div>
            <div className="text-base font-extrabold text-emerald-600">
              ₹{finalisedTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            {confirmedCount} of {scopeItems.length} prices confirmed
          </span>
          {allPricesConfirmed ? (
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
              asChild
            >
              <Link
                to="/quotes"
                search={{
                  leadId,
                  finalisedTotal,
                  scopePrices: JSON.stringify(proposalPrices),
                }}
              >
                <FileText className="w-3.5 h-3.5" /> Generate Proposal
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 text-xs font-bold shadow-sm"
              disabled
              title="Confirm every service price to generate the proposal"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Proposal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
