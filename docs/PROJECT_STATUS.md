# Project status

MooNsEvents is ready to use for local evaluation, demonstrations, development, contribution, and
controlled pilots. Core events workflows run in the included stack; provider-backed capabilities
activate after their credentials are configured. Before a deployment handles real client,
identity, or payment data, complete the checks in
[production readiness](PRODUCTION_READINESS.md).

## Capability maturity

| Capability                                              | Repository status                             | What an evaluator should expect                             |
| ------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| CRM, leads, follow-ups, proposals, bookings             | Implemented core workflow                     | Runs with the local stack and local database                |
| Packages, runOfShows, stays, cars, vendors, activities | Implemented core workflow                     | Editable catalogue and operational screens                  |
| Vendor RFQ composition and history                      | Implemented; delivery provider optional       | Draft/review works locally; sending needs configured email  |
| Customer and team chat                                  | Implemented; realtime infrastructure required | Uses Socket.IO/Redis and workspace permissions              |
| Human-operated lead WhatsApp inbox                      | Implemented; Meta account required            | Configuration is per workspace; no embedded credentials     |
| Maya governance and approval controls                   | Implemented framework                         | Provider-backed intelligence requires an AI provider        |
| Maya voice/telephone answering                          | Provider-backed integration                   | Requires Asterisk and configured speech/AI services         |
| Payments, SSO, email, object storage, live timelines      | Optional integrations                         | Disabled or fail closed when unconfigured                   |
| Multi-tenant provisioning and plans                     | Implemented architecture                      | Production rollout needs external infrastructure validation |
| Desktop installer                                       | Not implemented                               | Docker and native developer launchers are available today   |

## Evidence

- [Product showcase with direct application captures](PRODUCT_TOUR.md)
- [Architecture](architecture.md)
- [Events operating-system guide](events-operating-system.md)
- [WhatsApp inbox design and setup](WHATSAPP_INBOX.md)
- [Migration runbook](migration-runbook.md)
- [Security policy](../SECURITY.md)

## Claims policy

Documentation and release notes must distinguish among:

- **Implemented:** code and a runnable path exist in the repository.
- **Provider-backed:** the integration exists but requires a third-party account and credentials.
- **Planned:** no release should describe it as available.
- **Validated at scale:** only after a reproducible benchmark is published with commit, environment,
  dataset, command, and result.

Customer counts, revenue impact, uptime, throughput, adoption, and cost savings must never be
invented or inferred from repository stars.
