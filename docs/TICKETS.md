# Tickets — tayloraucoin.com

Work **one ticket at a time**. After each: `npm run build && npx tsc --noEmit`, then stop and report.

Tickets marked **[SCAFFOLDED]** already have working code in the repo. Your job on those is to verify, wire, and polish — **not to rewrite.** The scaffolded components encode design decisions that took many rounds to reach. If you think one is wrong, say so and stop. Do not silently improve it.

> **Current sprint:** v3 — Contract Sales Site (services page, capability grid, Cal.com CTA, CC case study). Tickets live in [`tickets/v3-contract-sales/`](tickets/v3-contract-sales/00-INDEX.md) — start there. The sections below are the v1 build backlog.

> **Also scoped, not started:** ADM — admin shell restructure (CC-style grouped left rail) + intake question review surface. Specs and build order live in [`admin/specs/`](admin/specs/00-build-order.md); that folder runs on the CC spec system, not this file's format. Three items in `admin/ADMIN-UX-SPEC.md` §7 await Taylor's ratification.

> **Next track (scoped, not started):** v4 — Client intake system (Stripe deposit via Agora → nine-step questionnaire → markdown output). Specs and build order live in [`intake/specs/`](intake/specs/README.md) — that folder runs on the CC spec system (its own kickoff contract and logs), not this file's format. Do not start INT tickets until Taylor green-lights the build.

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

## MEDIA — case study imagery

Built ahead of a batch of new captures. `media` is now `MediaGroup[]`; the strip
still renders nothing at all when it is empty, and every case page still closes
on Outcome.

- **MEDIA-01** ✅ `next/image` with static imports (`import shot from "@/public/work/<slug>/x.webp"`). Intrinsic dimensions come from the file at build time, so CLS is structurally impossible and no dimension is ever hand-maintained. AVIF added ahead of WebP in `next.config.ts`. Everbook's strip went from 7.7 MB of raw PNG to 408 KB delivered.
- **MEDIA-02** ✅ Grouped layout — `components/work/CaseMedia.tsx`. Optional mono `label` + prose `intro` per cluster, `size: "half"` pairs adjacent captures 2-up on desktop, `frame: "panel"` insets light-background diagrams. Group labels should reuse the matching `built` card label so the strip indexes back into What I built.
- **MEDIA-03** ✅ Click-to-zoom — `components/work/MediaLightbox.tsx`. Purpose-built rather than reusing `ui/Overlay`, which cannot nest (see the component docstring). Esc closes only the image, arrows page the whole strip, focus returns to the triggering thumbnail.
- **MEDIA-04** ✅ Optional `video` per item — `controls`, `preload="none"`, poster-framed, never autoplay. No GIFs.

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
- **SHIP-02** ✅ Analytics — Google Analytics 4 via `@next/third-parties`, gated on a jurisdiction table (`lib/consent/jurisdictions.ts`). Supersedes the original "Vercel Analytics — no third-party trackers" scope, at Taylor's direction. Hard gate: in prior-consent jurisdictions (EU/EEA, UK, Quebec) the tag is never inserted until the visitor accepts. GPC is honoured globally. Disclosure + opt-out at `/privacy`. Measurement ID comes from `NEXT_PUBLIC_GA_ID`, set on Vercel Production only, so preview deploys stay out of the property.
- **SHIP-03** Reserved routes `/ventures`, `/writing`, `/media` return 404 for now. Do not build them.

## CON — Contrast recalibration (D-CON-1)

Rationale and measured matrix: DESIGN-SYSTEM.md § D-CON-1 and the "Gilt,
recalibrated" audit artifact.

