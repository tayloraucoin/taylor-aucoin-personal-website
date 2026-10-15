---
id: MIG-4
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "verify refuses a migration that writes DDL against the auth schema"
slice_type: "database tooling; risks a false pass on a migration Supabase owns"
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
  - "tooling/check-migrations.ts"
  - "package.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Moving or renaming any file in db/migrations/"
  - "Running any migration"
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

# Contract — MIG-4 migration-check

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 2. Q3, with Mason and Warden (schema).
- **What did not cross:** The toolkit's migration check. db/migrations/ (Drizzle, 0000 to 0022) stays where it is; drizzle.config.ts's schemaFilter already keeps generation to public.
- **Plan:** Install check-migrations, modelled on the toolkit's packages/db/scripts/check-migrations.ts: it scans migration contents for DDL against auth and never reads names, so Drizzle's file names need no rename. Add it to verify. The local database stays Taylor's own Postgres. **Operator:** any hosted migration; the staging and production runs of 0015 to 0022 are hand-over lines, not this ticket.
- **Conflict risk:** low (one script, one verify step). Trigger: the first ticket that writes a migration under the practice (FIN-3 renumbers its planned 0016).
- **Estimate:** half a day. An estimate.
