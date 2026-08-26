# PORT — Portfolio intake track — Build order

**New here? Read [`README.md`](README.md) first** — process, kickoff contract, completion protocol. This file is the ordered, checkable queue, derived from each spec's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in [`PROGRESS.md`](PROGRESS.md). If this file and a spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread (kickoff contract in the README). 4. Close in three places, then tick here.

## Critical path (sequential)

PORT-1 → PORT-2 → PORT-5 → PORT-6 → PORT-8

PORT-3 (pay screen), PORT-4 (precedented steps), and PORT-7 (taste) run parallel once PORT-2 is Complete. PORT-9 is fast-follow and gates nothing.

## Build-order checklist

### Phase 0 — The cartridge

- [x] **PORT-1** · Track foundation: track key, migration, registries, validators, parameterized seams — **Mason migration review** · L · (—) — Complete 2026-08-26. Migration `0010_fast_cloak.sql` authored and scratch-verified; **Taylor runs it against the hosted databases**

### Phase 1 — The doors

- [x] **PORT-2** · Public entry: routes, start form, state router, welcome / resume / done shells · L · (PORT-1) — Complete 2026-08-26 at `/websites/coded/intake` (M-PORT-7). `PayPending` is a placeholder PORT-3 deletes; step bodies are empty until PORT-4/5/7

### Phase 2 — Three parallel tracks

- [x] **PORT-3** · Pay screen: catalogue rows, plan choice, add-ons, promo, fulfillment fix — **money path; Forge review** · L · (PORT-2) — Complete 2026-08-26. Taylor runs `yarn stripe:catalogue --apply` per tier and pastes the ids into `scripts/seed-products.ts`; until then coded rows are unsellable by design
- [x] **PORT-4** · Precedented steps: About you · Who this site is for · Your words · Media · Accounts and access · M · (PORT-2) — Complete 2026-08-26. Steps 3, 4, 5, 8 still render no body (PORT-5/6/7/8)
- [x] **PORT-7** · Taste: example-site content modules, gallery, favourites drag-rank · L · (PORT-2) — Complete 2026-08-26. Real sites and captures are Taylor's to curate; swapping them is content work, not code

### Phase 3 — The heavy steps

- [x] **PORT-5** · Entry machinery: per-entry uploads in RepeatableBlock; Experience and The Work steps — **answer-loss risk** · L · (PORT-2) — Complete 2026-08-26. Bytes-to-storage still needs a real `intake` bucket
- [x] **PORT-6** · "Sort this for me": extraction service, action, prefill, states — **third-party data path** · M · (PORT-5) — Complete 2026-08-26. Needs `ANTHROPIC_API_KEY` set; without it the button fails gently and keeps the paste

### Phase 4 — The point of it

- [x] **PORT-8** · Output document, done screen wiring, email variants — **launch-blocking** · M · (PORT-3, PORT-4, PORT-5, PORT-7) — Complete 2026-08-26. Step 8 shipped here too; all nine steps now render

### Phase 5 — Fast-follow

- [x] **PORT-9** · Post-intake charges: extra pages, care-plan activation, balance — Taylor-initiated only · M · (PORT-3) — Complete 2026-08-26. `yarn charge:extra-pages`; care plan and balance are runbook sections

## Execution batches — one per "next batch" prompt

Two tickets per build thread, in the order listed. This relaxes the guide's one-ticket-per-thread rule and is logged as a deviation; the rule's purpose is preserved by a **hard checkpoint between the two tickets** — three-place closure on the first, a five-line report, and a context clear before the second ticket's attach-list is read. If depth demands it, the builder splits and says so at the checkpoint; a thin ticket is more expensive than a second thread.

