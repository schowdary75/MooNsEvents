# MooNsEvents features

MooNsEvents follows an event from enquiry through commercial approval, planning, production, event-day delivery, and post-event settlement.

## CRM and sales

- Lead capture with event type, date, guest count, budget, source, status, score, owner, and follow-up
- Customer and family profiles
- Versioned quotations, line items, negotiations, electronic acceptance, and approval controls
- Conversion into event bookings and projects

## Packages and public catalog

- Event groups and event types
- Versioned packages, guest tiers, included components, selectable add-ons, and tax/deposit rules
- Location-specific pricing, date rules, capacity, overrides, and expiring holds
- Verified vendor offerings published to event types
- Search-friendly public catalog used directly by MooNsEWeb

## Event planning and production

- Event projects with progress and lifecycle state
- Tasks, checklists, dependencies, version history, and checker approvals
- Ceremonies, comments, media, and shared files
- Run-of-show schedules with owners, locations, status, timing, and notes
- Resource availability and allocations for staff, equipment, venue spaces, and vendor resources
- Event logistics, issue handling, contingency planning, and event-day coordination

## Guests

- Households and guest records
- RSVP state, party size, dietary notes, invitations, and response timestamps
- Seating tables, seat assignments, QR-safe check-in events, and duplicate-scan protection
- Customer-managed guest updates through the private event portal

## Vendors

- Vendor categories, profiles, portfolios, services, coverage, and verification
- Availability, public listings, customer reviews, service publications, and marketplace requests
- Protected bank details, disputes, and auditable approval decisions

## Commerce

- Package snapshots preserved at booking time
- Deposit checkout sessions and provider references
- Payments, invoices, contracts, schedules, amendments, refunds, budgets, and ledger entries
- Idempotency for holds and checkout operations

## Maya Event AI

- Event concept and execution-plan generation
- Event lead scoring and next-best-action guidance
- Vendor scopes with deliverables and acceptance criteria
- Risk reviews for venue, safety, crowd, schedule, vendor, weather, compliance, and budget concerns
- Customer and vendor communication drafts
- Event-only system instructions and explicit uncertainty handling
- Human approval required for external, financial, contractual, or booking actions
- Deterministic event fallback when no model provider is configured

## Customer website

- Event-type and package discovery
- Location and date availability
- Guest tiers and add-on configuration
- Secure 15-minute holds and deposit checkout
- Private event area for guests, documents, messages, milestones, invoices, contracts, and amendment requests
- Dedicated customer identity scope with no CRM membership

## Platform controls

- Tenant-scoped records and tenant-aware API requests
- Optional CRM bearer token and verified consumer OIDC tokens
- Security headers, CORS allowlist, request size limits, and controlled uploads
- Immutable booking snapshots and auditable approval paths
