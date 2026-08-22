# CRM — Admin CRM for lead calling — Build Order

**New here? Read `README.md` first.** This file is the ordered, checkable build queue, derived from each spec's `## Depends on`; where they disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread. 4. Close in three places, then tick here.

## Critical path (sequential)

CRM-1 → CRM-4 → CRM-12 → CRM-5   *(first usable call block ships with CRM-5)*
CRM-13 + CRM-17 → CRM-14 → CRM-15 → CRM-16   *(the v1.2 call-mode redesign; queue stays usable throughout)*

## Build-order checklist

### Phase 0 — foundations (parallelizable)
- [x] **CRM-1** · Schema & migrations — leads, call_attempts, lead_emails, lead_syncs, engagements.remindersDisabledAt, RLS deny-all, types/validators/constants · M · **Mason migration review** · (no deps)
- [x] **CRM-2** · Admin auth & shell — server-side Supabase Auth, requireAdmin seam, (protected) layout + nav, middleware matcher, adminRoutes, noindex · M · (no deps)
- [x] **CRM-3** · Leadgen `export --crm` — place_id-keyed unified CSV, both threads · S · **lives in the leadgen repo** · (no deps)

### Phase 1 — data in
- [x] **CRM-4** · CSV sync — upload → preview → transactional upsert, sync-owned-columns law, sync log, reject non-CRM files · M · (CRM-1, CRM-2, CRM-3)

### Phase 2 — the heart
- [x] **CRM-12** · Call windows — niche→profile config, pure `getCallWindow` derivation, America/Vancouver law, unmapped-niche handling · S · (CRM-1)
- [x] **CRM-5** · Call queue & focus card — bands, disposition row, cadence engine, callback scheduling, notes, terminal rulings, DNC exclusion, stage derivation, "Ready to call now" toggle + in-window sort, window chips, day strip, seasonal note · L · **launch-blocking: DNC exclusion; failure-state criteria (disposition never lost)** · (CRM-4, CRM-12)
- [x] **CRM-6** · Lead detail & timeline — contact editing (email add, phoneOverride), merged history, full-page view · M · (CRM-5)

### Phase 3 — outbound & linkage
- [x] **CRM-7** · Intro email — dialog, Resend send via emails service, promo checkbox, CASL soft guard, double-send confirm, failure keeps draft · M · **launch-blocking: guard copy + send record** · (CRM-6)
- [x] **CRM-8** · Promo pass-through on public intake start — `?promo=` forwarded into minted engagement entry URL · S · **client-facing: Quiet Gilt + D-INT law bind** · (no deps)
- [x] **CRM-9** · Engagement linkage — create-intake-link prefill, match suggestions, derived client stages, money panel · M · (CRM-6)
- [x] **CRM-10** · Intake admin panel — engagements list/detail, reminder history + kill switch (cron guard), markdown output view · M · (CRM-9)

### Phase 4 — instrumentation
- [x] **CRM-11** · Scoreboard — funnel counts at honest n, aging health numbers, **timing-model check** (reach rate by tier/profile/weekday) · M · (CRM-5, CRM-9, CRM-12)

### Phase 5 — call mode (v1.2 redesign, D-CRM-23…30)
- [x] **CRM-13** · Sheet primitive & sliding lead record — vendored CC Sheet (Radix), focus trap, URL contract, open-sheet key inertness · S · (no deps)
- [x] **CRM-17** · Markup renderer — extracted from the SOP dialog, extended with lists/blockquotes/tables, no markdown dependency · S · (no deps)
- [x] **CRM-14** · Conversation capture data contract — contactName/preferredChannel/linkTexted columns, one-transaction Save, sync-safety verified · S · **Mason migration review** · (no deps)
- [x] **CRM-15** · Call mode — two-column state machine, call-sheet markdown column, log-on-click + Next lead, conversation form + Save, mobile single-column · L · **launch-blocking: never-lost logging + accelerator inertness; Vigil induced-failure list** · (CRM-13, CRM-14, CRM-17)
- [x] **CRM-16** · Post-call actions & review — inline intro draft, texted-link record, intake mint inline, review receipt; retires the interim panel · M · **Vigil: record-precedes-send, show-once, re-send confirm** · (CRM-15)

## Ordering constraints (the why)

