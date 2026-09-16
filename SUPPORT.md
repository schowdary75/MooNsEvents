# MooNsEvents support

This page directs questions to the place where they can be answered and found again by other
users.

**[Overview](README.md)** · **[Setup](docs/GETTING_STARTED.md)** ·
**[Features](docs/FEATURES.md)** · **[Contributing](CONTRIBUTING.md)** ·
**[Security](SECURITY.md)**

## Before asking for help

1. Follow the [getting-started guide](docs/GETTING_STARTED.md).
2. Run the appropriate diagnostic:

   ```bash
   npm run doctor
   ```

   For Docker:

   ```bash
   npm run doctor -- --docker
   ```

3. Search the [documentation index](docs/README.md), existing
   [issues](https://github.com/schowdary75/moonsevents/issues), and
   [Discussions](https://github.com/schowdary75/moonsevents/discussions).
4. Remove all credentials, customer information, recordings, private URLs, and environment values
   before sharing output.

## Choose the correct support channel

| Need                                    | Where to go                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Setup, configuration, or usage question | [GitHub Discussions — Q&A](https://github.com/schowdary75/moonsevents/discussions)                           |
| Reproducible software bug               | [Open a bug report](https://github.com/schowdary75/moonsevents/issues/new?template=bug_report.yml)           |
| Focused feature proposal                | [Open a feature request](https://github.com/schowdary75/moonsevents/issues/new?template=feature_request.yml) |
| Contribution or pull-request question   | Read [CONTRIBUTING.md](CONTRIBUTING.md), then use the related issue or PR                                    |
| Suspected vulnerability                 | Follow [SECURITY.md](SECURITY.md) and report it privately                                                    |
| Community conduct concern               | Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and report it privately                                      |

## What to include

For technical help, include:

- Operating system and version.
- Docker Desktop or Docker Engine version, if applicable.
- Node and npm versions for native development.
- The exact command you ran.
- The complete error message with secrets and personal information removed.
- Whether the problem happens on a clean clone.
- The smallest reliable reproduction steps.

Screenshots are useful for UI problems, but use only fictional data and inspect the entire image
before uploading it.

## Support boundaries

Community support is best effort and has no guaranteed response time. Maintainers and contributors
can help with repository behavior, setup, documentation, and reproducible defects. They cannot
provide credentials for third-party providers or guarantee support for modified private forks,
unsupported infrastructure, or unreviewed production deployments.

Before handling real client, payment, or identity data, complete the
[production-readiness checklist](docs/PRODUCTION_READINESS.md).
