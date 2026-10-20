---
id: SITE-27
size: small
objective: "a hirer at /capabilities types a problem or a tool and sees only the chips that match within the tab they chose, hears the count, and on no match can clear the filter or send a note; a shared link with ?q= opens the same list"
slice_type: "a client filter over the page's chips with URL state and motion; risks a query that pushes history or reaches GA, a tab change that drops the query, an announcement on every keystroke, focus lost when a card closes, and motion that ignores reduced motion"
non_negotiables:
  - "The field is named by its visible label, Filter by problem or tool [draft], placeholder as hint only (A-16); it matches title, tech, approach, offer and keywords, case-insensitive, within the selected tab; switching tabs keeps the query and typing never changes the tab (D-SITE-148)"
  - "q lives in the URL by history.replaceState: no history entry, no navigation, a blank q removed; the open card is never in the URL"
  - "No match shows Nothing by that name., Clear the filter [draft] and Send a note to /contact, one label for one intent (D-SITE-174); Clear the filter and the field's × empty the field, restore the chips and focus the field"
  - "One polite status region gives the count after typing settles (about 500ms) and after a tab change, and the no-match line; never per keystroke"
  - "Filter and keyboard changes are instant; a pointer tab change is a 120ms cross-fade with scroll held; under reduced motion every transition is 0ms, cross-fade included (D-SITE-147, 178)"
  - "q never reaches a payload, page_location or page_referrer: SITE-3's seam, never a second strip (D-SITE-179)"
  - "A card closed because its chip left the list leaves focus where it was, in the field or on the tab (D-SITE-205)"
