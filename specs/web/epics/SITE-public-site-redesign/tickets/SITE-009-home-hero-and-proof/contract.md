---
id: SITE-9
size: small
objective: "home opens on its new frame: the hero (label, name, headline, lede, the call and See the work, the graded headshot) and the proof bar's four cells, so in the first screen a hirer reads what Taylor builds and how long he has shipped, and can book"
slice_type: "a home section pair on the critical first screen; risks a second primary action, a call that skips the event, a hero-metric block where a ledger was drawn, and the consent banner hiding the call at 390"
non_negotiables:
  - "One primary action in the hero: BookCallLink, surface home, placement hero, label Book a 30-minute call (A-17, D-SITE-165); See the work is the ghost"
  - 'The proof bar is a ledger in type: four cells, a fact over a meta line, hairlines between; never a hero-metric block, no counters or animated numbers (D-SITE-48, A-09)'
  - "Copy comes from home-words.md as written; [12], [23] and Four seats [draft] stay bracketed through the build (D-SITE-185); never improve a line"
  - "One h1, the name; the hero's headshot is the graded file Taylor supplies (D-SITE-172), one file for home and /about"
  - "Home's copy lives in content/ (house rule), not inline in components"
  - "This ticket touches nothing under components/analytics/: the consent state is reached through the real regime table"
devs_call: "Component names under app/_components/, the hero's markup within the captures, the content file's shape, and test file names"
waiver: "One surface, home, split for the token cap: home.md holds the job and states, home-build.md the layout, access and criteria, home-words.md every string"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-words.md"
  - "D-SITE-48"
  - "D-SITE-50"
  - "D-SITE-172"
  - "D-SITE-185"
  - "D-SITE-186"
  - "C-SITE-home-3"
  - "C-SITE-home-20"
  - "C-SITE-home-23"
  - "C-SITE-home-25"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q2
reviewers: [ assay ]
focus:
  - "home answers in one minute what was shipped end to end, and the decisions behind it (assay)"
operator_review: false
planned_paths:
  - "app/page.tsx"
  - "app/_components/HomeHero.tsx"
  - "app/_components/ProofBar.tsx"
  - "content/home.ts"
  - "components/sections/Hero.tsx"
  - "components/sections/Signal.tsx"
  - "lib/config.ts"
  - "public/images/**"
  - "tests/**"
depends_on: [ SITE-4, SITE-5 ]
out_of_scope:
  - "See the work's jump and focus to the first story (C-SITE-home-5): the selected-work ticket; until then it links the old section's #work anchor"
  - "Pillars, Problems I take on, Selected work, How I work, Testimonials, Work with me and the notes signup: their home tickets, each replacing its old section in place"
  - "The whole page in D-SITE-50's order (C-SITE-home-1), the name scan, keyboard pass and production bracket check (C-SITE-home-21, 24, 26), and RootField's fate: the last home ticket"
  - "The header's call and the dark default (C-SITE-home-2, 4, the header part of 20): proven by SITE-4 and SITE-5; cite, never re-prove"
criteria:
  - id: C1
    statement: "At 1440 the hero holds, in DOM order, the label Product engineer, one h1 Taylor Aucoin, the headline, the lede, then a Book a 30-minute call link to /book as the hero's only primary-styled control and a See the work ghost link, with the 176px headshot to the right; at 390 the headshot comes before the h1 and both buttons span the column; no serious or critical axe violation (C-SITE-home-3); main has id main and the skip link moves focus into it"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-hero.spec.ts"
  - id: C2
    statement: "With consent granted, the hero's call sends one book_call_click collect request with surface home, placement hero and no other event parameter, and lands on /book; with consent declined no request reaches any Google host (C-SITE-home-20)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-hero.spec.ts"
  - id: C3
    statement: "The proof bar shows four cells in D-SITE-48's order (Since 2016, [12] products, [23] cohorts taught, Four seats), each a fact over its meta line, side by side at 1440 and stacked at 390; no element on the page holds the old Signal label or stats, and no proof-bar text changes after load"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-hero.spec.ts"
  - id: C4
    statement: "At 390x844 with the request header x-vercel-ip-country DE, the hero's call and the banner's Accept and Decline buttons each lie fully inside the viewport (C-SITE-home-25, D-SITE-186)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-hero.spec.ts"
  - id: C5
    statement: "At 390, / has no horizontal scroll and the hero's two buttons are at least 44px tall (C-SITE-home-23)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-hero.spec.ts"
  - id: C6
    statement: "The hero and proof bar at 390 and 1440, dark and light, match the first two sections of captures/home/default-*, headshot included"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-009-home-hero-and-proof/evidence/hero/"
