# Tickets — tayloraucoin.com

Work **one ticket at a time**. After each: `npm run build && npx tsc --noEmit`, then stop and report.

Tickets marked **[SCAFFOLDED]** already have working code in the repo. Your job on those is to verify, wire, and polish — **not to rewrite.** The scaffolded components encode design decisions that took many rounds to reach. If you think one is wrong, say so and stop. Do not silently improve it.

---

## FND — Foundation

- **FND-01** [SCAFFOLDED] `app/globals.css` — Tailwind v4 `@theme` block, all tokens from `docs/DESIGN-SYSTEM.md`. Verify every token is present and nothing hardcodes a hex.
- **FND-02** [SCAFFOLDED] `app/layout.tsx` — fonts via `next/font/google` (Space Grotesk, Manrope, JetBrains Mono), `{children}` + `{modal}` slots, metadata base.
- **FND-03** Verify `npm run dev` boots clean and `npx tsc --noEmit` passes.
- **FND-04** Add `.gitignore`, `eslint.config.mjs`, `prettier`. Commit.
- **FND-05** ✅ Site-wide fix: every `-[--token]` arbitrary class was Tailwind v3 syntax that v4 silently drops (gold, hairlines, radii, durations were all no-ops). Converted to v4's `-(--token)`. See CLAUDE.md § Known traps.

## ATM — Atmosphere

- **ATM-01** [SCAFFOLDED] `components/field/RootField.tsx` — the canvas root system. Verify: trunks branch, angles snap to 45° in the tech zone, chamfered corners, vias render, pulses travel, cursor gain fades.
- **ATM-02** Gate the rAF loop behind an `IntersectionObserver` — pause when off-screen.
- **ATM-03** `prefers-reduced-motion` — render one static frame, no loop.
- **ATM-04** Mount the field **after first paint** and fade it in over 800ms. The `h1` must be LCP. Measure it.
- **ATM-05** Debounce resize at 200ms. Rebuild the tree, not the loop.
- **ATM-06** Mobile: reduce trunk count. Profile on a real phone, not a throttled desktop.

## PRIM — Primitives

- **PRIM-01** [SCAFFOLDED] `components/ui/GradientRing.tsx` — masked conic ring, JS-driven angle, hover accel. **`@property --angle` must be `inherits: true`.**
- **PRIM-02** [SCAFFOLDED] `components/ui/GradientButton.tsx` + `GhostButton.tsx`.
- **PRIM-03** `components/ui/SectionLabel.tsx` — mono, wide-tracked, hairline underline.
- **PRIM-04** `:focus-visible` ring on every interactive element. 2px gold. Keyboard-tab the whole page.
- **PRIM-05** `useFieldGain()` hook — the shared mechanism that fades the field's cursor-glow to 0 over any interactive element. Currently handled ad-hoc; centralize it.

## HERO

- **HERO-01** [SCAFFOLDED] `components/sections/Hero.tsx`. Name is plain ink — **no gradient on the name.**
- **HERO-02** Entrance sequence: eyebrow → name → sub → CTAs, staggered ~60ms, blur-up + 8px translate. One orchestrated moment, not scattered effects.

## CAP — Capabilities

- **CAP-01** [SCAFFOLDED] `components/sections/Capabilities.tsx` — two `GradientRing` cards.
- **CAP-02** Card hover: bg warms toward gold, `translateY(-2px)`, ring brightens and accelerates. Verify the ring **does not restart**.
- **CAP-03** ✅ Core-stack line under the cards — `CORE_STACK` from `lib/config.ts`, rendered in the same mono register as Selected Work's "Also built ·" line. See `docs/SITE-SPEC.md` § Capabilities. Item cut is Taylor's to finalize.
- **CAP-04** ✅ `/stack` — full eight-category taxonomy (`content/stack.ts`), reached via the gold `Full stack →` link at the end of the core-stack line. Intercepted as an overlay from `/` (`app/@modal/(.)stack/`), full page on direct load. The dialog shell was extracted from `CaseOverlay` into the shared `components/ui/Overlay.tsx` — behavior unchanged.

## WORK

- **WORK-01** [SCAFFOLDED] `components/sections/SelectedWork.tsx` — four rows, hover sweep, arrow reveal. Rows are `<Link>`, not divs.
- **WORK-02** `app/work/[slug]/page.tsx` — full case study page. `generateStaticParams` from `content/work.ts`.
- **WORK-03** `components/work/CaseBody.tsx` — the shared template. Follow `docs/SITE-SPEC.md` § case study template exactly. **It must look right with `media: []`.** Test that first.
- **WORK-04** Intercepting route: `app/@modal/(.)work/[slug]/page.tsx` + `app/@modal/default.tsx`. Clicking a row from `/` opens the overlay; the URL updates; refresh lands on the full page.
- **WORK-05** `components/work/CaseOverlay.tsx` — focus trap, `Escape` closes, backdrop click closes, focus returns to the originating row. Enter/exit animation: slide up from the bottom edge, `--ease-out`, 450ms.
- **WORK-06** Media strip — renders only when `media.length > 0`. Full-bleed. Lazy-loaded.

## SIG — Signal

- **SIG-01** [SCAFFOLDED] `components/sections/Signal.tsx` — four-cell stat grid.
- **SIG-02** Count-up on scroll into view. **Subtle.** If it feels like a SaaS landing page, cut it.

## FOOT

- **FOOT-01** [SCAFFOLDED] `components/sections/Footer.tsx`.
- **FOOT-02** Real links: mailto, GitHub, LinkedIn. Résumé PDF in `/public`.

## PERF

- **PERF-01** Lighthouse mobile ≥ 95 performance, ≥ 100 a11y. If the field blocks it, make the field cheaper.
- **PERF-02** No CLS. Reserve space for the hero before fonts load.
- **PERF-03** Bundle audit. Motion should be the only meaningful runtime dependency.

## SEO

- **SEO-01** `generateMetadata` per case study.
- **SEO-02** OG images via `next/og`, in the site's palette.
- **SEO-03** `sitemap.ts`, `robots.ts`, `Person` + `CreativeWork` structured data.

## SHIP

- **SHIP-01** Vercel project, `tayloraucoin.com` DNS, HTTPS.
- **SHIP-02** Analytics (Vercel Analytics — no third-party trackers).
- **SHIP-03** Reserved routes `/ventures`, `/writing`, `/media` return 404 for now. Do not build them.

---

## Out of scope for v1 — do not build

- Blog / newsletter / "now" page
- Light mode
- Any DJ, music, or festival content
- A CMS
- Ventures or holding-company framing. v1 is Taylor as an individual engineer. The architecture leaves room; the content does not use it yet.
