# Wamoro Farms

A responsive agribusiness website and content management system for Wamoro Farms, built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL and Prisma.

## Requirements

- Node.js 24 LTS and npm
- Docker with Docker Compose, or a PostgreSQL 17 database
- A persistent writable disk for CMS image uploads in production

## Local setup

```sh
cp .env.example .env
npm install
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The included Compose file maps PostgreSQL to port `5433` to avoid conflicting with a local PostgreSQL service. Edit `DATABASE_URL` if you use another database.

Before running the seed command, set a real `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 16 characters in `.env`. The seed script hashes the password and safely upserts the initial administrator and sample content. Do not use the example credentials in a shared environment. The dashboard is at `/admin`.

The site works before the database is configured by rendering local demonstration content. Admin features and persisted enquiries require PostgreSQL.

## Commands

```sh
npm run dev          # development server
npm run lint         # ESLint
npm run typecheck    # TypeScript checks
npm run build        # generate Prisma client and build for production
npm run start        # serve the production build
npm run db:generate  # regenerate Prisma client
npm run db:migrate   # create/apply a local development migration
npm run db:deploy    # apply committed migrations in production
npm run db:seed      # upsert the administrator and demonstration content
npm run db:studio    # open Prisma Studio
```

## Configuration and deployment

Copy `.env.example` into the deployment environment and configure:

- `DATABASE_URL`: a PostgreSQL connection string. Use the provider's TLS connection string in production.
- `SESSION_SECRET`: a cryptographically random value of at least 32 characters (`openssl rand -base64 32`).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`: credentials used by the idempotent seed.
- `UPLOAD_DIR`: path to a persistent mounted volume for CMS media; defaults to `storage/uploads`.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS site URL used for metadata and sitemap links.
- `MAX_UPLOAD_MB`: maximum size per image; the application caps this at 20 MB.

Use a Node.js host that runs the Next.js server and mounts a persistent volume at `UPLOAD_DIR`. Configure HTTPS at the host or reverse proxy, run `npm ci`, `npm run db:deploy`, then `npm run build` and `npm run start`. Do not deploy the upload directory on ephemeral storage or share a development database in production. M-Pesa remains disabled until the verified Till number and integration credentials are supplied.

### VPS deployment with GitHub Actions

`.github/workflows/deploy.yml` deploys the `main` branch to `wamoro.apperstar.com` over SSH. It sends a source archive to the restricted deployment command on the VPS; Docker builds and runs the Next.js server there. PostgreSQL and uploaded media use persistent Docker/host storage. This is a server-rendered Node deployment, not a static export.

The workflow reads these **repository variables** under **Settings → Secrets and variables → Actions → Variables**:

- `DEPLOY_HOST`: `31.97.116.56`
- `DEPLOY_USER`: `michael`
- `DEPLOY_KNOWN_HOSTS`: the pinned SSH host-key line for `31.97.116.56` (already configured on the Wamoro Farms repository)

It reads one **repository secret** under **Settings → Secrets and variables → Actions → Secrets**:

- `DEPLOY_SSH_KEY`: the dedicated Ed25519 private key paired with the restricted deploy key installed for `michael` (already configured on the Wamoro Farms repository)

The workflow is configured to deploy on pushes to `main` and on manual `workflow_dispatch`. It does not need database or admin passwords in GitHub: runtime credentials stay in `/home/michael/wamoro-farms/.env.production` on the VPS. That file contains `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `NEXT_PUBLIC_SITE_URL`, `UPLOAD_DIR`, and `MAX_UPLOAD_MB`. Keep it owned by `michael` with mode `600`; never commit it. PostgreSQL and media uploads persist in separate Docker volumes; the uploads volume is prepared for the unprivileged Node user.

The host reverse proxy config is `deploy/wamoro-farms.nginx.conf`. Certbot’s HTTP-01 challenge uses `/var/www/certbot`, and the host’s existing `certbot.timer` handles renewals. See `docker-compose.prod.yml` and `deploy/receive-deploy.sh` for the isolated app port, migration step, upload mount, and restricted deploy command.

### Backups

Back up PostgreSQL and the upload volume together. Example commands (replace the connection details and paths):

```sh
pg_dump "$DATABASE_URL" --format=custom --file=wamoro-farms.dump
tar -czf wamoro-uploads.tar.gz -C "$UPLOAD_DIR" .
```

Keep the database dump and media archive from the same backup window. To restore, restore the database with `pg_restore` into the target database and extract the media archive into the configured persistent `UPLOAD_DIR`.

## Included features

- Home, About, Services, Nursery, Gallery, Insights, article detail, Training and Contact pages
- Responsive product search and category filters, WhatsApp ordering, gallery lightbox, article search and video cards
- Admin sign-in, overview, rich-text blog editor with scheduling and SEO fields, products, events, media uploads, enquiry inbox and business/social/video settings
- PostgreSQL-backed enquiries, bookings and event registrations; Zod validation, origin checks and database-backed rate limits
- Hashed admin passwords, secure HTTP-only sessions, authorization in server routes, content sanitization and image content validation/optimization
- Open Graph metadata, organization/product/article structured data, sitemap and robots rules

Initial contact details, product prices and event information are editable demonstration data and require business-owner verification. No founder portrait or logo file was present in the workspace. Upload the approved founder photo under the Founder category in Admin → Gallery & Media, then select it in Site Settings; it will appear on the home and About pages. Add the official logo under `public/images/branding/` when available. Image source and license notes are in `public/images/ASSET_CREDITS.md`.

## Media storage

CMS uploads are converted to optimized WebP for delivery. The original file is also retained under `UPLOAD_DIR/originals/`; metadata is stored in PostgreSQL. Public files are served through `/api/media/[filename]`, and private images require an administrator session. Back up both the database and the complete upload directory.
