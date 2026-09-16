/**
 * Event-facing domain adapter.
 *
 * The restored MooNsConfig database keeps its proven canonical table names for
 * migration compatibility. This module exposes those complete implementations
 * to the event CRM without duplicating or weakening their transaction logic.
 */
import { prisma } from '../config/prisma.js';
import {
  acceptQuote,
  addQuoteComment,
  createCustomerTravelDocumentUpload,
  customerTravelDocumentDownload,
  customerTravellerHub,
  ensureCanonicalTripForBooking,
  ensureTravellerForContact,
  ensureTravellerForCustomer,
  recordProposalView,
  traveller360,
  tripWorkspace,
} from './travelDomainService.js';

export const ensureClientForContact = ensureTravellerForContact;
export const ensureClientForCustomer = ensureTravellerForCustomer;
export const ensureCanonicalEventForBooking = ensureCanonicalTripForBooking;
export const client360 = traveller360;
export const eventWorkspace = tripWorkspace;
export { acceptQuote, addQuoteComment, recordProposalView };
export const customerClientHub = customerTravellerHub;
export const createCustomerEventDocumentUpload = createCustomerTravelDocumentUpload;
export const customerEventDocumentDownload = customerTravelDocumentDownload;

export const eventDomainService = {
  async getSummary(id: string) {
    return eventWorkspace(id);
  },
  async listEvents() {
    return prisma.travelTrip.findMany({ orderBy: { updatedAt: 'desc' }, take: 200 });
  },
};
