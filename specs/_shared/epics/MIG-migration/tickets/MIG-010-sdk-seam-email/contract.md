---
id: MIG-10
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every Resend call goes through one email module"
slice_type: "personal data; risks an email to the wrong person"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [warden] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "server/services/emails.ts"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing any email's copy"
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

# Contract — MIG-10 sdk-seam-email

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 6, email third. Q3 with Warden.
- **What did not cross:** server/services/emails.ts imports resend directly; the imports row (warden) covers it until it conforms.
- **Plan:** Make server/services/emails.ts (or its successor) the module the remove recipe would delete; add its stack entry.
- **Conflict risk:** medium (one file, every send). Trigger: after the auth seam.
- **Estimate:** half a day. An estimate.
