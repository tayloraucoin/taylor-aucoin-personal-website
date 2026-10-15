---
id: MIG-6
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "lint refuses an import that crosses the repo's layer graph"
slice_type: "lint configuration; risks freezing today's violations as law"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q2 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "eslint.config.mjs"
  - "eslint-suppressions.json"
  - "package.json"
  - "docs/decisions/records/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Moving files to satisfy the graph"
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

# Contract — MIG-6 boundaries-lint

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 4 (signal V1 = 2).
- **What did not cross:** The layer graph check (the toolkit's packages/config/eslint/boundaries.js).
- **Plan:** For a root app before part 11 the top-level folders are the elements: app, components, content, lib, server, db, scripts, middleware. Write the graph (a Mason one-way door, so a decision record), install the config, run yarn eslint . --suppress-all so today's violations freeze in eslint-suppressions.json, and add the lint to verify. ESLint is 9.39, past the 9.24 suppressions floor.
- **Conflict risk:** medium (the lint config; the suppressions file). Trigger: any time.
- **Estimate:** half a day for the graph, an hour to install. Estimates.