devs_call: "The filter leaf's name and file under app/capabilities/_components/, the settle timer, how the cross-fade is applied, and test file names"
waiver: "One surface, /capabilities, split for the token cap: capabilities.md holds the states and the URL rules, capabilities-build.md behaviour, motion, access and criteria, capabilities-words.md the strings"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/capabilities-words.md"
  - "D-SITE-144"
  - "D-SITE-147"
  - "D-SITE-148"
  - "D-SITE-174"
  - "D-SITE-178"
  - "D-SITE-179"
  - "D-SITE-205"
  - "C-SITE-capabilities-3"
  - "C-SITE-capabilities-4"
  - "C-SITE-capabilities-5"
  - "C-SITE-capabilities-6"
  - "C-SITE-capabilities-11"
  - "C-SITE-capabilities-12"
  - "C-SITE-capabilities-13"
  - "C-SITE-capabilities-15"
  - "C-SITE-capabilities-16"
  - "C-SITE-capabilities-17"
  - "C-SITE-capabilities-18"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/capabilities/**"
  - "components/capabilities/**"
  - "tests/**"
depends_on: [ SITE-3, SITE-26 ]
out_of_scope:
  - "The tablist, ?tab=, chips, proofs and the close: SITE-26; a chip opening in place, Esc and focus return (C-SITE-capabilities-7, 8): SITE-10; cite, never re-prove"
  - "stripQuery and the page-view seam themselves: SITE-3"
  - "The status region's wording and the tablist's name: Taylor's to write; they render bracketed"
criteria:
  - id: C1
    statement: "Typing realtime shows exactly AI features, Realtime sync and Realtime voice, with no transition on the chip list, and the URL reads ?q=realtime with history.length unchanged; ?q=realtime loads the same three; a blank ?q= renders as default; the field's accessible name is its visible label (C-SITE-capabilities-3, 5, 12, 16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C2
    statement: "With realtime typed, choosing another tab keeps realtime in the field and the URL and shows only that tab's matching chips; typing never changes the selected tab; with Realtime sync open, a query or tab that removes it closes the card and focus stays in the field or on the tab (C-SITE-capabilities-4, D-SITE-205)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C3
    statement: "Typing kubernetes shows Nothing by that name., Clear the filter and Send a note (href /contact); Clear the filter and the field's × each empty the field, restore the tab's chips, remove q from the URL and focus the field (C-SITE-capabilities-6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C4
    statement: "The page has one status region with aria-live polite; typing realtime one key at a time changes its text once, after the last key, to hold the count 3; a tab change updates it once; kubernetes puts the no-match line in it (C-SITE-capabilities-16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C5
    statement: "With prefers-reduced-motion reduce, every chip, card and tab-panel element computes transition-duration and animation-duration 0s, after a pointer tab change too; without it, a pointer tab change holds window.scrollY and a keyboard tab change animates nothing (C-SITE-capabilities-13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C6
    statement: "With consent granted and real gtag.js loaded, typing sentinel into the filter, then a pointer tab change, a client navigation and the close's call, sends collect requests none of which holds sentinel or q= in its URL, body, dl or dr (C-SITE-capabilities-15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C7
    statement: "At 390 the field's ×, Clear the filter and Send a note each have a box at least 44px tall and wide, with no horizontal scroll; axe reports no serious or critical violation in filtered and filter-empty at 390 and 1440, dark and light (C-SITE-capabilities-17)"
    evidence: test
    command: "yarn test:e2e tests/e2e/capabilities-filter.spec.ts"
  - id: C8
    statement: "Timed by eye and in DevTools' animation panel on /capabilities: a chip opens in 200ms and closes in 160ms, transform only with no height animation, a switch opens the next card under the pointer, a keyboard open is instant, and a pointer tab change cross-fades in 120ms (C-SITE-capabilities-11)"
    evidence: manual
    reason: "Perceived timing and the transform-only check need a person watching the animation; D-SITE-147's numbers are read from the motion board, not a selector"
  - id: C9
    statement: "filtered and filter-empty, opened by ?state=, match captures/capabilities/ at 390 and 1440, dark and light, the field showing × at 32px in filtered (C-SITE-capabilities-18)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-027-capabilities-filter/evidence/states/"
---

# Contract — SITE-27 capabilities-filter

## Build notes

Wave 4, after SITE-26 (the page, its tablist leaf writing `?tab=`) and SITE-3 (`stripQuery`, the page-view seam).

- **Approach:** one client leaf owns the query and the selected tab together, so a tab change re-filters and typing never moves the tab. It reads `q` with `tab` from the page's `searchParams`, filters SITE-26's tab items before they reach `CapabilityChips`, writes both by one `history.replaceState`, and renders the no-match block and the status region. The cross-fade wraps the chip list on a pointer tab change only.
- **Decisions that apply:** D-SITE-148: "the filter sits above the tabs at every width… it searches within the selected tab; switching tabs keeps the query and re-filters." capabilities-build.md, Motion (D-SITE-147 as amended): "keyboard and filter 0ms (A-15, A-14); pointer tab change a 120ms cross-fade; hover never animates." D-SITE-178: "every transition is 0ms, `/capabilities`' fade and tab cross-fade included." D-SITE-179: "`q` is stripped from `page_location` site-wide before any page view; `tab` stays." D-SITE-205: "An open card closes when its chip leaves the list… and focus stays where it was." D-SITE-174: the no-match link is "Send a note" to `/contact`.
- **Interfaces:** `?state=` keys `filtered` (`q=realtime`) and `filter-empty` (`q=kubernetes`, synthetic), added to the page's States list; the filter leaf's props are plain data, never a `content/` import.
- **Per path:** `app/capabilities/page.tsx`: pass `q`; `app/capabilities/_components/`: the filter leaf and no-match block; `components/capabilities/`: only if the open card needs a close-on-remove hook; `tests/e2e/capabilities-filter.spec.ts`.
- **Words:** capabilities-words.md as written: the label, placeholder, × name and both links, `[draft]` kept; the count and no-match announcement render `[Taylor's to write]` beside the real count, so C4 reads the number.
- **Gotchas:** never `router.replace` or `useSearchParams`-driven state (a server re-render per key loses focus). Settle the announcement, never the filter: the list changes per key at 0ms (Assay round 3's red was a fade per keystroke). `history.length` is the no-push proof. C6 runs on the `NEXT_PUBLIC_GA_ID=G-TEST000000` build with SITE-3's interception helper, never a real hit. Capture: `yarn capture --route /capabilities --keys filtered,filter-empty --out <C9's path>`.
- **After this lands:** SITE-3's deferred `?q=sentinel` check on a preview becomes recordable; its note names this ticket.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a filter that fades per key, a push per keystroke and a tab change that clears the query.
