<div align="center">

# 🌸 Gayatri Lactation Care

**A companion for Mama's breastfeeding journey** — self-serve Edu Hub, lactation consultants, and Clinic & Homecare service booking.

</div>

An Indonesian-language lactation companion web app. It brings together self-serve education (Edu Hub), the "Minbee" AI assistant, and a per-category service booking flow (consultation, private classes, webinars). The user-facing UI is in Indonesian by design (the "Mama" brand); this README and the docs are in English.

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — styling, warm pastel palette
- **PostgreSQL 16** + **Prisma 6** — service data, challenges, and estimator settings
- **Route Handlers** — APIs (`/api/chat`, `/api/estimator`)
- **Google Gemini** (`@google/genai`) — the Minbee lactation assistant
- **lucide-react** — icons

## Run Locally

**Prerequisites:** Node.js, Docker (for the local Postgres)

```bash
npm install
docker compose up -d          # Postgres 16 on port 5435
cp .env.example .env          # holds a default DATABASE_URL matching compose
npx prisma migrate deploy     # apply the schema (or `npx prisma migrate dev`)
npx prisma generate           # generate Prisma Client (if not automatic)
npm run db:seed               # seed services, challenges, estimator settings
npm run db:seed-admin         # create the admin user from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev                   # http://localhost:3000
```

Other commands:

```bash
npm run build && npm start   # production
npm test                     # unit (Vitest)
npm run test:e2e             # E2E (Playwright)
```

**The database is required for dev & runtime.** The `/layanan/[id]` and `/layanan/[id]/booking` pages are dynamic — they query Postgres on every request (new services appear without a rebuild). So `npm run dev`/`npm start` need a reachable `DATABASE_URL`; if Postgres is down, those pages fail to render with a Prisma connection error. Make sure `docker compose up -d` is running and the data is seeded.

`GEMINI_API_KEY` is optional (set it in `.env`). Without a key the app still runs — `/api/chat` (Minbee) falls back to canned responses, while the other features (tracker, calculator, booking) work fully.

**`UPLOAD_DIR`** sets the storage root for uploaded files (module videos & PDF materials), **outside `public/`**. The dev default is **`./uploads`** (already in `.gitignore`, never committed). In production (VPS), point it at a persistent path outside the repo, e.g. `UPLOAD_DIR=/var/lib/gayatri/uploads`, and make sure that directory is writable by the Node process and included in backups. Files are only retrievable through the admin-gated routes `/api/video/[moduleId]` & `/api/material/[id]` (see the Admin section).

## Authentication

Authentication uses **Auth.js v5** (credentials provider, argon2id password hashing, JWT sessions).

