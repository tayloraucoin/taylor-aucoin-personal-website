---
id: MIG-3
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "the toolchain sits on the house set: Next 16, TypeScript 5.9.2 exact, Node 22 declared"
slice_type: "framework and toolchain upgrade; risks every route and config the major renames"
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
  - "yarn.lock"
  - "tsconfig.json"
  - "middleware.ts"
  - "next.config.ts"
  - ".claude/rules/next.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Any feature change in the same commits"
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

# Contract — MIG-3 toolchain-majors

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 1 (signal S2 = 1).
- **What did not cross:** next ^15.1.0 (15.5.23 installed) against the practice's Next 16; Node undeclared in package.json; typescript ^5.7.0 against 5.9.2 exact (deps.md). strict is already written true in tsconfig.json, so no TypeScript 6 surprise.
- **Plan:** One major per commit, each after the minimum release age and followed by yarn verify: declare engines.node (>=22.18); pin typescript 5.9.2; then Next 15 to 16 by the framework's upgrade guide in its own commit (middleware.ts becomes proxy.ts, eslint-config-next follows, @next/third-parties with it), and .claude/rules/next.md is rewritten from the toolkit's Next 16 body in that commit.
- **Conflict risk:** high for the framework major (package.json, the lockfile, middleware.ts and every route it renames). Trigger: a quiet window Taylor names; never the week of a release.
- **Estimate:** half a day for the pins; Next 15 to 16 one to two days. Estimates.
