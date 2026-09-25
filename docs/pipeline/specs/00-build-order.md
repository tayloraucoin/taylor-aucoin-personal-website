# PIPE — Engagement pipeline — Build order

**New here? Read [`../README.md`](../README.md) first** — process, kickoff contract, completion protocol. This file is the ordered, checkable queue, derived from each spec's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in [`PROGRESS.md`](PROGRESS.md). If this file and a spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread (kickoff contract in the README). 4. Close in three places, then tick here.

## Gate — CLEARED 2026-09-25

Taylor, 2026-09-25: "Defaults are fine."

- [x] **One pipeline**, not one per track (M-PIPE-1).
- [x] **At most one email per step.**
- [x] **Registrar instructions pasted per send.**
- [x] **Copy-for-approval as an email** — Taylor decides while entering content (PIPE-5); no build impact.

## Critical path (sequential)

PIPE-1 → PIPE-2 → PIPE-3 → PIPE-4 → PIPE-5 (Taylor)

## Build-order checklist

### Phase 1 — The data

- [x] **PIPE-1** · Schema: pipeline steps, completions, sent emails, remembered values — **Mason migration review** · S · (—) — code complete 2026-09-25; migration `0020` authored, not run. See `PROGRESS.md`

### Phase 2 — The playbook

- [x] **PIPE-2** · `/admin/pipeline`: list, create, edit, reorder, archive, delete, copy — **Vesper surface review** · M · (PIPE-1) — code complete 2026-09-25; not rendered

### Phase 3 — On an engagement

- [x] **PIPE-3** · The engagement checklist, filled-in prompts, done and undo — **Mason seam review** · M · (PIPE-2) — code complete 2026-09-25; not rendered
- [x] **PIPE-4** · Compose and send a step's email — **full verification, real inbox** · M · (PIPE-3) — code complete 2026-09-25; staging send outstanding

### Phase 4 — Content (Taylor, not a build ticket)

- [ ] **PIPE-5** · Taylor enters the steps from his Kryshan threads in order, and writes the three email templates against `../EMAIL-BRIEFS.md`. Can begin as soon as PIPE-2 is live; the emails can be tested once PIPE-4 is.

### Roadmap (not authored)

- A `pipelines` parent table when a second track's process diverges (M-PIPE-1).
- A registrar instruction library for the domain handoff.
- A values panel on the engagement to edit `pipeline_values` outside a send.
- Template history.

## Taylor does before the next

| After  | Taylor does                                                                           |
| ------ | ------------------------------------------------------------------------------------- |
| PIPE-1 | Review `0020`; run `yarn db:migrate` then `yarn db:setup` on staging, then production |
| PIPE-2 | Walk the page; ratify or overrule the two `[PROPOSED]` rulings; start PIPE-5          |
| PIPE-4 | The staging send pass in the ticket, to his own inbox                                 |

## Full dependency table

| Ticket | Complete-required dependencies |
| ------ | ------------------------------ |
| PIPE-1 | —                              |
| PIPE-2 | PIPE-1 (and `0020` applied)    |
| PIPE-3 | PIPE-2                         |
| PIPE-4 | PIPE-3                         |
