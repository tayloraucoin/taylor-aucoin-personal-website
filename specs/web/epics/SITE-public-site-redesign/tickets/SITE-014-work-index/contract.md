---
id: SITE-14
size: small
objective: "a hirer who wants more than home showed opens /work, sees every piece of work in one discipline grouped by how it was engaged, narrows it by type in the URL, and opens the story they want"
slice_type: "a new server-rendered route over SITE-8's derivations; risks tabs and chips that lose the view on reload, a chip with no rows, a repeated link heard without its row, and a gallery opener with nothing behind it"
non_negotiables:
  - "Tabs and chips are links writing ?tab= and ?type= in two named navs, aria-current on the selected one; never an ARIA tablist (D-SITE-190)"
  - "Every tab, chip, group and order comes from SITE-8's functions; this ticket renders, it never re-derives"
  - "The Websites tab holds Kryshan Randel alone; Holistica stays unpublished and Clean Coast hidden (D-SITE-238)"
  - "No marks, counts, row numbers, row hover or arrows (D-SITE-8, 102); filtering swaps rows instantly (A-14)"
  - "A row with an empty gallery shows no opener and no empty frame"
  - "The family office stays unnamed; canvas strings win on /work only, listRole and the en dash at render (D-SITE-189)"
  - "Looks from tabVariants and chipVariants in components/ui/Button.tsx, shared with SITE-11; behaviour is this page's own"
devs_call: "Row and group component names, the fixture row's content, and test file names"
waiver: "One surface, the work index, split for the token cap: work-index.md holds the states, work-index-build.md layout, access and criteria, work-index-words.md every string; decisions-14.md holds D-SITE-238, which amends its Websites state"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/work-index.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/work-index-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/work-index-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-100"
  - "D-SITE-189"
  - "D-SITE-190"
  - "D-SITE-238"
  - "C-SITE-work-index-1"
  - "C-SITE-work-index-2"
  - "C-SITE-work-index-3"
  - "C-SITE-work-index-5"
  - "C-SITE-work-index-6"
  - "C-SITE-work-index-7"
  - "C-SITE-work-index-8"
  - "C-SITE-work-index-10"
  - "C-SITE-work-index-11"
  - "C-SITE-work-index-12"
  - "C-SITE-work-index-13"
  - "C-SITE-work-index-15"
  - "C-SITE-work-index-16"
  - "C-SITE-work-index-17"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/work/page.tsx"
  - "app/work/_components/**"
  - "app/work/_fixtures.ts"
  - "components/ui/Button.tsx"
  - "tests/**"
depends_on: [ SITE-8 ]
out_of_scope:
  - "The derivation rules behind C-SITE-work-index-4 and 9 (fallbacks, empty chips and tabs): proven by SITE-8's C1 and C4, cited, never re-proven"
  - "The header's call button on /work (C-SITE-work-index-14): proven by SITE-4"
  - "Gallery images for Kryshan Randel and the three kits: not on disk; their rows ship with no opener until Taylor adds them"
  - "The intro line, page title, description and the two navs' names: Taylor's to write; they ship bracketed"
