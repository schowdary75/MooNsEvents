# Security policy

**[Overview](README.md)** · **[Features](docs/FEATURES.md)** ·
**[Setup](docs/GETTING_STARTED.md)** · **[Contributing](CONTRIBUTING.md)** ·
**[Support](SUPPORT.md)** · **[Code of Conduct](CODE_OF_CONDUCT.md)** ·
**[MIT license](LICENSE)**

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or include sensitive details in a
discussion.

Use GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Select **Advisories**.
3. Select **Report a vulnerability**.
4. Include affected versions, impact, reproduction steps, and any proposed mitigation.

Reports are reviewed by repository administrators. Please allow time to reproduce and coordinate a
fix before public disclosure.

## Sensitive data

Never commit or attach:

- `.env` files or provider credentials
- private keys, certificates, signing secrets, or database URLs with real passwords
- database dumps, Terraform state or variable files
- client/customer information, credentials, identity documents, or payment data
- uploads, call recordings, email exports, logs, or production screenshots

Use synthetic data in tests, issues, discussions, and pull requests.

## Supported versions

Security fixes are applied to the latest `main` revision and to any release explicitly listed as
supported. Before the first tagged release, `main` is the supported version. Older commits and
unmaintained forks are not supported.