- **`AUTH_SECRET` is required** in `.env` to sign JWT sessions. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` (see `.env.example`).
- **The admin** is created once via `npm run db:seed-admin`, using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. Change the defaults before production.
- **Users** self-register at **`/daftar`** (which signs them in automatically) and log in at **`/masuk`**. Registration always creates a `USER`-role account; the `ADMIN` role is only granted via seeding.

> **Production note:** behind a proxy/host (e.g. Cloud Run), Auth.js needs a trusted host — set `AUTH_TRUST_HOST=true` in the environment when running `next start`, otherwise the `/api/auth/*` endpoints reject requests (`UntrustedHost`). `next dev` already trusts localhost automatically.

## Admin

The admin panel protects every `/admin/*` path via Auth.js middleware — only `ADMIN`-role accounts get in (anon is redirected to `/masuk`, regular users to `/`).

- **Create an admin:** run `npm run db:seed-admin` (an idempotent upsert from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`). Change the default credentials before production.
- **Sign in:** log in at **`/masuk`** with the admin credentials, then open **`/admin`** (dashboard).
- **Manage services** at **`/admin/layanan`** — create (`/admin/layanan/baru`), edit (`/admin/layanan/[id]`), and enable/disable via a toggle. Price/detail changes reflect immediately on the public `/layanan` pages.
- **Manage class modules** — only for `class`-category services, build the digital-class content at **`/admin/layanan/[id]/modul`**: add ordered modules (Naik/Turun to reorder), manage per-module materials at **`/admin/layanan/[id]/modul/[moduleId]`** (PDF/Video/Link types), and mark a module/material as a free preview. Non-class services (consultation) show "bukan kelas digital" and have no modules.
- **Upload videos & materials** — in the module builder, the admin uploads module videos (MP4/WebM) and material files (PDF) directly through the form. Files are **stored outside `public/`** (in `UPLOAD_DIR`, see above) and are **not** served as static assets. Retrieval goes through the admin-gated routes **`/api/video/[moduleId]`** and **`/api/material/[id]`**, which support HTTP Range (video seeking / partial streaming). Size limits: **video 500 MB**, **PDF 20 MB**.
- **Manage class purchases (enrollments)** at **`/admin/enrollment`** — list every class purchase with a status filter (`Menunggu`/`Lunas`/`Dibatalkan`). After a user transfers and confirms, the admin clicks **Tandai Lunas** (→ `PAID`, recording the confirming admin) or **Batalkan** (→ `CANCELLED`). The count of still-pending purchases shows on the `/admin` dashboard.
- **Estimator settings & payment info** at **`/admin/pengaturan`** — set the free-of-charge radius, per-km rate, and base transport fee (the Homecare calculator), plus the **class payment info** (bank name, account number, account holder, WhatsApp number) shown to users while awaiting confirmation.

The service detail page **`/layanan/[id]` is rendered dynamically** (server-rendered on demand), so a new service created by the admin appears and is publicly reachable **without a rebuild**.

## Public Class Detail

The public detail page **`/layanan/[id]`** for `class`-category services shows the class's **real modules** (ordered by `sortOrder`) and is open to anyone **without login**:

- **Preview modules** (marked as a free preview by the admin) show a **`<video>`** player that streams the clip directly from the gated `/api/video/[moduleId]` route — open to anon (`200`).
- **Paid modules** appear **locked** (title + lock icon, no video element); fetching their video as anon → **403**.
- The **"Beli Kelas"** button leads to `/layanan/[id]/booking` to start a purchase.

## Class Purchase

For `class`-category services (digital classes), a **logged-in** user buys the class right on its booking page **`/layanan/[id]/booking`**:

- Anonymous users see a **login gate** (a link to `/masuk`), not a buy button.
- A logged-in user clicks **"Beli Kelas"** → **one** enrollment request is created with status **`PENDING`** (idempotent: buying/reloading does not duplicate rows — constrained unique per `user + service`).
- The panel then shows **"Menunggu Konfirmasi Pembayaran"** along with transfer info (bank/account/holder) and a **Konfirmasi via WhatsApp** button (`wa.me`) to notify the admin.
- Once the admin marks it **Lunas** at `/admin/enrollment`, the status becomes **`PAID`** and the user's booking page switches to **"Mama sudah punya akses ke kelas ini"** with a **Buka Kelas Saya** button to `/kelas-saya`.

## Class Access

After payment is confirmed (`PAID`), the buyer opens their class at **`/kelas-saya`**:

- **`/kelas-saya`** — a list of all the user's purchased (`PAID`) classes. Login required (otherwise redirected to `/masuk`).
- **`/kelas-saya/[serviceId]`** — the class content: all modules (ordered by `sortOrder`) with a **`<video>`** player and the material list (PDF/Video/Link) — all unlocked once payment is confirmed. A user who is not `PAID` is redirected to the service detail page.
- Video & material files are only served through the gated routes **`/api/video/[moduleId]`** and **`/api/material/[id]`** to **class buyers (`PAID`)**, **admins**, or for **preview modules/materials** (free clips). Everything else → **403**.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (`next dev`) on port 3000 |
| `npm run build` | Production build (`next build`) |
| `npm start` | Run the production build (`next start`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run db:seed` | Seed the database with initial data (`tsx prisma/seed.ts`) |
| `npm run db:seed-admin` | Create/update the admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| `npm run db:reset` | Reset + re-migrate the database (`prisma migrate reset`) |

## Routes

| URL | Page |
|-----|------|
| `/` | Edu Hub (Dashboard) |
| `/layanan` | Service list |
| `/layanan/[id]` | Service detail (per-category view) |
| `/layanan/[id]/booking` | Booking form (per category) |
| `/masuk` | Login |
| `/daftar` | Registration (auto sign-in) |
| `/kelas-saya` | List of purchased classes (`PAID`; login required) |
| `/kelas-saya/[serviceId]` | Class content: modules + video + materials (`PAID` buyers only) |
| `/admin` | Admin dashboard (`ADMIN` role only) |
| `/admin/enrollment` | Manage class purchases (confirm/cancel) |
| `/admin/layanan` | Manage services (list, enable/disable) |
| `/admin/layanan/baru` | Create a new service |
| `/admin/layanan/[id]` | Edit a service |
| `/admin/layanan/[id]/modul` | Manage digital-class modules (`class` category only) |
| `/admin/layanan/[id]/modul/[moduleId]` | Edit a module + manage materials |
| `/admin/pengaturan` | Estimator settings (transport fee) + class payment info |
| `/api/admin/upload` | Upload video/material (admin, streaming) |
| `/api/video/[moduleId]` | Serve a module video (`PAID` buyer/admin/preview, HTTP Range) |
| `/api/material/[id]` | Serve a PDF material (`PAID` buyer/admin/preview, HTTP Range) |

Service categories: **Homecare** (distance + transport), **Clinic**, **Private Class** (online/offline), **Webinar** (fixed schedule + email).

## Structure

```
src/
  app/                  # Next.js App Router
    layout.tsx          # Root layout (header/footer)
    page.tsx            # Edu Hub (Dashboard)
    globals.css         # Global stylesheet
    layanan/            # Service list + detail + booking
      layout.tsx        # Layout + shared state (React Context)
      page.tsx          # Service list
      [id]/page.tsx     # Per-category targeted detail
      [id]/booking/page.tsx  # Per-category targeted booking
    api/
      chat/route.ts     # Gemini API (Minbee)
      estimator/route.ts # Fee calculation API
  components/
    Dashboard.tsx       # Edu Hub: hero, programs, diagnostics, testimonials
  services/             # Clinic & Homecare flow
    ServiceList.tsx     # Service list
    ServiceDetail.tsx   # Per-category targeted detail
    ServiceBooking.tsx  # Per-category targeted booking
    serviceConfig.ts    # Category descriptors
    estimator.ts        # Pure fee-calculation function
    useEstimate.ts      # Fee-calculation hook
  lib/                  # Query layer (server-only, uses Prisma)
    db.ts               # Prisma Client singleton
    services.ts         # Service queries
    challenges.ts       # Challenge queries
    settings.ts         # Estimator settings
  types.ts
prisma/
  schema.prisma         # Service, Challenge, Setting models
  migrations/           # SQL migrations
  seed.ts               # Seed script
  seed-data.ts          # Challenge data for seeding
```

## Project Status

**Core features complete.** The online-class flow works **end-to-end**:

1. **The admin** builds a class (ordered modules) and uploads videos + PDF materials in the module builder.
2. **A user** registers/logs in, then **buys a class** on the booking page (a `PENDING` enrollment + transfer info).
3. **The admin** marks it **Lunas** → status `PAID`.
4. **The user** opens the class content at `/kelas-saya/[serviceId]`: modules (ordered), a video player, and materials — all unlocked for `PAID` buyers.
5. **The public detail** `/layanan/[id]` shows the real modules with a **free preview** (preview modules) for anon; paid modules stay locked.

File access is guarded by the gated `/api/video/[moduleId]` & `/api/material/[id]` routes (`PAID` buyer / admin / preview; otherwise 403). Verified by 46 unit tests (Vitest) and 29 E2E tests (Playwright).

### Remaining before production

Not part of the core features, but recommended before go-live:

- **Rate limiting** on login/register (brute-force mitigation).
- **Self-serve password reset** for users.
- **Domain + HTTPS** (set `AUTH_TRUST_HOST=true` behind a proxy) and **regular backups** of the database + `UPLOAD_DIR`.