criteria:
  - id: C1
    statement: "/work shows h1 Work, Product engineering and All with aria-current, then h2 groups Full-time (Everbook, Roomvy, Calculate by QxMD), Contract (Multi-entity family office platform), Business (Agora), Passion projects (Conscious Connections) with each title an h3, then the capabilities line to /capabilities; Branding & UI shows chips All, Business, Passion projects, Own brand and Websites shows none (C-SITE-work-index-1, 2)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C2
    statement: "Activating the Contract chip by keyboard loads /work?type=contract with that chip current, focus on it, scrollY unchanged and no visible group label but an h2 Contract in the outline; reloading returns the same view; the tabs' and chips' hrefs equal workHref's; tabbing from the top reaches the header, tabs, chips, each row's links in visual order, the capabilities line and the footer, each focused control showing a 2px outline, in dark and light (C-SITE-work-index-3, 5, 11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C3
    statement: "Read the decision story on Everbook opens /work/everbook in the same tab at scrollY 0; on Branding & UI, Agora and Conscious Connections lead with the story link and the Taylor Aucoin kit has none; every repeated link has aria-describedby naming its row title; live links open in a new tab with rel noopener noreferrer (C-SITE-work-index-6, 8, 12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C4
    statement: "?tab=websites shows Kryshan Randel alone with no chips and no gallery opener; on ?state=gallery (a synthetic row, outside production only) the opener opens MediaLightbox on the first image and Escape returns focus to it (C-SITE-work-index-7, D-SITE-238)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C5
    statement: "At 390 there is no horizontal scroll and every tab, chip and row link has a hit area at least 44px tall; meta reads role · period on one line, with an en dash between years; with reduced motion every transition computes to 0ms; axe reports no serious or critical violation on each tab and on ?type=contract (C-SITE-work-index-10, 12, 13, 15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C6
    statement: "The HTML of /work on every tab holds none of the family office's names (C-SITE-work-index-16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/work-index.spec.ts"
  - id: C7
    statement: "/work, ?tab=websites, ?tab=branding and ?type=contract match captures/work-index/ at 390 and 1440, dark and light, first visit dark, except that Websites holds Kryshan Randel alone and empty galleries show no opener (C-SITE-work-index-1, 5, 8, 10, 17)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-014-work-index/evidence/states/"
  - id: C8
    statement: "On a VERCEL_ENV=production build, /work and each tab, fetched per request, hold no bracketed value or [draft] tag"
    evidence: manual
    reason: "/work renders per request, so check:build-output never sees it; passes only once Taylor writes the bracketed lines; recorded --verdict deferred and run at launch"
---

# Contract — SITE-14 work-index

## Build notes

Wave 3, after SITE-8 (derivations). Whichever of SITE-11 and SITE-14 builds first adds `tabVariants` and `chipVariants`, the other reuses them; never both at once. Runs beside the other page tickets.

- **Approach:** a server `app/work/page.tsx` that awaits `searchParams` (the page renders per request, `verdict.md`), parses with `parseTab` and `parseType`, and renders `visibleTabs`, `chipsForTab` and `groupByType(entriesForTab(…))` as plain links built by `workHref`, with `scroll={false}` so focus and position hold. Rows are server components; the gallery opener is the one client leaf (a button opening `MediaLightbox`, unchanged).
- **Decisions that apply:** D-SITE-190: tabs and chips are links writing `?tab=` and `?type=`, each set a `nav`, `aria-current` on the selected one. D-SITE-100: groups Full-time, Contract, Business, Passion projects, Client, Own brand, no counts. D-SITE-189: "Canvas row strings win on `/work` only." D-SITE-238: "The Websites tab, on home and `/work`, shows Kryshan Randel as the one website; Holistica … unpublished until it ships; Clean Coast stays hidden."
- **Words:** work-index-words.md as written; the bracketed lines ship bracketed; "All n images" and "All n boards" from the gallery's count.
- **Interfaces:** `WorkTabsNav`, `TypeChipsNav`, `TypeGroup`, `WorkRow`, `GalleryOpener` in `app/work/_components/`; the `gallery` key in `/work`'s States list, read by `readPageState`, seeding one synthetic row from `app/work/_fixtures.ts`.
- **Per path:** `page.tsx`: the route, its metadata and the capabilities line; `_components/`: the pieces above; `_fixtures.ts`: the synthetic row with two images already under `public/`; `tests/e2e/work-index.spec.ts`.
- **Gotchas:** no row on real content has a gallery this cycle, so C4's opener runs on the fixture; the opener renders only when `gallery.length > 0`. A chip change must not scroll: `Link` with `scroll={false}`, and focus stays on the link because the element persists across the render (same key). Selected-chip group label: visually hidden h2, never removed (D-SITE-191). C6 reads the family office's names from `docs/_legacy/pending/cho-ventures-naming/` into the test, never anywhere else. Capture by URL: `yarn capture --route '/work?tab=websites' --keys default --out <evidence dir>`, one per view. Map the kit's token names through `.claude/rules/house-design.md`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended: rendering over proven logic. Choosing down risks a soft navigation that drops focus.
