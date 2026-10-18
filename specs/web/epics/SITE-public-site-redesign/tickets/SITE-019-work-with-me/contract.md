---
id: SITE-19
size: small
objective: "a hirer at /work-with-me sees the five roles with how each is engaged and the price band, the smaller building group below, how it starts and the FAQ, and writes a note or books a call; /services lands there for good"
slice_type: "a static page rebuilt from today's /services plus a permanent redirect; risks a second primary per view, a call label that differs or skips /book, a 307 or a dropped query, and a menu where seats should be"
non_negotiables:
  - "/services → /work-with-me is permanent (Next answers 308) and carries the query; app/services/ is deleted with it, never before the page exists (D-SITE-164)"
  - "Order as services.md: hero, five role rows with the price line once under them, the building group (coded website, branding, conventions install), How I work with What I'm not, How to start with the reply line, FAQ, the close"
  - "Every Send a note goes to siteRoutes.contact and leads; every call is SITE-4's BookCallLink, Book a 30-minute call to /book with surface services (A-17, D-SITE-130)"
  - "The close is SITE-6's PageClose in its note-led form, with no résumé link"
  - "Roles are seats of one job, never a menu; no row names marketing (D-SITE-125)"
  - "Copy from services-words.md and content/services.ts as written; its [draft] and Taylor's slots stay bracketed, and the two prices stay slots until Taylor names them (D-SITE-203)"
