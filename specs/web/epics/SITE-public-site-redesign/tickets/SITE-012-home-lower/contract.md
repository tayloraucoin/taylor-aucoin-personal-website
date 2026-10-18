---
id: SITE-12
size: small
objective: "home's lower half lands (How I work with the AI block, four testimonials, Work with me's role rows and the websites line) and the whole page is proven in D-SITE-50's order, so a hirer who scrolls past the stories sees how Taylor works, who vouches for him and how to engage him"
slice_type: "three static sections and the whole-page pass; risks a carousel or initials tile coming back, a quote shown twice, an old section or the field left on the page, a forbidden name on home, and a keyboard order that skips a control"
non_negotiables:
  - "How I work: five steps (Scope · Build · Ship · Measure · Iterate) and the three-list AI block, shown as outputs, never opened (D-SITE-58)"
  - "Testimonials: all four approved quotes, two by two, Dawson, Bruno, Vaughn, Yogesh, no carousel, no initials tile, ending in a link to /about#testimonials; no quote twice on the page (D-SITE-56, 62)"
  - "Work with me rows are roles, each with how it is engaged: Product engineer, Product designer, Systems consultant, Fractional CTO, 0→1 build (D-SITE-57); the rows and link go to /work-with-me, the one line to /websites"
  - "Never on home: the family office's name, Durable, Viewpoint.AI, marketing as a skill, a bento or a hero-metric block (home.md)"
  - "Copy comes from home-words.md and the content files as written; Taylor's lists and lines stay bracketed or [draft] (D-SITE-185)"
  - "Every href comes from siteRoutes"
devs_call: "Component names, the home testimonial card's variant API in components/testimonials/, where the role rows' data sits, and test file names"
waiver: "One surface, home, split for the token cap: home.md holds the job, order and states, home-build.md the layout, access and criteria, home-words.md every string"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-words.md"
  - "D-SITE-50"
  - "D-SITE-56"
  - "D-SITE-58"
  - "D-SITE-185"
  - "C-SITE-home-1"
  - "C-SITE-home-13"
  - "C-SITE-home-14"
  - "C-SITE-home-21"
  - "C-SITE-home-24"
  - "C-SITE-home-26"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q2
reviewers: [ assay ]
focus:
  - "home answers in one minute what was shipped end to end, and the decisions behind it (assay)"
operator_review: false
planned_paths:
  - "app/page.tsx"
  - "app/_components/HowIWork.tsx"
  - "app/_components/HomeTestimonials.tsx"
  - "app/_components/WorkWithMe.tsx"
  - "components/testimonials/TestimonialCard.tsx"
  - "components/sections/Testimonials.tsx"
  - "content/home.ts"
  - "tests/**"
depends_on: [ SITE-10, SITE-11 ]
out_of_scope:
  - "The notes signup and its states (C-SITE-home-15's notes rows, 16 to 19): the signup ticket, which this ticket follows; its id joins depends_on when it is cut"
  - "The Work with me page, its content in content/services.ts and the /services redirect: the Work with me ticket"
  - "RootField itself: it stays for /about, /privacy and /capabilities until their tickets; only home drops it"
  - "Taylor's AI lists, the Product designer line and the replaced brackets: content edits by Taylor; launch waits on them (D-SITE-185)"
criteria:
  - id: C1
    statement: "How I work shows the five steps Scope, Build, Ship, Measure, Iterate in order, in one row at 1440 and stacked with a fixed number column at 390, then three lists headed What I give it, What I let AI do, What I check, with no disclosure control among them"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C2
    statement: "Testimonials shows four cards, Dawson, Bruno, Vaughn, Yogesh in that order, two columns at 1440 and one at 390, with no avatar or initials element; Read them in full links /about#testimonials; no quote sentence appears twice in main (C-SITE-home-13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C3
    statement: "Work with me shows five rows, Product engineer, Product designer, Systems consultant, Fractional CTO, 0→1 build, each with a terms and a best-for line; the rows and the Work with me link go to /work-with-me and the websites line to /websites (C-SITE-home-14)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C4
    statement: "main holds, in order, the hero, proof bar, pillars, Problems I take on, Selected work, How I work, Testimonials, Work with me and Notes, with the footer after main; no Signal, BioRow or RootField canvas remains on / (C-SITE-home-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C5
    statement: "The text and HTML of / at default and at every home ?state= key contain none of the family office's names, Durable, Viewpoint or a marketing capability (C-SITE-home-21)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C6
    statement: "Tabbing from the top of / reaches the skip link, header, hero buttons, pillars, chips, toggle, link, tabs, type chips, each story's controls, See all work, Work with me, the signup and the footer in that order, each focused control showing a 2px outline; at 390 there is no horizontal scroll, every control in the three new sections is at least 44px tall, and axe reports no serious or critical violation (C-SITE-home-24)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-lower.spec.ts"
  - id: C7
    statement: "/ at default matches captures/home/default-* in full at 390 and 1440, dark and light (C-SITE-home-1)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-012-home-lower/evidence/default/"
  - id: C8
    statement: "On the launch build, yarn check:build-output finds no bracketed value or [draft] tag in home's prerendered HTML (C-SITE-home-26)"
    evidence: manual
    reason: "It passes only once Taylor has replaced every bracketed and [draft] line (D-SITE-185), after this build; recorded --verdict deferred and run at launch"
