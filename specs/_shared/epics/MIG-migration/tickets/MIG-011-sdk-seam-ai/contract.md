---
id: MIG-11
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "every Anthropic and OpenAI call goes through one AI module"
slice_type: "AI calls; risks a prompt or key handled in two places"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q2 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "server/services/**"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing any prompt or model choice"
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

# Contract — MIG-11 sdk-seam-ai

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-14; the criteria are written when the ticket starts.

- **Layer:** 3, part 6, AI last. Q2 with Mason.
- **What did not cross:** An AI module: @anthropic-ai/sdk in server/services/come-across.ts, extract.ts, primer.ts and style-search.ts; openai in server/services/voice-transcription.ts.
- **Plan:** Read the toolkit's docs/runbooks/remove/ai.md backwards; one module owns the clients and the keys; add its stack entry.
- **Conflict risk:** medium. Trigger: after the email seam.
- **Estimate:** one day. An estimate.
