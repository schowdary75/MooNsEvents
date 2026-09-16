/**
 * Visa application case tracking — turns the existing visa *content* CMS into
 * an actual case tracker so travellers stop asking "will my visa come in time?".
 * This is the pure state machine + guidance; a persistent `visa_cases` table
 * (additive migration) backs it in production.
 */

export type VisaStatus =
  | 'not_started'
  | 'documents_pending'
  | 'submitted'
  | 'under_review'
  | 'additional_docs_required'
  | 'approved'
  | 'rejected';

const TRANSITIONS: Record<VisaStatus, VisaStatus[]> = {
  not_started: ['documents_pending'],
  documents_pending: ['submitted'],
  submitted: ['under_review'],
  under_review: ['approved', 'rejected', 'additional_docs_required'],
  additional_docs_required: ['submitted'],
  approved: [],
  rejected: [],
};

const GUIDANCE: Record<VisaStatus, string> = {
  not_started: 'Share the event location and dates so we can open the permit file.',
  documents_pending: 'Upload the required credentials and supporting documents to proceed.',
  submitted: 'Permit application lodged and awaiting authority review.',
  under_review: 'The permit is under authority review. We are tracking it and will update you.',
  additional_docs_required: 'The authority requested more documents; action is needed now.',
  approved: 'Permit approved. The approved permit is ready for the event file.',
  rejected: 'Permit application rejected; our team will advise on re-application or alternatives.',
};

export function isTerminal(status: VisaStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function canTransition(from: VisaStatus, to: VisaStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface VisaCase {
  status: VisaStatus;
  destination: string;
  travelDate: Date;
  updatedAt: Date;
}

export interface VisaTransitionResult {
  ok: boolean;
  status: VisaStatus;
  guidance: string;
  error?: string;
}

/** Attempt a status change, enforcing the allowed lifecycle. */
export function advanceVisaCase(
  current: VisaCase,
  to: VisaStatus,
  now: Date = new Date(),
): VisaTransitionResult {
  if (!canTransition(current.status, to)) {
    return {
      ok: false,
      status: current.status,
      guidance: GUIDANCE[current.status],
      error: `Cannot move a permit case from "${current.status}" to "${to}".`,
    };
  }
  current.status = to;
  current.updatedAt = now;
  return { ok: true, status: to, guidance: GUIDANCE[to] };
}

/**
 * Flag cases at risk: still not approved with the travel date approaching.
 * Consulates typically need lead time, so anything inside `bufferDays` that is
 * not yet approved is a risk worth surfacing.
 */
export function isAtRisk(current: VisaCase, now: Date = new Date(), bufferDays = 14): boolean {
  if (current.status === 'approved') return false;
  const daysToTravel = Math.floor((current.travelDate.getTime() - now.getTime()) / 86_400_000);
  return daysToTravel <= bufferDays;
}

export function visaGuidance(status: VisaStatus): string {
  return GUIDANCE[status];
}
