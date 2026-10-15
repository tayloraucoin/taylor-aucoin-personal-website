---
id: MIG-9
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every Supabase auth and admin-client call goes through one auth module"
slice_type: "authorization; risks an admin route left open"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason, warden] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "middleware.ts"
  - "server/services/admin-auth.ts"
  - "server/services/**"
  - "scripts/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing who may reach /admin"
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

# Contract — MIG-9 sdk-seam-auth

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 6, auth second. Q3 with Mason and Warden.
- **What did not cross:** An auth module. @supabase/ssr in middleware.ts and server/services/admin-auth.ts; @supabase/supabase-js in server/services/example-captures.ts, invoices.ts, submission.ts and four scripts. No reviewer glob reaches them.
- **Plan:** Read the toolkit's docs/runbooks/remove/supabase-auth.md and supabase-database.md backwards; separate the auth calls from the storage and database ones; move each behind its module and add the stack entries. **Operator:** Supabase dashboard settings when a seam changes them.
- **Conflict risk:** high (middleware.ts gates every route). Trigger: after the billing seam.
- **Estimate:** one to two days. An estimate.
