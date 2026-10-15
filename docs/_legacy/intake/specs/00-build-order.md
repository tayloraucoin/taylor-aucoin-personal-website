# INT — Client intake — Build order

**New here? Read [`README.md`](README.md) first** — process, kickoff contract, completion protocol. This file is the ordered, checkable queue, derived from each spec's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in [`PROGRESS.md`](PROGRESS.md). If this file and a spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread (kickoff contract in the README). 4. Close in three places, then tick here.

## Critical path (sequential)

INT-1 → INT-2 → INT-4 → INT-5 → INT-6 → INT-7

INT-3 (deposit gate) runs parallel to INT-4/5/6 once INT-2 is Complete. INT-8 is last and is **not** required for the first client if the first client is chased by hand.

## Build-order checklist

### Phase 0 — Ground

- [x] **INT-1** · Foundation: deps, env, db scaffold, schema migration, storage + RLS setup — **Mason migration review** · L · (—)

### Phase 1 — The seam

- [x] **INT-2** · Engagement service: token seam, state derivation, link-creation CLI · M · (INT-1)

### Phase 2 — Two parallel tracks

- [ ] **INT-3** · Deposit gate: P0, Checkout, webhook — **money path; Forge review** · L · (INT-2) — code complete; needs the Agora key + a browser. See `PROGRESS.md` § INT-3
- [ ] **INT-4** · Intake shell: Quiet Gilt primitives, routing gate, W0, resume · L · (INT-2) — code complete; rendering unverified. See `PROGRESS.md` § INT-4

### Phase 3 — The form

- [ ] **INT-5** · Steps 1–4 + the autosave engine — **answer-loss risk; Forge review** · L · (INT-4) — code complete; browser behaviours unverified. See `PROGRESS.md` § INT-5
- [ ] **INT-6** · Steps 5–9: uploads, voice-note card, access step · L · (INT-5) — code complete; storage path unverified. See `PROGRESS.md` § INT-6

### Phase 4 — The point of it

- [ ] **INT-7** · Done screen, markdown output, completion + output emails — **launch-blocking** · M · (INT-3, INT-6) — code complete; email delivery unverified

### Phase 5 — Fast-follow

- [ ] **INT-8** · Resume-link email, reminders cron, expiry screen · M · (INT-7) — code complete; send path unverified

## Ordering constraints (what alphabetical order hides)

- **INT-2 precedes both INT-3 and INT-4** — the token seam is the only door into everything; building either surface first would force a second, throwaway access path.
- **INT-3 does not gate INT-4/5/6** — form development runs on `deposit_required=false` engagements (D-INT-9) until the gate exists. It does gate INT-7: the output document reports deposit state.
- **The autosave engine lives in INT-5, not INT-4** — the shell can be verified with static steps; autosave belongs with the first real fields so it is built against real inputs, not mocks.
- **INT-7 precedes INT-8** — reminder emails deep-link into a flow whose completion path must already exist, and `email_events` idempotency is exercised by the completion send first.

## What does NOT gate

Nothing in INT gates the portfolio site or the v3 contract-sales sprint. The deferred admin build (`../ADMIN-HANDOFF.md`) gates nothing here. INT-8 does not gate first-client use.

## Full dependency table

| Ticket | Complete-required dependencies |
| ------ | ------------------------------ |
| INT-1  | —                              |
| INT-2  | INT-1                          |
| INT-3  | INT-2                          |
| INT-4  | INT-2                          |
| INT-5  | INT-4                          |
| INT-6  | INT-5                          |
| INT-7  | INT-3, INT-6                   |
| INT-8  | INT-7                          |

## Ticket-authoring batches (record)

All eight authored 2026-08-18 in one session — logged as a deviation (see `DEVIATIONS.md`), mitigated by the shared `TECH-SCOPE.md` data contract and a Forge convention audit over the full set.

## Locked references (do not re-litigate)

- **Decisions:** D-INT-1…10 (`../INTAKE-UX-SPEC.md` §13) · M-INT-1…10 (`TECHNICAL-DECISIONS.md`). Cite by ID; reopening requires new evidence routed to Taylor.
- **Binding law:** the README's non-negotiables + repo `CLAUDE.md` invariants.
- **Launch-blocking set:** INT-1…INT-7 (INT-8 is fast-follow). Within them: webhook idempotency (INT-3), autosave/no-loss (INT-5), no-password law and private storage (INT-6), honest output flags (INT-7).
