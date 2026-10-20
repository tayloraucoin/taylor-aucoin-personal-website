---
id: SITE-10
size: small
objective: "home's pillars open in place inside their ring, and Problems I take on shows eight capability chips that open into a card with the approach and where it was done, so a hirer sees what Taylor owns and the proof behind it without leaving the page"
slice_type: "two disclosure sections and a shared chip; risks a rating leaking into the DOM, two cards open at once, focus lost on Esc, motion that ignores reduced motion, and the chip built twice for home and /capabilities"
non_negotiables:
  - "Pillars are one ringed panel of four rows that open in place (D-SITE-44); pillar 2 shows its second sentence closed and moves the founder line to its open row (D-SITE-53)"
  - "Chips: 8 in Taylor's comfort order, 25 behind Show all 25, the /capabilities link always shown (D-SITE-46, 142); the ratings order the chips and never reach the DOM (D-SITE-65)"
  - "One chip open at a time; the open card sits 24px from the chips (D-SITE-149); its proof names take foreground weight 500 with the gold underline (D-SITE-145); Fragment Mono stays on the tech line (D-SITE-187)"
  - "Chip motion per D-SITE-147, transform-based, never an animated height; under reduced motion every transition is 0ms and the ring stops (D-SITE-178)"
  - "The capability chip and its open card live in components/capabilities/, for home and /capabilities (placement.md); CapabilityGrid stays for /capabilities until its ticket"
  - "Copy comes from home-words.md as written; a line Taylor has not written stays bracketed or [draft] (D-SITE-185)"
devs_call: "Component names, how the comfort order is stored in content/capabilities.ts, the ring's markup within the captures, and test file names"
waiver: "One surface, home, split for the token cap: home.md holds the states, home-build.md the layout, access and criteria, home-words.md every string"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-words.md"
  - "D-SITE-44"
  - "D-SITE-46"
  - "D-SITE-53"
  - "D-SITE-65"
  - "D-SITE-147"
  - "D-SITE-149"
  - "D-SITE-178"
  - "D-SITE-184"
  - "D-SITE-187"
  - "C-SITE-home-6"
  - "C-SITE-home-7"
  - "C-SITE-home-8"
  - "C-SITE-home-22"
  - "C-SITE-home-27"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q2
reviewers: [ assay ]
focus:
  - "home answers in one minute what was shipped end to end, and the decisions behind it (assay)"
operator_review: false
planned_paths:
  - "app/page.tsx"
  - "app/_components/Pillars.tsx"
  - "components/capabilities/CapabilityChips.tsx"
  - "components/capabilities/CapabilityCard.tsx"
  - "content/capabilities.ts"
  - "content/home.ts"
  - "components/sections/Capabilities.tsx"
  - "components/sections/Specialties.tsx"
  - "tests/**"
depends_on: [ SITE-9 ]
out_of_scope:
  - "/capabilities' page, its filter, tabs and proof-href changes, and retiring CapabilityGrid.tsx: the /capabilities ticket (wave 4, D-SITE-234)"
  - "Taylor's real comfort ratings and the pillars' open-row lines: content edits by Taylor; the build ships the synthetic order and bracketed rows"
  - "Selected work, How I work and everything below: their home tickets"
criteria:
  - id: C1
    statement: "The pillars panel holds four rows in order (Systems, end to end; Judgment, not tickets; Conventions that compound; Fast and precise), each a button with aria-expanded and aria-controls; pressing one opens its row in place with aria-expanded true and focus on the button; Esc closes it and focus stays on that button; pillar 2's closed line is A feature starts as a UX problem and has to end as a business outcome. (C-SITE-home-6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-pillars.spec.ts"
  - id: C2
    statement: "Problems I take on shows exactly 8 chips in the comfort order, and no rating number or rating attribute appears in the page's HTML; Show all 25 (aria-expanded false) shows 25 chips, then reads Show fewer with aria-expanded true; the Search every capability link to /capabilities shows in both (C-SITE-home-7, C-SITE-home-8)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-pillars.spec.ts"
  - id: C3
    statement: "Pressing a chip opens its card in place (aria-expanded true) with the tech line, the approach and the Done at line, each proof with an href as a link; pressing a second chip closes the first, so at most one is open; Esc closes the card and focus returns to its chip (C-SITE-home-6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-pillars.spec.ts"
  - id: C4
    statement: "With prefers-reduced-motion reduce, every pillar, chip and card element computes a transition-duration of 0s and the ring's animation is none or paused (C-SITE-home-22)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-pillars.spec.ts"
  - id: C5
    statement: "At 390, / has no horizontal scroll with all 25 chips and a card open, every pillar row, chip, toggle and link is at least 44px tall, and axe reports no serious or critical violation with a pillar and a chip open"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-pillars.spec.ts"
  - id: C6
    statement: "The pillars and Problems I take on sections of default-*, and the capabilities-open and capabilities-all states by ?state=, match captures/home/ at 390 and 1440, dark and light"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-010-home-pillars-and-capabilities/evidence/sections/"
  - id: C7
    statement: "pillar-open by ?state= matches its crop at 390 and 1440, dark and light: pillar 2 open, its founder line in the open row (C-SITE-home-27)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-010-home-pillars-and-capabilities/evidence/pillar-open/"
  - id: C8
    statement: "/capabilities matches its own capture taken at the branch head just before this change, at 390 and 1440, dark and light"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-010-home-pillars-and-capabilities/evidence/capabilities-unchanged/"
