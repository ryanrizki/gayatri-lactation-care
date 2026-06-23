<div align="center">

# 🌸 Gayatri Layanan Laktasi

**Pendamping perjalanan menyusui Mama** — Edu Hub mandiri, konsultan laktasi, dan pemesanan layanan Klinik & Homecare.

</div>

Aplikasi web pendamping laktasi berbahasa Indonesia. Menyatukan edukasi mandiri (Edu Hub), asisten AI "Minbee", dan alur pemesanan layanan (konsultasi, kelas privat, webinar) yang disesuaikan per kategori.

## Tech Stack

- **React 19** + **Vite 6** + **TypeScript**
- **react-router-dom 7** — routing seluruh aplikasi
- **Tailwind CSS v4** — styling, palet warm pastel
- **Express** — server + API (`/api/chat`, `/api/estimator`)
- **Google Gemini** (`@google/genai`) — asisten laktasi Minbee
- **lucide-react** — ikon

## Run Locally

**Prasyarat:** Node.js

```bash
# 1. Install dependencies
npm install

# 2. (Opsional) set GEMINI_API_KEY untuk asisten Minbee
cp .env.example .env.local   # lalu isi GEMINI_API_KEY

# 3. Jalankan dev server
npm run dev                  # http://localhost:3000
```

Tanpa `GEMINI_API_KEY`, aplikasi tetap jalan — chat Minbee masuk mode fallback, fitur lain (tracker, kalkulator, pemesanan) berfungsi penuh.

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (Express + Vite middleware) di port 3000 |
| `npm run build` | Build SPA + bundle server ke `dist/` |
| `npm start` | Jalankan hasil build produksi |
| `npm run lint` | Type-check (`tsc --noEmit`) |

## Routes

| URL | Halaman |
|-----|---------|
| `/` | Edu Hub (Dashboard) |
| `/layanan` | Daftar layanan |
| `/layanan/:id` | Detail layanan (tampilan per kategori) |
| `/layanan/:id/booking` | Formulir reservasi (per kategori) |

Kategori layanan: **Homecare** (jarak + transport), **Klinik**, **Kelas Privat** (online/offline), **Webinar** (jadwal tetap + email).

## Struktur

```
src/
  App.tsx               # Routing + header/footer
  main.tsx              # BrowserRouter root
  components/
    Dashboard.tsx       # Edu Hub: hero, program, diagnostik, testimoni
  services/             # Alur Klinik & Homecare
    ServicesLayout.tsx  # Layout route + state bersama (Outlet context)
    ServiceList.tsx     # Daftar layanan
    ServiceDetail.tsx   # Detail tertarget per kategori
    ServiceBooking.tsx  # Reservasi tertarget per kategori
    serviceConfig.ts    # Deskriptor kategori
    useEstimate.ts      # Hook kalkulasi tarif
  data/challengesData.ts
  types.ts
server.ts               # Express: API Gemini + estimator
```

## API

- `POST /api/chat` — asisten laktasi Minbee (Gemini). Fallback bila `GEMINI_API_KEY` kosong.
- `POST /api/estimator` — kalkulasi tarif transparan (`packageId`, `locationDistance`, `isHomecare`).
