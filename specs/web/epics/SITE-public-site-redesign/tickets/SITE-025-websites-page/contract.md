---
id: SITE-25
size: small
objective: "a buyer of a coded site at /websites reads ownership, then price and time, then the sites built, then changes and the FAQ, in the new brand, and starts the intake or books a call first through /book; /websites/platform stays exactly as it was"
slice_type: "a static page restyle over components shared with a legacy page; risks the platform page drifting, an unpublished row or care-plan row shipping, a price typed into a component, and a call that skips /book or its event"
non_negotiables:
  - "Order and layout as websites-coded-build.md: hero, What you actually own, What it costs, Sites I've built, Changes after the build, What you get, How it goes, Worth saying up front, Questions, the close; no eyebrow, stats strip, secondary call link or case link in the hero (D-SITE-208)"
  - "One label, one destination: three Start your site → buttons (hero, cost, close) to the intake start; Book a call first only in the close, through SITE-4's BookCallLink to /book with surface websites, placement close (D-SITE-210, 226)"
  - "Example rows come from content/work/rows.ts' published website rows: Kryshan Randel ships, Holistica stays unpublished, Clean Coast hidden (D-SITE-211, 238); the care plan renders nothing (D-SITE-212)"
  - "Shared components (WebsitesHero, Pricing, Process, Changes, WebsitesClose) keep /websites/platform's output byte for byte: props whose defaults reproduce it, or forks into app/websites/_components/ (D-SITE-209)"
  - "Every price renders from content/websites-coded.ts or content/websites.ts; no price literal in a component"
  - "Copy as websites-coded-words.md: today's content verbatim; [draft] marks stay; no Durable (D-SITE-213)"
devs_call: "Fork or prop for each shared component, the example row's markup within the captures, whether the close places SITE-6's PageClose slots or its own block, and test file names"
waiver: "One surface, the coded websites page, split for the token cap: websites-coded.md holds the job and states, websites-coded-build.md layout, access, events and criteria, websites-coded-words.md the strings; decisions-14.md holds D-SITE-226, the events ruling"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/websites-coded.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/websites-coded-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/websites-coded-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-113"
  - "D-SITE-114"
  - "D-SITE-115"
  - "D-SITE-116"
  - "D-SITE-207"
  - "D-SITE-208"
  - "D-SITE-209"
  - "D-SITE-210"
  - "D-SITE-211"
  - "D-SITE-212"
  - "D-SITE-213"
  - "D-SITE-214"
  - "D-SITE-226"
  - "C-SITE-websites-coded-1"
  - "C-SITE-websites-coded-3"
  - "C-SITE-websites-coded-4"
  - "C-SITE-websites-coded-5"
  - "C-SITE-websites-coded-6"
  - "C-SITE-websites-coded-7"
  - "C-SITE-websites-coded-8"
  - "C-SITE-websites-coded-9"
  - "C-SITE-websites-coded-10"
  - "C-SITE-websites-coded-11"
  - "C-SITE-websites-coded-12"
  - "C-SITE-websites-coded-13"
  - "C-SITE-websites-coded-14"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/websites/page.tsx"
  - "app/websites/_components/**"
  - "app/test-harness/example-row/page.tsx"
  - "components/websites/**"
  - "content/websites-coded.ts"
  - "content/websites-coded-case.ts"
  - "content/work/rows.ts"
  - "tests/**"
depends_on: [ SITE-3, SITE-4, SITE-7, SITE-24 ]
out_of_scope:
  - "The route, redirect, chooser and golden file: SITE-24; the header (Contact, no call button, C-SITE-websites-coded-2) and footer: SITE-4 and SITE-5; cite, never re-prove"
  - "Holistica's row content and the care plan (D-SITE-211, 212); Kryshan Randel's screenshots and testimonial: Taylor's"
  - "/websites/platform's restyle (D-SITE-112)"
