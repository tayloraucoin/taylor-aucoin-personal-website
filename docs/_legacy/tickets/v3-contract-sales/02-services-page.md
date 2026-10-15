# SVC — Services page: `/services` (nav label: "Work with me") — 3 hrs

The single highest-value artifact of the day. Build it first, while fresh. New route `app/services/page.tsx`; sections live in `components/services/`. Reuse existing primitives (`GradientRing`, `GradientButton`, `GhostButton`, `SectionLabel`) — no new visual language. All CLAUDE.md invariants apply: gradient stays rationed, no gradient behind copy, interface beats atmosphere.

- **SVC-01** Route + nav. `app/services/page.tsx` with metadata via `lib/metadata.ts` conventions. Add "Work with me" to the site nav. (Nav treatment is a design decision — if `docs/SITE-SPEC.md` doesn't specify a nav pattern for a second page, stop and ask before inventing one.)

- **SVC-02** Hero.
  - H1: "Work with me"
  - One-sentence positioning line: senior/staff product engineer, contract + fractional, remote from Vancouver.
  - Availability line — e.g. "Available for new engagements from [date]. Taking two this fall." (Taylor fills the date.)
  - Primary CTA button → Cal.com (`BOOKING_URL`, from PRE-03): "Book a 30-min call".
  - Secondary link → "Selected work".

- **SVC-03** Three offer cards, equal weight, scannable. Each card: who it's for · what's included · duration/cadence · a "Start here" link to the booking CTA.
  - **Contract Senior/Staff Engineer** — 3–12 months, embed with the team, ship production features. Best for: teams needing senior throughput now.
  - **Fixed-Scope 0→1 Build** — 8–16 weeks, idea → shipped product. **Mark as flagship.** Best for: founders who need a real product, not a prototype.
  - **Fractional CTO / Technical Partner** — 1–2 days/week retainer. Architecture, technical strategy, hiring, AI-native process. Best for: non-technical founders and scaling teams.
  - Card content is typed TS (e.g. `content/services.ts`), same pattern as `content/work/`.

- **SVC-04** Soft price anchor (decided: no hourly rate). One line beneath the cards: "Most engagements land between $X and $Y. Fixed scope where it makes sense — no hourly surprises." X/Y are **build-project totals, not rates** — Taylor supplies the numbers; ship with placeholders clearly marked if they haven't landed.

- **SVC-05** "Sounds like you?" — problem grid. 6 problem statements in the client's voice, each tagged to an offer:
  - "We have a product idea and no one to build it." → 0→1 Build
  - "Our roadmap is stalling; we need senior throughput for two quarters." → Contract
  - "We're shipping AI features and the codebase is drifting." → Fractional CTO
  - "A contractor left mid-build and we need someone to own it." → Contract
  - "We're non-technical and can't tell if our devs are making good calls." → Fractional CTO
  - "We need to move fast without the code becoming a liability." → any

- **SVC-06** "How I work" — 4–5 bullets on process quality: typed end-to-end, tutorial-grade specs, preview environments, AI-native development with convention files, weekly written updates.

- **SVC-07** "What I'm not" (decided: include). 3 lines. E.g.: not a dev shop that upsells hours · not a consultant who delivers a deck and disappears · not a body you have to manage.

- **SVC-08** "How to start" — 3 steps: 30-min call → scoped proposal within 48 hrs → start date. Add: "I reply within one business day."

- **SVC-09** Proof strip.
  - Signal stats (9.5 years / 12 0→1 builds / 14 cohorts) — reuse the `Signal` data, don't fork the numbers.
  - 2–3 testimonials. **Build the component so it renders nothing (no gap, no placeholder) with zero quotes** — quotes land mid-week from PRE-01. Typed content, e.g. `content/testimonials.ts`.
  - Photo (from PRE-04) + a two-line bio.

- **SVC-10** FAQ — 5 questions: how engagements start · contract vs. fractional · remote/timezone (Vancouver, PST) · how pricing works · availability. Disclosure/accordion behavior must respect `prefers-reduced-motion` and keyboard focus rules (PRIM-04 standard).

- **SVC-11** Closing CTA: "30-minute call. No pitch — we'll figure out if I'm the right fit." + book button → `BOOKING_URL`.
