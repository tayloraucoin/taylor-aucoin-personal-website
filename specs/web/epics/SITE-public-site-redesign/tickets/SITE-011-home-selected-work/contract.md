---
id: SITE-11
size: small
objective: "home's Selected work shows three discipline tabs, each tab's type chips with Featured first, and stories told in three beats with their gallery, so a hirer reads the decisions behind each product, opens the full story or sees all work in one click"
slice_type: "an interactive section over SITE-8's derivations; risks tabs off the ARIA pattern, a See all work that drops the filter, an empty gallery frame, and See the work landing nowhere"
non_negotiables:
  - "Tabs: Product engineering (default) · Websites · Branding & UI, the ARIA tabs pattern; type chips are toggle buttons with aria-pressed in a labelled group, Featured first, then SITE-8's chipsForTab without all (D-SITE-51, 54)"
  - "Featured is the curated set per tab: Conscious Connections, Everbook, the family office; Kryshan Randel alone on Websites, with no type filter (D-SITE-238); the Taylor Aucoin kit, Conscious Connections, Agora"
  - "Tabs, chips, groups and every /work href come from lib/work/rows.ts (SITE-8); this ticket never re-derives them and never re-proves SITE-8's logic"
  - "A story shows Problem · Decided · Happened from its beats; Read the decision story renders only when the entry names a published slug (D-SITE-175); a story with no artifact renders text only, no empty frame (D-SITE-181)"
  - "The gallery is StoryGallery in components/work/ (lead, 160x104 thumbs, All n images) opening the existing MediaLightbox, unchanged (D-SITE-39, 182); no carousel"
  - "See the work moves focus to the first story's heading, with no smooth scroll under reduced motion (D-SITE-4, 178)"
  - "Copy comes from home-words.md and the content files as written; [draft] and bracketed lines stay (D-SITE-185)"
devs_call: "Component names, the shape of the Featured lists in content/home.ts, where tabVariants and chipVariants sit in components/ui/, and test file names"
waiver: "One surface, home, split for the token cap: home.md holds the states, home-build.md the layout, access and criteria, home-words.md every string; decisions-14.md holds D-SITE-238, which amends home.md's Websites state"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-4"
  - "D-SITE-51"
  - "D-SITE-54"
  - "D-SITE-101"
  - "D-SITE-175"
  - "D-SITE-181"
  - "D-SITE-182"
  - "D-SITE-238"
  - "C-SITE-home-5"
  - "C-SITE-home-9"
  - "C-SITE-home-10"
  - "C-SITE-home-11"
  - "C-SITE-home-12"
  - "C-SITE-home-15"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q2
reviewers: [ assay ]
focus:
  - "home answers in one minute what was shipped end to end, and the decisions behind it (assay)"
operator_review: false
planned_paths:
  - "app/page.tsx"
  - "app/_components/SelectedWork.tsx"
  - "app/_components/WorkTabs.tsx"
  - "app/_components/StoryRow.tsx"
  - "app/_components/HomeHero.tsx"
  - "components/work/StoryGallery.tsx"
  - "components/ui/Button.tsx"
  - "content/home.ts"
  - "components/sections/SelectedWork.tsx"
  - "tests/**"
depends_on: [ SITE-8, SITE-9 ]
out_of_scope:
  - "/work's own tabs, chips and rows (links with aria-current, D-SITE-190): the /work ticket, which shares only the looks"
  - "The case study's gallery format: SITE-16; whichever builds first creates StoryGallery"
  - "Clean Coast and Holistica on the Websites tab: hidden and unpublished (D-SITE-238); the kit boards and the Kryshan Randel and Holistica images: Taylor's, not on disk, so those galleries ship empty"
