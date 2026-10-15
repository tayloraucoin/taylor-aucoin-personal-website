---
id: MIG-5
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "the repo has a chosen test runner and its first real tests, run by yarn test"
slice_type: "test infrastructure; risks a runner chosen by drift"
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
  - "package.json"
  - "tests/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Coverage thresholds before there is coverage to measure"
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

# Contract — MIG-5 tests-beyond-smoke

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 3 (signal C3 = 2).
- **What did not cross:** Tests. Layer 2 left one smoke test on node:test (tests/smoke.test.ts). Playwright 1.62.1 is a devDependency for the capture scripts, not a test runner here.
- **Plan:** The runner question first, as its own decision: node:test, or Vitest (CRM-18's spec holds a vitest question waiting on Mason and Taylor). Then tests arrive with each feature ticket under the contract loop. Thresholds once measured, rounded down, with an auto-update that only floors. **Operator:** patch coverage needs a hosted service.
- **Conflict risk:** low per ticket; the thresholds commit touches CI. Trigger: the third feature ticket with tests, or Taylor's call.
- **Estimate:** a day for the runner and the first tests; thresholds an hour once measured. Estimates.
