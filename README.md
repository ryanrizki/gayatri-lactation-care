<div align="center">

# 🌸 Gayatri Layanan Laktasi

**Pendamping perjalanan menyusui Mama** — Edu Hub mandiri, konsultan laktasi, dan pemesanan layanan Klinik & Homecare.

</div>

Aplikasi web pendamping laktasi berbahasa Indonesia. Menyatukan edukasi mandiri (Edu Hub), asisten AI "Minbee", dan alur pemesanan layanan (konsultasi, kelas privat, webinar) yang disesuaikan per kategori.

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — styling, palet warm pastel
- **PostgreSQL 16** + **Prisma 6** — data layanan, challenge, dan setelan estimator
- **Route Handlers** — API (`/api/chat`, `/api/estimator`)
- **Google Gemini** (`@google/genai`) — asisten laktasi Minbee
- **lucide-react** — ikon

## Run Locally

**Prasyarat:** Node.js, Docker (untuk Postgres lokal)

```bash
npm install
docker compose up -d          # Postgres 16 di port 5435
cp .env.example .env          # berisi DATABASE_URL default yang cocok dengan compose
npx prisma migrate deploy     # terapkan schema (atau `npx prisma migrate dev`)
npx prisma generate           # generate Prisma Client (jika belum otomatis)
npm run db:seed               # isi data layanan, challenge, setelan estimator
npm run db:seed-admin         # buat user admin dari ADMIN_EMAIL/ADMIN_PASSWORD di .env
npm run dev                   # http://localhost:3000
```

Perintah lain:

```bash
npm run build && npm start   # produksi
npm test                     # unit (Vitest)
npm run test:e2e             # E2E (Playwright)
```

**Database wajib untuk build & dev.** Halaman `/layanan/[id]` dan `/layanan/[id]/booking` memakai `generateStaticParams`, yang meng-query Postgres saat `next build`. Jadi `npm run build` maupun `npm run dev` butuh `DATABASE_URL` yang bisa dijangkau — jika Postgres mati, build gagal dengan error koneksi Prisma. Pastikan `docker compose up -d` sudah jalan dan data sudah di-seed.

`GEMINI_API_KEY` bersifat opsional (isi di `.env`). Tanpa key, aplikasi tetap jalan — `/api/chat` (Minbee) masuk mode fallback, fitur lain (tracker, kalkulator, pemesanan) berfungsi penuh.

## Autentikasi

Autentikasi memakai **Auth.js v5** (credentials provider, password argon2id, sesi JWT).

- **`AUTH_SECRET` wajib** ada di `.env` untuk menandatangani sesi JWT. Generate dengan `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` (lihat `.env.example`).
- **Admin** dibuat sekali via `npm run db:seed-admin`, memakai `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dari `.env`. Ganti nilai default sebelum produksi.
- **User** mendaftar sendiri di **`/daftar`** (langsung otomatis masuk) dan login di **`/masuk`**. Registrasi selalu membuat akun role `USER`; role `ADMIN` hanya lewat seed.

> **Catatan produksi:** di balik proxy/hosting (mis. Cloud Run), Auth.js butuh host tepercaya — set `AUTH_TRUST_HOST=true` di environment saat menjalankan `next start`, jika tidak endpoint `/api/auth/*` akan menolak permintaan (`UntrustedHost`). Mode `next dev` sudah otomatis memercayai localhost.

## Admin

Panel admin melindungi seluruh path `/admin/*` lewat middleware Auth.js — hanya akun role `ADMIN` yang boleh masuk (anon diarahkan ke `/masuk`, user biasa diarahkan ke `/`).

- **Buat admin:** jalankan `npm run db:seed-admin` (upsert idempoten dari `ADMIN_EMAIL`/`ADMIN_PASSWORD` di `.env`). Ganti kredensial default sebelum produksi.
- **Masuk:** login di **`/masuk`** memakai kredensial admin, lalu buka **`/admin`** (dashboard).
- **Kelola layanan** di **`/admin/layanan`** — buat (`/admin/layanan/baru`), edit (`/admin/layanan/[id]`), dan aktif/nonaktifkan lewat toggle. Perubahan harga/detail langsung ter-reflect di halaman publik `/layanan`.
- **Setelan estimator** di **`/admin/pengaturan`** — atur radius bebas biaya, tarif per km, dan biaya transport dasar yang dipakai kalkulator tarif Homecare.

Halaman detail layanan **`/layanan/[id]` di-render dinamis** (server-rendered on demand), sehingga layanan baru yang dibuat admin langsung muncul dan bisa dibuka publik **tanpa perlu build ulang**.

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (`next dev`) di port 3000 |
| `npm run build` | Build produksi (`next build`) |
| `npm start` | Jalankan hasil build produksi (`next start`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | End-to-end test (Playwright) |
| `npm run db:seed` | Isi database dengan data awal (`tsx prisma/seed.ts`) |
| `npm run db:seed-admin` | Buat/update user admin dari `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| `npm run db:reset` | Reset + migrasi ulang database (`prisma migrate reset`) |

## Routes

| URL | Halaman |
|-----|---------|
| `/` | Edu Hub (Dashboard) |
| `/layanan` | Daftar layanan |
| `/layanan/[id]` | Detail layanan (tampilan per kategori) |
| `/layanan/[id]/booking` | Formulir reservasi (per kategori) |
| `/masuk` | Login |
| `/daftar` | Registrasi (auto sign-in) |
| `/admin` | Dashboard admin (khusus role `ADMIN`) |
| `/admin/layanan` | Kelola layanan (daftar, aktif/nonaktif) |
| `/admin/layanan/baru` | Buat layanan baru |
| `/admin/layanan/[id]` | Edit layanan |
| `/admin/pengaturan` | Setelan estimator (tarif transport) |

Kategori layanan: **Homecare** (jarak + transport), **Klinik**, **Kelas Privat** (online/offline), **Webinar** (jadwal tetap + email).

## Struktur

```
src/
  app/                  # Next.js App Router
    layout.tsx          # Root layout (header/footer)
    page.tsx            # Edu Hub (Dashboard)
    globals.css         # Stylesheet global
    layanan/            # Daftar + detail + booking layanan
      layout.tsx        # Layout + state bersama (React Context)
      page.tsx          # Daftar layanan
      [id]/page.tsx     # Detail tertarget per kategori
      [id]/booking/page.tsx  # Reservasi tertarget per kategori
    api/
      chat/route.ts     # API Gemini (Minbee)
      estimator/route.ts # API kalkulasi tarif
  components/
    Dashboard.tsx       # Edu Hub: hero, program, diagnostik, testimoni
  services/             # Alur Klinik & Homecare
    ServiceList.tsx     # Daftar layanan
    ServiceDetail.tsx   # Detail tertarget per kategori
    ServiceBooking.tsx  # Reservasi tertarget per kategori
    serviceConfig.ts    # Deskriptor kategori
    estimator.ts        # Fungsi murni kalkulasi tarif
    useEstimate.ts      # Hook kalkulasi tarif
  lib/                  # Query layer (server-only, pakai Prisma)
    db.ts               # Prisma Client singleton
    services.ts         # Query layanan
    challenges.ts       # Query challenge
    settings.ts         # Setelan estimator
  types.ts
prisma/
  schema.prisma         # Model Service, Challenge, Setting
  migrations/           # Migrasi SQL
  seed.ts               # Skrip seed
  seed-data.ts          # Data challenge untuk seed
```