---

# Contract — SITE-12 home-lower

## Build notes

Wave 3, the last home ticket: after SITE-10 and SITE-11, and after the notes signup ticket (C4 and C6 reach its section). Start gate as every home ticket: `home.md`'s `pillar-open` line (D-SITE-184).

- **Approach:** three server sections in `app/_components/`, placed in D-SITE-50's order in `app/page.tsx`, replacing today's `Testimonials` (delete it; home is its only consumer). Add a home variant to `TestimonialCard` without changing what `CaseBody` and `ProofStrip` render. Drop `RootField` from home: the locked canvas shows the page-top glow, not the field (as D-SITE-143 rules for `/capabilities`); if the default capture draws the field, keep it and say so at the operator's look. Then the whole-page pass: order, name scan, keyboard and the full capture.
- **Decisions that apply:** D-SITE-50: "Home order: header, hero, proof bar, pillars, Problems I take on, Selected work, How I work, Testimonials, Work with me, Notes, footer." D-SITE-56: "all four approved quotes, two by two, Dawson first, then Bruno, Vaughn, Yogesh, ending in a link to `/about#testimonials`. Dawson's and Bruno's cards use other contiguous spans of their recommendations than their stories do. No carousel." D-SITE-58: "three lists: What I give it, What I let AI do, What I check. Taylor's lists; synthetic placeholders until then. Shown as outputs, never opened." D-SITE-57: "Product engineer and Product designer (full-time, contract or fractional), Systems consultant (scoped engagement, system design), Fractional CTO (retainer), 0→1 build (fixed scope)." D-SITE-62: testimonial cards drop the initials tile.
- **Words (home-words.md, How I work, Testimonials, Work with me):** steps and their lines as drawn on the Paper Home page (read through the Paper tools' text, never a screenshot); AI lists `[draft]` placeholders; "Read them in full [draft]"; rows from `content/services.ts` where present, Product designer's line `[Taylor's to write]`, Systems consultant's `[draft]`; links "Work with me" and "[Draft] Need a website you own? Websites". The card spans for Dawson and Bruno as drawn: contiguous text from `full`, never trimmed or joined.
- **Interfaces:** `HowIWork`, `HomeTestimonials`, `WorkWithMe`; the home variant of `TestimonialCard`; home's rows in `content/home.ts` (the Work with me ticket owns `content/services.ts`; if both pages come to read one row list, it moves there).
- **Per path:** `app/page.tsx`: final order, `RootField` and the old import dropped. The three sections. `components/testimonials/TestimonialCard.tsx`: the variant. `components/sections/Testimonials.tsx`: deleted. `content/home.ts`: steps, lists, rows, spans. `tests/e2e/home-lower.spec.ts`.
- **Gotchas:** C5's names: the family office's client names are already in the repo (`docs/pending/cho-ventures-naming/`); read them from there into the test, and never add them anywhere else. `content/work/conscious-connections.ts` mentions Durable or Viewpoint today: if a home string carries one, stop and ask Taylor, since the copy is his. C6 walks the signup's controls, so it passes only after the signup ticket. C8 is recorded with `yarn contract:record … --verdict deferred` and goes to Operator checks. Map the kit's token names through `.claude/rules/house-design.md`. Capture: `yarn capture --route / --keys default --out <evidence dir>`.
- **Review (Q2):** one fresh-context Assay pass over the full-page captures and the three sections, with the focus line; findings in the thread.
- **Model:** Sonnet 5.5 at medium, minimum and recommended: static sections under tight tests. Choosing down risks trimmed quotes and a missed old section.