- **CON-01** ✅ Token change in `app/globals.css` — night ramp 100–800 declared in `@theme`; `--color-body` → night-400 `#B0ADCD`, `--color-dim` → night-500 `#9C99BC`, `--color-role-label` → solid `#7F7DA1` (55% alpha retired). DESIGN-SYSTEM.md §1 updated (new hexes, raised contrast floors, four ramp tables, D-CON-1 decision record). Half-step fallback values recorded in the `@theme` comment for a two-line revert. Zero component edits — all consumers inherit via the semantic tokens.
- **CON-02 / CON-03** ✅ **Full public-route sweep done — 22 of 22 routes.** Method: an in-page audit that walks every rendered text node, composites its real painted background (ground gradient included, alpha layers resolved), and checks WCAG against the correct floor for that node's size and weight. Routes audited: `/`, `/about`, `/capabilities`, `/services`, `/stack`, `/testimonials`, `/privacy`, all **six** `/work/[slug]` case studies, `/websites`, `/websites/platform`, `/websites/coded`, `/websites/privacy`, `/websites/terms`, `/websites/intake`, `/websites/coded/intake`, `/admin/login`, `/banner-export`, plus `/` at a 375px mobile viewport. ~1,100 unique colour/size/background combinations. **Result: the D-CON-1 tokens hold everywhere — every `body`/`dim`/`role-label`/`ink` pair passes, worst case 6.59:1, most surfaces 6.7–7.1:1.** Role lines measure 4.71–4.90:1, up from 2.2:1. Mobile `--color-spec-bg` correctly resolves to `rgba(9,12,34,.62)`. **Risk cleared:** the assessment warned `body`/`dim` on a *gold* fill would regress — of 13 gold-filled elements on `/`, exactly one carries text (the CTA, dark ink, 10.96:1). Nothing regressed anywhere. Three genuine failures surfaced, all pre-existing and none caused by D-CON-1 — see CON-05/06/07. **Still owed:** keyboard-tab pass; Taylor's full-step vs half-step ratification.
- **CON-05** ✅ **Fixed — and it was 13 buttons, not one.** `bg-(--color-c1) … text-white` turned out to be the admin CRM's *entire* primary-button pattern: login, call panel (×2), post-call panel (×4), engagement panel (×2), conversation form, sync form, call review, intro email form. Every one measured **3.44:1**. Added `--color-action` (`#6D5CC0` = violet-600) and repointed all 13 fills to it; white on it is **5.33:1**. `--color-c1` was never changed — it is the trace/ring violet, and altering it would have shifted the whole site's atmosphere. New law recorded in DESIGN-SYSTEM.md §1: **`--color-c1` is structure and must never carry text.** Only `/admin/login` could be verified in-browser (the other 12 are auth-gated), but all 13 now resolve through one token, so they move together — confirm the rest under CON-08.
- **CON-06** ✅ **Fixed.** Introduced `--color-proof-label` (`#B48934` = gold-600) and replaced the three hardcoded `text-[rgb(232_185_97/.55)]` call sites with it. Measured in place: `/capabilities` proof labels now **5.91–6.05:1** (10 of them) and `/testimonials` **5.95:1**, up from 3.82:1; zero failures on either page. **The fix preserves the real intent, which the original ticket got wrong.** These labels come in pairs — with an `href` they render `--color-c2` plus an arrow, without one they render quiet. So the alpha was encoding *"same gold, not clickable,"* which is genuine information. The ticket's first suggestion (gold-300) would have been **lighter** than `c2`, making non-links louder than links — backwards. Gold-600 is a deeper, muted gold: same family, visibly recessive, legible. Also removes a hardcoded hex, restoring the "nothing hardcodes a hex" law. Original finding follows. ~~**Gold text at 55% alpha fails AA — 11 instances on public marketing pages.**~~ `text-[rgb(232_185_97/.55)]` at 9–10px measures **3.82:1** on `/capabilities` (10) and `/testimonials` (1). Two problems at once: it fails the contrast floor, and it is a **raw colour hardcoded in an arbitrary class**, violating DESIGN-SYSTEM.md's "nothing hardcodes a hex." Sources: `components/capabilities/CapabilityGrid.tsx:107` and `:152`, `components/testimonials/TestimonialCard.tsx:117`. Same bug class as the role line D-CON-1 just fixed — **quiet bought with alpha instead of size, weight, and tracking.** Fix is the ramp: solid **gold-300 `#F6D293`** (12.6:1) reads as a quiet gold at 9px without alpha, or keep `--color-c2` solid (10.0:1) and let the 9px + .2em tracking do the quieting. Pre-existing; not caused by D-CON-1.
- **CON-07** ✅ **Fixed by deleting one class.** `/banner-export`'s keycap hints (`BannerExport.tsx`) were `text-(--color-dim) opacity-70` at 12px — 4.0:1. The keycap sits beside a `--color-body` label, and `--color-dim` is *already* the quiet step below body, so the `opacity-70` was doing nothing the token wasn't: dropping it alone gives **6.67:1** and keeps the hint visibly quieter than the label it follows. No new token, no visual restructuring — the alpha was simply redundant.
- **Not a finding — recorded so it is not re-flagged:** `ChoiceGroup`'s `DISABLED_CLASS` (`text-(--color-dim) opacity-60`, 3.23:1 on `/websites/coded/intake`) and `TextField`'s `disabled:opacity-60`. WCAG 1.4.3 explicitly exempts inactive/disabled UI components from the contrast minimum. Compliant by exemption.
- **CON-09** ✅ Final regression sweep on the **production build** (not dev): 18 routes, ~900 unique colour/size/background combinations, **zero contrast failures**. Every finding raised on a publicly reachable surface is closed.
- **CON-08** Still unaudited, needs credentials or a live token: the **8 protected `/admin` routes** (leads, leads/[id], queue, scoreboard, engagements, engagements/[id], sync, transcripts) and the **intake `[token]` step flows**. The admin density concern from the assessment remains unverified. Also unaudited: the two `@modal` overlay routes, whose content pages (`/stack`, `/work/[slug]`) both pass standalone.
- **CON-04** Optional cleanups: `lib/invoices/paper.ts` doc comments (cite night-600/700/200 instead of the old hexes), banner re-export (`app/banner-export` saved PNGs are stale), tokenize the CTA's hardcoded `#0a0714` (`GradientButton.tsx`, `::selection`) — a pre-existing deviation from "nothing hardcodes a hex," not caused by D-CON-1.

---

## Out of scope for v1 — do not build

- Blog / newsletter / "now" page
- Light mode
- Any DJ, music, or festival content
- A CMS
- Ventures or holding-company framing. v1 is Taylor as an individual engineer. The architecture leaves room; the content does not use it yet.