---

# Contract — SITE-10 home-pillars-and-capabilities

## Build notes

Wave 3, after SITE-9 (the page frame, which keeps today's Capabilities and Specialties in their slots for this ticket to swap).

- **Start gate:** `home.md` holds `[NEEDS DECISION — BLOCKING]` on `pillar-open` until its crop is drawn in a Design thread and the line is decided (D-SITE-184). C7 needs that crop.
- **Approach:** a server `Pillars` section with a client leaf for the open rows; the capability chips as a client component in `components/capabilities/` taking plain props (never `content/` imports in the leaf). Replace `Capabilities` and `Specialties` in `app/page.tsx` in place and delete both files (home is their only consumer, verified). Register `capabilities-open`, `capabilities-all` and `pillar-open` in home's States list: `readPageState` seeds the component state outside production, real content, no fixture.
- **Decisions that apply:** D-SITE-44: "Pillars are one ringed panel of four rows that open in place." D-SITE-46: "8 shown, "Show all 25" expands in place, a link to `/capabilities`. Ordered by Taylor's comfort, with synthetic ratings until he supplies his." D-SITE-142: "25 of 28 show… hidden are A/B testing, read replicas and the React Native monorepo." D-SITE-147: "the pressed chip becomes the card in place as one transform-based layout transition (never an animated height), 200ms (`--dur-fast`)… Close (toggle, name, Esc) reverses in 160ms, focus back on the chip… Opened by keyboard: instant." D-SITE-178: "every transition is 0ms." D-SITE-149: "The open card sits 24px from the chips above and below it." D-SITE-145: "an open chip's proof names take foreground text at weight 500 with home's gold underline… each name keeps its comma when the line wraps." D-SITE-53: "I've been the founder and the first engineer…" moves to the open row.
- **Words (home-words.md, Proof bar and pillars; Problems I take on):** pillar titles and lines as written, `[draft]` kept; open rows 1, 3, 4 are Taylor's to write: render `[Taylor's to write]`, which SITE-1's build-output check keeps out of production. Heading "Problems I take on", line "Open one for the approach and where it was done. [draft]"; card "Done at {proof names}, usually on contract. [draft]"; controls "Show all 25 · Show fewer · Search every capability [draft]".
- **Content:** `content/capabilities.ts` gains a chip name (the 25 names as drawn on the Paper Home and Capabilities pages, read through the Paper tools' text) and a synthetic comfort value that reproduces the drawn order. This takes capabilities.md's [PROPOSED] short-name line forward from the `/capabilities` ticket, which keeps the `tabs` fill and the proof hrefs. C8 proves `/capabilities` unchanged (capture main first). Pillar copy goes in `content/home.ts`.
- **Interfaces:** `Pillars`; `CapabilityChips({ items, initialOpen?, initialAll? })` and `CapabilityCard` in `components/capabilities/`; the two new `Capability` fields.
- **Per path:** as above; tests in `tests/e2e/home-pillars.spec.ts`.
- **Gotchas:** the ring is the house's masked ring (house-design.md law 1): never a gradient under text. Pressed-chip state uses `aria-expanded`, not `aria-pressed`. Opening a chip by keyboard is instant and keeps scroll. A chip with no proof never shows (D-SITE-15). The family office's proof label stays unnamed. Map the kit's token names through `.claude/rules/house-design.md`; stop and ask before inventing one. Captures: `yarn capture --route / --keys capabilities-open,capabilities-all,pillar-open --out <evidence dir>`.
- **Review (Q2):** one fresh-context Assay pass over the captures and the new components, with the focus line; findings in the thread.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks an animated height, a rating in a data attribute and focus lost on Esc.
