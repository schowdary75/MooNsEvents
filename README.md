<p align="center">
  <img src="client/public/logo.png" alt="MooN logo" width="220" />
</p>

<h1 align="center">MooNsEvents</h1>

<p align="center">
  <strong>The open-source operating system for events and experiences—from first enquiry to post-event settlement.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-24-5FA04E?style=flat-square&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js 24" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript 5" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&amp;logo=react&amp;logoColor=111827" alt="React 19" /></a>
  <a href="https://docs.docker.com/compose/"><img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&amp;logo=docker&amp;logoColor=white" alt="Docker Compose" /></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/security-policy-2ea44f?style=flat-square&amp;logo=github" alt="Security policy" /></a>
</p>

<p align="center">
  <a href="https://github.com/schowdary75/MooNsEvents"><img src="https://img.shields.io/github/stars/schowdary75/MooNsEvents?style=flat-square&amp;logo=github&amp;cacheSeconds=1800" alt="GitHub stars" /></a>
  <a href="https://github.com/schowdary75/MooNsEvents/forks"><img src="https://img.shields.io/github/forks/schowdary75/MooNsEvents?style=flat-square&amp;logo=github" alt="GitHub forks" /></a>
  <a href="https://github.com/schowdary75/MooNsEvents/graphs/contributors"><img src="https://img.shields.io/github/contributors/schowdary75/MooNsEvents?style=flat-square&amp;logo=github" alt="GitHub contributors" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-6f42c1?style=flat-square" alt="Contributions welcome" /></a>
  <a href="docs/PRODUCT_TOUR.md"><img src="https://img.shields.io/badge/product-tour-2C847C?style=flat-square&amp;logo=googlechrome&amp;logoColor=white" alt="Product tour" /></a>
</p>

<p align="center">
  <a href="docs/community/HALL_OF_FAME.md"><img src="https://img.shields.io/badge/community-Hall_of_Fame-D4AF37?style=flat-square&amp;logo=githubsponsors&amp;logoColor=white" alt="Hall of Fame" /></a>
  <a href="docs/community/RECOGNITION.md#roadmap-champions"><img src="https://img.shields.io/badge/recognition-Roadmap_Champions-6F42C1?style=flat-square&amp;logo=gitbook&amp;logoColor=white" alt="Roadmap Champions" /></a>
  <a href="docs/community/CERTIFICATES.md"><img src="https://img.shields.io/badge/contributors-digital_certificates-0E8A16?style=flat-square&amp;logo=credly&amp;logoColor=white" alt="Contributor certificates" /></a>
</p>

MooNsEvents connects event CRM, package &amp; tier curation, guest lists, RSVPs, seating &amp; QR check-in, supplier RFQs, quotations, bookings, run-of-show production schedules, payments, customer event portal, and Maya-assisted workflows in one multi-tenant platform.

> **Ready to use:** The included stack runs the core CRM, event packages, quotations, bookings, projects, run-of-show schedules, guest lists, seating, vendors, and operations workflows locally. Provider-backed features such as AI, email, telephony, payments, SSO, and WhatsApp become available after you add your own credentials. Complete the [production-readiness checklist](docs/PRODUCTION_READINESS.md) before handling real customer, payment, or guest identity data.

## Start here — choose what you want to do

**Every bold title in the first column is a link.** Choose the path that matches what you want to do:

| Start here | What you will find |
| --- | --- |
| 🚀 **[Install and run MooNsEvents →](docs/GETTING_STARTED.md)** | Windows, Linux, macOS, Docker, native development, login, stopping, and troubleshooting |
| ✨ **[Explore every feature →](docs/FEATURES.md)** | Maya AI, CRM, packages, run of show, guest lists, seating, vendors, RFQs, chat, and operations |
| 🎬 **[Open the product showcase tour →](docs/PRODUCT_TOUR.md)** | Direct, privacy-safe captures from the running application and guided workflow |
| 📊 **[Check what is ready →](docs/PROJECT_STATUS.md)** | Local capabilities, provider requirements, limitations, and maturity |
| 🤝 **[Make your first contribution →](CONTRIBUTING.md)** | Fork, clone, branch, test, push, open a pull request, and earn recognition |
| 🛡️ **[Read the security policy →](SECURITY.md)** | Private vulnerability reporting and rules for protecting client and guest data |
| 💬 **[Get project support →](SUPPORT.md)** | Setup questions, bug reports, feature requests, and safe support channels |
| 🧭 **[Understand project governance →](GOVERNANCE.md)** | Maintainer roles, decisions, reviews, releases, and roadmap ownership |

