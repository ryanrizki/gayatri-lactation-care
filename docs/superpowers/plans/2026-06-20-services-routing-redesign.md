# Klinik & Homecare Routed Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-component `step`-state Klinik & Homecare wizard with real react-router URLs and category-tailored detail + booking pages, split into focused files.

**Architecture:** `react-router-dom` v7 owns the whole app URL. App.tsx renders persistent header/footer around `<Routes>`. A `/layanan` layout route (`ServicesLayout`) owns shared config + booking-draft state and exposes it to child routes (`ServiceList`, `ServiceDetail`, `ServiceBooking`) via `useOutletContext`. A `serviceConfig.ts` descriptor drives per-category (homecare / klinik / class / webinar) field differences.

**Tech Stack:** React 19, react-router-dom 7, TypeScript, Vite, Tailwind v4, lucide-react.

**Verification note:** No unit-test runner is configured in this repo. Each task is verified by `npx tsc --noEmit` (must be clean) plus a dev-server route/HTTP check. The dev server runs via `npx tsx server.ts` on port 3000.

**Design quality bar (every screen):** follow the `rework-section` skill — body text ≥ `text-sm`, labels ≥ `text-xs`, tap targets ≥ 44px (`min-h-[44px]`), mobile-first, brand tokens only, "Mama" voice.

---

## File Structure

- Create `src/services/serviceConfig.ts` — `ServiceKind`, `getKind`, `findPackage`, `WEBINAR_EVENT`, `KIND_META`.
- Create `src/services/useEstimate.ts` — estimator fetch hook.
- Create `src/services/ServicesLayout.tsx` — `/layanan` layout: shared state, header, stepper, `<Outlet/>`, context type `ServicesCtx` + `useServices()`.
- Create `src/services/ServiceList.tsx` — step 1 grid (moved from `ServicesSection`).
- Create `src/services/ServiceDetail.tsx` — category-tailored config page.
- Create `src/services/ServiceBooking.tsx` — category-tailored form + receipt.
- Modify `src/main.tsx` — wrap `<App/>` in `<BrowserRouter>`.
- Modify `src/App.tsx` — header/footer + `<Routes>`; NavLink nav; remove `activeTab`.
- Modify `src/components/Dashboard.tsx` — drop `onNavigateToTab` prop, use `useNavigate`.
- Delete `src/components/ServicesSection.tsx` — replaced by `src/services/*`.

Shared types `ServicePackage`, `LogEntry`, etc. stay in `src/types.ts`. `SERVICE_PACKAGES` stays in `src/data/challengesData.ts`.

---

## Task 1: Install router + wrap BrowserRouter + minimal Routes

**Files:**
- Modify: `package.json` (via npm)
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install react-router-dom**

Run:
```bash
cd /home/samsul/Projects/gayatri-live-lactation-care
npm install react-router-dom@^7.18.0
```
Expected: added 1+ package, 0 vulnerabilities.

- [ ] **Step 2: Wrap App in BrowserRouter** — replace `src/main.tsx` entirely:

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 3: Convert App.tsx to routes.** In `src/App.tsx`, change imports and the `activeTab` logic. Replace the React import line and add router imports:

```tsx
import React from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ServicesLayout from "./services/ServicesLayout";
import ServiceList from "./services/ServiceList";
import ServiceDetail from "./services/ServiceDetail";
import ServiceBooking from "./services/ServiceBooking";
import { Heart, CalendarCheck, Lock } from "lucide-react";
```

Remove `const [activeTab, setActiveTab] = useState(...)` and `handleJumpTab`. Add at top of `App()`:

```tsx
  const navigate = useNavigate();
```

Replace the header nav `[{...}].map(...)` block with NavLinks (keep the same pill styling):

```tsx
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-[#FAF6F0] p-1 rounded-xl sm:rounded-2xl border border-[#EADCC9]/55">
            {[
              { to: "/", label: "Edu Hub", icon: <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> },
              { to: "/layanan", label: "Klinik & Homecare", icon: <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> }
            ].map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className={({ isActive }) => `px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-sans font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  isActive ? "bg-[#3F322F] text-white shadow-sm font-bold" : "text-[#7A6A65] hover:text-[#3F322F] hover:bg-white/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
