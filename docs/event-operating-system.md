# Event operating system

The runtime is organized around five connected aggregates:

1. `Lead` captures the event enquiry and qualification state.
2. `EventPackage` defines a publishable, versioned offer with pricing and availability.
3. `Booking` preserves the accepted commercial scope and payment lifecycle.
4. `EventProject` owns planning, guests, resources, logistics, and the run of show.
5. `VendorProfile` and `VendorService` represent the event supply network.

MooNsEWeb consumes `/public/catalog/*` and `/customer/*`. The internal CRM consumes `/crm/*`. Both send the same `x-tenant-id`, while customer endpoints additionally require a verified consumer OIDC token.

Maya runs through `/crm/ai`. Its prompts are event-specific, factual uncertainty is explicit, and consequential actions remain human-controlled.

The committed migration chain is a clean event-domain baseline. Deploy it to a new event CRM database; preserve and export any older database before switching environments.
