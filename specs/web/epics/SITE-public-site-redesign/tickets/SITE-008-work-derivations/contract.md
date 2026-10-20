---
id: SITE-8
size: small
objective: "one pure module turns the studies and rows into what /work and home's Selected work show: the tabs that have rows, a tab's type chips, its rows grouped by type newest first, safe parsing of ?tab= and ?type=, and the /work link that carries them"
slice_type: "pure derivation logic shared by two pages; risks a chip with no rows, an empty tab left showing, a wrong group order, and an unknown query value that errors instead of falling back"
non_negotiables:
  - "Pure functions over injected data: studies, rows and isPublished are arguments with the real content as defaults, so every rule is unit-tested without editing content"
  - "An unknown, empty or repeated ?tab= falls back to product; an unknown ?type=, featured, or a type the tab does not carry falls back to all (D-SITE-101)"
  - "Chips are all plus only the types the tab's published entries carry, shown only when there are two or more types (D-SITE-54); a tab with no published entries is absent (work-index.md, Empty)"
  - "Groups follow D-SITE-100's order (full-time, contract, business, passion, client, own-brand); entries within a group sort newest first by sortDate (D-SITE-188)"
  - "Every href comes from siteRoutes; the default tab and all are left out of the URL"
devs_call: "The entry type's name and shape, function names beyond the interfaces listed, and test file names"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/work-index.md"
  - "D-SITE-54"
  - "D-SITE-100"
  - "D-SITE-101"
  - "D-SITE-188"
  - "D-SITE-189"
truth_files: "none: no living UX file exists yet; pure logic changes nothing a visitor sees until a page renders it"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "lib/work/rows.ts"
  - "tests/**"
depends_on: [ SITE-2, SITE-7 ]
out_of_scope:
  - "Rendering tabs, chips, groups and rows, and their URL behaviour in the browser (C-SITE-work-index-2, 3, 4 on the page): the /work ticket"
  - "Home's Featured chip and its curated three stories per tab: the home selected-work ticket, which uses chipsForTab and puts Featured first"
  - "List-role casing: the /work ticket, at render (D-SITE-189)"
criteria:
  - id: C1
    statement: "parseTab returns product for undefined, empty, an unknown value and an array, and websites or branding for those values; parseType returns all for undefined, an unknown value, featured and a type the tab does not carry, and the type otherwise (C-SITE-work-index-4)"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "On the real content, chipsForTab(product) is all, full-time, contract, business, passion chipsForTab(branding) is all, business, passion, own-brand, and chipsForTab(websites), one type, is empty"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "On the real content, the product tab's groups are full-time (Everbook, Roomvy, Calculate by QxMD), contract (the family office), business (Agora), passion (Conscious Connections), in that order; on injected entries out of order, groups follow D-SITE-100's order and each sorts newest first"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "With an injected isPublished that rejects a study, its entry is gone, a chip left with no entries is gone, and a tab left with none is absent from visibleTabs; with the real content, every tab is visible and websites holds Kryshan Randel alone (C-SITE-work-index-9)"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "workHref(product, all) and workHref(product, featured) are /work; workHref(websites, all) is /work?tab=websites; workHref(product, full-time) is /work?type=full-time; workHref(branding, business) is /work?tab=branding&type=business"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "formatPeriod turns an em dash or hyphen between two years, or between a year and present, into a spaced en dash and leaves a single year as it is"
    evidence: test
    command: "yarn test"
---

# Contract — SITE-8 work-derivations

## Build notes

Wave 2, after SITE-7 (the fields and `workRows`) and SITE-2 (`siteRoutes`). Home's selected-work ticket and `/work` both import this module.

- **Approach:** `lib/work/rows.ts` (placement.md: "rows for a tab, chips for a tab, `parseTab`, `parseType`, grouping, newest first", two sections, pure). A study and a row become one entry shape so both pages render one list: id, title, tagline, role (the study's `listRole`, the row's `role`), period, type, sortDate, `caseStudySlug` (a study's own slug), `liveUrl`, gallery, beats.
- **Decisions that apply:** D-SITE-100: "Type chips: All, then only the types that tab carries, shown only when it carries two or more (D-SITE-54)"; "Under All: a label column groups rows by type (Full-time, Contract, Business, Passion projects, Client, Own brand)"; "Within a group, newest first, as drawn (D-SITE-188)." D-SITE-101: "The tab and type live in the URL (`/work?tab=websites`, `?type=contract`)… "See all work" carries home's tab and chip, with Featured mapping to All. An unknown value falls back to All." work-index.md, Empty: "a tab whose rows are all unpublished (`WORK_PUBLISHED`) is hidden, and chips come from the rows, so no chip shows nothing." D-SITE-189: "en dash applied at render."
- **Interfaces:** `type Tab = "product" | "websites" | "branding"`; `type TypeFilter = WorkType | "all"`; `parseTab(value: string | string[] | undefined): Tab`; `parseType(value, tab, entries?): TypeFilter`; `entriesForTab(tab, data?)`; `visibleTabs(data?): Tab[]`; `chipsForTab(entries): TypeFilter[]`; `groupByType(entries): { type: WorkType; entries }[]`; `filterByType(entries, type)`; `workHref(tab, type: TypeFilter | "featured"): string`; `formatPeriod(period): string`. `data` is `{ studies, rows, isPublished }`, defaulting to `content/work`'s list, `workRows` and `isWorkPublished` for studies and the row's own `published` for rows.
- **The tab values:** `product` is the default and never written; home's "See all work" and `/work` use these three values, so they are fixed here, not by either page.
- **Per path:** `lib/work/rows.ts`: the module. `tests/unit/work-rows.test.ts`: C1 to C6, each test named after its criterion.
- **Gotchas:** `searchParams` values arrive as `string | string[] | undefined`; an array falls back. A study is published by `isWorkPublished(slug)` (today `WORK_PUBLISHED` in `lib/config.ts`), a row by its own `published` flag: never route rows through `WORK_PUBLISHED`. The real websites tab holds one published row, Kryshan Randel (D-SITE-238), so it proves the one-type rule on real content. Keep `content/work` copy and images out of anything a client leaf imports: this module is for server components; a client leaf takes plain props.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a chip list that ignores published state or a fallback that throws.