Repository documents are also available through GitHub's **README**, **Contributing**, **Code of conduct**, **MIT license**, and **Security** tabs above this page.

## See the application before installing

[**Click here to open the product tour →**](docs/PRODUCT_TOUR.md)

The tour uses direct, privacy-safe captures from the running application—not UI mock-ups. Any visible lead data is deliberately fictional.

![MooNsEvents operations dashboard](docs/images/product/dashboard.png)

[**View the full screenshot tour →**](docs/PRODUCT_TOUR.md)

## Who MooNsEvents is for

- **Event Management Companies & Agencies** replacing disjointed spreadsheets, forms, and point tools.
- **Wedding Planners & Experiential Producers** designing bespoke timelines, guest arrangements, and curated packages.
- **Venues & Destination Coordinators** managing multi-space availability, verified supplier networks, and run-of-show logistics.
- **Corporate Event & Conference Organizers** tracking sponsorship packages, approvals, budgets, and attendee check-ins.
- **Engineering Teams & SaaS Developers** seeking a robust, multi-tenant event operating system baseline built with TypeScript, React 19, and Node.js.

## One connected event journey

```mermaid
flowchart LR
  A["1. Capture Enquiry"] --> B["2. Qualify & Triage"]
  B --> C["3. Curate Packages"]
  C --> D["4. Run-of-Show & Tasks"]
  D --> E["5. Vendor Outreach & RFQs"]
  E --> F["6. Quote & Book"]
  F --> G["7. Live Check-in & Event Ops"]
  G --> H["8. Settle & Support"]
```

1. **Capture the enquiry.** Receive an event lead through website forms, customer chat, incoming phone calls, or WhatsApp.
2. **Qualify and triage.** Score event viability, record dates, guest counts, budget, aesthetic preferences, and assign an event director.
3. **Curate the package.** Build tiered packages (Silver, Gold, Platinum, VIP) with venue options, catering styles, decor add-ons, and expiring hold locks.
4. **Build the run-of-show.** Plan minute-by-minute cues, milestones, checklists, stage cues, ceremony breakdowns, and resource assignments.
5. **Request supplier rates.** Dispatch RFQs to verified florists, caterers, audiovisual crews, and photographers; track responses and proposals.
6. **Quote and confirm.** Generate versioned proposals and contracts, collect client e-signatures, confirm deposits, and establish payment schedules.
7. **Run the live event.** Coordinate staff, manage guest RSVPs, seating charts, and real-time QR ticket scanning with duplicate-check protection.
8. **Settle and support.** Process final invoices, vendor payouts, incident reviews, attendee surveys, and post-event customer follow-up.

---

## Feature highlights

MooNsEvents is architected across ten dedicated modules to manage every phase of the event lifecycle:

### 1. Maya Event AI & Inbound Call Answering
- **Asterisk ARI Voice Telephony:** Answers inbound event calls, identifies returning clients, records event requirements, checks availability, schedules callbacks, and generates structured CRM journal notes.
- **Intelligent Lead Triage:** Analyzes lead briefs, estimates complexity, scores client intent, and recommends next-best actions.
- **Automated Run-of-Show & Brief Generation:** Drafts comprehensive minute-by-minute schedules, vendor briefs, and risk reviews (weather, crowd control, licensing, venue capacity).
- **Strict Human-in-the-Loop Governance:** AI drafts customer messages, vendor RFQs, and budget adjustments; external dispatches, booking changes, and financial modifications require human approval.

### 2. Event CRM, Leads, Pipeline & WhatsApp Inbox
- **Multi-Channel Lead Ingestion:** Captures inquiries from web forms, customer portals, phone calls, live chat, and WhatsApp.
- **Lead Timeline & Activity Journal:** Centralizes voice recordings, call transcripts, notes, quotations, milestones, and task assignments in one timeline.
- **Two-Way Meta WhatsApp Business Inbox:** Real-time messaging with delivery receipts (sent, delivered, read), rich message templates, and automated conversation threads.
- **Sales Pipeline Management:** Tracks stages from New Lead, Qualified, Site Visit, Quoting, Negotiation, to Confirmed Booking and Post-Event Follow-up.

