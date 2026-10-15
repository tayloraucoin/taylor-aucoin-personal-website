---
id: MIG-17
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "docs/ and specs/ render in a local docs app"
slice_type: "a new local app; risks nothing in production"
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
  - "apps/docs/**"
  - "package.json"
  - "AGENTS.md"
  - "tooling/refs-pending.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Any hosted project or deploy"
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

# Contract — MIG-17 docs-app

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 13.
- **What did not cross:** The toolkit's apps/docs reader. Day one installed the docs it reads, not the app.
- **Plan:** Port the toolkit's apps/docs as a workspace app, local only, with layer-3.md's rewires: no @pem packages (copy the few sources), the product name as a literal, docs/_legacy/ as one group listed last, specs/ as a second content root, a docs:dev script on port 3001, and every refs-pending line for an apps/docs path removed in the same commit.
- **Conflict risk:** low. Trigger: after part 11 (a workspace app needs apps/ and workspaces).
- **Estimate:** a day. An estimate.