devs_call: "Component names under app/work-with-me/_components/, the shape of content/services.ts's roles and building rows, which old components/services/ files are deleted, and test file names"
waiver: "One surface, Work with me, split for the token cap: services.md holds the order and states, services-build.md layout and access, services-words.md the strings, services-criteria.md the criteria"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-criteria.md"
  - "D-SITE-57"
  - "D-SITE-125"
  - "D-SITE-130"
  - "D-SITE-164"
  - "D-SITE-203"
  - "C-SITE-services-1"
  - "C-SITE-services-2"
  - "C-SITE-services-3"
  - "C-SITE-services-4"
  - "C-SITE-services-5"
  - "C-SITE-services-6"
  - "C-SITE-services-7"
  - "C-SITE-services-21"
  - "C-SITE-services-24"
  - "C-SITE-services-27"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/work-with-me/**"
  - "app/services/**"
  - "components/services/**"
  - "content/services.ts"
  - "next.config.ts"
  - "tests/**"
depends_on: [ SITE-5, SITE-6 ]
out_of_scope:
  - "/book and /contact: SITE-20 and the /book tickets"
  - "The header (current item, call button) and footer: proven by SITE-4 and SITE-5; the close block itself by SITE-6; cite, never re-prove"
  - "Naming the branding and conventions install prices and clearing the drafts: Taylor, before launch (D-SITE-203)"
  - "Home's Work with me rows: SITE-12; the PEM page: a later ticket"
criteria:
  - id: C1
    statement: "GET /services and /services?x=1 answer 308 with Location /work-with-me and /work-with-me?x=1; GET /work-with-me answers 200 (C-SITE-services-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-with-me.spec.ts"
  - id: C2
    statement: "/work-with-me has one h1, Work with me, and h2s in services.md's order; five role h3s, Product engineer, Product designer, Systems consultant, Fractional CTO, 0→1 build, each with its terms, best-for and includes; three building h3s, Coded website at $2,000 CAD + GST, Branding, Conventions install; the $15K–$75K CAD line appears once, after the roles; no text on the page reads marketing (C-SITE-services-3)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-with-me.spec.ts"
  - id: C3
    statement: "Every Send a note on the page links to /contact; every Book a 30-minute call, header included, links to /book and no other label offers a call; Websites links to /websites and Branding & UI to /work?tab=branding; no link points at the Cal.com host; the hero and the close each have exactly one primary-styled control, Send a note (C-SITE-services-4, 5, 6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-with-me.spec.ts"
  - id: C4
    statement: "With consent granted, the hero's call sends one book_call_click with surface services and placement hero, and the close's with placement close, and no other event parameter; with consent declined no request reaches a Google host"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-with-me.spec.ts"
  - id: C5
    statement: "Every FAQ answer is visible with no button, details or aria-expanded; at 390 the hero buttons are full width and at least 44px, the inline links at least 24px tall, and the page has no horizontal scroll; axe reports no serious or critical violation at 390 and 1440, dark and light; main has id main and the skip link moves focus into it (C-SITE-services-7, 21)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-with-me.spec.ts"
  - id: C6
    statement: "default at 390 and 1440, dark and light, matches captures/services/default-*, sections in order and the FAQ open (C-SITE-services-2, 7)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-019-work-with-me/evidence/states/"
  - id: C7
    statement: "On the launch build, the building group shows Taylor's two prices and no [draft] or Taylor's bracket remains on /work-with-me (C-SITE-services-24, 27)"
    evidence: manual
    reason: "Waits on Taylor's prices and copy (D-SITE-203) and the production build check; recorded --verdict deferred"
---

# Contract — SITE-19 work-with-me

## Build notes

Wave 3, after SITE-5 (footer in the layout, `main#main`) and SITE-6 (`PageClose`). Runs beside the home, `/work`, case-study and `/about` tickets; SITE-20 builds the `/contact` its notes land on.

- **Approach:** move the page to `app/work-with-me/page.tsx` with sections under `app/work-with-me/_components/`, read from a reshaped `content/services.ts` (roles with `terms`, `bestFor`, `includes`; building rows with `price`, `line`, `proofHref?`). Add the `/services` entry beside SITE-2's two in `next.config.ts`'s `redirects()` and delete `app/services/`. Drop what the new order has no place for (`RootField`, `ProblemGrid`, `ProofStrip`, `OfferCards`, `ClosingCta`) and delete each file no other page imports.
- **Decisions that apply:** D-SITE-164: "Work with me is built at `/work-with-me` … `/services` redirects there permanently." D-SITE-130: the note leads, the call sits beside it as the ghost; the close is "the `/about` close block without its résumé link (reused)". D-SITE-57: the five roles, each with how it is engaged. D-SITE-125: "seats of one job, never a menu"; the building group is "visibly smaller than Roles". D-SITE-203: branding and conventions install prices are Taylor's before launch, as "$N CAD + GST".
- **Layout (services-build.md):** column 1080 at 1440, 342 at 390. Role rows name 240 · terms 240 at Meta · best-for over includes at Small 15, joined with " · ". Building rows name 240 · price 240 tabular · line · a 160 link column (proof over Send a note); conventions install has Send a note only (D-SITE-128). FAQ rows open, question 360, answer to 640. H3 per role, building row, step and FAQ question.
- **Words:** services-words.md, Chrome and `/work-with-me`, as written; document title "Work with me", its description per D-SITE-129. The prices render as `{price}` slots until Taylor names them.
- **Per path:** `app/work-with-me/**`: page and sections. `app/services/**`: deleted. `components/services/**`: retired files deleted. `content/services.ts`: roles and building rows. `next.config.ts`: one redirect. `tests/e2e/work-with-me.spec.ts`; SITE-2's `routes.spec.ts` C2 line for `/services` moves to the 308 (SITE-2 wrote it to change here).
- **Gotchas:** `permanent: true` is 308; assert the real `Location` with `maxRedirects: 0`. The event criterion reads real collect requests: the fake-ID build and SITE-1's opt-in to real gtag.js, as SITE-4's spec. `/contact` answers 404 until SITE-20: assert hrefs, not the landing. `app/about/page.tsx` imports `availability` from `content/services.ts`: keep that export. Token names in the spec are the kit's: map through `.claude/rules/house-design.md`. Capture: `yarn capture --route /work-with-me --keys default --out <C6's path>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a second primary in a view or a roles list that reads as a menu.