### 3. Event Packages, Public Catalog & Tiered Pricing
- **Multi-Tiered Package Builder:** Define baseline packages (e.g., Gala, Luxury Wedding, Tech Summit) with guest tiers, included services, and optional add-ons.
- **Dynamic Location & Seasonal Pricing:** Configure venue-specific rate cards, seasonal peak multipliers, minimum spend rules, and date blackout periods.
- **Expiring Hold Locks:** 15-minute transactional inventory holds to prevent double-booking of premier dates and venue halls during client checkout.
- **Public Catalog API:** Direct feeds consumed by the customer-facing portal (`MooNsEWeb`) for seamless browsing and self-service package discovery.

### 4. Run-of-Show Timeline Studio & Production Logistics
- **Minute-by-Minute Cue Sheet:** Interactive schedule builder specifying exact cue times, stage zones, AV/lighting presets, performer calls, and personnel owners.
- **Milestone & Task Tracking:** Project phases with nested checklists, task dependencies, critical path flags, and multi-user assignment.
- **Resource & Space Allocation:** Conflict-free scheduling for stage managers, audio engineers, sound rigs, breakout rooms, and green rooms.
- **Logistics & Contingency Planning:** Document weather contingencies, emergency contacts, municipal permits, and stage layout diagrams.

### 5. Guest Management, RSVPs, Seating & QR Check-in
- **Household & Guest Directory:** Group guests by household, organization, or party, with individual contact details and VIP designations.
- **RSVP Tracking & Preferences:** Monitor confirmed attendees, declines, plus-ones, dietary requirements, meal selections, and accessibility accommodations.
- **Interactive Seating Studio:** Organize floor plans, round/banquet tables, seat assignments, and place-card exports.
- **Real-Time QR Code Check-in:** Issue mobile-ready guest passes with secure QR tokens; scan attendees at registration with instant duplicate-scan prevention.

### 6. Vendor Network, Portfolios & Supplier RFQs
- **Vendor Category Directory:** Categorize photographers, videographers, decorators, caterers, security teams, transport providers, and audio-visual technicians.
- **Verified Portfolios & Compliance:** Track insurance certifications, food-hygiene ratings, service catalogs, past event galleries, and client review scores.
- **Automated RFQ Dispatch:** Select suppliers by date and service scope; compose automated or AI-assisted RFQ briefs, track bids, and compare proposals.
- **Direct Proposal Extraction:** Convert accepted vendor bids directly into line items on the client quotation.

### 7. Commerce, Invoicing, Milestone Payments & Contracts
- **Milestone Payment Schedules:** Automatically structure deposit, progress, and balance payments (e.g., 25% hold deposit, 50% production milestone, 25% final settlement).
- **Versioned Quotations & PDF Proposals:** Generate branded, itemized PDF quotes with clear pricing breakdowns, terms, and digital acceptance workflows.
- **Payment Gateways & Invoicing:** Supports credit card checkout, UPI/bank transfers, tax and GST calculation, payment receipts, and automated payment reminders.
- **Escrow & Refund Management:** Track vendor escrow disbursements, security deposits, client cancellation fees, and auditable refund authorizations.

### 8. Private Customer Event Portal (MooNsEWeb)
- **Dedicated Client Experience:** Clients log in securely to their event portal to review real-time planning progress.
- **Self-Service Guest Management:** Hosts can upload guest lists, track RSVPs, assign table seating, and send digital invitations.
- **Document Hub & E-Sign:** Review and sign event contracts, approve floor plans, view invoices, and make secure installment payments.
- **Direct Director Chat:** Real-time messaging with the designated event manager with file sharing and timeline updates.

### 9. Realtime Operations, Team Chat & Customer Live Support
- **Internal Staff Channels:** Event-specific chat channels, production team threads, and direct staff messages backed by Redis Pub/Sub and Socket.IO.
- **Customer Live Chat Widget:** Embeddable on public event websites; handles visitor inquiries with automated FAQ triage and live operator handover.
- **Live Ops Center & Incident Desk:** Broadcast urgent updates to on-site staff, track active issues, report delays, and trigger recovery workflows.

