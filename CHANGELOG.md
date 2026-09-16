# Changelog

All notable changes to MooNsEvents will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) for published releases.

## [Unreleased]

### Added

- Public product showcase built from direct captures of the running application.
- Project-status, production-readiness, performance, and launch documentation.
- Focused feature, setup, and documentation-index guides.
- Code of Conduct, support guide, and project governance.

### Changed

- The root README is now a concise product landing page with direct navigation to setup,
  contributing, security, licensing, and detailed documentation.
- The README now restores project, technology, community, and repository-stat badges; provides
  clearly labeled action links; and includes a richer feature overview.
- The README header now uses the MooN logo and three centered, progressively shorter badge rows,
  followed by a detailed system architecture diagram and component guide.
- Project wording now describes the verified local stack as ready to use while keeping
  provider-backed and production-readiness boundaries explicit.

### Fixed

- GitHub Actions now reference existing `actions/checkout@v6` and `actions/setup-node@v6`
  releases.
- Container dependency installation can skip Git hook setup without breaking local development.
- Docker API containers now create and use a writable persistent directory for call recordings.
- Docker web-container health checks now use IPv4 loopback consistently with their Nginx listeners.
- Production API and worker images now include the shared permissions module required by the
  administrator seed command.
- Local Docker containers now receive the compatibility routing and session settings required for
  blank-workspace administrator login.

## [0.1.0] - Planned

The first public evaluation release. See [the release notes](docs/releases/v0.1.0.md) for the
included workflow, validation checklist, and known limitations.

[Unreleased]: https://github.com/schowdary75/moonsevents/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/schowdary75/moonsevents/releases/tag/v0.1.0
