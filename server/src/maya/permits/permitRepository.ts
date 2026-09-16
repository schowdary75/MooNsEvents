import type { MayaDeps } from '../types.js';
import {
  advancePermitCase,
  isAtRisk,
  permitGuidance,
  type PermitCase,
  type PermitStatus,
} from './permitCase.js';

/**
 * Persistence for permit cases on top of the additive `permit_cases` table. The
 * lifecycle rules live in permitCase.ts; this layer just loads/saves and surfaces
 * the at-risk view the ops team needs.
 */

export interface PermitCaseRow {
  id: number;
  location: string;
  eventDate: Date;
  status: PermitStatus;
  guidance: string;
  atRisk: boolean;
  updatedAt: Date;
}

function toRow(
  r: { id: number; location: string; event_date: Date; status: string; updated_at: Date },
  now: Date,
): PermitCaseRow {
  const status = r.status as PermitStatus;
  const model: PermitCase = {
    status,
    location: r.location,
    eventDate: r.event_date,
    updatedAt: r.updated_at,
  };
  return {
    id: r.id,
    location: r.location,
    eventDate: r.event_date,
    status,
    guidance: permitGuidance(status),
    atRisk: isAtRisk(model, now),
    updatedAt: r.updated_at,
  };
}

export async function createPermitCase(
  deps: MayaDeps,
  input: {
    location: string;
    eventDate: Date;
    leadId?: number | null;
    customerId?: number | null;
  },
): Promise<PermitCaseRow> {
  const row = await deps.prisma.permit_cases.create({
    data: {
      location: input.location,
      event_date: input.eventDate,
      lead_id: input.leadId ?? null,
      customer_id: input.customerId ?? null,
      status: 'not_started',
    },
  });
  return toRow(row, deps.now());
}

export async function listPermitCases(deps: MayaDeps): Promise<PermitCaseRow[]> {
  const rows = await deps.prisma.permit_cases.findMany({
    orderBy: { event_date: 'asc' },
    take: 500,
  });
  const now = deps.now();
  return rows.map((r) => toRow(r, now));
}

/** Move a case forward, enforcing the lifecycle, and persist the new status. */
export async function advanceCase(
  deps: MayaDeps,
  caseId: number,
  to: PermitStatus,
): Promise<{ ok: boolean; status: PermitStatus; guidance: string; error?: string }> {
  const existing = await deps.prisma.permit_cases.findUnique({ where: { id: caseId } });
  if (!existing)
    return { ok: false, status: 'not_started', guidance: '', error: 'Permit case not found.' };

  const model: PermitCase = {
    status: existing.status as PermitStatus,
    location: existing.location,
    eventDate: existing.event_date,
    updatedAt: existing.updated_at,
  };
  const result = advancePermitCase(model, to, deps.now());
  if (!result.ok) return result;

  await deps.prisma.permit_cases.update({
    where: { id: caseId },
    data: { status: result.status, updated_at: deps.now() },
  });
  await deps.logActivity(
    'permit',
    'status_change',
    caseId,
    `Permit case #${caseId} → ${result.status}.`,
  );
  return result;
}