### 10. Multi-Tenant Enterprise Architecture & Security
- **Strict Logical Tenant Isolation:** Dedicated database schema per event enterprise, ensuring zero cross-tenant data leakage.
- **Role-Based Access Control (RBAC):** Granular permissions for SuperAdmin, Agency Owner, Event Director, Production Coordinator, Staff, Vendor, and Client roles.
- **Audit Trails & Data Governance:** Comprehensive tamper-evident logs for all financial actions, contract approvals, data exports, and system logins.
- **Enterprise Security:** HTTPS/TLS enforcement, bcrypt password hashing, tokenized sessions, CORS allowlists, rate limiting, and secure file storage.

---

## Capability snapshot

| Area | Status | Notes |
| --- | --- | --- |
| **CRM, Leads, Proposals, Bookings & Projects** | Ready in local stack | Full database persistence, lifecycle states, and metrics |
| **Packages, Tiers, Add-ons & Catalog** | Ready in local stack | Multi-tier configuration with 15-minute hold locks |
| **Run-of-Show Studio & Task Production** | Ready in local stack | Interactive minute-by-minute timeline builder |
| **Guest Lists, RSVPs, Seating & QR Check-in** | Ready in local stack | Full guest tracking with duplicate-scan prevention |
| **Vendor Profiles, Portfolios & RFQ Composer** | Ready in local stack | RFQ draft and review local; delivery via configured email |
| **Customer Event Portal (MooNsEWeb)** | Ready in local stack | Self-service host dashboard and guest management |
| **Team Chat & Realtime Notifications** | Ready in local stack | Powered by Socket.IO and Redis |
| **Two-Way Meta WhatsApp Inbox** | Provider-backed | Requires Meta WhatsApp Business API credentials |
| **Maya Event AI & Voice Telephony** | Provider-backed | Requires Gemini API key and Asterisk ARI server |
| **Payments & Invoicing (Stripe / Bank)** | Provider-backed | Optional integrations; fail-closed when unconfigured |

[**Open the detailed capability and maturity matrix →**](docs/PROJECT_STATUS.md)

---

## Run locally

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) **OR**
- Node.js 24+, MySQL 8.4+, and Redis 7.4+

### 1. Clone the repository

```bash
git clone https://github.com/schowdary75/MooNsEvents.git
cd MooNsEvents
```

### 2. Configure environment

Copy the sample environment file:

```bash
cp .env.example .env
```

Key environment settings:
```env
DATABASE_URL=mysql://user:password@127.0.0.1:3306/moonsevents
EVENT_TENANT_ID=00000000-0000-4000-8000-000000000010
CORS_ORIGINS=http://localhost:8080,http://localhost:3001
OIDC_ISSUER=http://localhost:8081/realms/moons-events
OIDC_AUDIENCE=moons-events-web
GEMINI_API_KEY=
```

### 3. Start the application

**On Windows:**
```bat
start.cmd
```

**On Linux, macOS, or Git Bash:**
```bash
chmod +x start.sh stop.sh
./start.sh
```

The launcher installs dependencies, runs Prisma migrations, seeds starter event types and packages, and starts all services:
- **Internal Event CRM:** `http://localhost:8080`
- **Backend API:** `http://localhost:4000/api/v1`
- **Customer Event Portal:** `http://localhost:3001`

To stop without deleting application data:
```bash
./stop.sh
```

[**Read the complete setup and troubleshooting guide →**](docs/GETTING_STARTED.md)

---

## Architecture

