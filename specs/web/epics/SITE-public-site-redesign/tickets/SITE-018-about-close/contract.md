---
id: SITE-18
size: small
objective: "a hirer finishing /about reads the core tools, every testimonial in full and Off the clock, lands at Tools or Testimonials from an old link with the heading in view, and books a call from the one primary button"
slice_type: "the lower half of a static reading page, an anchor landing, one dev-only state and one shared close; risks a pending testimonial in production, a heading under the header on landing, a second primary, and the call going to Cal.com directly"
non_negotiables:
  - "Sections after Education in about.md's order: Tools #tools, Testimonials #testimonials, Off the clock, the close (D-SITE-74)"
  - "Testimonials are one list with two subheads, People I worked for (Dawson, Bruno, Vaughn) and Engineers I led (Yogesh), each in full, no tabs; TestimonialTabs.tsx is deleted (D-SITE-71)"
  - "pending-testimonial renders only the synthetic fixture, outside production; a real unapproved entry never renders (D-SITE-199)"
  - "Tools shows only items flagged core in content/stack.ts, five groups, the résumé link beside the heading (D-SITE-72)"
  - "The close is SITE-6's PageClose, its call BookCallLink with surface about and placement close, to /book; the one primary on the page (A-17)"
devs_call: "Component names under app/about/_components/, the fixture's shape, the focus-on-landing method, and test file names"
waiver: "One surface, /about, split for the token cap: about.md holds the order and states, about-build.md layout, access and criteria, about-words.md the strings"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about-words.md"
  - "D-SITE-71"
  - "D-SITE-72"
  - "D-SITE-73"
  - "D-SITE-174"
  - "D-SITE-199"
  - "C-SITE-about-1"
  - "C-SITE-about-2"
  - "C-SITE-about-4"
  - "C-SITE-about-6"
  - "C-SITE-about-7"
  - "C-SITE-about-8"
  - "C-SITE-about-9"
  - "C-SITE-about-11"
  - "C-SITE-about-13"
  - "C-SITE-about-14"
  - "C-SITE-about-17"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/about/page.tsx"
  - "app/about/_components/**"
  - "app/about/_fixtures.ts"
  - "components/testimonials/**"
  - "content/stack.ts"
  - "tests/**"
depends_on: [ SITE-6, SITE-17 ]
out_of_scope:
  - "Intro to Education and the 390 dates (C-SITE-about-10, 12, 15, 16): SITE-17"
  - "The header's current item (C-SITE-about-3): proven by SITE-4; the /stack and /testimonials redirects (C-SITE-about-5): proven by SITE-2; the close block itself: SITE-6; cite, never re-prove"
  - "Approving Micheal Ozdoba's testimonial and the Tools résumé line: Taylor"
criteria:
  - id: C1
    statement: "/about's h2s are, in order, How I think, Experience, Teaching, Education, Tools, Testimonials, Off the clock, then the close; Tools shows only core items from content/stack.ts in five groups; its résumé link and the close's point at SITE.resume with (PDF) in their names, the footer's being SITE-5's (C-SITE-about-1, 9, 11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-close.spec.ts"
  - id: C2
    statement: "Testimonials holds h3s People I worked for, with Dawson, Bruno and Vaughn, and Engineers I led, with Yogesh: four figures, each a blockquote with the full text and a figcaption; no tablist; no TestimonialTabs import or file remains (C-SITE-about-7)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-close.spec.ts"
  - id: C3
    statement: "/about?state=pending-testimonial on the local build shows one card marked Pending approval under Engineers I led with the synthetic fixture's text and no unapproved entry's words; a production-mode readPageState returns default for it (C-SITE-about-8)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-close.spec.ts"
  - id: C4
    statement: "Exactly one primary-styled control exists, the close's Book a 30-minute call to /book; no link on the page points at the Cal.com host; Not ready to book? offers Send a note to /contact and the close holds no email address; with consent granted the close's call sends one book_call_click with surface about and placement close only, and none with consent declined (C-SITE-about-4, 14, 17)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-close.spec.ts"
  - id: C5
    statement: "Loading /about#tools and /about#testimonials at 1440 and 390 puts the section's h2 fully below the header and gives it focus (C-SITE-about-6)"
    evidence: manual
    reason: "The about criterion asks for a person's check of scroll position; the builder records it, with a screenshot per width"
  - id: C6
    statement: "default and pending-testimonial at 390 and 1440, dark and light, match captures/about/default-* and pending-testimonial-*, with Contact in the header and footer (C-SITE-about-2, 13)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-018-about-close/evidence/states/"
---

# Contract — SITE-18 about-close

## Build notes

Wave 3, after SITE-17 (the page's upper half, the anchor pattern on Teaching) and SITE-6 (`PageClose`).

- **Approach:** replace today's lower sections in `app/about/page.tsx` with `Tools`, `AboutTestimonials`, `OffTheClock` and `PageClose`. `Tools` reads `content/stack.ts` core items under the five groups. `AboutTestimonials` renders the full card from `components/testimonials/`, its pending variant behind `readPageState` and the `_fixtures.ts` synthetic entry. `#tools` and `#testimonials` reuse SITE-17's anchor pattern.
- **Decisions that apply:** D-SITE-71, 72, 199 as non-negotiables. D-SITE-73: "the code critic checks scroll position and focus at build." D-SITE-174: "Send a note" to `/contact` in place of the address. D-SITE-75's amber stands for Taylor: full testimonials at Body, not Quote 20px.
- **Words:** about-words.md rows Tools to Close actions; Bruno's relationship line as drawn, "Family office engagement · 2026"; the pending card's synthetic lines as written; the Tools link line ships `[draft]` as written.
- **Interfaces:** the four sections; `pending-testimonial` in the page's States list; the full card's pending variant in `components/testimonials/`; content/stack.ts gains the five group names and canvas short labels if it lacks them (D-SITE-198).
- **Per path:** the page and sections, the fixture, the card, `content/stack.ts`, `TestimonialTabs.tsx` deleted, `GradientButton` dropped from /about's imports, `tests/e2e/about-close.spec.ts`.
- **Gotchas:** `SHOW_PENDING_TESTIMONIALS` stays false; the state alone shows the fixture. `TestimonialTabs` may still be imported by `/testimonials`: SITE-2 deletes that page; if it has not landed, stop and say so. The fixture is synthetic (Alex Example), never Micheal Ozdoba's words. Map the kit's token names through `.claude/rules/house-design.md`. Capture: `yarn capture --route /about --keys default,pending-testimonial --out <evidence dir>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a pending card reaching production.
