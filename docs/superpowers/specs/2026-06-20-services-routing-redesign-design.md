# Klinik & Homecare — Routed, Category-Tailored Flow

**Date:** 2026-06-20
**Status:** Approved design, pending implementation plan

## Problem

The Klinik & Homecare experience is a single 727-line `ServicesSection.tsx` component that swaps three views (`list` / `detail` / `booking`) via a `step` state variable. No URLs, no browser back, not shareable, and the file is too large to reason about. Category differences (consultation / class / webinar) are handled with scattered inline conditionals.

## Goals

1. **Real pages** — detail and booking become distinct URL routes (browser back, shareable links).
2. **Category-tailored** detail + booking — consultation, class, and webinar each get the fields and flow that fit them.
3. Split the oversized component into focused units.
4. Keep the Gayatri identity and meet the rework-section skill bar (16px+ type, 44px tap targets, mobile-first, brand tokens).

Non-goals: events backend, payment integration, auth, changing brand colors/fonts, reworking Edu Hub content.

## Architecture

### Routing — react-router-dom v7, whole app

Add `react-router-dom` (v7). `main.tsx` wraps `<App/>` in `<BrowserRouter>`. `App.tsx` replaces `activeTab` state with `<Routes>`.

| URL | Screen | Component |
|-----|--------|-----------|
| `/` | Edu Hub | `Dashboard` |
| `/layanan` | Service list | `ServiceList` |
| `/layanan/:id` | Detail + config | `ServiceDetail` |
| `/layanan/:id/booking` | Booking + receipt | `ServiceBooking` |
| `*` | redirect → `/` | `<Navigate to="/" />` |

- Header nav pills and footer links become `<NavLink>` (active styling via `isActive`).
- Dashboard's `onNavigateToTab("services")` calls become `navigate("/layanan")` (use `useNavigate`).
- Unknown `:id` → redirect to `/layanan`.

**Deep links:** prod `server.ts` already has `app.get("*")` → `index.html`; dev Vite middleware (`appType: "spa"`) serves index.html for unknown paths. API routes are registered before the SPA fallback. **No server change required.**

### Component split (`src/services/`)

- **`ServicesLayout.tsx`** — element for the `/layanan` route tree. Owns shared state: method/`isHomecare`, `distanceKm`, class `mode` (online/offline), booking draft (name, phone, email, date, time), `estimateData`, `bookedReceipt`. Renders the section header + 3-step stepper (stepper visibility/active derived from current route) and `<Outlet context={...} />`. Children consume via `useOutletContext`. This keeps cross-page state without an external store.
- **`ServiceList.tsx`** — step 1 grid. Move the already-reworked 2-column-mobile card grid here. Card CTA navigates to `/layanan/:id`.
- **`ServiceDetail.tsx`** — reads `:id`, renders category-tailored config (see matrix). CTA → `/layanan/:id/booking`.
- **`ServiceBooking.tsx`** — category-tailored form + success receipt. On submit builds receipt, shows confirmation.
- **`serviceConfig.ts`** — `categoryKind(pkg)` helper and a per-category descriptor: which config controls to show, which booking fields, labels, and the hardcoded webinar event date.
- **`useEstimate.ts`** — hook wrapping the `POST /api/estimator` fetch (packageId, locationDistance, isHomecare → estimate). Returns `{ estimate, loading }`.

`ServicesSection.tsx` is removed; routes point at the new components. `SERVICE_PACKAGES`, `ServicePackage`, and existing booking/estimate types stay in their current files.

### Category tailoring

`categoryKind` resolves to one of: `homecare`, `klinik`, `class`, `webinar`
(consultation splits into homecare vs klinik by package id; class and webinar by `pkg.category`).

| Kind | Detail config | Booking fields | Estimate |
|------|---------------|----------------|----------|
| **homecare** (`laktasi_homecare`) | distance slider (1–35 km) + transport breakdown + total | name, WhatsApp, date, time | base + transport |
| **klinik** (`laktasi_klinik`) | clinic info card, fixed price, no distance | name, WhatsApp, date, time | base only |
| **class** (`kelas_*`) | online/offline toggle (informational, no price change), fixed price | name, WhatsApp, date, time, mode | base only |
| **webinar** (`webinar_*`) | fixed upcoming event date/time shown, "what you get", no config | name, WhatsApp, **email** (for Zoom link), **no date picker** | base only |

- Estimator API is unchanged: only homecare passes `isHomecare: true` + distance; all others pass `isHomecare: false` → `transportFee: 0`.
- Webinar event date: hardcoded constant in `serviceConfig.ts` (e.g. an upcoming Saturday 10:00 WIB). No backend.
- Receipt adapts per kind (homecare shows distance; webinar shows event date + email + "Zoom link via WhatsApp/email"; class shows mode).

### Data flow

1. `/layanan` — `ServiceList` reads `SERVICE_PACKAGES`, card → `navigate(/layanan/:id)`.
2. `/layanan/:id` — `ServiceDetail` finds package by id (redirect if missing). Reads/sets config in layout context. `useEstimate` recomputes when id/distance/method change. CTA → booking.
3. `/layanan/:id/booking` — `ServiceBooking` reads package + config + estimate from context. Submit → build receipt in context → render success screen. "Back to list" resets draft and navigates `/layanan`.

### Error / edge handling

- Unknown `:id` → `<Navigate to="/layanan" />`.
- Visiting `/layanan/:id/booking` directly (no config touched) → defaults apply (homecare distance default 4 km, class mode online); estimate computed on mount.
- Form validation unchanged in spirit: required name, WhatsApp, and date (date not required for webinar); inline warning message.
- Reduced motion already handled globally in `index.css`.

## Quality bar (rework-section skill)

Every new/moved screen: body text ≥ `text-sm` (16px target for primary copy), labels ≥ `text-xs`, tap targets ≥ 44px, mobile-first (single column scaling up; list stays 2-col mobile per prior decision), brand tokens only, "Mama" voice. Verification gate per change: `npx tsc --noEmit` clean + `curl` HTTP 200.

## Risks

- **react-router v7 API** — use `BrowserRouter`, `Routes`, `Route`, `useParams`, `useNavigate`, `NavLink`, `Outlet`, `useOutletContext`.
- **App.tsx churn** — tab nav + footer links convert to routing; verify Edu Hub ↔ Klinik navigation and scroll-to-top behavior survive.
- **State across routes** — layout-context approach must keep config when moving detail→booking; covered by `ServicesLayout` owning state.

## Out of scope / future

Events backend, online payment, user accounts, reworking Edu Hub sub-sections (separate runs).