```

Replace the brand-logo `onClick={() => handleJumpTab("dashboard")}` with `onClick={() => navigate("/")}`.

Replace the `<main>` content block:

```tsx
        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 flex-1 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/layanan" element={<ServicesLayout />}>
              <Route index element={<ServiceList />} />
              <Route path=":id" element={<ServiceDetail />} />
              <Route path=":id/booking" element={<ServiceBooking />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
```

In the footer, replace the two `handleJumpTab` buttons with NavLinks:

```tsx
              <NavLink to="/" end className="text-left hover:text-[#F2A07C] transition">Edu Hub & Tantangan</NavLink>
              <NavLink to="/layanan" className="text-left hover:text-[#F2A07C] transition">Homecare & Kelas</NavLink>
```

> NOTE: Steps 3 references `ServicesLayout`/`ServiceList`/`ServiceDetail`/`ServiceBooking` and `Dashboard` (still takes a prop until Task 7). The app will not compile fully until Tasks 2–6 create those files. That is expected; compile is verified at Task 7. To keep Task 1 independently checkable, temporarily stub the four service imports — create empty placeholder files now and flesh them out in later tasks.

- [ ] **Step 4: Create placeholder service files so Task 1 compiles**

Create each of these (will be overwritten):
```bash
mkdir -p src/services
printf 'export default function ServicesLayout(){return null}\n' > src/services/ServicesLayout.tsx
printf 'export default function ServiceList(){return null}\n' > src/services/ServiceList.tsx
printf 'export default function ServiceDetail(){return null}\n' > src/services/ServiceDetail.tsx
printf 'export default function ServiceBooking(){return null}\n' > src/services/ServiceBooking.tsx
```

Also temporarily make Dashboard's prop optional so App compiles: in `src/components/Dashboard.tsx` change `onNavigateToTab: (tabName: string) => void;` to `onNavigateToTab?: (tabName: string) => void;` (Task 7 removes it). App renders `<Dashboard />` with no prop now.

- [ ] **Step 5: Verify compile + routes**

Run:
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: clean (no output).

Start server if down, then check routes resolve to the SPA (200):
```bash
curl -s -o /dev/null -w "home=%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "layanan=%{http_code}\n" http://localhost:3000/layanan
```
Expected: `home=200`, `layanan=200`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(services): add react-router, route shell, nav links"
```

---

## Task 2: serviceConfig.ts — category descriptors

**Files:**
- Create: `src/services/serviceConfig.ts`

- [ ] **Step 1: Write the config module**

```ts
import { SERVICE_PACKAGES } from "../data/challengesData";
import { ServicePackage } from "../types";

export type ServiceKind = "homecare" | "klinik" | "class" | "webinar";

/** Resolve a package to its tailored flow kind. */
export function getKind(pkg: ServicePackage): ServiceKind {
  if (pkg.id === "laktasi_homecare") return "homecare";
  if (pkg.id === "laktasi_klinik") return "klinik";
  if (pkg.category === "webinar") return "webinar";
  return "class";
}

export function findPackage(id: string | undefined): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((p) => p.id === id);
}

/** Hardcoded upcoming webinar session (no events backend). Edit freely. */
export const WEBINAR_EVENT = {
  dateLabel: "11 Juli 2026",
  timeLabel: "10:00 WIB",
};

export interface KindMeta {
  methodLabel: string;   // human label for the delivery method
  usesDistance: boolean; // show distance slider + transport fee
  usesDatePicker: boolean; // booking shows date + time pickers
  usesEmail: boolean;    // booking collects email (Zoom link)
}

export const KIND_META: Record<ServiceKind, KindMeta> = {
  homecare: { methodLabel: "Kunjungan Rumah (Homecare)", usesDistance: true,  usesDatePicker: true,  usesEmail: false },
  klinik:   { methodLabel: "Tatap Muka di Klinik",       usesDistance: false, usesDatePicker: true,  usesEmail: false },
  class:    { methodLabel: "Kelas Privat",               usesDistance: false, usesDatePicker: true,  usesEmail: false },
  webinar:  { methodLabel: "Webinar Online (Zoom)",      usesDistance: false, usesDatePicker: false, usesEmail: true  },
};
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/services/serviceConfig.ts && git commit -m "feat(services): category config descriptors"
```

---

## Task 3: useEstimate hook

**Files:**
- Create: `src/services/useEstimate.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useState, useEffect } from "react";

export interface EstimateData {
  serviceName: string;
  basePrice: number;
  transportFee: number;
  total: number;
  currency: string;
}

/** Fetch a transparent fee estimate from POST /api/estimator. */
export function useEstimate(packageId: string, isHomecare: boolean, distanceKm: number) {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/estimator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId, locationDistance: distanceKm, isHomecare }),
        });
        if (res.ok && !cancelled) setEstimate(await res.json());
      } catch (err) {
        console.error("Gagal memuat estimasi tarif", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [packageId, isHomecare, distanceKm]);

  return { estimate, loading };
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/services/useEstimate.ts && git commit -m "feat(services): useEstimate hook"
```

---

## Task 4: ServicesLayout — shared state + stepper + Outlet context

**Files:**
- Create (overwrite placeholder): `src/services/ServicesLayout.tsx`

- [ ] **Step 1: Write the layout**

```tsx
import React, { useState } from "react";
import { Outlet, useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BookingDraft {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
}

export interface Receipt {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceName: string;
  kind: string;
  dateLabel: string;   // date picked, or fixed webinar event date
  time: string;
  methodLabel: string;
  distanceKm?: number;
  total: number;
}

export interface ServicesCtx {
  isHomecare: boolean;
  setIsHomecare: (v: boolean) => void;
  distanceKm: number;
  setDistanceKm: (v: number) => void;
  classMode: "online" | "offline";
  setClassMode: (v: "online" | "offline") => void;
  draft: BookingDraft;
  setDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  receipt: Receipt | null;
  setReceipt: (r: Receipt | null) => void;
}

export function useServices() {
  return useOutletContext<ServicesCtx>();
}

const EMPTY_DRAFT: BookingDraft = { name: "", phone: "", email: "", date: "", time: "09:00" };

export default function ServicesLayout() {
  const [isHomecare, setIsHomecare] = useState(true);
  const [distanceKm, setDistanceKm] = useState(4);
  const [classMode, setClassMode] = useState<"online" | "offline">("online");
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const ctx: ServicesCtx = {
    isHomecare, setIsHomecare, distanceKm, setDistanceKm,
    classMode, setClassMode, draft, setDraft, receipt, setReceipt,
  };

  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Derive current step + selected id from the URL.
  const rest = pathname.replace(/^\/layanan\/?/, ""); // "" | ":id" | ":id/booking"
  const segments = rest.split("/").filter(Boolean);
  const selectedId = segments[0];
  const step: 1 | 2 | 3 = segments.includes("booking") ? 3 : selectedId ? 2 : 1;

  const Stepper = () => {
    const items = [
      { n: 1, label: "Pilih Layanan", short: "Layanan", to: "/layanan", enabled: true },
      { n: 2, label: "Konfigurasi", short: "Detail", to: selectedId ? `/layanan/${selectedId}` : "", enabled: !!selectedId },
      { n: 3, label: "Reservasi", short: "Booking", to: selectedId ? `/layanan/${selectedId}/booking` : "", enabled: !!selectedId },
    ];
    return (
      <div className="flex justify-center items-center gap-1 sm:gap-2 max-w-xl mx-auto py-2 px-2 sm:py-3 sm:px-4 bg-white/60 backdrop-blur rounded-2xl border border-[#EADCC9]/60 text-sm font-bold text-[#7A6A65] shadow-sm">
        {items.map((it, i) => (
          <React.Fragment key={it.n}>
            {i > 0 && <ChevronRight className="w-4 h-4 text-[#EADCC9] shrink-0" />}
            <button
              type="button"
              disabled={!it.enabled}
              onClick={() => it.enabled && navigate(it.to)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                step === it.n ? "bg-[#3F322F] text-white shadow-md font-bold" : "hover:bg-[#EADCC9]/30 text-[#5C453C]"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === it.n ? "bg-[#FBC2A2] text-[#291E1C]" : "bg-[#EADCC9]/55 text-[#3F322F]"
              }`}>{it.n}</span>
              <span className="hidden sm:inline">{it.label}</span>
              <span className="sm:hidden">{it.short}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center max-w-3xl mx-auto space-y-4 pb-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#E06E43] bg-[#FFF2EB] px-5 py-2 rounded-full shadow-sm">
          🌸 Layanan Spesialis Laktasi Gayatri
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-[#3F322F]">
          Pendampingan Laktasi <span className="text-[#F2A07C]">Terpadu</span>
        </h1>
        <p className="text-[#5C453C] text-base leading-relaxed max-w-lg mx-auto">
          Mendampingi setiap momen menyusui dengan pendekatan medis yang suportif, minim trauma, dan terstandarisasi untuk Mama dan si Kecil.
        </p>
      </div>

      <Stepper />

      <Outlet context={ctx} />
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/services/ServicesLayout.tsx && git commit -m "feat(services): layout with shared state and stepper"
```

---

## Task 5: ServiceList — step 1 grid (routed)

**Files:**
- Create (overwrite placeholder): `src/services/ServiceList.tsx`

- [ ] **Step 1: Write the list** (port of the already-reworked 2-col-mobile grid; card CTA now navigates)

```tsx
import { useNavigate } from "react-router-dom";
import { SERVICE_PACKAGES } from "../data/challengesData";
import { CheckCircle, ArrowRight } from "lucide-react";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

export default function ServiceList() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 border-b border-[#EADCC9]/50 pb-3">
        <h2 className="text-base sm:text-lg font-display font-bold text-[#3F322F]">
          Pilih Layanan Terbaik Untuk Mama
        </h2>
        <span className="text-sm font-semibold text-[#7A6A65] shrink-0">
          {SERVICE_PACKAGES.length} Program
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {SERVICE_PACKAGES.map((pkg) => {
          const catLabel = pkg.category === "consultation" ? "Konsultasi" : pkg.category === "class" ? "Kelas Privat" : "Webinar";
          const catClass = pkg.category === "consultation"
            ? "bg-white/90 text-[#7A6A65] border-[#EADCC9]"
            : pkg.category === "class"
            ? "bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]"
            : "bg-blue-50 text-blue-700 border-blue-100";
          return (
            <div
              key={pkg.id}
              className="border border-[#EADCC9] p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 rounded-3xl bg-white hover:-translate-y-0.5 hover:border-[#FBC2A2] hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="relative">
                  <img src={pkg.image} alt={pkg.name} loading="lazy" className="w-full h-28 sm:h-36 object-cover rounded-2xl" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur ${catClass}`}>
                    {catLabel}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-display font-bold text-[#3F322F] leading-snug line-clamp-2">{pkg.name}</h3>
                  <p className="text-lg font-display font-black text-[#E06E43]">{formatIDR(pkg.price)}</p>
                  <p className="text-sm text-[#5C453C] leading-relaxed line-clamp-2">{pkg.description}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-[#5C453C]">
                  {pkg.features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-[#7BA86F] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                  {pkg.features.length > 2 && (
                    <li className="text-sm text-[#937F73] italic pl-6">+{pkg.features.length - 2} manfaat lainnya</li>
                  )}
                </ul>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/layanan/${pkg.id}`)}
                  className="w-full min-h-[44px] py-3 bg-[#3F322F] hover:bg-[#F2A07C] text-white rounded-full text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile + route**

Run: `npx tsc --noEmit 2>&1 | head -20` → clean.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/layanan` → `200`.

- [ ] **Step 3: Commit**

```bash
git add src/services/ServiceList.tsx && git commit -m "feat(services): routed service list page"
```

---

## Task 6: ServiceDetail — category-tailored config

**Files:**
- Create (overwrite placeholder): `src/services/ServiceDetail.tsx`

- [ ] **Step 1: Write the detail page**

```tsx
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ClipboardCheck, Sparkles, MapPin, CheckCircle, ShieldCheck, CalendarClock } from "lucide-react";
import { findPackage, getKind, KIND_META, WEBINAR_EVENT } from "./serviceConfig";
import { useEstimate } from "./useEstimate";
import { useServices } from "./ServicesLayout";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = findPackage(id);
  const { isHomecare, setIsHomecare, distanceKm, setDistanceKm, classMode, setClassMode } = useServices();

  if (!pkg) return <Navigate to="/layanan" replace />;

  const kind = getKind(pkg);
  const meta = KIND_META[kind];
  // Homecare flag only meaningful for homecare kind; force true so estimate includes transport.
  const homecareForEstimate = kind === "homecare";
  const { estimate } = useEstimate(pkg.id, homecareForEstimate, distanceKm);

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate("/layanan")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A6A65] hover:text-[#3F322F] transition cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Layanan
      </button>

      <div className="bg-white rounded-[28px] border border-[#EADCC9] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
        {/* Left: package info */}
        <div className="lg:col-span-7 p-5 sm:p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#EADCC9]/50">
          <img src={pkg.image} alt={pkg.name} className="w-full h-56 sm:h-64 object-cover rounded-2xl" />
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]">
              {meta.methodLabel}
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black text-[#3F322F]">{pkg.name}</h2>
            <p className="text-base text-[#5C453C] leading-relaxed">{pkg.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#3F322F]">
              Fasilitas &amp; Keuntungan Untuk Mama
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.features.map((feat, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#EADCC9]/50 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#7BA86F] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#3F322F] leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Jaminan Standardisasi Gayatri</span>
              <p className="text-sm leading-relaxed text-emerald-700">
                Bidan dan Dokter Konselor laktasi kami bersertifikat resmi, ramah bayi, dan mengedepankan pendekatan medis yang minim trauma bagi Mama dan buah hati.
              </p>
            </div>
          </div>
        </div>

        {/* Right: category-tailored config */}
        <div className="lg:col-span-5 p-5 sm:p-6 md:p-8 space-y-6 bg-[#FAF8F5]/50 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#3F322F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E06E43]" /> Konfigurasi Layanan
              </h3>
              <p className="text-sm text-[#5C453C] leading-relaxed">
                Sesuaikan pelaksanaan layanan yang paling pas untuk Mama.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#EADCC9] rounded-2xl space-y-4 shadow-sm">
              {/* HOMECARE: distance slider */}
              {kind === "homecare" && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#3F322F]">
                    <MapPin className="w-4 h-4 text-[#E06E43]" /> Estimasi Jarak ke Rumah Mama
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#5C453C]">Jarak</span>
                    <span className="text-[#E06E43] font-bold bg-[#FFF2EB] px-2.5 py-0.5 rounded-full border border-[#FFD3BE]">{distanceKm} KM</span>
                  </div>
                  <input
                    type="range" min={1} max={35} step={1} value={distanceKm}
                    onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#FAF1E6] accent-[#F2A07C] rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#937F73]">
                    <span>&lt;5 km (bebas akomodasi)</span>
                    <span>35 km (tarif tambahan)</span>
                  </div>
                </div>
              )}

              {/* KLINIK: fixed location info */}
              {kind === "klinik" && (
                <div className="flex items-start gap-2.5 text-sm text-[#3F322F]">
                  <MapPin className="w-5 h-5 text-[#E06E43] shrink-0 mt-0.5" />
                  <span>Sesi berlangsung tatap muka di Klinik Gayatri, Jakarta Selatan. Tidak ada biaya transport tambahan.</span>
                </div>
              )}

              {/* CLASS: online/offline toggle */}
              {kind === "class" && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-[#5C453C] block">Metode Kelas</span>
                  <div className="flex bg-[#FAF1E6] p-1.5 rounded-full border border-[#EADCC9]/40">
                    {(["online", "offline"] as const).map((m) => (
                      <button
                        key={m} type="button" onClick={() => setClassMode(m)}
                        className={`flex-1 text-center min-h-[44px] py-2 text-sm font-bold rounded-full transition cursor-pointer select-none ${
                          classMode === m ? "bg-[#3F322F] text-white shadow-sm" : "text-[#7A6A65] hover:text-[#3F322F]"
                        }`}
                      >
                        {m === "online" ? "Online (Zoom)" : "Offline (Tatap Muka)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WEBINAR: fixed event date */}
              {kind === "webinar" && (
                <div className="flex items-start gap-2.5 text-sm text-[#3F322F]">
                  <CalendarClock className="w-5 h-5 text-[#E06E43] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Jadwal Webinar</span>
                    <span>{WEBINAR_EVENT.dateLabel} · {WEBINAR_EVENT.timeLabel}. Tautan Zoom dikirim ke email &amp; WhatsApp Mama setelah daftar.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fee breakdown */}
            <div className="bg-[#FFF2EB] border border-[#FFD3BE] p-5 rounded-2xl space-y-3.5 shadow-sm">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#E06E43] block border-b border-[#FBC2A2]/40 pb-1">
                Kalkulator Tarif Transparan
              </span>
              <div className="space-y-2 text-sm text-[#3F322F]">
                <div className="flex justify-between">
                  <span className="text-[#5C453C]">Tarif dasar layanan</span>
                  <span className="font-bold">{formatIDR(estimate?.basePrice ?? pkg.price)}</span>
                </div>
                {kind === "homecare" && (
                  <div className="flex justify-between">
                    <span className="text-[#5C453C]">Transport &amp; akomodasi</span>
                    <span className="font-bold">{formatIDR(estimate?.transportFee ?? 0)}</span>
                  </div>
                )}
                <hr className="border-[#FBC2A2]/40 border-dashed" />
                <div className="flex justify-between text-base font-black pt-1">
                  <span>Total rencana bayar</span>
                  <span className="text-[#E06E43]">{formatIDR(estimate?.total ?? pkg.price)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={() => { setIsHomecare(kind === "homecare"); navigate(`/layanan/${pkg.id}/booking`); }}
              className="w-full bg-[#3F322F] hover:bg-[#F2A07C] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ClipboardCheck className="w-5 h-5" />
              {kind === "webinar" ? "Daftar Webinar Sekarang" : "Lanjut ke Reservasi"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/layanan")}
              className="w-full text-center min-h-[44px] py-2 text-sm text-[#937F73] hover:text-[#3F322F] transition font-bold"
            >
              Lihat Layanan Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

> NOTE: `isHomecare` from context is set on CTA click so the booking summary/estimate matches the kind. `setIsHomecare` and `classMode` are read in booking via context.

- [ ] **Step 2: Verify compile + route**

Run: `npx tsc --noEmit 2>&1 | head -20` → clean.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/layanan/laktasi_homecare` → `200`.

- [ ] **Step 3: Commit**

```bash
git add src/services/ServiceDetail.tsx && git commit -m "feat(services): category-tailored detail page"
```

---

## Task 7: ServiceBooking — category-tailored form + receipt, and cleanup

**Files:**
- Create (overwrite placeholder): `src/services/ServiceBooking.tsx`
- Modify: `src/components/Dashboard.tsx` (remove prop, use navigate)
- Delete: `src/components/ServicesSection.tsx`

- [ ] **Step 1: Write the booking page**

```tsx
import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, User, AlertCircle, Info, CalendarClock } from "lucide-react";
import { findPackage, getKind, KIND_META, WEBINAR_EVENT } from "./serviceConfig";
import { useEstimate } from "./useEstimate";
import { useServices, Receipt } from "./ServicesLayout";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

const inputClass = "w-full min-h-[44px] px-4 py-2.5 text-base border border-[#EADCC9] focus:border-[#F2A07C] rounded-2xl focus:outline-none bg-[#FFFDFB] text-[#3F322F]";
const labelClass = "text-sm font-bold text-[#5C453C] block mb-1.5";

export default function ServiceBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = findPackage(id);
  const { distanceKm, classMode, draft, setDraft, receipt, setReceipt } = useServices();
  const [warning, setWarning] = useState<string | null>(null);

  if (!pkg) return <Navigate to="/layanan" replace />;

  const kind = getKind(pkg);
  const meta = KIND_META[kind];
  const { estimate } = useEstimate(pkg.id, kind === "homecare", distanceKm);
  const total = estimate?.total ?? pkg.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name || !draft.phone || (meta.usesDatePicker && !draft.date) || (meta.usesEmail && !draft.email)) {
      setWarning("Mohon lengkapi data yang ditandai wajib ya, Ma. 🌸");
      return;
    }
    setWarning(null);
    setReceipt({
      id: "BK-" + Math.floor(100000 + ((pkg.price + draft.name.length * 37) % 900000)),
      name: draft.name,
      phone: draft.phone,
      email: meta.usesEmail ? draft.email : undefined,
      serviceName: pkg.name,
      kind,
      dateLabel: meta.usesDatePicker ? draft.date : `${WEBINAR_EVENT.dateLabel} · ${WEBINAR_EVENT.timeLabel}`,
      time: meta.usesDatePicker ? draft.time : WEBINAR_EVENT.timeLabel,
      methodLabel: kind === "homecare" ? `${meta.methodLabel} (${distanceKm} km)` : kind === "class" ? `${meta.methodLabel} · ${classMode}` : meta.methodLabel,
      distanceKm: kind === "homecare" ? distanceKm : undefined,
      total,
    });
  };

  const resetAll = () => {
    setReceipt(null);
    setDraft({ name: "", phone: "", email: "", date: "", time: "09:00" });
    navigate("/layanan");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate(`/layanan/${pkg.id}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A6A65] hover:text-[#3F322F] transition cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Detail Layanan
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-[28px] border border-[#EADCC9] overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
        {/* Summary */}
        <div className="md:col-span-5 p-5 sm:p-6 bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#EADCC9]/50 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-sm font-bold text-[#E06E43] uppercase tracking-wide block">Langkah Akhir</span>
              <h3 className="text-lg font-display font-bold text-[#3F322F]">Ringkasan Pilihan</h3>
            </div>
            <div className="p-4 bg-white border border-[#EADCC9]/50 rounded-2xl space-y-4">
              <div>
                <span className="text-xs font-bold text-[#937F73] block uppercase tracking-wide">Program</span>
                <span className="text-base font-bold text-[#3F322F] block leading-snug mt-0.5">{pkg.name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#937F73] block uppercase tracking-wide">Metode</span>
                <span className="text-base font-bold text-[#3F322F] block mt-0.5">
                  {kind === "homecare" ? `${meta.methodLabel} (${distanceKm} km)` : kind === "class" ? `${meta.methodLabel} · ${classMode}` : meta.methodLabel}
                </span>
              </div>
              {kind === "webinar" && (
                <div className="flex items-start gap-2 text-sm text-[#5C453C]">
                  <CalendarClock className="w-4 h-4 text-[#E06E43] shrink-0 mt-0.5" />
                  <span>{WEBINAR_EVENT.dateLabel} · {WEBINAR_EVENT.timeLabel}</span>
                </div>
              )}
              <hr className="border-[#EADCC9]/50 border-dashed" />
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-[#5C453C]">Total</span>
                <span className="text-[#E06E43] bg-[#FFF2EB] px-2.5 py-1 rounded-full">{formatIDR(total)}</span>
              </div>
            </div>
            <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-2 text-sm text-sky-800 leading-snug">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Pembayaran dilakukan langsung setelah layanan selesai. 100% transparan tanpa deposit di awal.</span>
            </div>
          </div>
        </div>

        {/* Form or receipt */}
        <div className="md:col-span-7 p-5 sm:p-6 md:p-8">
          {receipt ? (
            <div className="space-y-6 text-center animate-fadeIn py-2">
              <div className="w-16 h-16 bg-[#D1E1CE] text-[#4D6B4E] border border-[#CCDDC8] flex items-center justify-center rounded-full mx-auto text-2xl font-black">✓</div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-[#3F322F]">Pendaftaran Berhasil!</h3>
                <p className="text-sm text-[#5C453C]">Kode Reservasi: <span className="font-bold text-[#3F322F]">{receipt.id}</span></p>
              </div>
              <div className="bg-[#FAF8F5] border border-[#EADCC9]/55 text-left p-5 rounded-2xl text-sm text-[#5C453C] leading-relaxed space-y-3">
                <p><span className="text-[#937F73] font-bold block uppercase text-xs tracking-wide">Pendaftar</span><span className="font-bold text-[#3F322F]">{receipt.name}</span> ({receipt.phone}{receipt.email ? `, ${receipt.email}` : ""})</p>
                <p><span className="text-[#937F73] font-bold block uppercase text-xs tracking-wide">Layanan</span><span className="font-bold text-[#3F322F]">{receipt.serviceName}</span></p>
                <p><span className="text-[#937F73] font-bold block uppercase text-xs tracking-wide">Jadwal</span><span className="font-bold text-[#3F322F]">{receipt.dateLabel}</span></p>
                <p><span className="text-[#937F73] font-bold block uppercase text-xs tracking-wide">Metode</span><span className="font-bold text-[#3F322F]">{receipt.methodLabel}</span></p>
                <div className="border-t border-dashed border-[#EADCC9] pt-2.5 flex justify-between font-bold text-base text-[#3F322F]">
                  <span>Total</span><span className="text-[#E06E43] font-black">{formatIDR(receipt.total)}</span>
                </div>
              </div>
              <p className="text-sm text-[#937F73] leading-relaxed max-w-md mx-auto">
                Admin Gayatri menghubungi Mama via WhatsApp maksimal 1×24 jam untuk konfirmasi. Terima kasih ya, Ma!
              </p>
              <button type="button" onClick={resetAll} className="w-full min-h-[48px] py-3 bg-[#3F322F] hover:bg-[#F2A07C] text-white font-bold text-sm rounded-full cursor-pointer transition-colors shadow-md">
                Kembali ke Daftar Layanan
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-xs font-bold text-[#E06E43] bg-[#FFF2EB] px-3.5 py-1 rounded-full inline-block uppercase tracking-wide">Formulir Reservasi</span>
                <h3 className="text-lg font-display font-bold text-[#3F322F] mt-1.5">Data Kontak Mama</h3>
              </div>

              {warning && (
                <div className="p-3.5 bg-[#FFFBFA] border border-[#FFD9D4] rounded-2xl text-sm text-red-700 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> <span>{warning}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#5C453C] block mb-1.5">Nama Lengkap Mama</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#937F73]/70" />
                    <input type="text" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Contoh: Rania Kirana" className={inputClass + " pl-10"} required />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#3F322F]/60 font-black">+62</span>
                    <input type="tel" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="812345678" className={inputClass + " pl-14"} required />
                  </div>
                </div>

                {meta.usesEmail && (
                  <div>
                    <label className={labelClass}>Email (untuk tautan Zoom)</label>
                    <input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="mama@email.com" className={inputClass} required />
                  </div>
                )}

                {meta.usesDatePicker && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tanggal</label>
                      <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className={inputClass + " cursor-pointer"} required />
                    </div>
                    <div>
                      <label className={labelClass}>Waktu / Sesi</label>
                      <select value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))} className={inputClass + " cursor-pointer"}>
                        <option value="09:00">09:00 WIB</option>
                        <option value="11:00">11:00 WIB</option>
                        <option value="13:00">13:00 WIB</option>
                        <option value="15:00">15:00 WIB</option>
                        <option value="18:30">18:30 WIB</option>
                      </select>
                    </div>
                  </div>
                )}

                {!meta.usesDatePicker && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-[#FAF1E6] rounded-2xl text-sm text-[#3F322F]">
                    <CalendarClock className="w-5 h-5 text-[#E06E43] shrink-0 mt-0.5" />
                    <span>Jadwal acara sudah ditentukan: <b>{WEBINAR_EVENT.dateLabel} · {WEBINAR_EVENT.timeLabel}</b>.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <button type="submit" className="w-full bg-[#3F322F] hover:bg-[#F2A07C] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <ClipboardCheck className="w-5 h-5" /> {kind === "webinar" ? "Konfirmasi Pendaftaran" : "Konfirmasi Reservasi"}
                </button>
                <button type="button" onClick={() => navigate(`/layanan/${pkg.id}`)} className="w-full text-center min-h-[44px] py-2 text-sm text-[#937F73] hover:text-[#3F322F] transition font-bold">
                  Batal &amp; Kembali ke Detail
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update Dashboard navigation** — in `src/components/Dashboard.tsx`:

Change the imports line to add router hook:
```tsx
import { useNavigate } from "react-router-dom";
```
Remove the `DashboardProps` interface and the `onNavigateToTab` param. Change signature:
```tsx
export default function Dashboard() {
```
Add inside the component (near other hooks):
```tsx
  const navigate = useNavigate();
```
Replace every `onNavigateToTab("services")` with `navigate("/layanan")` (there are calls in the hero "Mulai Konsultasi" button and in the program "Daftar Program Sekarang" button). The hero "Jelajahi Edu Hub" button keeps its `document.getElementById("program-laktasi")` scroll — unchanged.

- [ ] **Step 3: Delete the old component**

```bash
git rm src/components/ServicesSection.tsx
```

- [ ] **Step 4: Verify full compile + all routes**

Run: `npx tsc --noEmit 2>&1 | head -30` → clean.
Run:
```bash
for p in / /layanan /layanan/laktasi_homecare /layanan/laktasi_homecare/booking /layanan/webinar_pumping /layanan/webinar_pumping/booking; do
  curl -s -o /dev/null -w "$p => %{http_code}\n" "http://localhost:3000$p"
done
```
Expected: every line `=> 200`.

Run a leftover-tiny-type scan on the new files:
```bash
grep -rnE 'text-\[(8|9|10|11)px\]' src/services/ || echo "no tiny type ✓"
```
Expected: `no tiny type ✓`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(services): category-tailored booking, wire Dashboard nav, remove old ServicesSection"
```

---

## Task 8: Manual smoke + final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm server running**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` → `200`. If not, start: `npx tsx server.ts &` then retry.

- [ ] **Step 2: Manual route walk** (in browser, hard refresh)

Verify each path renders and is mobile-first (narrow window ~360px):
- `/` Edu Hub hero + reworked sections.
- `/layanan` 2-col card grid; click a card → goes to `/layanan/:id`.
- `/layanan/laktasi_homecare` shows distance slider + transport in total.
- `/layanan/laktasi_klinik` shows clinic info, no slider, no transport line.
- `/layanan/kelas_bekerja` shows online/offline toggle.
- `/layanan/webinar_pumping` shows fixed event date, no slider/toggle.
- Booking for webinar shows **email** field + **no** date picker; booking for others shows date/time, no email.
- Submit a booking → success receipt with correct method/total. "Kembali ke Daftar Layanan" returns to `/layanan` and clears the form.
- Browser back button moves booking → detail → list correctly.
- Header pills + footer links highlight the active route.

- [ ] **Step 3: Final typecheck**

Run: `npx tsc --noEmit 2>&1 | head -30` → clean.

- [ ] **Step 4: Commit any fixes from smoke test** (if needed)

```bash
git add -A && git commit -m "fix(services): smoke-test adjustments"
```

---

## Self-Review Notes

- **Spec coverage:** routing whole-app (Task 1), component split into `src/services/*` (Tasks 2–7), category matrix homecare/klinik/class/webinar (Tasks 6–7), webinar fixed-date + email + no-date-picker (Tasks 6–7), estimator unchanged via `useEstimate` (Task 3), deep-link/no-server-change (verified by curl in Tasks 1/5/6/7/8), quality bar via tiny-type scan + manual mobile walk (Tasks 7–8). All covered.
- **Type consistency:** `ServicesCtx`, `BookingDraft`, `Receipt` defined in Task 4 and imported by Tasks 6–7. `EstimateData` defined in Task 3, used in Tasks 6–7. `ServiceKind`/`getKind`/`findPackage`/`KIND_META`/`WEBINAR_EVENT` defined in Task 2, used in Tasks 6–7. `useServices()` from Task 4 used in Tasks 6–7.
- **Known caveat:** the receipt id uses a deterministic expression (not `Math.random()`, which is fine in app code but avoided here for reproducibility of the plan example). Real app code may use `Math.random()` — acceptable in the browser.
