---
id: MIG-2
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every push and pull request to main runs yarn verify in CI"
slice_type: "CI configuration; risks a red first run for want of a build-time secret"
non_negotiables:
  - "The workflow runs yarn verify itself, never a copy of its steps, so CI and a local run cannot drift"
  - "Checkout at fetch-depth 0, so check-specs and check-test-weakening find origin/main"
  - "Node 22 and Yarn 4.13.0 through Corepack; install with --immutable"
  - "A missing secret never turns the run red: every tier variable is optional"
  - "Read-only token (permissions: contents: read); no deploy, no push"
devs_call: "Action versions, concurrency, the timeout, step names, and how next-env.d.ts is produced before the typecheck"
cites: []
truth_files: "none: CI configuration changes no behaviour a user of the site or admin sees"
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - ".github/workflows/verify.yml"
  - "tooling/refs-pending.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Deploys: Vercel keeps deploying as it does"
  - "Branch protection settings (Taylor's)"
criteria:
  - id: C1
    statement: "yarn build:agent passes with no tier variables set: a clean checkout with no .env file and no secrets builds, and only warns that SUPABASE_URL did not resolve"
    evidence: check
    command: "yarn build:agent"
  - id: C2
    statement: "yarn typecheck passes in a clean checkout once next typegen has written the gitignored next-env.d.ts, the step the workflow runs before yarn verify"
    evidence: check
    command: "yarn typecheck"
  - id: C3
    statement: "The first run of .github/workflows/verify.yml on a pull request to main is green"
    evidence: manual
    reason: "Only GitHub Actions can run the workflow, and the push and first run are Taylor's hosted steps (rulings 54)"
---

# Contract — MIG-2 ci-verify-workflow

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (layer 2; rulings 52; C2 = 2).
- **What did not cross:** No CI file is tracked. yarn verify runs only locally, and verify:fast at the stop gate.
- **Plan:** After the migration merges: one workflow, yarn verify on push and pull_request to main, with checkout at fetch-depth 0 (check-test-weakening and check-specs compare with origin/main), Node 22, Corepack and yarn install. build:agent reads the tier variables next.config.ts resolves (Supabase and Stripe), so the workflow names them as repository secrets. **Operator:** the secrets, the first run and branch protection are Taylor's.
- **Conflict risk:** low (one new file). Trigger: the migration branch has merged.
- **Estimate:** two hours, plus Taylor's secrets. An estimate.
