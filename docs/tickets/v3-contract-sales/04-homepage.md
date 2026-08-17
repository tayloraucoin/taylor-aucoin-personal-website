# HOME — Homepage updates — 1 hr

Light touches only. The homepage positioning already works; this adds conversion paths without redesigning anything.

- **HOME-01** Hero CTAs: add "Work with me →" primary CTA (→ `/services`) + a "Book a call" link (→ `BOOKING_URL`) alongside the existing "Selected work" / "Résumé". The primary CTA gets the gradient treatment per the ration rules; the hero must still read as one orchestrated moment (HERO-02) — new CTAs join the stagger, they don't get their own effect.

- **HOME-02** Visible full-time line (decided: include). One clean sentence — e.g. "Available for contract and fractional engagements — and open to the right full-time role." Place near the hero or just under the Signal block; pick whichever placement `docs/SITE-SPEC.md` accommodates without a new section — if neither fits cleanly, stop and ask.

- **HOME-03** Testimonial strip below Selected Work — 2–3 quotes, same component/content source as SVC-09 (`content/testimonials.ts`). **Renders nothing with zero quotes** — no placeholder state ships.

- **HOME-04** Add the photo (PRE-04) somewhere on the homepage or About. Placement is a design decision — propose one against `docs/SITE-SPEC.md`, ask if unspecified.

- **HOME-05** ✅ (verify only) Signal block reads **14 cohorts**, not 13 — corrected in commit `260649a`. Confirm it renders 14 and close.
