---
id: WEB-22
size: medium
objective: "A showcase client writes a brain dump for every page they plan, up to what they bought, so Taylor designs each page from the client's words, not only Home"
slice_type: "A form step gains a computed list of answer boxes over a stored-shape change; risks a box stored under its label instead of its option value, a typed page's notes drifting to another row, a count that ignores typed pages, and an imported value invisible on screen"
non_negotiables:
  - "No stored key or option value is renamed; Home's box stays homeBrainDump with the shortlist under it, and no saved answer is lost"
  - "A ticked page's box is stored under `<option value>BrainDump`; a typed page's under pagesCustomBrainDump, index-aligned with pagesCustom and changed in the same save"
  - "Boxes stop at INCLUDED_PAGES plus paidExtraPages, typed pages counting; ticking stays uncapped (2026-09-03) and What the extra pages are for still shows past the limit"
  - "Import pre-fills a page box only when a source explicitly plans that page, quoted (homeBrainDump's rule); a typed page is never imported"
  - "No change to deposit, checkout or extras charging code, and no edit to VEN's ux/ or technical/ files"
  - "Every new string is marked [COPY — pending Taylor]; no existing copy is rewritten"
  - "Every state is reachable by ?state= on the harness (canon C-P08)"
devs_call: "Function and file names, fixture data, where the extra-pages box sits relative to the page boxes, the document's heading text, test file names"
cites: []
truth_files:
  - "specs/web/ux/intake/site-pages.md"
qa: Q2
reviewers:
  - vigil
focus:
  - "Stored names: each ticked page's box under its option value, a typed page's under a key that survives a rename or reorder, Home under homeBrainDump (vigil)"
  - "The count: boxes stop at 5 plus pages bought, typed pages count, and the extra-pages box still appears past the limit (vigil)"
operator_review: true
planned_paths:
  - "lib/validators/showcase-intake.ts"
  - "lib/intake/site-page-notes.ts"
  - "lib/intake/showcase-copy.ts"
  - "lib/intake/showcase-primer-fields.ts"
  - "lib/intake/showcase-answer-labels.ts"
  - "server/services/output.ts"
  - "app/websites/coded/intake/_components/steps/step-site.tsx"
  - "app/websites/coded/intake/_components/custom-pages.tsx"
  - "components/intake/site-pages-fixtures.ts"
  - "components/intake/intake-fixtures.tsx"
  - "tests/unit/site-page-notes.test.ts"
  - "tests/e2e/site-page-notes.spec.ts"
  - "specs/web/ux/intake/site-pages.md"
depends_on: []
out_of_scope:
  - "Deposit, checkout and the extras charge for pages; the pay gate"
  - "A cap on the checklist, or a reorder control for typed pages"
  - "Copy: every new string is a placeholder Taylor rewrites"
  - "VEN's ux/ and technical/ files"
criteria:
  - id: C1
    statement: "Every non-home option value across every pack's pages list has a text key `<value>BrainDump` in the site schema; Home's is homeBrainDump; pagesCustomBrainDump is a list of strings; no existing site key is removed"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The boxed pages are the ticked pages in the checklist's order (not the order ticked), Home first, then each named typed page in its row order; a blank typed row gets no box"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boxes stop at INCLUDED_PAGES plus paidExtraPages: with 5 included and none bought, 4 ticked and 3 typed give 5 boxes and the last 2 typed pages none; with 2 bought, all 7 get boxes"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "On the harness, pages-over shows 5 page boxes, 7/5 in the count, and What the extra pages are for; pages-bought shows 7 boxes; every checklist row stays tickable in both"
    evidence: test
    command: "yarn test:e2e tests/e2e/site-page-notes.spec.ts"
  - id: C5
    statement: "On the harness's pages-typed, a typed page renamed keeps its brain dump, and removing an earlier typed row leaves every later row's brain dump under its own page's box"
    evidence: test
    command: "yarn test:e2e tests/e2e/site-page-notes.spec.ts"
  - id: C6
    statement: "Venture's pages list and the venture-place overlay each list about, labelled About, right after home; every other pack's page values are unchanged"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The ingestion inventory holds each `<value>BrainDump` as critical, described as filled only when the source explicitly plans that page, and only for kinds whose packs list the page; pagesCustomBrainDump is never in it"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The intake document prints every page brain dump under its page's name in sitemap order, Home first, in one block; a brain dump for a page no longer in the sitemap prints in its own block after it; no page key prints as a loose line or in Not answered"
    evidence: test
    command: "yarn test"
  - id: C9
    statement: "pages-home-only, pages-some, pages-typed, pages-over and pages-bought render on /test-harness/intake at 390 and 1440 with the boxes C2 and C3 name"
    evidence: capture
    path: "specs/web/one-offs/WEB-022-site-page-notes/evidence/states/"
  - id: C10
    statement: Taylor has looked this ticket over and approved it.
    evidence: manual
    reason: "operator_review: true; the builder defers it with what to look at"
---

# Contract — WEB-22 site-page-notes

## Build notes

Each page a client plans on step 8 gets its own long-answer box, so Taylor designs every page from the client's words. Ruled by Taylor on 2026-10-20 (the build) and at gate 1 the same day (stored names, dropped notes).

- **Approach:** one pure function, `boxedPages`, turns the ticked list, the typed rows, the pack's checklist and the allowance into the ordered pages that get a box. The step and the document both read it, so the screen and the document cannot disagree. Home's box keeps its place and its shortlist; the other boxes follow the shortlist, then the extra-pages box.
- **Decisions that apply:**
  - Stored shape (gate 1): one text key per checklist page, `<value>BrainDump`, mirroring homeBrainDump, so each joins the import, labels and document with no new import code. A typed page's under `pagesCustomBrainDump: string[]`, by position, changed in the same `setValue` pass as `pagesCustom`.
  - Dropped notes (gate 1): stored forever; printed after the sitemap block in their own block, which also catches an imported note for a page never ticked.
  - Uncapped checklist (Taylor, 2026-09-03): the note under the group is the honest control.
  - Import rule (Taylor, 2026-09-05, `DESCRIPTIONS.homeBrainDump`): only an explicit plan for that page, quoted.
- **Interfaces:** `PAGE_BRAIN_DUMP_VALUES`, `pageBrainDumpKey(value)` and `boxedPages(...)` in `lib/intake/site-page-notes.ts`; schema keys `<value>BrainDump` and `pagesCustomBrainDump`; harness keys `pages-home-only`, `pages-some`, `pages-typed`, `pages-over`, `pages-bought`.
- **Per path:**
  - `site-page-notes.ts`: the value list, the key function, `boxedPages`.
  - `showcase-intake.ts`: the keys, spread into `stepSiteSchema`.
  - `showcase-copy.ts`: About after Home in venture's list.
  - `showcase-primer-fields.ts`: a description per page key, and a kind gate.
  - `showcase-answer-labels.ts`: a label per key.
  - `output.ts`: the page block and the dropped block; page keys out of the loose lines and Not answered.
  - `step-site.tsx`: the boxes. `custom-pages.tsx`: the rename and remove that carry the notes.
  - The fixtures and the harness wiring; the tests; the UX truth.
- **Gotchas:**
  - The pack label is not the key: venture-place shows "The model" for `offering`.
  - `pages` is stored in tick order; sitemap order is the pack's.
  - A ticked value missing from the current pack, say after a sub-type change, still counts. It sorts after the pack's pages.
  - `saveStepAnswers` replaces the step's object wholesale.
- **Model:** Opus, medium. A weaker model stores a box under its label or index and forgets that typed pages count.
