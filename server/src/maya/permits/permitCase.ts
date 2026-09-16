/**
 * Permit application case tracking — turns the existing permit *content* CMS into
 * an actual case tracker so clients stop asking "will my permit come in time?".
 * This is the pure state machine + guidance; a persistent `permit_cases` table
 * (additive migration) backs it in production.
 */

export type PermitStatus =
  | 'not_started'
  | 'documents_pending'
  | 'submitted'
  | 'under_review'
  | 'additional_docs_required'
  | 'approved'
  | 'rejected';

const TRANSITIONS: Record<PermitStatus, PermitStatus[]> = {
  not_started: ['documents_pending'],
  documents_pending: ['submitted'],
  submitted: ['under_review'],
  under_review: ['approved', 'rejected', 'additional_docs_required'],
  additional_docs_required: ['submitted'],
  approved: [],
  rejected: [],
};

const GUIDANCE: Record<PermitStatus, string> = {
  not_started: 'Share the location and events dates so we can open the permit file.',
  documents_pending: 'Upload credential, photo and supporting documents to proceed.',
  submitted: 'Application lodged — awaiting the consulate to begin review.',
  under_review: 'Under consular review. We are tracking it and will update you.',
  additional_docs_required: 'The consulate asked for more documents — action needed now.',
  approved: 'Permit approved. Download the e-permit / collect the credential.',
  rejected: 'Application rejected — our team will advise on re-application or refund.',
};

export function isTerminal(status: PermitStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function canTransition(from: PermitStatus, to: PermitStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface PermitCase {
  status: PermitStatus;
  location: string;
  eventDate: Date;
  updatedAt: Date;
}

export interface PermitTransitionResult {
  ok: boolean;
  status: PermitStatus;
  guidance: string;
  error?: string;
}

/** Attempt a status change, enforcing the allowed lifecycle. */
export function advancePermitCase(
  current: PermitCase,
  to: PermitStatus,
  now: Date = new Date(),
): PermitTransitionResult {
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
 * Flag cases at risk: still not approved with the events date approaching.
 * Consulates typically need lead time, so anything inside `bufferDays` that is
 * not yet approved is a risk worth surfacing.
 */
export function isAtRisk(current: PermitCase, now: Date = new Date(), bufferDays = 14): boolean {
  if (current.status === 'approved') return false;
  const daysToEvent = Math.floor((current.eventDate.getTime() - now.getTime()) / 86_400_000);
  return daysToEvent <= bufferDays;
}

export function permitGuidance(status: PermitStatus): string {
  return GUIDANCE[status];
}
