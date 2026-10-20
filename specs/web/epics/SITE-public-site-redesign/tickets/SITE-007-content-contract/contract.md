---
id: SITE-7
size: small
objective: "the six case studies and the website and branding rows carry every field the redesigned pages read (type, list role, sort date, facts, What I built format, home's story beats, where AI sat), typed in content/, so home, /work and the case study build in parallel on one shape"
slice_type: "typed content and its guards, no UI; risks copy improved on the way in, a row pointing at a study that does not exist, and a placeholder that reaches production"
non_negotiables:
  - "Content stays typed TS in content/ (house rule); CaseStudy's existing fields and their strings are untouched, so case-study pages keep today's text (D-SITE-189)"
  - "Every value is copied, never improved: from the study's own file, the Paper canvas or the words files; a value Taylor has not written keeps the bracketed or [draft] text its words file shows (D-SITE-185)"
  - "type: Everbook, Roomvy and Calculate full-time; the family office contract; Agora business; Conscious Connections passion (D-SITE-188)"
  - "builtFormat: Everbook and Agora gallery; Conscious Connections band; Roomvy and Calculate rows-after (Calculate with no screens); the family office rows-paired, its diagram on the Unified data layer card (D-SITE-91, 193, 232)"
  - "aiSat on Conscious Connections only; the other five have none and render no-ai (D-SITE-233)"
  - "content/work/rows.ts holds the three branding rows (Agora and Conscious Connections with their caseStudySlug, the Taylor Aucoin kit without) and the three website rows: Kryshan Randel published, the one website; Holistica, Phoenix's site, an unpublished placeholder; Clean Coast unpublished (D-SITE-238)"
  - "The family office stays unnamed in every new field, as its title does today"
devs_call: "How the new types are laid out inside types.ts, the order of fields in each study, and test file names"
waiver: "The content contract is shared data, no UI: case-study.md proposes the facts and What I built fields, work-index.md settles the rows file, the type field and the list role, decisions-14.md the Tickets gate's rulings on AI and the website rows; technical/data-contract.md fixes the shape"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/work-index.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-91"
  - "D-SITE-175"
  - "D-SITE-188"
  - "D-SITE-189"
  - "D-SITE-193"
  - "D-SITE-194"
  - "D-SITE-238"
  - "D-SITE-232"
  - "D-SITE-233"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); content changes nothing a visitor sees until a page ticket reads it"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "content/work/types.ts"
  - "content/work/index.ts"
  - "content/work/rows.ts"
  - "content/work/agora.ts"
  - "content/work/calculate-qxmd.ts"
  - "content/work/conscious-connections.ts"
  - "content/work/everbook.ts"
  - "content/work/future-of-cities.ts"
  - "content/work/roomvy.ts"
  - "tests/**"
depends_on: [ SITE-1 ]
out_of_scope:
  - "Deriving tabs, chips, groups and URLs from this data: the work-derivations ticket (lib/work/rows.ts)"
  - "Rendering any field: home, /work and the case-study tickets"
  - "/about's experience field (D-SITE-197): the /about ticket; capabilities' shortName, tabs and proof hrefs: the /capabilities ticket (D-SITE-234)"
  - "Phoenix's example row and retiring content/websites-coded-case.ts: the /websites ticket (wave 4, D-SITE-114, 211)"
  - "New media: the family office's further artifacts and Calculate's captures join when Taylor has them (D-SITE-232); kit boards not on disk ship as an empty gallery"
criteria:
  - id: C1
    statement: "Every study in content/work has type, listRole, sortDate matching YYYY-MM, builtFormat, and exactly four facts each with a value and a meta line, only the fourth may have an href, and only with a live URL; the types are as the non-negotiables list"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "builtFormat is gallery for Everbook and Agora, band for Conscious Connections, rows-after for Roomvy and Calculate, rows-paired for the family office, where exactly one built card (Unified data layer) carries a screen and no other study's card does"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "aiSat is set on Conscious Connections only; its product list holds its atAGlance AI system value and its build list its Method value, character for character"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Conscious Connections' facts are Solo build [draft] / founder · engineer · designer; 2026 to present / first commit May 2026; Beta / marketing site live · toolkit ahead of launch; consciousconnections.app / live site, the last linking its live URL"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "rows.ts holds six rows: Agora (business), Conscious Connections (passion) and Taylor Aucoin (own-brand) under branding, published, the first two naming a caseStudySlug that resolves to a study in content/work and the third none; Kryshan Randel (published), Holistica and Clean Coast Detailing (each published false) under websites, type client"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Within each type, sorting the studies by sortDate newest first gives work-index.md's order: Everbook, Roomvy, Calculate by QxMD under full-time"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The repo typechecks with the new required fields on every study"
    evidence: check
    command: "yarn typecheck"
