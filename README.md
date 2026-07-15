<div align="center">

# 🌸 Gayatri Layanan Laktasi

**Pendamping perjalanan menyusui Mama** — Edu Hub mandiri, konsultan laktasi, dan pemesanan layanan Klinik & Homecare.

</div>

Aplikasi web pendamping laktasi berbahasa Indonesia. Menyatukan edukasi mandiri (Edu Hub), asisten AI "Minbee", dan alur pemesanan layanan (konsultasi, kelas privat, webinar) yang disesuaikan per kategori.

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — styling, palet warm pastel
- **Route Handlers** — API (`/api/chat`, `/api/estimator`)
- **Google Gemini** (`@google/genai`) — asisten laktasi Minbee
- **lucide-react** — ikon

## Run Locally

**Prasyarat:** Node.js

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # produksi
npm test                     # unit (Vitest)
npm run test:e2e             # E2E (Playwright)
```

`GEMINI_API_KEY` bersifat opsional (salin `.env.example` ke `.env` lalu isi). Tanpa key, aplikasi tetap jalan — `/api/chat` (Minbee) masuk mode fallback, fitur lain (tracker, kalkulator, pemesanan) berfungsi penuh.

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (`next dev`) di port 3000 |
| `npm run build` | Build produksi (`next build`) |
| `npm start` | Jalankan hasil build produksi (`next start`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | End-to-end test (Playwright) |

## Routes

| URL | Halaman |
|-----|---------|
| `/` | Edu Hub (Dashboard) |
| `/layanan` | Daftar layanan |
| `/layanan/[id]` | Detail layanan (tampilan per kategori) |
| `/layanan/[id]/booking` | Formulir reservasi (per kategori) |

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
    useEstimate.ts      # Hook kalkulasi tarif
  data/challengesData.ts
  types.ts
```
