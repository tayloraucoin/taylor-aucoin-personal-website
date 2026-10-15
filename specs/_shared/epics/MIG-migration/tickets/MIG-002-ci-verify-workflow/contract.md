---
id: MIG-2
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every push and pull request to main runs yarn verify in CI"
slice_type: "CI configuration; risks a red first run for want of a build-time secret"
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
  - ".github/workflows/verify.yml"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Deploys: Vercel keeps deploying as it does"
  - "Branch protection settings (Taylor's)"
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

# Contract — MIG-2 ci-verify-workflow

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (layer 2; rulings 52; C2 = 2).
- **What did not cross:** No CI file is tracked. yarn verify runs only locally, and verify:fast at the stop gate.
- **Plan:** After the migration merges: one workflow, yarn verify on push and pull_request to main, with checkout at fetch-depth 0 (check-test-weakening and check-specs compare with origin/main), Node 22, Corepack and yarn install. build:agent reads the tier variables next.config.ts resolves (Supabase and Stripe), so the workflow names them as repository secrets. **Operator:** the secrets, the first run and branch protection are Taylor's.
- **Conflict risk:** low (one new file). Trigger: the migration branch has merged.
- **Estimate:** two hours, plus Taylor's secrets. An estimate.
