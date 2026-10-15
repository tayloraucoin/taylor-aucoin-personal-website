---
id: MIG-8
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every Stripe call goes through one billing module that the reviewer map covers"
slice_type: "money; risks a double charge or a dropped webhook"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason, warden, chancery] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "server/services/**"
  - "app/api/webhooks/stripe/**"
  - "scripts/setup-stripe-catalogue.ts"
  - "toolkit.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing what any price or invoice says"
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

# Contract — MIG-8 sdk-seam-billing

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 6, billing first (signal V5 = 2). Q3 with Mason, Warden and Chancery.
- **What did not cross:** A billing module. Stripe is imported in server/services/agora-invoicing.ts, deposit.ts, invoices.ts, orders.ts and scripts/setup-stripe-catalogue.ts, which no reviewer glob reaches (the webhooks are reached by **/webhooks/**). The imports rows in toolkit.json keep each change at the right reviewers until it conforms.
- **Plan:** Read the toolkit's docs/runbooks/remove/billing.md backwards: what it would delete is what the module owns. Move the call sites behind it, add its stack entry to toolkit.json, and install check-stack into verify with that first entry. **Operator:** the Stripe dashboard when a seam changes a webhook endpoint.
- **Conflict risk:** high (the call sites). Trigger: Taylor opens it; billing before the other families because it is money.
- **Estimate:** one to two days. An estimate.
