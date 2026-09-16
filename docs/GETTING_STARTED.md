# Getting started with MooNsEvents

This guide covers the one-command Docker path, manual Docker control, and native development on
Windows, Linux, and macOS.

**[Overview](../README.md)** · **[Features](FEATURES.md)** ·
**[Product showcase](PRODUCT_TOUR.md)** · **[Contributing](../CONTRIBUTING.md)** ·
**[Security](../SECURITY.md)** · **[MIT license](../LICENSE)**

## Choose your path

| Goal                              | Recommended path                                      |
| --------------------------------- | ----------------------------------------------------- |
| Open and evaluate the application | [One-command Docker start](#one-command-docker-start) |
| Control each container command    | [Manual Docker setup](#manual-docker-setup)           |
| Develop with hot reload           | [Native development](#native-development)             |
| Fix a startup problem             | [Diagnostics](#diagnostics)                           |

## One-command Docker start

The launcher installs the application stack inside Docker. You do **not** need to separately
install Node.js, npm, MySQL, Redis, Nginx, Prisma, or project packages.

The only prerequisite is:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) on Windows or macOS, or Docker
  Engine with the Docker Compose v2 plugin on Linux.

Docker must be installed separately because it needs operating-system administrator approval and,
on Windows or macOS, virtualization support. Start Docker and wait until its engine is running.

### 1. Clone the repository

```bash
git clone https://github.com/schowdary75/moonsevents.git
cd moonsevents
```

### 2. Start on Linux or macOS

```bash
chmod +x start.sh stop.sh
./start.sh
```

### 3. Start on Windows

Start Docker Desktop, open the repository in **Git Bash**, and run:

```bash
./start.sh
```

You can also use WSL with Docker Desktop's WSL integration enabled:

```bash
cd /mnt/c/path/to/moonsevents
./start.sh
```

PowerShell and Command Prompt do not run `.sh` files directly; use Git Bash or WSL.

### What the launcher does

On its first run, `start.sh`:

1. Checks that Docker and Docker Compose v2 are installed and running.
2. Uses Node 24 in a temporary container to create an ignored `.env` with unique local passwords,
   signing secrets, encryption keys, and an administrator password.
3. Pulls and builds Node 24, MySQL 8.4, Redis 7.4, Nginx, the API, worker, and React application.
4. Starts the containers, applies both Prisma migration sets, and waits for required services.
5. Creates the initial administrator and role permissions.
6. Prints the application URL and local login details.
7. Keeps live logs visible so the terminal does not close while the application is running.

Open <http://localhost:8080> when startup finishes. Pressing `Ctrl+C` closes the log viewer; the
containers continue running.

To start without following logs:

```bash
./start.sh --no-logs
```

### Stop without deleting data

```bash
./stop.sh
```

The stop script keeps the database, Redis, uploads, and logs. Run `./start.sh` later to reuse the
same local configuration and data.

> Keep `.env` private. It contains generated local secrets and is excluded from Git. Do not delete
> it while retaining the Docker database volume because the generated database password must
> continue to match the stored data.

## Manual Docker setup

Use this path when you want to control each Docker command yourself.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js 24](https://nodejs.org/) and npm 11 or newer
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose

### 1. Install packages and create a safe environment

```bash
npm ci
npm run setup:env
```

The setup command copies `.env.example` to the ignored `.env` and generates unique local database
passwords, signing secrets, encryption keys, and an initial administrator password. It refuses to
overwrite an existing `.env`.

Save the administrator password printed in the terminal. Never commit `.env`.

### 2. Build and start

```bash
docker compose up --build -d
docker compose ps
```

The API container applies the platform and tenant migrations during startup.

### 3. Create the initial administrator

```bash
docker compose exec api npm run prisma:seed
```

Open <http://localhost:8080> and sign in with the email and password printed by
`npm run setup:env`.

| Endpoint                                 | Purpose                   |
| ---------------------------------------- | ------------------------- |
| <http://localhost:8080>                  | Application through Nginx |
| <http://localhost:8080/api/v1/health>    | API health                |
| <http://localhost:8080/api/v1/readiness> | Dependency readiness      |
| <http://localhost:8080/api/docs>         | Swagger UI                |
| <http://localhost:8080/api/openapi.json> | OpenAPI document          |

### 4. View logs or stop

```bash
docker compose logs -f api worker
docker compose down
```

`docker compose down` keeps the named data volumes.

## Native development

Use native development for fast hot reload when MySQL 8.4 and Redis 7 are already available.

### 1. Install dependencies and create `.env`

```bash
npm ci
npm run setup:env
```

If `.env` already exists, setup stops without changing it.

### 2. Prepare MySQL

Replace the example password with the generated `DATABASE_PASSWORD` in your local `.env`:

```sql
CREATE DATABASE moonsevents
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE moonsevents_platform
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moon_user'@'localhost' IDENTIFIED BY 'your-generated-DATABASE_PASSWORD';
GRANT ALL PRIVILEGES ON moonsevents.* TO 'moon_user'@'localhost';
GRANT ALL PRIVILEGES ON moonsevents_platform.* TO 'moon_user'@'localhost';
FLUSH PRIVILEGES;
```

The provisioning URL uses a privileged local MySQL account because tenant creation requires
database and user administration. Never expose that account to browser code or use the local
example configuration in production.

Start Redis on `127.0.0.1:6379`, or update `REDIS_URL` in `.env`.

### 3. Generate Prisma clients, migrate, and seed

```bash
npm run prisma:generate
npm run prisma:deploy:platform
npm run prisma:deploy
npm run prisma:seed --workspace @moonsevents/server
```

### 4. Start the application

Client and API:

```bash
npm run dev:app
```

Client, API, and worker:

```bash
npm run dev
```

The Vite application runs at <http://localhost:5174> and proxies `/api`, `/uploads`, and
`/socket.io` to the API at <http://localhost:4000>.

## Diagnostics

Check native-development prerequisites without changing the machine:

```bash
npm run doctor
```

Check the Docker path:

```bash
npm run doctor -- --docker
```

The report uses `PASS`, `WARN`, and `FAIL`. Exit code `0` means no blockers were found, `1` means a
required check failed, and `2` means the options were invalid. Optional provider warnings do not
change the exit code.

The doctor does not install software, rewrite files, start containers, migrate, seed, or contact
provider services. It checks environment key names and never prints values.

## Environment configuration

Use `.env.example` as the source of truth. Real `.env` files are ignored at the root and in both
workspaces.

### Core values

| Variable                           | Purpose                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`                     | Main or initial tenant database                            |
| `PLATFORM_DATABASE_URL`            | Global identities, tenants, plans, and platform operations |
| `TENANT_DATABASE_BASE_URL`         | Template used to connect to tenant databases               |
| `TENANT_PROVISIONING_DATABASE_URL` | Privileged provisioning-only MySQL connection              |
| `TENANT_CREDENTIAL_ENCRYPTION_KEY` | Encrypts stored tenant database credentials                |
| `REDIS_URL`                        | Queues, rate limits, locks, cache, and realtime state      |
| `JWT_ACCESS_SECRET`                | Application access-token signing                           |
| `OPERATOR_JWT_SECRET`              | Platform-operator token signing                            |
| `AUTH_PASSWORD_PEPPER`             | Server-side password hardening                             |
| `CORS_ORIGINS`                     | Exact comma-separated browser origins                      |

### Optional integrations

Leave optional values blank until you deliberately enable the related capability:

- AWS S3, CloudFront, Secrets Manager, and malware webhooks
- WorkOS SSO
- Razorpay and Zoho Books
- SMTP and IMAP
- Google OAuth, Gemini, and Google Ads
- Asterisk ARI and an SMS gateway
- Meta/WhatsApp; see the [WhatsApp inbox guide](WHATSAPP_INBOX.md)
- Timeline status, events rules, insurance, and inventory providers

See the [inventory adapter guide](inventory-provider-adapters.md) for the credential-free reference
adapter, validation contract, timeouts, redaction, and catalogue fallback.

Never place a server credential in a `VITE_*` variable. Vite variables are compiled into browser
assets and are public.

## Common commands

| Command                          | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `./start.sh`                     | Configure, build, start, initialize, and follow the Docker stack |
| `./stop.sh`                      | Stop Docker without deleting local data                          |
| `npm run setup:env`              | Create an ignored `.env` with generated development secrets      |
| `npm run doctor`                 | Diagnose native prerequisites without changing the machine       |
| `npm run doctor -- --docker`     | Diagnose Docker prerequisites                                    |
| `npm run dev:app`                | Run client and API with hot reload                               |
| `npm run dev`                    | Run client, API, and worker                                      |
| `npm run build`                  | Build all workspaces                                             |
| `npm run lint`                   | Run ESLint                                                       |
| `npm run typecheck`              | Run TypeScript checks                                            |
| `npm test`                       | Run automated tests                                              |
| `npm run format:check`           | Verify formatting                                                |
| `npm run prisma:generate`        | Generate tenant and platform Prisma clients                      |
| `npm run prisma:deploy`          | Apply tenant migrations                                          |
| `npm run prisma:deploy:platform` | Apply platform migrations                                        |

## Database safety

- Use versioned Prisma migrations for shared or production databases.
- Back up databases and uploads before production migration.
- Never use destructive reset or schema-push commands against shared data.
- The seed creates the configured initial administrator and missing role permissions.
- For restored databases, follow the [migration runbook](migration-runbook.md).