criteria:
  - id: C1
    statement: "A tablist holds Product engineering (aria-selected true), Websites and Branding & UI; arrow keys move between tabs and focus stays on the tab; Product engineering shows Conscious Connections, Everbook and the family office in that order; Websites shows Kryshan Randel alone and no type chips; Branding & UI shows the Taylor Aucoin kit, Conscious Connections and Agora (C-SITE-home-9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C2
    statement: "Product engineering's chips are Featured, Full-time, Contract, Business, Passion projects and Branding & UI's are Featured, Business, Passion projects, Own brand, each with aria-pressed; pressing Full-time shows Everbook, Roomvy and Calculate by QxMD, Calculate with no gallery element, keeps focus on the chip and updates a polite live region (C-SITE-home-9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C3
    statement: "See all work links /work on Featured, /work?type=full-time under Full-time, /work?tab=branding&type=business under Branding & UI with Business, and /work?tab=websites on Websites; Websites also links /websites and Branding & UI links /work-with-me (C-SITE-home-10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C4
    statement: "Read the decision story on Everbook opens /work/everbook with scrollY 0; the Taylor Aucoin kit and Kryshan Randel show no story link; every story shows the three beat labels Problem, Decided, Happened (C-SITE-home-11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C5
    statement: "A story's second thumb opens MediaLightbox on that image and All n images opens it on the first; Esc closes it and focus returns to the control that opened it; a story whose gallery is empty renders no thumb, no All n button and no empty frame (C-SITE-home-12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C6
    statement: "Pressing the hero's See the work puts the first story's heading in the viewport with focus on it; with reduced motion the scroll is instant (C-SITE-home-5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C7
    statement: "At 390, / has no horizontal scroll on any tab, every tab, chip, thumb and link in the section is at least 44px tall, and axe reports no serious or critical violation on each tab"
    evidence: test
    command: "yarn test:e2e tests/e2e/home-selected-work.spec.ts"
  - id: C8
    statement: "The Selected work section of default-*, and selected-work-websites, -branding and -filtered by ?state=, match captures/home/ at 390 and 1440, dark and light, except that the Websites tab holds Kryshan Randel's row alone (D-SITE-238) (C-SITE-home-15, selected-work rows)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-011-home-selected-work/evidence/selected-work/"
---

# Contract — SITE-11 home-selected-work

## Build notes

Wave 3, after SITE-8 (`lib/work/rows.ts`) and SITE-9 (the frame, the hero's See the work). Start gate as every home ticket: `home.md`'s `pillar-open` line (D-SITE-184) must be decided first.

- **Approach:** a server `SelectedWork` reads `entriesForTab`, `visibleTabs`, `chipsForTab` and `workHref` and passes plain props to a client `WorkTabs` holding tab and chip state. Featured is a list of entry ids per tab in `content/home.ts`; a type chip shows that type's entries newest first, three at most, the rest behind See all work (D-SITE-51). Swap the old `SelectedWork` in `app/page.tsx` in place and delete it (home is its only consumer). Register `selected-work-websites`, `-branding` and `-filtered` (Full-time on Product engineering) in home's States list. Point the hero's See the work at the first story's heading.
- **Decisions that apply:** D-SITE-51: "Featured (default, the curated three)… A tab shows only the types its stories carry; more than three lead to "See all work" (`/work`, carrying the filter). On the tabs' row at 1440." D-SITE-54: "Selected chip: raised surface, strong border, a mark-coloured check." D-SITE-101: ""See all work" carries home's tab and chip, with Featured mapping to All." D-SITE-238: "The Websites tab, on home and `/work`, shows Kryshan Randel as the one website." D-SITE-7: Dawson's quote stands in for Everbook's live link.
- **Words (home-words.md, Selected work):** tabs, chips, beat labels and tab footers as written: "See all work", "See all full-time work [draft]", "[Draft] How a coded website works", "[Draft] Branding, on Work with me"; "All {n} images", "All {n} boards" on Branding & UI. Stories from SITE-7's `beats` and the content files; quotes found by the testimonial's project link. The live region's count wording is Taylor's to write: announce `[Taylor's to write] {n}`.
- **Interfaces:** `SelectedWork`, `WorkTabs`, `StoryRow`; `StoryGallery({ items, label })` in `components/work/`; `tabVariants`, `chipVariants` beside `buttonVariants` (looks only; `/work` reuses them with its own behaviour).
- **Per path:** `app/page.tsx`: the swap and three keys. `app/_components/SelectedWork.tsx`, `WorkTabs.tsx`, `StoryRow.tsx`. `app/_components/HomeHero.tsx`: See the work's target only. `components/work/StoryGallery.tsx`. `components/ui/Button.tsx`: the two looks. `content/home.ts`: Featured and tab footers. `components/sections/SelectedWork.tsx`: deleted. `tests/e2e/home-selected-work.spec.ts`.
- **Gotchas:** home.md's Websites state still lists three sites; D-SITE-238 rules, and C8 says so. Kryshan Randel and the kit have empty galleries, so neither shows an opener. `content/work` images must not enter a client leaf's import graph: the leaf takes plain props. Tabs use roving `tabIndex`. The family office stays unnamed. Map the kit's token names through `.claude/rules/house-design.md`; stop and ask before inventing one. Captures: `yarn capture --route / --keys selected-work-websites,selected-work-branding,selected-work-filtered --out <evidence dir>`.
- **Review (Q2):** one fresh-context Assay pass over the captures and the section's components, with the focus line; findings in the thread.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks tabs without arrow keys and a lightbox that loses focus.
