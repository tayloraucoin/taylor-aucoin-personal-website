---
id: MIG-12
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "the site's tokens are the practice's preset names, and lint refuses a raw value"
slice_type: "design tokens; risks a colour shift across every surface"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "app/globals.css"
  - "eslint.config.mjs"
  - "eslint-suppressions.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Importing a component kit: house-design.md says no component library"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — MIG-12 token-preset

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 7 (signal V2 = 2).
- **What did not cross:** The token preset and the raw-value lint. The tokens live in app/globals.css's @theme (Tailwind v4, CSS-first, no tailwind.config.js).
- **Plan:** After part 9's tokens.md: map the @theme values onto the preset's semantic names in one commit; install the token lint with suppressions; then replace raw values file cluster by file cluster. The part's kit half meets the house rule 'No component library': Taylor rules at the start whether any kit enters, and ui.md's vocabulary line changes only with that ruling.
- **Conflict risk:** medium (globals.css and the UI files). Trigger: part 9's design layer names the tokens.
- **Estimate:** half a day for the preset and lint; replacements half a day per ten files. Estimates.
