---
id: SITE-15
size: small
objective: "a hirer inside one story reads it in D-SITE-79's order, from the facts ledger to the close, with every absent block leaving no trace, and books a call from the one primary button"
slice_type: "a page template over six studies' typed content; risks a block out of order, an empty heading or gap where a block is absent, a second primary, a testimonial pointing at itself, and Escape still leaving the page"
non_negotiables:
  - "Order (D-SITE-79, 96): opening (All work, meta line, h1, tagline, facts ledger, lead artifact) · At a glance · The brief · What I built · Process · Decisions · What broke · Outcome · Where AI sat · Testimonial · close"
  - "An absent optional block leaves no heading, rule or gap (D-SITE-5); Where AI sat on Conscious Connections only (D-SITE-233)"
  - "The close is SITE-6's PageClose, its call BookCallLink with surface case-study, placement close and the slug; the one primary on the page (A-17)"
  - "The testimonial card has no project link and the span D-SITE-84 and 94 name, never home's or /about's"
  - "PageDismiss retires; Escape acts only inside the lightbox (D-SITE-195)"
  - "Every string from the study's file or case-study-words.md as written; existing fields keep today's text (D-SITE-189)"
devs_call: "Component names under app/work/[slug]/_components/, where the case-study spans sit, fixture shapes, and test file names"
waiver: "One surface, the case study, split for the token cap: case-study.md holds the order and states, case-study-build.md layout, access and criteria; decisions-14.md holds D-SITE-233"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-5"
  - "D-SITE-79"
  - "D-SITE-84"
  - "D-SITE-195"
  - "D-SITE-233"
  - "C-SITE-case-study-1"
  - "C-SITE-case-study-2"
  - "C-SITE-case-study-3"
  - "C-SITE-case-study-4"
  - "C-SITE-case-study-5"
  - "C-SITE-case-study-10"
  - "C-SITE-case-study-11"
  - "C-SITE-case-study-12"
  - "C-SITE-case-study-13"
  - "C-SITE-case-study-14"
  - "C-SITE-case-study-15"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/work/[slug]/page.tsx"
  - "app/work/[slug]/_components/**"
  - "app/work/[slug]/_fixtures.ts"
  - "components/testimonials/CaseStudyTestimonial.tsx"
  - "components/work/CaseBody.tsx"
  - "components/work/Section.tsx"
  - "components/ui/PageDismiss.tsx"
  - "content/testimonials.ts"
  - "tests/**"
depends_on: [ SITE-5, SITE-6, SITE-7 ]
out_of_scope:
  - "What I built's four media formats, its tiles and lightbox, and the format-* and no-testimonial captures (C-SITE-case-study-8, 9): SITE-16 (case-study-formats); here What I built renders its intro and surfaces as text, as no-artifacts draws it"
  - "Not found and its 404 (C-SITE-case-study-7): SITE-2; the header and its call (the header's part of C-SITE-case-study-6): SITE-4"
  - "Calculate's and the family office's new media (D-SITE-232); Taylor's closing lines and AI lists: content edits by Taylor"
criteria:
  - id: C1
    statement: "Every published study holds, in order, its blocks present among: All work to /work, the meta line, one h1, the tagline, four facts with the last linking its live URL where the study has one, the lead artifact, then h2s At a glance, The brief, What I built, Process, Decisions, What broke, Outcome, Where AI sat, Testimonial (an h2, when present), then the close; Conscious Connections has no Testimonial h2; no heading level is skipped (C-SITE-case-study-1, 10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C2
    statement: "/work/everbook shows a Testimonial with Dawson's D-SITE-84 span, differing from home's and /about's, and no link, and no Where AI sat; /work/calculate-qxmd shows no lead artifact, testimonial or Where AI sat, and no empty section, heading or rule where they would be (C-SITE-case-study-3, 13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C3
    statement: "On each published study exactly one primary-styled control exists, the close's Book a 30-minute call to /book; the close offers Not ready to book? with Send a note to /contact and holds no email address or mailto link; with consent granted its call sends one book_call_click with surface case-study, placement close and the page's slug only (C-SITE-case-study-4, 5, 15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C4
    statement: "Pressing Escape on a case study leaves the URL and scroll position unchanged; no PageDismiss import remains (C-SITE-case-study-14)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C5
    statement: "For every published study, the meta description and og:description equal its metaDescription, which is 160 characters or fewer (C-SITE-case-study-12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C6
    statement: "At 390 every published study has no horizontal scroll and every link and button at least 44px tall; axe reports no serious or critical violation on each (C-SITE-case-study-10, 11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study.spec.ts"
  - id: C7
    statement: "default (Everbook's tail), no-ai, bare and no-artifacts by ?state=, and no-gallery rendering as no-artifacts, match captures/case-study/ at 390 and 1440, dark and light, except that Everbook shows no Where AI sat (D-SITE-233) (C-SITE-case-study-2)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-015-case-study-page/evidence/states/"
---

# Contract — SITE-15 case-study-page

## Build notes

Wave 3, after SITE-5 (`#main` on this page), SITE-6 (`PageClose`) and SITE-7 (the fields). SITE-16 (case-study-formats) follows and replaces What I built's body.

- **Approach:** rewrite `app/work/[slug]/page.tsx` to render the blocks in order from `_components/` (opening with `FactsLedger` and `LeadArtifact`, `AtAGlance`, `Brief`, `WhatIBuilt` (text surfaces for now), `ProcessRows`, `DecisionRows`, `WhatBroke`, `Outcome`, `WhereAiSat`, then `CaseStudyTestimonial` and `PageClose`). Each optional block renders null when empty, so nothing wraps it. Delete `CaseBody.tsx`, `PageDismiss.tsx` and `Section.tsx` where nothing else imports them.
- **Decisions that apply:** D-SITE-79 and 96 (the order above, At a glance after the opening). D-SITE-84: "the full card without its project link … a short span at Quote 20px (18px at 390)." D-SITE-94: Yogesh's and Bruno's spans as written there. D-SITE-85: Where AI sat reuses home's three-list look, In the product · In the build · What I checked. D-SITE-174: the close's fallback is Send a note to `/contact`. D-SITE-195, 233 as non-negotiables.
- **Words:** case-study-words.md; the meta line's type label from home's filter names; the close line is `closingLine` from `content/about.ts`; the privacy artifact caption ships `[draft]`.
- **Interfaces:** the components above; `caseStudySpan` per testimonial in `content/testimonials.ts`; `no-ai`, `bare`, `no-artifacts`, `no-gallery` and `no-testimonial` in the page's States list, each stripping blocks from the current study through `_fixtures.ts`.
- **Per path:** the page, its blocks and fixtures; the card; the spans; the deletions; `tests/e2e/case-study.spec.ts`.
- **Gotchas:** Where AI sat copies the look of SITE-12's home-only `HowIWork` lists rather than sharing a component (judgment: one consumer each). `RootField` stays only if the captures draw the field (D-SITE-143 pattern); say which at the operator's look. `generateStaticParams` stays: on production `readPageState` never reads `searchParams`, so pages prerender. The case-study captures still show Everbook's AI block; D-SITE-233 wins. `no-testimonial`'s full-page capture waits on its re-export (D-SITE-196) and on the formats, so SITE-16 captures it. Map the kit's token names through `.claude/rules/house-design.md`. Capture: `yarn capture --route /work/everbook --keys default,no-ai,bare,no-artifacts,no-gallery --out <evidence dir>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a block wrapped in an empty section.
