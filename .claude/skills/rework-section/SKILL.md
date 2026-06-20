---
name: rework-section
description: Use when reworking, redesigning, modernizing, or rewriting any section of the Gayatri lactation app home/Dashboard or ServicesSection — makes a section modern-looking, elder-friendly, and mobile-first while keeping the existing brand palette and Indonesian "Mama" voice.
---

# Rework Section (Gayatri)

## Overview

Rework one home-page section at a time so it is **modern**, **elder-friendly (lansia/ibu segala usia)**, and **mobile-first**, without breaking the existing Gayatri warm-pastel identity. Edit the section in place, then verify.

Core principle: **one section per run, brand tokens unchanged, readability over decoration.** The current template's biggest failure is tiny type (`text-[9px]`–`text-[11px]`) and over-wide tracking — fix that everywhere you touch.

## When to Use

- "Rework / redesign / modernize the [X] section"
- A section has tiny text, cramped tap targets, desktop-first columns
- Adding consistency after the new hero

NOT for: changing brand colors/fonts (those are fixed), whole-app rewrites (go section by section), backend/server.ts.

## Brand Tokens (do NOT invent new ones)

| Role | Value |
|------|-------|
| Linen bg | `#FAF6F0` |
| Cream surface | `#FAF1E6` |
| Card white | `#FFFFFF` |
| Border | `#EADCC9` |
| Cocoa text (primary) | `#3F322F` |
| Taupe text (muted) | `#7A6A65` / `#937F73` |
| Peach accent | `#FBC2A2` |
| Apricot accent (CTA/emphasis) | `#F2A07C` |
| Success green | `#7BA86F` |
| Display font | `font-display` (Fraunces) |
| Body font | `font-sans` (Nunito) |
| Mono/data | `font-mono` (JetBrains Mono) |

Accent rule: **one** apricot/peach focal point per section, rest quiet.

## Elder-Friendly Rules (non-negotiable)

- **Body text min `text-base` (16px); never below `text-sm` (14px).** Replace every `text-[9px]/[10px]/[11px]/[8px]` and `text-xs` body copy with `text-sm`+. Eyebrows/labels min `text-xs` (12px), uppercase tracking max `tracking-wide` (kill `tracking-[0.18em]+` on small text).
- **Tap targets min 44px**: buttons/links `min-h-[44px]`, padding `py-3`+. Whole cards clickable, not tiny chevrons.
- **Contrast**: text on linen/white uses cocoa `#3F322F` or `#5C453C`; never taupe `#937F73` for body paragraphs (labels only).
- **Plain Bahasa Indonesia**, short sentences, address user as **"Mama"**. Spell out, avoid jargon without a gloss.
- Icons paired with a **text label**, never icon-only actions.
- Generous spacing: section `space-y-6`+, card padding `p-5 sm:p-6`.

## Mobile-First Rules

- Base classes = mobile (single column, full-width). Add `sm:`/`md:`/`lg:` to scale UP, never the reverse.
- Default `grid-cols-1`, then `sm:grid-cols-2` / `lg:grid-cols-3`.
- Primary CTA full-width on mobile (`w-full sm:w-auto`), thumb-reachable.
- No horizontal scroll, no fixed widths. Images `w-full h-auto` or fixed-height `object-cover`.
- Test the narrow case first: does it read at 360px wide?

## Modern Look Rules

- Consistent radius: cards `rounded-3xl`, pills/buttons `rounded-full`, inputs `rounded-2xl`.
- Soft shadows only (`shadow-sm`/`shadow-md`); borders `border-[#EADCC9]`.
- Whitespace > dividers. Group with cards/spacing, not heavy lines.
- Clear hierarchy: `font-display` headline → `text-sm`/`text-base` body → small label.
- Subtle motion only: reuse `animate-fadeIn`; gentle hover (`hover:shadow-md`, `hover:-translate-y-0.5`). Respect `prefers-reduced-motion` (already handled in index.css).

## Workflow (rewrite in place, then verify)

1. **Locate** the section in `src/components/Dashboard.tsx` or `src/components/ServicesSection.tsx`. Read it fully.
2. **Analyze** out loud (brief): purpose, current readability/mobile/modern problems — especially tiny-type and tap-target violations.
3. **Rewrite in place** with Edit, applying every rule above. Keep the section's data/content and props/handlers; change presentation + copy clarity only. Reuse existing imports/icons.
4. **Verify** (required, show evidence):
   ```bash
   cd /home/samsul/Projects/gayatri-live-lactation-care
   npx tsc --noEmit 2>&1 | head -20            # must be clean
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/   # 200 (start server if down: npx tsx server.ts &)
   grep -nE 'text-\[(8|9|10|11)px\]|text-xs[^ ]*"[^"]*[A-Za-z]{20}' src/components/<file>   # spot leftover tiny body type
   ```
5. **Report**: section name, problems fixed, before→after on type sizes/tap targets, verify output. Offer the next section.

## Rewrite Checklist (per section)

- [ ] No body text below `text-sm`; eyebrows ≥ `text-xs`
- [ ] Every button/link ≥ 44px tap height, `w-full sm:w-auto` for primary
- [ ] Body copy uses cocoa, not taupe
- [ ] `grid-cols-1` base → scales up with breakpoints
- [ ] One accent focal point; consistent radius + soft shadow
- [ ] Copy in warm plain Indonesian, "Mama" voice, icons labeled
- [ ] `tsc --noEmit` clean + HTTP 200

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Keeping `text-[10px]`/`text-xs` "because it fits" | Resize layout, not the type. 16px body floor. |
| Desktop grid first (`grid-cols-3 sm:grid-cols-1`) | Mobile base, scale up. |
| Inventing new colors for "modern" feel | Use the 8 brand tokens only. |
| Icon-only buttons to save space | Always pair icon + label. |
| Reworking 3 sections at once | One section per run; verify each. |