---

# Contract — SITE-9 home-hero-and-proof

## Build notes

Wave 3, the first home ticket, after SITE-4 (`BookCallLink`, `buttonVariants`) and SITE-5 (`main#main`, the footer out of the page). The other home tickets follow, each replacing one old section.

- **Start gate:** `home.md` holds `[NEEDS DECISION — BLOCKING]` on `pillar-open` (D-SITE-184), so `contract:init` refuses every home ticket until that crop is captured and the line is decided in the file. Pre-build for this ticket: the graded headshot (D-SITE-172), which C6 needs.
- **Approach:** rewrite `app/page.tsx` to D-SITE-50's frame: the new hero, the proof bar, then today's sections in the order their replacements take (Capabilities as pillars, Specialties as Problems I take on, SelectedWork, Testimonials) so each later ticket swaps one in place. Column 1200 at 1440, full width less 24 at 390. Delete `components/sections/Hero.tsx` and `Signal.tsx`; drop `BioRow` from home only (Work with me still imports it).
- **Decisions that apply:** D-SITE-50: "Home order: header, hero, proof bar, pillars, Problems I take on, Selected work, How I work, Testimonials, Work with me, Notes, footer." D-SITE-48: "a ledger in type (heading-4 fact over a meta line, hairline rules), never a hero-metric block (A-09). Four items: "Since 2016"; "[12] products and counting"; "[23] cohorts taught", its meta line naming BCIT ISSP, VFS, a design cohort and the virtual interns; "Four seats [draft]" over "founder · founding engineer · product designer · fractional CTO"." D-SITE-172: "today's photo graded to sit on carbon, slightly warm (kit §5), supplied by Taylor before the home and `/about` build tickets; one file serves both." D-SITE-185: bracketed values "may stay bracketed through the build; launch waits on them." D-SITE-186: "The consent banner may cover "See the work" at 390x844; accepted while the hero's primary and both banner buttons stay fully visible." Home build, Hero: "Label with accent rule, Display, Headline, Lede, two buttons; headshot 176 right"; 390: "Headshot first; buttons full width." Proof bar: "Four cells, hairlines between"; 390 "Stacked".
- **Words (home-words.md, Chrome and hero; Proof bar):** label "Product engineer"; "Taylor Aucoin · The whole product, thought through. · Product Engineer, building software for over a decade. I shape the problem, ship it, and set it up to be measured, with my judgment over the AI."; ghost "See the work"; the bar's four facts and meta lines as written, brackets kept, the `[draft]` mark kept in data and caught by SITE-1's check. Headshot alt is Taylor's to write: until he does, keep today's `SITE.name`, as `BioRow` has it.
- **Interfaces:** `HomeHero`, `ProofBar` (server components); `content/home.ts` exporting the hero and bar copy. `PHOTO` in `lib/config.ts` points at the graded file under `public/images/`.
- **Per path:** `app/page.tsx`: the frame. `app/_components/HomeHero.tsx`, `ProofBar.tsx`: the sections. `content/home.ts`: their copy. `components/sections/Hero.tsx`, `Signal.tsx`: deleted. `lib/config.ts`: `PHOTO` only. `public/images/**`: the graded headshot. `tests/e2e/home-hero.spec.ts`.
- **Consent state:** home.md lists `consent`, but the banner belongs to the analytics seam (SITE-3, Q3). Reach it as SITE-3 does, with `x-vercel-ip-country: DE` on the request (the real regime table); C4 sets the header in Playwright. No `?state=consent` fixture, no edit under `components/analytics/`.
- **Gotchas:** the event criterion reads real collect requests: build with `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` and opt into real gtag.js through SITE-1's shared fixture, as SITE-4's spec does; a GA4 event parameter arrives as `ep.<name>`. Pressing the call lands on a 404 until the Work with me ticket: assert the URL. `GradientButton` is retired, not reused. Token names in the spec are the kit's: map through `.claude/rules/house-design.md` and stop and ask before inventing one. Hover transitions are 0ms under reduced motion (D-SITE-178).
- **Review (Q2):** one fresh-context Assay pass over the hero and bar captures and `app/_components/`, with the focus line; findings in the thread.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a bar drawn as a metric block and a second primary in the hero.
