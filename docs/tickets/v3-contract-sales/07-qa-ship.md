# QA — QA + ship — 45 min

- **QA-01** Every CTA resolves to the Cal.com link (`BOOKING_URL`). Click each one: nav, services hero, services closing CTA, offer-card "Start here" links, homepage "Book a call". No dead `#` hrefs ship.

- **QA-02** Mobile pass on the services page + capability card dialogs — **dialogs are the most likely thing to break on small screens.** Real phone or device emulation; check the overlay at 375px, keyboard focus, and scroll-lock.

- **QA-03** Lighthouse run — screenshot the score (it's proof material for later outreach). Baseline standard is PERF-01: mobile ≥ 95 performance, ≥ 100 a11y.

- **QA-04** Nav includes "Work with me" on every page.

- **QA-05** Résumé PDF link still prominent (the full-time door stays open).

- **QA-06** Read the services page out loud once. **If any line sounds like marketing copy, cut it** (see `docs/TASTE-PROFILE.md` § voice). This is Taylor's pass — flag candidates, don't rewrite unprompted.

- **QA-07** Ship: `npm run build && npx tsc --noEmit` clean, merge, deploy to Vercel, verify `tayloraucoin.com/services` live.

- **QA-08** Testimonial gate: `SHOW_PENDING_TESTIMONIALS` in `lib/config.ts` is **`false`**, so only `approved: true` entries render in production. No unconfirmed quote ships.
