/**
 * Credential & document rule engine — attacks the "will my credential be accepted?"
 * anxiety with the single most common cause of denied boarding: the six-month
 * validity rule. `assessCredential` is pure and exact; the vault interface is the
 * storage seam (an additive `client_documents` table enables persistence).
 */

export interface CredentialAssessment {
  valid: boolean;
  /** Whole months of validity remaining at the events date. */
  monthsValidAtEvent: number;
  /** Most locations require 6 months' validity beyond entry. */
  sixMonthRuleOk: boolean;
  expired: boolean;
  alert: string | null;
}

const MONTH_MS = 30 * 86_400_000;

export function assessCredential(
  credentialExpiry: Date,
  eventDate: Date,
  now: Date = new Date(),
): CredentialAssessment {
  const expired = credentialExpiry.getTime() <= now.getTime();
  const monthsValidAtEvent = Math.floor(
    (credentialExpiry.getTime() - eventDate.getTime()) / MONTH_MS,
  );
  const sixMonthRuleOk = monthsValidAtEvent >= 6;

  let alert: string | null = null;
  if (expired) {
    alert = 'Credential has already expired and must be renewed before the event.';
  } else if (credentialExpiry.getTime() <= eventDate.getTime()) {
    alert = 'Credential expires on or before the events date — renew immediately.';
  } else if (!sixMonthRuleOk) {
    alert = `Credential is valid for only ${Math.max(
      0,
      monthsValidAtEvent,
    )} month(s) beyond events. Most countries require 6 months — advise the client to renew.`;
  }

  return {
    valid: !expired && sixMonthRuleOk,
    monthsValidAtEvent,
    sixMonthRuleOk,
    expired,
    alert,
  };
}

export interface StoredDocument {
  id: string;
  clientRef: string;
  type: 'credential' | 'permit' | 'id' | 'other';
  fileUrl: string;
  expiresOn?: Date | null;
}

/**
 * Document vault storage seam. The in-memory fallback lets the feature run in
 * dev; production swaps in a persistent implementation backed by an additive
 * `client_documents` table + the existing secure upload service.
 */
export interface DocumentVault {
  put(doc: Omit<StoredDocument, 'id'>): Promise<StoredDocument>;
  listFor(clientRef: string): Promise<StoredDocument[]>;
}

export class InMemoryDocumentVault implements DocumentVault {
  private readonly store = new Map<string, StoredDocument[]>();
  private seq = 0;

  async put(doc: Omit<StoredDocument, 'id'>): Promise<StoredDocument> {
    const saved: StoredDocument = { id: `doc_${++this.seq}`, ...doc };
    const list = this.store.get(doc.clientRef) ?? [];
    list.push(saved);
    this.store.set(doc.clientRef, list);
    return saved;
  }

  async listFor(clientRef: string): Promise<StoredDocument[]> {
    return this.store.get(clientRef) ?? [];
  }
}

export const documentVault: DocumentVault = new InMemoryDocumentVault();