- **CRM-1 precedes CRM-4** — the upsert needs the tables and the sync-owned column law encoded in the service.
- **CRM-4 precedes CRM-5** — a queue over an empty table verifies nothing; real rows first.
- **CRM-6 precedes CRM-7** — the dialog launches from surfaces CRM-6 owns and needs contactEmail editing to exist.
- **CRM-9 precedes CRM-10** — the linkage (lead → engagement) is what makes the intake panel reachable from the pipeline; building the panel first invites a second, unlinked navigation model.
- **CRM-8 gates nothing** — it can ship any time; the intro email degrades gracefully (promo checkbox still appends the param; it simply isn't honored until CRM-8 ships).
- **CRM-12 precedes CRM-5** — the queue's Fresh-band sort, the toggle, and the chips all read `getCallWindow`. Building the queue first means writing the sort twice. It is a small ticket deliberately kept out of CRM-5, which is already L; the numbering (12) does not match its queue position (5th) — this file is the queue, not the numbering.
- **CRM-12's timezone criterion is not optional** — Vercel runs UTC; a naive `getHours()` ships every window 7–8 hours off, silently and confidently. Verify against `America/Vancouver` explicitly.
- **CRM-13, CRM-14 and CRM-17 precede CRM-15** — the Sheet's key-inertness guard, the extended Save payload, and the renderer are all consumed by the state machine; building CRM-15 first means shipping call mode against contracts that change under it.
- **CRM-17 exists to keep CRM-15 inside one thread** — same reasoning that pulled CRM-12 out of CRM-5. CRM-15 already restructures 985 measured lines of live interaction code; a markdown parser written inside that run is the part that gets done badly. Do not fold it back in.
- **CRM-15 precedes CRM-16** — CRM-15 deliberately keeps the old next-step panel as a *named interim* (logged in DEVIATIONS at its closure) so no yes dead-ends between tickets; CRM-16 retires it. This seam is intentional — do not "fix" the interim inside CRM-15.
- **The queue must stay workable after every Phase 5 ticket** — the redesign lands mid-territory; a call block must be possible the morning after any single ticket ships.
- **Nothing in this track gates the intake system** — the client-facing flow keeps working throughout.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| CRM-1, CRM-2, CRM-3, CRM-8 | none |
| CRM-12 | CRM-1 |
| CRM-4 | CRM-1, CRM-2, CRM-3 |
| CRM-5 | CRM-4, CRM-12 |
| CRM-6 | CRM-5 |
| CRM-7 | CRM-6 |
| CRM-9 | CRM-6 |
| CRM-10 | CRM-9 |
| CRM-11 | CRM-5, CRM-9, CRM-12 |
| CRM-13, CRM-14, CRM-17 | none |
| CRM-15 | CRM-13, CRM-14, CRM-17 |
| CRM-16 | CRM-15 |

## Ticket-authoring batches (distinct from build phases)

| Batch | Tickets | Why grouped |
|---|---|---|
| B1 | CRM-1, CRM-2, CRM-3 | The foundations share the data contract and the auth seam every later ticket cites |
| B2 | CRM-4, CRM-12, CRM-5 | The sync law, the window model, and the queue that consumes both. CRM-12 is S and authors fast; keeping it in this batch is what stops the queue's sort from being written twice |
| B3 | CRM-6, CRM-7, CRM-8 | The lead-detail surfaces and both email/promo seams |
| B4 | CRM-9, CRM-10, CRM-11 | The engagement bridge and everything that reads it |
| B5 | CRM-13, CRM-14, CRM-15, CRM-16 | The call-mode redesign, authored 2026-08-22 in the scoping thread that carried the UX rulings — four tickets in one pass exceeds the three-ticket authoring ceiling; logged as a process deviation |
| B5b | CRM-17 | Carved out of CRM-15 during the 2026-08-22 capacity assessment, authored in the same thread |


## Build execution runs (Phase 5) — assessed 2026-08-22, Reeve

Distinct from authoring batches above: this is how the *builds* are paced across threads, and which model each run gets.

**Measured inputs.** Verification is cheap on this repo — `npx tsc --noEmit` 2.3s, `npm run build` 17s, and the build needs no env — so a run's ceiling is reasoning and context, not the verify loop. Diff surface measured on the current tree: CRM-13 touches 474 existing lines · CRM-14 646 (plus `server/services/leads.ts`, 1117 lines, read-only — must not be forked) · CRM-15 985 restructured · CRM-16 537 read, ~450 new · CRM-17 131.

| Run | Tickets | Model | Why this pairing |
|---|---|---|---|
| 1 | CRM-13 + CRM-17 | Sonnet 5 | **Complete 2026-08-22.** Both S, both pure presentation, file-disjoint (`lead-drawer`/`call-queue` guard vs `sop-dialog`/`markup`). No schema, no service. Matches Taylor's documented 2-per-pass norm |
| 2 | CRM-14 | Sonnet 5 | **Complete 2026-08-22.** Migration reviewed and approved, not applied (no DB credentials in this environment — DEVIATIONS 2026-08-22). Alone: it applies a migration. One-way doors do not share a pass, and Mason reviews the SQL before it applies |
| 3 | CRM-15 | **Fable 5** | **Complete 2026-08-22** (build-verified; behavioural criteria await a signed-in pass — DEVIATIONS). Alone. The one slice where the top tier is warranted — see its Recommended execution |
| 4 | CRM-16 | Opus 5 | **Complete 2026-08-22** (build-verified; Vigil induction list awaits a signed-in pass — DEVIATIONS). Alone. Three outbound side effects under a record-before-send law |

**Rules for every run:** one ticket at a time inside a pass, three-place closure and a five-line report between tickets, context cleared before the next attach-list. Verify continuously rather than at the end — at 17s a build, there is no reason not to. Runs 1 and 2 are mutually independent and may swap order; 3 and 4 are strictly sequential.

**What does not gate:** nothing in Phase 5 gates the intake system, and the queue must remain workable the morning after any single run.

## Locked references (do not re-litigate)

- **Decisions:** D-CRM-1…30 (`../CRM-UX-SPEC.md` §6; §3.8 is the call-mode state contract) · M-CRM-1…9 (`TECHNICAL-DECISIONS.md`) · inherited M-INT-1…22 and D-INT-1…10 where they touch (CRM-8, CRM-10).
- **Launch-blocking set (conditions of the first real call block):** DNC exclusion (CRM-5) · CASL guard + send record (CRM-7) · sync never-touch law (CRM-4).
- **Phase 5 blocking set (conditions of shipping call mode):** never-lost logging + accelerator inertness (CRM-15) · record-precedes-send + show-once law (CRM-16) · sync-safety of the new columns (CRM-14).
