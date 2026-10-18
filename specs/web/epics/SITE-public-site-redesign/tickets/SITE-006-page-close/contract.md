---
id: SITE-6
size: small
objective: "one close block, drawn as /about's, that /about, the case study, /capabilities and Work with me place with their own line and the one fallback, so every page ends on the same call, résumé and Send a note"
slice_type: "a shared section with no live consumer until wave 3; risks a block that bends to each page by branching markup, an email address left in a close, and a call that skips the event"
non_negotiables:
  - "The call is always BookCallLink (A-17, D-SITE-165), placement close, with the surface and slug the page passes; never a raw link to /book or Cal.com"
  - 'Every fallback is "Not ready to book?" with "Send a note" to siteRoutes.contact; no email address or mailto anywhere in the block (D-SITE-174)'
  - 'One primary action per block: the call, or on Work with me "Send a note" with "Prefer a call?" and the call as a text link (D-SITE-130)'
  - "The block takes its line, availability and slots as props and holds no page's copy"
  - "The test route answers 404 when isProductionDeployment() is true, so it never ships"
devs_call: "The props' shape, slots or a variant prop, as long as no page's markup branches inside the block; the line's element; test file names"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about.md"
  - "D-SITE-74"
  - "D-SITE-130"
  - "D-SITE-174"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "components/site/PageClose.tsx"
  - "app/test-harness/close/page.tsx"
  - "tests/**"
depends_on: [SITE-4]
out_of_scope:
  - "Placing the block on a page, and that page's close line and criteria (C-SITE-about-17, C-SITE-case-study-15): the /about, case study, /capabilities and Work with me tickets"
  - '/websites'' close (phone, email, entity, "Book a call first"): the /websites ticket (wave 4) places this block''s slots or keeps its own'
  - "Retiring GradientButton, ClosingCta and the old closes: each page ticket, with its page"
criteria:
  - id: C1
    statement: "On the test route's call-led close: a hairline, the line, the availability, then in DOM order the Book a 30-minute call link to /book as the block's only primary-styled control, Résumé (PDF) to SITE.resume, and Not ready to book? with Send a note to /contact; no text matching an email address and no mailto link in the block"
    evidence: test
    command: "yarn test:e2e tests/e2e/page-close.spec.ts"
  - id: C2
    statement: "On the test route's close without a résumé (as /capabilities): the call, then the fallback, and no Résumé link; on its note-led close (as Work with me): Send a note to /contact as the only primary-styled control, then Prefer a call? with a Book a 30-minute call text link to /book, and no Résumé link"
    evidence: test
    command: "yarn test:e2e tests/e2e/page-close.spec.ts"
  - id: C3
    statement: "With consent granted, the call-led close's button sends one book_call_click with placement close and the surface and slug the route passed, and the note-led close's text link sends placement close with surface services; with consent declined, no request reaches any Google host"
    evidence: test
    command: "yarn test:e2e tests/e2e/page-close.spec.ts"
  - id: C4
    statement: "At 390 the call-led close puts the call and Résumé on one row and the fallback on the row under, the page has no horizontal scroll, Send a note and Résumé are at least 44px tall, and no close has a serious or critical axe violation"
    evidence: test
    command: "yarn test:e2e tests/e2e/page-close.spec.ts"
  - id: C5
    statement: "The test route's page calls notFound() when isProductionDeployment() is true (helper injected)"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The call-led close at 390 and 1440, dark and light, matches the close in captures/about/default-*, the line's text aside"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-006-page-close/evidence/close/"
---

# Contract — SITE-6 page-close

## Build notes

Wave 1, after the header ticket (`BookCallLink`, `buttonVariants`). Every wave 3 page with a close depends on this one.

- **Approach:** `PageClose` in `components/site/`, the `/about` close as drawn: hairline above, the closing line, availability at meta, then an actions row. The page passes its line, its availability, the call's `surface` and `slug`, and whether the résumé shows; the note-led form swaps the primary for "Send a note" and moves the call into a "Prefer a call?" text link. A test-only route renders the three forms with synthetic lines, so the block is proven before any page places it.
- **Decisions that apply:** D-SITE-74 draws `/about`'s close: "the close (closing line, availability, booking, résumé, email)"; D-SITE-174 replaces its email. Placement: "The `/about` close reused four times (D-SITE-74, 174); props drop the résumé link and swap the fallback." D-SITE-174: "Every "Not ready to book?" fallback is Work with me's as built, "Send a note" to `/contact` (D-SITE-127), in place of the email address: the `/about`, case-study and `/capabilities` closes." About build, Close: "hairline above; closing line at Headline; availability meta; button · résumé link · "Not ready to book?" "Send a note" → `/contact`, one row"; at 390 "button and résumé on one row, fallback row under". Services build, Close: "the `/about` close block without its résumé link (reused): hairline, Headline, availability at Meta, primary "Send a note" (auto width at 390, as drawn), then "Prefer a call?" muted with the "Book a 30-minute call" link." Capabilities build, Close: "closing line at Heading 3, primary button, "Not ready to book?" with "Send a note" to `/contact`."
- **Interfaces:** `PageClose` with its props (the builder's shape); the line's size is a prop (Headline, or Heading 3 for `/capabilities`). `/test-harness/close`: a test-only literal in the page and spec, as SITE-3's `/test-harness/analytics`.
- **Per path:** `components/site/PageClose.tsx`: the block. `app/test-harness/close/page.tsx`: the three forms with synthetic lines ("Fixture closing line" and the like), 404 in production through `isProductionDeployment()`. `tests/e2e/page-close.spec.ts`, `tests/unit/page-close-route.test.ts`.
- **Words:** about-words.md, Close actions: "Book a 30-minute call · Résumé (PDF) · Not ready to book? · Send a note"; availability "Available now · {availability}" from `content/services.ts`, with a middot. services-words.md, Close: "Send a note [draft] · Prefer a call? · Book a 30-minute call": render the drafts without the `[draft]` mark; never improve them.
- **Gotchas:** the event criterion reads real collect requests: the fake-ID build and SITE-1's opt-in to real gtag.js, as the header ticket's spec. The case-study build calls the close line a paragraph; leave its element to the page. Hover transitions are 0ms under reduced motion (D-SITE-178). Token names in the spec are the kit's: map through `.claude/rules/house-design.md`. `GradientButton` is retired, not reused.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a close that branches per page.
