---
id: MIG-1
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "specs/web/ux/ holds the living truth of the admin, CRM and intake surfaces, promoted from the host's three UX specs against today's code"
slice_type: "spec writing; risks writing the old spec as truth where the code has moved"
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
  - "specs/web/ux/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Editing, moving or deleting any file under docs/_legacy/"
  - "Code changes"
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

# Contract — MIG-1 ux-promotion

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (layer 1; P4 = 1).
- **What did not cross:** The host's UX specs are history under docs/_legacy/: admin/ADMIN-UX-SPEC.md (369 lines), crm/CRM-UX-SPEC.md (177) and intake/INTAKE-UX-SPEC.md (309), with seven deviation logs and seven decision logs beside them. No agent reads them as living truth, and specs/web/ux/ holds only a .gitkeep.
- **Plan:** The living-truth promotion prompt the run printed (layer-3.md): a product-spec thread led by Vesper reads each spec against the code, surface by surface, writes specs/web/ux/ from docs/design/templates/ux-overview.template.md and ux-surface.template.md, names every reachable state, writes the code's behaviour as the truth and lists each disagreement for Taylor. The websites area (docs/_legacy/websites/, the PORT specs and page specs) has no file the instruction files call a UX spec; the thread proposes whether its surfaces join. Each drafted host ticket whose surface gains a file gains it in cites.
- **Conflict risk:** low in code (specs only). Trigger: Taylor opens the promotion thread; the first UI ticket under the practice waits for it.
- **Estimate:** one to three days, by the specs' size. An estimate.