```mermaid
flowchart TB
  subgraph Channels["Users & Inbound Channels"]
    Staff["Event Planners & Operations Staff"]
    Clients["Event Hosts & Private Portal"]
    Guests["Event Attendees & QR Check-in"]
    Voice["Asterisk ARI Voice Telephony"]
    Webhooks["Meta WhatsApp & Payment Webhooks"]
  end

  subgraph Edge["Edge & Reverse Proxy"]
    Nginx["Nginx Reverse Proxy"]
    SPA["React 19 + Vite CRM (`:8080`)"]
    ClientWeb["Next.js Customer Portal (`:3001`)"]
  end

  subgraph Runtime["Application Runtime"]
    API["Express 5 REST API (`:4000`)"]
    Realtime["Socket.IO Realtime Gateway"]
    Security["Auth · MFA · RBAC · Tenant Context"]
    Maya["Maya Event AI Copilot Engine"]
  end

  subgraph Domains["Event Domain Aggregates"]
    CRM["Lead & Pipeline Service"]
    Packages["Package & Catalog Engine"]
    Production["Run-of-Show & Project Service"]
    GuestOps["Guest, Seating & Check-in"]
    Vendors["Vendor & RFQ Service"]
    Commerce["Quotations, Invoices & Payments"]
  end

  subgraph Async["Background Workers"]
    BullMQ["BullMQ Job Workers"]
    Redis[("Redis 7.4<br/>Queues · Locks · Realtime State")]
  end

  subgraph Storage["Data Persistence"]
    Prisma["Prisma ORM"]
    MySQL[("MySQL 8.4 Database<br/>Tenant Isolated")]
    Uploads[("Secure File Storage<br/>Contracts · Media · Badges")]
  end

  Staff -->|HTTPS| Nginx
  Clients -->|HTTPS| Nginx
  Guests -->|QR Scan| Nginx
  Voice --> API
  Webhooks --> API

  Nginx --> SPA
  Nginx --> ClientWeb
  SPA --> API
  ClientWeb --> API

  API --- Realtime
  API --> Security
  Security --> Maya
  Security --> Domains

  Domains --> CRM
  Domains --> Packages
  Domains --> Production
  Domains --> GuestOps
  Domains --> Vendors
  Domains --> Commerce

  Domains --> Prisma
  Prisma --> MySQL
  Domains --> Redis
  Redis --> BullMQ
  BullMQ --> Prisma
  Domains --> Uploads
```

### Layer responsibilities

| Layer | Responsibility |
| --- | --- |
| **Nginx & Web Delivery** | Reverse proxy, static asset delivery, SPA history fallback, and WebSocket upgrading |
| **React 19 & Vite** | High-performance, responsive CRM workspace with interactive dashboards and run-of-show tools |
| **Express 5 API** | REST API endpoints, input validation, tenant context resolution, and webhook verification |
| **Socket.IO Realtime** | Bi-directional communication for team chat, live lead notifications, and real-time check-in updates |
| **Maya AI Engine** | AI concept generation, call transcription analysis, vendor brief drafting, and risk auditing |
| **Redis 7.4 & BullMQ** | Background job queues, distributed locking, hold reservation timers, and rate limiting |
| **Prisma & MySQL 8.4** | Strongly typed data modeling, automated schema migrations, and isolated tenant storage |

[**Read the complete architecture guide →**](docs/architecture.md) · [**Event operating system design →**](docs/event-operating-system.md)

---

## Documentation library

| Guide | Description |
| --- | --- |
| 📖 **[Features Guide](docs/FEATURES.md)** | Complete breakdown of every platform capability and boundary |
| 🚀 **[Getting Started](docs/GETTING_STARTED.md)** | Windows, Linux, Docker, and native installation instructions |
| 🎬 **[Product Showcase](docs/PRODUCT_TOUR.md)** | Real UI captures and workflow explanations |
| 📊 **[Project Status](docs/PROJECT_STATUS.md)** | Capability maturity matrix and provider requirements |
| 🛡️ **[Production Readiness](docs/PRODUCTION_READINESS.md)** | Security checklist before deploying with real client data |
| 💬 **[WhatsApp Inbox Guide](docs/WHATSAPP_INBOX.md)** | Meta WhatsApp Business configuration and webhook setup |
| 🏗️ **[Architecture Guide](docs/architecture.md)** | Deep dive into system components, data flow, and scaling |
| 🧭 **[Governance Guide](GOVERNANCE.md)** | Project maintainership, RFC process, and release policy |
| 🔒 **[Security Policy](SECURITY.md)** | Vulnerability reporting and data protection practices |
| 🤝 **[Contributing Guide](CONTRIBUTING.md)** | Pull request instructions, testing rules, and coding standards |

---

## Contributing and community

Contributions are warmly welcome! Whether you are improving run-of-show timeline ergonomics, adding seating chart features, enhancing Maya AI prompts, or optimizing database queries:

1. [**Find a good first issue →**](https://github.com/schowdary75/MooNsEvents/issues)
2. [**Read the visual setup guide →**](docs/VISUAL_SETUP_GUIDE.md)
3. [**Review the contribution guidelines →**](CONTRIBUTING.md)

Contributors are honored in the [Hall of Fame](docs/community/HALL_OF_FAME.md), the [Leaderboard](docs/community/LEADERBOARD.md), and are eligible for [Digital Certificates](docs/community/CERTIFICATES.md).

All participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

MooNsEvents is open-source software licensed under the [MIT License](LICENSE).
Third-party notices and dependencies are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
