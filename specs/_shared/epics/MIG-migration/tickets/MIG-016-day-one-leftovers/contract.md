---
id: MIG-16
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every host decision is findable by its id in the ledger, and the bash guard can be split per rule"
slice_type: "indexing and harness; risks a ledger line that misquotes its source"
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
  - "docs/decisions/ledger.md"
  - "tooling/hooks/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Editing any file under docs/_legacy/"
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

# Contract — MIG-16 day-one-leftovers

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 12.
- **What did not cross:** Entry-by-entry indexing of the seven host decision logs (docs/_legacy/{admin,crm,finance,intake,pipeline,review,websites}/specs/TECHNICAL-DECISIONS.md; one ledger line per file today), and the per-rule split of the bash guard (ruled operator for the whole hook).
- **Plan:** One ledger line per decision, citing the file and heading, bodies untouched. The guard split is built in the toolkit first and installed here; with one committer it waits until a second person joins.
- **Conflict risk:** low. Trigger: any quiet hour (the indexing); a second committer (the split).
- **Estimate:** half a day each. Estimates.
