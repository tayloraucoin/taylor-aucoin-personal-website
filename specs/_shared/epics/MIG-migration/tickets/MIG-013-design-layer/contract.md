---
id: MIG-13
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "the product's design layer exists, written from its own guides, and ui.md points at it"
slice_type: "design law; risks a default the host's law rejects"
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
  - "toolkit.json"
  - ".claude/rules/ui.md"
  - ".claude/rules/house-design.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Editing, moving or deleting the host's guides under docs/_legacy/"
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

# Contract — MIG-13 design-layer

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 9 (signals P4 and V2).
- **What did not cross:** DESIGN.md, tokens.md, components.md, states.md, anti-patterns.md and coverage-gaps.md. The law today is .claude/rules/house-design.md and docs/_legacy/DESIGN-SYSTEM.md, SITE-SPEC.md and TASTE-PROFILE.md.
- **Plan:** The design-layer prompt the run printed: a thread led by Vesper writes the six files from docs/design/templates/ into a folder it proposes and Taylor confirms (never docs/design/), each rule naming its guide and section; the host's rejections become anti-patterns in its own words. toolkit.json's designLayer and ui.md change in the same commit.
- **Conflict risk:** low in code. Trigger: Taylor opens the thread, after or beside the promotion (MIG-1).
- **Estimate:** a day. An estimate.
