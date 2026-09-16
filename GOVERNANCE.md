# MooNsEvents governance

MooNsEvents uses lightweight maintainer-led governance. The goal is to keep decisions transparent,
give contributors a clear path to responsibility, and protect the project's security and product
direction.

**[Overview](README.md)** · **[Roadmap](https://github.com/schowdary75/moonsevents/issues)** ·
**[Contributing](CONTRIBUTING.md)** · **[Code of Conduct](CODE_OF_CONDUCT.md)** ·
**[Security](SECURITY.md)**

## Project roles

### Primary maintainer

MooN is the primary maintainer and is responsible for:

- Product direction and release approval.
- Repository administration and branch protection.
- Final decisions when contributor consensus cannot be reached.
- Security coordination and access to private reports.
- Appointing or removing maintainers as the project grows.

### Maintainers

Maintainers are trusted contributors who may triage issues, review pull requests, help shape the
roadmap, and merge approved work within their areas. Maintainer access is earned through sustained,
constructive, technically sound participation; it is not granted only for a single large change.

### Contributors

Anyone following the [contribution guide](CONTRIBUTING.md) and
[Code of Conduct](CODE_OF_CONDUCT.md) can contribute. Contributors do not need prior permission for
an unclaimed, clearly scoped issue, but large features, schema changes, new providers, or
architectural changes should be discussed before implementation.

### Roadmap Champions

Contributors who close meaningful milestones can receive Roadmap Champion recognition. Recognition
does not automatically grant repository permissions, decision authority, or maintainer status.

## How decisions are made

1. Bugs and focused improvements are discussed in their issue or pull request.
2. Large changes begin with a written proposal describing the problem, users affected,
   alternatives, security impact, migration impact, and acceptance criteria.
3. Maintainers seek practical consensus based on evidence, product fit, maintainability, test
   coverage, privacy, and tenant safety.
4. If consensus is not possible, the primary maintainer makes and records the final decision.

Decisions may change when new evidence appears. Reconsideration should bring new technical,
product, security, or user evidence rather than repeat the same arguments.

## Pull requests and merging

- Contributors work from focused branches and open pull requests into protected `main`.
- Pull requests must explain their purpose, scope, validation, and any operational or migration
  impact.
- Required checks and reviews must pass unless the maintainer documents a specific, temporary
  exception.
- The default merge method is **Squash and merge** to keep the main history readable.
- Authors do not approve their own changes when independent review is available.
- Security-sensitive or tenant-boundary changes may require additional tests or review.

## Roadmap and releases

The public issue tracker is the working roadmap. Labels and milestones communicate scope and
priority, but they are not promises of delivery dates.

The primary maintainer approves releases. Release notes must distinguish:

- Features that run in the included local stack.
- Provider-backed features that require external credentials.
- Experimental or planned work.
- Production or scale claims supported by published evidence.

## Security and private decisions

Security reports, credentials, personal data, active abuse investigations, and embargoed fixes are
handled privately. Maintainers should publish a safe summary after resolution when disclosure does
not increase risk.

No governance decision can override the [MIT License](LICENSE), contributor ownership of their
work, applicable law, or the obligation to protect private data.

## Changes to governance

Governance changes use the same pull-request process as other repository changes. Significant
changes should remain open long enough for contributor feedback before the primary maintainer makes
the final decision.