| Batch | Tickets | Why grouped |
| --- | --- | --- |
| **1 — Ground** ✔ | PORT-1 | Alone, as it turned out. A migration, a seam extraction across nine consumers, and a byte-for-byte regression proof is a full thread's reasoning load; it was originally batched with PORT-2 and the sizing was corrected against evidence (logged in `DEVIATIONS.md`) |
| **2 — The door** | PORT-2 | Alone. The start form is the highest copy-fidelity screen in the flow — every string diffs against the v2 doc — and it sits on top of a shared-component extraction that must leave the durable tree unchanged |
| **3 — Money** ✔ | PORT-3 | Split from PORT-4 at the checkpoint, as the batch rule permits. PORT-3 ran long: a cross-track promo leak surfaced during verification and the fulfillment generalization needed four settlement paths plus replays exercised against a real database. PORT-4 is ~50 fields of verbatim copy whose failure mode is silent paraphrase; that is the specific work not to start on a tired thread |
| **3b — The plain steps** | PORT-4 | Alone. Five steps, every string diffing against the v2 doc |
| **4 — The catalogue steps** | PORT-5 → PORT-6 | They share the entry model; extraction prefills exactly what PORT-5 stores, and building them apart means one is tested against mocks |
| **5 — Taste and the deliverable** | PORT-7 → PORT-8 | PORT-8's gate closes when PORT-7 lands; the output document is written with every step's answer shape freshly in context |
| **6 — Fast-follow** | PORT-9 | Alone. Money semantics on a founder-operated path; nothing shares its model |

Batch 5 may only start once batches 3 and 4 are Complete (PORT-8 gates on PORT-3, 4, 5, 7). Batches 3 and 4 both gate only on batch 2.

## Ordering constraints (what alphabetical order hides)

- **PORT-1 precedes everything** — the track column, the registry seam, and the entry-key column are the ground every other slice stands on; building a surface first would hardcode track assumptions the cartridge exists to prevent.
- **PORT-3 does not gate PORT-4/5/6/7** — form development runs on `deposit_required=false` engagements (D-INT-9), exactly as INT did. It does gate PORT-8 (the output reports payment state) and PORT-9 (post-intake charges reuse its rows).
- **PORT-5 precedes PORT-6** — extraction prefills the entry blocks; building the extractor before the blocks exist means testing against mocks on the slice whose whole risk is the real prefill path.
- **PORT-7 needs only PORT-2** — the taste step's gallery has no dependency on the entry machinery; parallelize it.
- **PORT-8 last before fast-follow** — the output document is only honest once every step it reports exists.

## What does NOT gate

Nothing in PORT gates the Durable track, the CRM, or the portfolio site itself. PORT-9 does not gate first-client use — Kryshan's extra pages and care plan, if any, can be handled by hand once. The `/websites` chooser and the portfolio marketing page are out of scope entirely (handoff decision 3).

## Full dependency table

| Ticket | Complete-required dependencies |
| ------ | ------------------------------ |
| PORT-1 | —                              |
| PORT-2 | PORT-1                         |
| PORT-3 | PORT-2                         |
| PORT-4 | PORT-2                         |
| PORT-5 | PORT-2                         |
| PORT-6 | PORT-5                         |
| PORT-7 | PORT-2                         |
| PORT-8 | PORT-3, PORT-4, PORT-5, PORT-7 |
| PORT-9 | PORT-3                         |

## Ticket-authoring batches (record)

All nine authored 2026-08-26 in one session — logged as a deviation (see `DEVIATIONS.md`), mitigated the same way INT's was: one shared tech scope, one governing UX scope, and the v2 copy doc as the single copy authority across the set.

## Locked references (do not re-litigate)

- **Decisions:** D-INT-1…12 (`docs/intake/INTAKE-UX-SPEC.md` §13) · D-PORT-1…7 (`../PORTFOLIO-INTAKE-UX-SCOPE.md` §11, pending ratification) · M-INT-1…23 (`docs/intake/specs/TECHNICAL-DECISIONS.md`) · M-PORT-1…5 (`TECHNICAL-DECISIONS.md` here). Cite by ID; reopening requires new evidence routed to Taylor.
- **Binding law:** the README's non-negotiables + repo `CLAUDE.md` invariants + the v2 copy doc's verbatim rule.
- **Launch-blocking set:** PORT-1…PORT-8 (PORT-9 is fast-follow). Within them: the Durable byte-for-byte guarantee (PORT-1/2), fulfillment generalization + confirm-before-charge (PORT-3), blob-never-lost (PORT-5/6), private storage on per-project uploads (PORT-5), honest output flags (PORT-8).
- **Open Taylor items** (build proceeds where marked): Kryshan promo mechanics + $1,600 split · refund sentence · admin panel + care plan sign-offs and billing start · terms coverage · five-pages + coming-soon rows · example-set curation. See `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §10.
