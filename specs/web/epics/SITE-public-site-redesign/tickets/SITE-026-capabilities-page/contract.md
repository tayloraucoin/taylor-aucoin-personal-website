---
id: SITE-26
size: small
objective: "a hirer at /capabilities sees every problem Taylor takes on as chips under five discipline tabs, opens one in place and follows its proof to the work, and ends on the one call; today's card grid retires"
slice_type: "a page rebuilt on home's shared chip with its own tablist and URL tab; risks a tablist that breaks the ARIA pattern, a tab change that pushes history or leaves a card open, a chip with no proof, and a proof pointing at the wrong place"
non_negotiables:
  - "Chips are SITE-10's CapabilityChips and CapabilityCard, reused, never rebuilt; 25 show in comfort order, the 3 hidden never (D-SITE-142, 65); no Show all toggle (D-SITE-140)"
  - "Tabs, in order: All, Product & design, Engineering, AI & data, Leading delivery; an ARIA tablist with one tab stop, arrows and Home/End moving and selecting; the selected tab lives in the URL as ?tab= by replaceState; an unknown ?tab= falls back to All (D-SITE-146)"
  - "Looks come from tabVariants in components/ui/Button.tsx; whichever of SITE-11, SITE-14 and this ticket builds first adds it, the others reuse it, never two at once; the tablist behaviour is this page's own"
  - "content/capabilities.ts gains tabs, first filled from today's tags, and the proof hrefs D-SITE-141 names (D-SITE-234); Taylor reassigns tabs in the build thread"
  - "The close is SITE-6's PageClose with the line at Heading 3, the call through BookCallLink with surface capabilities, Not ready to book? with Send a note to /contact, no résumé link and no email address (D-SITE-174)"
  - "The header marks Work as current on /capabilities (D-SITE-140)"
  - "CapabilityGrid.tsx and RootField leave the page; CapabilityGrid is deleted with no import left (D-SITE-143)"
