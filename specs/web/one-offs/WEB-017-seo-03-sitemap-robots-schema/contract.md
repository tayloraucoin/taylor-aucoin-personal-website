---
id: WEB-17
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "sitemap.ts, robots.ts and Person and CreativeWork structured data exist"
slice_type: "[FILL: what kind of work this is, and the class of failure it risks]"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites: []
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "[FILL: repo paths or globs this ticket will change]"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "[FILL: what this ticket will not do]"
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

# Contract — WEB-17 seo-03-sitemap-robots-schema

## Build notes

Source: docs/_legacy/TICKETS.md:94

Drafted from the host's tracker by the migration (rulings.md 45, record 0001) on 2026-10-14. The host item is the brief; the criteria are written when the ticket starts. cites stays empty until the promotion (MIG-1) writes specs/web/ux/.

- **Trigger:** None.
