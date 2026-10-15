---
id: MIG-15
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "the app lives in apps/web under Yarn workspaces and Turbo"
slice_type: "repo restructure; risks every path in the repo"
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
  - "apps/web/**"
  - "package.json"
  - "turbo.json"
  - "toolkit.json"
  - ".claude/rules/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Moving docs/ or specs/: they stay at the root"
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

# Contract — MIG-15 shape-restructure

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 11 (far path; signal S1 = 2).
- **What did not cross:** Workspaces and Turbo. The app sits at the root; toolkit.json says path ".".
- **Plan:** Its own epic, opened through the prompt builder, last: the app moves to apps/web, workspaces and turbo.json arrive, toolkit.json's path and every rule's globs change, verify gains the Turbo steps. content/ moves with the app, and the call sheet's process.cwd() read changes in the move commit. Every earlier baseline is re-derived in that commit.
- **Conflict risk:** high (every file). Trigger: Taylor's call, after the parts he wants, in a window with no open branches.
- **Estimate:** two to three days. An estimate.
