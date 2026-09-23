# REV — Client design review — Build order

**New here? Read [`../README.md`](../README.md) first** — process, kickoff contract, completion protocol. This file is the ordered, checkable queue, derived from each spec's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in [`PROGRESS.md`](PROGRESS.md). If this file and a spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread (kickoff contract in the README). 4. Close in three places, then tick here.

## Critical path (sequential)

REV-1 → REV-2 → REV-3 → REV-4 → (roadmap)

## Build-order checklist

### Phase 1 — The ingest

- [x] **REV-1** · Review ingest: three tables, the key seam, four endpoints, the minting CLI — **Mason migration review** · M · (—) — code complete 2026-09-22; migration `0017` authored, not run. See `PROGRESS.md`

- [x] **REV-2** · Feedback answers: optional versioned `answers` on submissions, printed in the email — **Mason contract review** · S · (REV-1) — code complete 2026-09-22; no migration. Paired with kryshan-film-portfolio KR-6

- [x] **REV-3** · Admin: design reviews (rounds, forms, comments), read-only — **Mason seam review** · S · (REV-1, REV-2) — code complete 2026-09-22; not rendered against a database

- [x] **REV-4** · Sister-repo handshake: one shared key, static `clientApp`, rounds on first contact (supersedes M-REV-1) — **Mason auth review** · S · (REV-1) — code complete 2026-09-22; migrations `0018`–`0019` authored, not run

### Roadmap (not authored)

- Key rotation without a new round, if minting a fresh round ever proves too coarse.

## Ordering constraints

- **REV-1 precedes everything** — the tables and the seam are what any later surface reads through. Nothing may read `review_rounds` by key except `requireReviewRound`.

## What does NOT gate

Nothing in REV gates the intake, CRM, finance, or portfolio work. The client boilerplate's `/review/*` layer can be built against the contract before REV-1 is applied to a hosted database; it only needs a live key to be *verified*.

## Full dependency table

| Ticket | Complete-required dependencies |
| ------ | ------------------------------ |
| REV-1  | —                              |
| REV-2  | REV-1 (code complete)          |
| REV-3  | REV-1, REV-2 (code complete)   |
| REV-4  | REV-1 (code complete)          |
