# TST — Testimonials feature — added mid-sprint (Aug 17)

Scoped after the strips (SVC-09/HOME-03) proved too thin for the real asset: five
LinkedIn recommendations that tell a two-sided story — people who hired Taylor
AND engineers he led. The second side substantiates the leadership claims the
same way case studies substantiate the builds.

**Source material:** the LinkedIn recommendations (4 used — the UX-course one is
excluded by Taylor's call). Text is used verbatim now; **nothing renders in
production until the person confirms** (per-person `approved` flag). Extracted
lead quotes must be contiguous verbatim spans — no splicing words someone
didn't write.

- **TST-01** Content model. `content/testimonials.ts`: extracted lead quote,
  full verbatim text (paragraphs), name, current title · company, relationship
  (`worked-for` | `led`) + mono relationship line, optional project link
  (case study where one exists), optional "worked on" line for reports,
  `approved: boolean` (all `false` until confirmations land).
  `SHOW_PENDING_TESTIMONIALS` in `lib/config.ts` previews unapproved entries
  locally — **must be `false` before deploy** (QA-08).
- **TST-02** `TestimonialCard` — lead quote first, "Read more" expands the full
  text in place. Pending entries carry a dim "pending approval" chip so preview
  state is unambiguous.
- **TST-03** Home strip (replaces the HOME-03 placeholder wiring): 2–3 cards
  below Selected Work, employer-side leading (Dawson first), ending with
  "All testimonials →". Same component feeds the services proof strip.
- **TST-04** `/testimonials` page: tabs **"People I worked for"** /
  **"Engineers I led"**, full-context cards (quote → read more → name, title ·
  company → relationship line → project tag → worked-on line for reports).
  Placeholders marked TODO where details are unconfirmed (Vaughn's FYBR
  project, the ISSP project mapping).
- **TST-05** As confirmations arrive: flip `approved`, replace any wording the
  person revised, confirm placeholder details. One flag per yes — the site
  grows quote by quote.

Assignments: Dawson (Co-founder, Looka; managed Taylor · Everbook/Pine Studio) and
Vaughn (FYBR; managed Taylor · 2017) → *worked for*. Yogesh (Senior SWE) and
Micheal (SAP) → *led*, both BCIT ISSP, two terms, reported to Taylor directly.