criteria:
  - id: C1
    statement: "/websites has one h1, the hero title, and h2s in websites-coded-build.md's order; the hero has one primary-styled control and no eyebrow, stats, call or case link; the page shows $2,000 and CAD + GST; no string literal or JSX text (comments excluded) in app/websites/page.tsx, app/websites/_components/** or the five shared components holds a dollar amount, the page's description included (C-SITE-websites-coded-1, 4)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C2
    statement: "Exactly three links named Start your site, each to /websites/coded/intake; the close's Book a call first links to /book, and no link on the page points at the Cal.com host (C-SITE-websites-coded-3, 14)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C3
    statement: "On the harness route, a synthetic row's desktop shot, phone shot and All n images each open the lightbox on that row's gallery, Escape closes it and focus returns to the trigger; a row with no live link or no testimonial shows no such line and no empty gap; a row with an empty gallery shows no shot button and no All n images; the route answers 404 in production (C-SITE-websites-coded-5, 6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-example-row.spec.ts"
  - id: C4
    statement: "Sites I've built shows Kryshan Randel's row only: no Holistica or Phoenix text, no care-plan row, and no Durable, Clean Coast, family office or marketing service anywhere on the page; CodedCase.tsx and content/websites-coded-case.ts do not exist (C-SITE-websites-coded-7, 11, 13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C5
    statement: "The first FAQ item is open and the rest closed, each toggling by Enter and Space; Tab walks the Access path in DOM order and every control shows a 2px focus outline; main has id main and the skip link moves focus into it (C-SITE-websites-coded-8, 9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C6
    statement: "With consent granted, Book a call first sends one book_call_click with surface websites and placement close and no other parameter, and a Start your site click sends no event; with consent declined no request reaches a Google host (C-SITE-websites-coded-12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C7
    statement: "The head holds robots noindex, nofollow and the Websites for creative work social card; at 390 there is no horizontal scroll, primary buttons are full width and at least 44px, links at least 24px; axe reports no serious or critical violation at 390 and 1440, dark and light (C-SITE-websites-coded-10, 14)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites.spec.ts"
  - id: C8
    statement: "After this change /websites/platform's main still equals SITE-24's golden file (C-SITE-websites-coded-11, D-SITE-209)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-platform-golden.spec.ts"
  - id: C9
    statement: "default at 390 and 1440, dark and light, matches captures/websites-coded/default-* minus Phoenix's row (D-SITE-115) (C-SITE-websites-coded-1, 10)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-025-websites-page/evidence/states/"
  - id: C10
    statement: "On the launch build no [draft] or bracketed placeholder remains on /websites (C-SITE-websites-coded-7)"
    evidence: manual
    reason: "Taylor writes the Add-ons and Sites I've built lines and Kryshan's row; checked on the launch build, recorded --verdict deferred"
---

# Contract — SITE-25 websites-page

## Build notes

Wave 4, after SITE-24 (the page at `/websites`, the golden test) and SITE-7 (`workRows`). Beside SITE-26.

- **Approach:** rebuild `app/websites/page.tsx` section by section from the build file and the four captures, on today's content files. A server example row in `app/websites/_components/` reads a `WorkRow` with its `example`; it renders the shots and All n images only when the gallery has items, using `components/work/MediaLightbox.tsx`. The FAQ is `components/ui/Faq.tsx`. Retire `CodedCase.tsx` and `websites-coded-case.ts`.
- **Decisions that apply:** D-SITE-208: no eyebrow, stats strip, secondary call link or case link in the hero. D-SITE-210: "Book a call first" goes to `/book`. D-SITE-207: first FAQ item open. D-SITE-116: at 390 the desktop shot leads full width, no phone shot. D-SITE-114: one named testimonial line when the client gives one. D-SITE-211, 212, 213, 214: as the non-negotiables and C7. D-SITE-226: only `book_call_click` fires here.
- **Interfaces:** the example row component; `/test-harness/example-row`, a test-only literal row (synthetic names, images already under `public/`), 404 when `isProductionDeployment()`, as SITE-6's harness. `default` is the only `?state=` key: the page ships with one row, so `one-example` is `default` (D-SITE-115, 211).
- **Per path:** `content/websites-coded.ts`: the Add-ons label and Sites heading as `[draft]` strings, `heroNote` without its appended call line; the page's description moves here word for word. `content/work/rows.ts`: Kryshan Randel's `example` when its images exist, else none. Shared `components/websites/*`: props with defaults, or a fork. `tests/e2e/websites.spec.ts`, `websites-example-row.spec.ts`.
- **Gotchas:** run C8 after every change to a shared component, not once at the end. Kryshan Randel's screenshots are not on disk (pre-build item): the row ships text only and C9's shot area differs from the canvas until they land; record the capture with that note. Read real collect requests with the fake-ID build and SITE-1's opt-in, as SITE-4. Capture: `yarn capture --route /websites --keys default --out <C9's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a shared component edited in place, so the platform page drifts, and a call link left pointing at Cal.com.
