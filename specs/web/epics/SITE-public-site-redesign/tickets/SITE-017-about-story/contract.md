---
id: SITE-17
size: small
objective: "a hirer deciding on the person reads who Taylor is, how he thinks, where he has worked, what he teaches and where he studied, and reaches any case study from its Experience row"
slice_type: "the upper half of a static reading page over typed content plus one new about-only field; risks a section out of order, a row link with no unique name, a role read from the wrong field, and a date that wraps into its role at 390"
non_negotiables:
  - "Sections in about.md's order: Intro (the page's one eyebrow, h1 About, location line, story, headshot), How I think, Experience, Teaching #teaching, Education (D-SITE-67, 74)"
  - "Experience reads content/about.ts experience, never content/work role (D-SITE-197); grouped Full-time, Contract and fractional, My own products, Programmes (D-SITE-70); Also built is one line with no links (D-SITE-68)"
  - "Every string from about-words.md or its existing source as written; brackets and [draft] lines render as written, for Taylor to fill (D-SITE-67)"
  - "The family office stays unnamed; no Mentorship row in How I think; nothing on DJ, music or festivals (C-SITE-about-15)"
  - "RootField, SectionLabel and today's mono labels leave /about here"
devs_call: "Component names under app/about/_components/, the experience entry's exact field names, and test file names"
waiver: "One surface, /about, split for the token cap: about.md holds the order and states, about-build.md layout, access and criteria, about-words.md the strings"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about-words.md"
  - "D-SITE-67"
  - "D-SITE-70"
  - "D-SITE-172"
  - "D-SITE-197"
  - "C-SITE-about-1"
  - "C-SITE-about-10"
  - "C-SITE-about-12"
  - "C-SITE-about-15"
  - "C-SITE-about-16"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/about/page.tsx"
  - "app/about/_components/**"
  - "content/about.ts"
  - "public/**"
  - "tests/**"
depends_on: [ SITE-5, SITE-7 ]
out_of_scope:
  - "Tools, Testimonials, Off the clock, the close, the anchors' landing, the pending state, the event and the full-page captures (C-SITE-about-2, 4, 6 to 9, 11, 13, 14, 17): SITE-18"
  - "The header's current item (C-SITE-about-3): proven by SITE-4; the /stack and /testimonials redirects (C-SITE-about-5): proven by SITE-2; cite, never re-prove"
  - "Taylor's confirmations and rewrites (cohort counts, schools, years, roles, Artist Hivemind Hub): content edits by Taylor"
criteria:
  - id: C1
    statement: "/about has one h1, About, after the only eyebrow, The person behind the work; then h2s How I think, Experience, Teaching and Education in that order, with no heading level skipped; How I think holds three rows and none is Mentorship (C-SITE-about-1, 15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-story.spec.ts"
  - id: C2
    statement: "Experience shows h3s Full-time, Contract and fractional, My own products and Programmes; the six rows with a published study each link Read the decision story to /work/<slug>, its accessible name ending in the row's name; Also built holds no link; BCIT ISSP's Teaching links to #teaching, which the Teaching section carries (C-SITE-about-10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-story.spec.ts"
  - id: C3
    statement: "Every content/about.ts experience entry has a group among the four, a name, a role and years with an en dash for a range; every slug names a study in content/work; the only anchor is teaching (D-SITE-197)"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The text of /about's main contains no DJ, music or festival words and no family office client name, and no import of RootField or SectionLabel remains in app/about (C-SITE-about-15)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-story.spec.ts"
  - id: C5
    statement: "At 390 the page has no horizontal scroll, every Experience and Education date sits on its own line below its role, and every Read the decision story and Teaching link is at least 44px tall (C-SITE-about-12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/about-story.spec.ts"
  - id: C6
    statement: "The carbon-graded headshot is on file before the build starts, one file for home and /about, and the intro uses it with alt Taylor Aucoin (C-SITE-about-16, D-SITE-172)"
    evidence: manual
    reason: "Taylor supplies the graded photo; the builder confirms the file and records it"
  - id: C7
    statement: "From the intro through Education, /about at 390 and 1440, dark and light, matches the same region of captures/about/default-*"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-017-about-story/evidence/states/"
---

# Contract — SITE-17 about-story

## Build notes

Wave 3, after SITE-5 (`#main`, the footer in the layout) and SITE-7 (content types). SITE-18 finishes the page.

- **Pre-build:** the graded headshot (D-SITE-172), C6. Without it, stop at the start and ask Taylor.
- **Approach:** rewrite `app/about/page.tsx` from `_components/`: `AboutIntro`, `HowIThink`, `Experience` (with `AlsoBuilt`), `Teaching`, `Education`, each a server component over plain content. Today's lower sections stay in place, unchanged, until SITE-18 replaces them. Add `experience` to `content/about.ts` as data-contract.md writes it; the four groups are h3s.
- **Decisions that apply:** D-SITE-67: "How I think's Mentorship row merges into Teaching." D-SITE-70, 68 as non-negotiables. D-SITE-75: "Teaching's ledger loses its top rule under the heading… at 390 every Experience and Education date sits on its own meta line." D-SITE-197: "an about-only field, with en-dash dates."
- **Words:** about-words.md rows Meta title to Education; the hidden name is ", {row name}". Today's meta description stays (its "fourteen" is Taylor's flag, never ours).
- **Interfaces:** the five sections; `experience: { group; name; role; years; slug?; anchor? }[]` in `content/about.ts`; Teaching's section carries `id="teaching"`, scroll-margin and `tabindex="-1"` on its h2, so SITE-18's landing work reuses the pattern.
- **Per path:** the page, its sections, `content/about.ts`, the headshot under `public/`, `tests/e2e/about-story.spec.ts`, `tests/unit/about-content.test.ts`.
- **Gotchas:** Experience's links resolve through `siteRoutes.caseStudy`, and only for published slugs (`isWorkPublished`). The headshot is one file shared with home: if SITE-9 has landed it, reuse its path. Map the kit's token names through `.claude/rules/house-design.md`. Capture: `yarn capture --route /about --keys default --out <evidence dir>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks role lines read from `content/work`.
