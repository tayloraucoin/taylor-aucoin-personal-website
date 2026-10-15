---
id: MIG-7
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "lib/env.ts is the only process.env reader in app code, and lint keeps it so"
slice_type: "configuration seam; risks a secret read in a client bundle or a tier read wrong"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q2 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [warden] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "lib/env.ts"
  - "lib/config/env/**"
  - "eslint.config.mjs"
  - "eslint-suppressions.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "next.config.ts's own reads: Next config runs before the app and resolves the tiers"
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

# Contract — MIG-7 env-seam

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 5 (signal V3 = 1).
- **What did not cross:** One reader: 16 files read process.env outside an env.ts (app/banner-export/save/route.ts, app/websites/coded/intake/_actions/start.ts, app/websites/intake/_actions/start.ts and 13 more; assess.md). The host's reader is lib/env.ts, with lib/config/env/resolve-tier-env.ts as its tier picker.
- **Plan:** Adopt lib/env.ts as the seam (the Warden row **/env.ts already matches it). A lint rule against process.env outside it, installed with suppressions so the count only falls; then one ticket per module folder moving its reads behind it.
- **Conflict risk:** medium (16 readers, under the 25 line). Trigger: the rule any time; the moves follow part 6's module order.
- **Estimate:** half a day for the seam and the rule; the moves about a day. Estimates.