devs_call: "The tablist's component name and file under app/capabilities/, how tabs are stored per capability, the framing line's slot, and test file names"
waiver: "One surface, /capabilities, split for the token cap: capabilities.md holds the job and states, capabilities-build.md layout, behaviour, access and criteria, capabilities-words.md the strings; decisions-14.md holds D-SITE-234"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-140"
  - "D-SITE-141"
  - "D-SITE-143"
  - "D-SITE-145"
  - "D-SITE-146"
  - "D-SITE-149"
  - "D-SITE-174"
  - "D-SITE-205"
  - "D-SITE-234"
  - "C-SITE-capabilities-1"
  - "C-SITE-capabilities-2"
  - "C-SITE-capabilities-5"
  - "C-SITE-capabilities-9"
  - "C-SITE-capabilities-10"
  - "C-SITE-capabilities-14"
  - "C-SITE-capabilities-18"
  - "C-SITE-capabilities-19"
  - "C-SITE-capabilities-20"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/capabilities/**"
  - "components/capabilities/**"
  - "components/ui/Button.tsx"
  - "components/site/nav.ts"
  - "content/capabilities.ts"
  - "tests/**"
depends_on: [ SITE-4, SITE-6, SITE-10 ]
out_of_scope:
  - "The filter, ?q=, no match, the status region, the tab cross-fade and reduced motion on this page: SITE-27"
  - "A chip opening in place, one card at a time, Esc and focus return (C-SITE-capabilities-7, 8): SITE-10's shared component; cite, never re-prove"
  - "The header and footer themselves: SITE-4 and SITE-5"
criteria:
  - id: C1
    statement: "/capabilities has one h1, Problems I take on, a framing line, the five tabs in order with All selected, and 25 chips in the comfort order, all closed; A/B testing, read replicas and the React Native monorepo are absent; Work carries aria-current in the header (C-SITE-capabilities-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C2
    statement: "?tab=ai-data loads with AI & data aria-selected and exactly the chips whose tabs hold it; at 390 the selected tab's box lies inside the strip's visible width; ?tab=nope and a blank ?tab= render as default (C-SITE-capabilities-2, 5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C3
    statement: "The tablist is one tab stop; ArrowRight, ArrowLeft, Home and End move focus and selection, updating the chips and ?tab= with no new history entry and no navigation; choosing All removes tab from the URL; a tab change that removes an open card's chip closes the card and focus stays on the tab (D-SITE-205)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C4
    statement: "Every shown chip has at least one proof; a proof with a case study links to /work/<slug>, This site to /work?tab=branding, consciousconnections.app to /work/conscious-connections, BCIT ISSP off-site with an accessible name that says it opens another site; in Interface design's open card each of the four proof names computes weight 500 with an underline and sits with its comma in one unbreakable span (C-SITE-capabilities-9, 10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C5
    statement: "Every capability has tabs drawn from the five; with no reassignment, each capability's tabs are its tags mapped Design to Product & design, Commerce and Quality to Engineering, AI and Data to AI & data, Delivery and Process to Leading delivery; no file under app/capabilities/ or components/capabilities/ holds an arbitrary font size outside kit §3's tokens (C-SITE-capabilities-19)"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The close's Book a 30-minute call links to /book and, with consent granted, sends one book_call_click with surface capabilities and placement close only; its Send a note links to /contact; the page has no résumé link, no mailto and no email address; CapabilityGrid.tsx does not exist (C-SITE-capabilities-14, 20)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C7
    statement: "At 390 there is no horizontal scroll with a card open; axe reports no serious or critical violation in default, tab and card-open at 390 and 1440, dark and light; main has id main and the skip link moves focus into it"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities.spec.ts"
  - id: C8
    statement: "default, tab, card-open and card-open-four-proofs, opened by ?state=, match captures/capabilities/ at 390 and 1440, dark and light, with Contact in header and footer (C-SITE-capabilities-18)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-026-capabilities-page/evidence/states/"
---

# Contract — SITE-26 capabilities-page

## Build notes

Wave 4, after SITE-10 (`CapabilityChips({ items, initialOpen?, initialAll? })`, `CapabilityCard`, the chip name field) and SITE-6 (`PageClose`). SITE-27 adds the filter on top.

- **Approach:** `app/capabilities/page.tsx` (server) renders the h1 with the page-top glow, the framing line, a client tablist leaf and `CapabilityChips` fed the tab's items as plain props, then `PageClose`. The leaf reads the initial tab from the page (`searchParams`, so the page renders per request, as `/work`) and writes `?tab=` by `history.replaceState`.
- **Decisions that apply:** D-SITE-146: tabs "in build order: All (default) · Product & design · Engineering · AI & data · Leading delivery… in the URL as `?tab=`; at 390 the strip scrolls sideways and keeps the selected tab in view. A chip may sit in two tabs." D-SITE-141: proof opens `/work/[slug]` with a case study, a `/work` tab for a website or kit, external stays external. D-SITE-143: cut the eyebrow, the old h1, category tags, grid, overlay and `RootField`. D-SITE-205: an open card closes when its chip leaves the list. D-SITE-234: the first `tabs` fill from today's tags.
- **Interfaces:** `Capability.tabs: Tab[]`; the proof href changes; `currentNavItem("/capabilities")` returns `work`; `?state=` keys `default`, `tab`, `card-open`, `card-open-four-proofs` (real content: the tab, Search and discovery open, Interface design open).
- **Per path:** `app/capabilities/page.tsx`, `app/capabilities/_components/`. `components/capabilities/CapabilityGrid.tsx`: deleted. `components/site/nav.ts`: the one rule. `content/capabilities.ts`: `tabs`, hrefs, "the family office platform" proof name in sentence case. `tests/e2e/capabilities.spec.ts`, `tests/unit/capabilities-tabs.test.ts`.
- **Words:** capabilities-words.md as written: h1, tabs, the close; the framing line, tablist name and external-proof wording are Taylor's to write and render `[Taylor's to write]`; `[draft]` marks stay.
- **Gotchas:** in a tablist, Tab leaves the strip; arrows move the selection. Never `router.replace` (it re-renders the server page); `replaceState` keeps scroll. The tab change itself is instant here; SITE-27 adds the cross-fade. The family office stays unnamed. Capture: `yarn capture --route /capabilities --keys default,tab,card-open,card-open-four-proofs --out <C8's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a tablist of links, a pushed history entry per tab and a rebuilt chip.