---

# Contract — SITE-7 content-contract

## Build notes

Wave 2, after SITE-1 (its unit loader). Home, `/work` and the case study depend on it.

- **Approach:** extend `content/work/types.ts` with the shared vocabulary and the new `CaseStudy` fields from `technical/data-contract.md`, add `beats` (below), fill the six studies, and write `content/work/rows.ts`. Export the row list and the new types from `content/work/index.ts`. No component changes.
- **The shape (data-contract.md, exactly):** `WorkType = "full-time" | "contract" | "business" | "passion" | "client" | "own-brand"`; `Discipline = "product" | "websites" | "branding"`. `CaseStudy` gains `type` (the first four), `listRole: string`, `sortDate: "YYYY-MM"`, `facts: [Fact, Fact, Fact, Fact]` with `Fact = { value; meta; href? }` (href on the fourth only), `builtFormat: "band" | "gallery" | "rows-after" | "rows-paired"`, `BuiltCard.screen?: MediaItem` (rows-paired only), `aiSat?: { product: string[]; build: string[]; checked: string[] }`. `WorkRow` as data-contract.md writes it, `example` included (wave 4 fills it). The testimonial is found by its project link in `content/testimonials.ts`; never add a second pointer.
- **Beats (Mason, judgment; a gap in data-contract.md):** home's stories show Problem · Decided · Happened, and no field holds them. Add `beats?: { problem: string; decided: string; happened: string }` to `CaseStudy` and `WorkRow`, filled with the strings on the Paper Home page (states default, selected-work-filtered, -websites, -branding). A story the canvas does not draw gets none.
- **Decisions that apply:** D-SITE-188: "case studies gain a type field (Full-time, Contract, Business, Passion projects), Roomvy and Calculate being Full-time. Rows sit newest first within a group, as drawn." D-SITE-189: "a short list-role field per study, title casing and en dash applied at render; case-study pages keep today's strings." D-SITE-91: "Roomvy: rows, screens after. Calculate: rows, no screens. The family office: rows, its diagram paired with Unified data layer." D-SITE-193: Conscious Connections keeps the band. D-SITE-194: "A per-study `facts` content field holds the facts ledger's four cells (fact over a meta line, the last a link)." D-SITE-175: "Agora and Conscious Connections link their existing studies; the Taylor Aucoin kit drops the link until that story exists." D-SITE-238: "The Websites tab, on home and `/work`, shows Kryshan Randel as the one website; Holistica (Phoenix's site) is a placeholder row, unpublished until it ships; Clean Coast stays hidden." D-SITE-233: "Where AI sat ships on Conscious Connections only."
- **Values:** listRole and period from work-index-words.md's Product engineering table (Everbook "Founding engineer", Roomvy "Senior frontend engineer", the family office "Fractional CTO", the rest their existing `role`). Facts: Conscious Connections from case-study-words.md's Facts ledger row; the other five as drawn on their Paper case-study pages (read through the Paper tools' text, never a screenshot). sortDate from the period's end ("present" newest; month `01` where no file names one), checked against C6. aiSat's `checked` list for Conscious Connections: one item, `[draft] Taylor's list` (case-study-words.md: Taylor's to write). Rows from work-index-words.md: titles, taglines and meta as written there, brackets kept; Clean Coast's images and URL from `content/websites-clean-coast.ts`; galleries from files on disk only.
- **Interfaces:** the types above; `workRows: WorkRow[]` from `content/work/rows.ts`, re-exported by `content/work/index.ts`.
- **Per path:** `content/work/types.ts`: the types. The six study files: the new fields only. `content/work/rows.ts`: six rows. `content/work/index.ts`: exports. `tests/unit/content-contract.test.ts`: C1 to C6.
- **Gotchas:** one `published` flag serves home and `/work` (D-SITE-238), so the Websites tab shows one row on both, with no chips. Bracketed and `[draft]` values stay; SITE-1's build-output check keeps them out of production (D-SITE-185). Kryshan Randel, Holistica and the kit boards have no files on disk: their galleries are empty arrays, and the page tickets render no opener for an empty gallery. A mistyped `caseStudySlug` shows no link rather than failing the build: C5 is the guard. Name tests after their criterion.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks paraphrased copy and facts read off a screenshot.
