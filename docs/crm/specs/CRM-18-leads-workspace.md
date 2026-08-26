# CRM-18 — The leads workspace: filters, the pipeline board, and the leads that go quiet

**Epic:** CRM — leads surface (v1.3) · **Phase 6** · Size: L (Mason slices — see §Technical)
**Slice type:** Lookup and comprehension surface. Failure class: a worked lead with no date going silent and never being found again; a board that implies a write it cannot honestly make.
**Vigil:** Review by *inducing*: filter to an empty set (offer the clear, never dead-end); open the board with 800 leads in `to_call` and 3 everywhere else (the rail holds, the columns stay legible); land on "Gone quiet" from the scoreboard's own defect count and confirm the number matches; drag a card (nothing happens, and nothing suggests it should); load the board at 375px (stacked sections, no horizontal scroll). QA states which paths it exercised: empty-filter · full-table-board · scoreboard-handoff · mobile-board · preset-parity.

**Status:** Scoped (2026-08-24) — not started

---

## Outcome

`/admin/leads` stops being an address book. One surface, two views over one URL-held filter state: **List** (the lookup surface, upgraded with stage, next action, last touch, sort, and paging) and **Board** (the funnel as columns, read-only with respect to stage). A filter rail spans both, with four saved presets as plain links — **Gone quiet**, **Resurfacing soon**, **Wants info, never sent**, **No next action**. Switching view never costs a filter. The scoreboard's `workedWithoutNextAction` count stops being a dead end and starts being a link.

## Why / intent

- **CRM-UX-SPEC §2 specified this and it was not built.** The IA table names `/admin/leads` as "all leads, **filter**/search". Only search shipped ([`app/admin/(protected)/leads/page.tsx`](../../../app/admin/(protected)/leads/page.tsx)). This slice is a shortfall against a signed contract before it is a new feature.
- **The surface cannot read its own funnel.** `searchLeads` returns `closedState` and nothing else about position; `getLeadStage` exists, is correct, and is never called here. Stage on the row is most of what separates a CRM from a contact list.
- **D-CRM-4 names the expensive failure and no surface reaches it.** [`scoreboard/page.tsx`](../../../app/admin/(protected)/scoreboard/page.tsx) prints *"N worked leads with no next action — these are the ones that go quiet and get lost"* in gold, unlinked, while the `overdueCallbacks` line directly below it links to the queue. The system names its own worst leak and offers no way to act on it. **Closing that is the point of this slice.**
- **D-CRM-1 / D-CRM-2 shape the board, not the other way round.** Stage is derived from attempts, emails, and engagement facts — never stored. A drag from "Trying" to "Info sent" would have to fabricate an email that was never sent. The gesture every board trains you to expect is, in this data model, a lie with an animation on it. The board is a mirror of work done, not a place work is pushed through.
- **D-CRM-23 stands.** The queue is the calling surface. The board is a readout. Without that line drawn hard, the board becomes a second call mode and the two drift on the day it matters.
- **Ground truth to reuse, not fork:** `getLeadStage` (the one home for stage) · `StageChip` / `WindowChip` in `chips.tsx` · `LeadDrawer` + `LeadRecord` (already shared by queue and leads, so a record never differs by how it was opened) · `LeadSchedule` and `CALLBACK_CHIPS` for the only date write · the queue's URL-filter and `shown`-paging pattern in `call-queue.tsx`.
- **What this slice is NOT (binding):** no schema change; no drag-to-stage in any form; no bulk actions; no second calling affordance; no charts; no change to the queue, call mode, or the engagement panel.

**Rulings this slice makes (labelled, proposed — Taylor ratifies before build):**

- **`[PROPOSED — D-CRM-31]` One surface, two views, one filter state.** List and Board read the same URL params. The board is a readout and never a calling surface.
- **`[PROPOSED — D-CRM-32]` The board is read-only with respect to stage.** Its only writes are `closedState` and `nextActionAt` — the two facts that are stored rather than derived. Both already have UI. No drag-to-stage, ever, including as a "convenience" on the two stored columns.
- **`[PROPOSED — D-CRM-33]` Staleness is a fact, never a pressure device.** "last touch 23 days ago" is stated and sorted on. It is never colored, badged, escalated, or decayed. D-CRM-22's no-pressure law covers time-until; this extends the identical reasoning to time-since. A lead that went quiet is a warm lead with a gap in it.
- **`[PROPOSED — D-CRM-34]` Presets are plain links, not stored objects.** A preset is a URL. "Gone quiet" is the named destination for the scoreboard's defect count.
- **`[PROPOSED — D-CRM-35]` `to_call` and terminal-closed render as collapsed count rails, not card columns.** `to_call` realistically holds most of the table; a board with one 800-card column and six 3-card columns is a list wearing decoration.

## Experience & states

**Shared filter rail (both views).** Facets, all derivable from existing columns or one join: stage (multi-select chips) · thread (tabs, queue's pattern) · trade · city · next action (Overdue · Today · This week · Later · **None**) · last touch (Never · <7d · 7–30d · 30d+) · has email · has engagement · website bucket · walk-in viable (§3.7 promised this filter; it was never built). Plus the four presets as links. Filter state is the URL; clearing is one control.

**List view (default).** Today's list plus: `StageChip` on every row · next action ("Tue 2pm" / "none") · last touch ("11 days ago" / "never") · a labelled sort control (score · last touch · next action · name) · a real **Show 50 more** replacing the silent `limit = 100`. Density unchanged — this is a scanning surface and the user is calm here (§1: the considered path, not the flooded one).

**Board view.** Columns left to right: **To call** *(rail, count only, "Work these in the queue →")* → **Trying** → **In conversation** → **Info sent** → **Intake sent** → **Client** → **Resting** *(`not_now`, sorted by resurface date — this is the nurture pipeline and it gets its own space)* → **Closed** *(rail, count only, expandable)*. Within every column, sort by last touch, oldest first: what is going quiet rises on its own without anything shouting.

**Card anatomy — four lines, nothing more.** Business name · trade · city · "last touch 11 days ago" · "next: Thu 2pm" or "no next action" (`--color-c2`, matching the queue's overdue treatment exactly, and nothing else). No score, no avatars, no progress bars, no drag handles. Click opens `LeadDrawer` + `LeadRecord` — every write stays in the one place that already owns it.

**States (exhaustive):** default · hover · active · focus-visible · disabled · loading (skeleton rows and skeleton cards, no spinner storm, §4) · **column empty** ("Nobody here yet." / for Client: "No clients off the list yet." — hospitality, not apology) · **filtered to nothing** ("No leads match these filters." + **Clear filters**, never a dead end) · **Gone quiet empty** ("Nothing has gone quiet. Everyone you've worked has a date." — stated flat; no congratulation, no streak, no confetti) · offline (quiet banner; the date write disabled with the reason, per §4) · reduced motion (no card transitions at all).

**Mobile.** The board is stacked collapsible sections, **not** a horizontal scroll — a column you cannot see and do not know exists is a column that loses leads. D-CRM-7's "mobile usable" is satisfied by the list view; the board is a laptop surface and the design says so rather than faking it.

## Non-negotiables (this slice)

- **No drag-to-stage.** Stage is derived (D-CRM-2). A gesture that implies a write the model cannot make is worse than no gesture.
- **The board never dials.** The queue is the calling surface (D-CRM-23). One home.
- **No urgency devices anywhere** — no red, no decay gradients, no badge counts, no exclamation marks, no countdowns. Gold is the only accent, used where the queue already uses it (D-CRM-22, extended by D-CRM-33).
- **`do_not_call` stays findable here and excluded from every queue** — unchanged; this surface exists partly so Taylor can find out *why* a business was marked.
- **No cap without an exit.** Every truncation is surfaced with a way past it (D-CRM-19's reasoning).
- **The drawer is the only write surface.** No inline editing on rows or cards.
- **Copy is plain and in the admin's utilitarian register.** The strings above are drafts; Taylor writes the finals.

## Data & AI

**Schema changes: none.** Everything above is derivable from `leads`, `call_attempts`, `lead_emails`, and `engagements` as they stand. **Indexes are a live question — Mason's, in §Technical.**
**Tables read:** `leads` · `call_attempts` (aggregate) · `lead_emails` (aggregate) · `engagements` (join).
**Writes:** `nextActionAt` / `nextActionNote` and `closedState` only, both through the existing `LeadRecord` path. No new write surface.
**AI notes:** **None.**
**Instrumentation:** none — `/admin` carries no analytics (D-CRM-16).

## Accessibility

Columns are `<section>` with real headings; cards are links, never divs with handlers; targets ≥44px (§5). The board is keyboard-navigable — arrows across columns, j/k within, Enter opens, matching the muscle memory the queue already built. Filter chips are toggle buttons with `aria-pressed` and visible focus. Contrast checked at rendered size, gold on the admin ground first, per §5's own instruction. `prefers-reduced-motion` collapses every transition.

## Acceptance criteria (observable)

1. A filter set in List survives a switch to Board and back, in the URL, with no loss. *(Vigil: preset-parity.)*
2. Every list row and every board card shows a derived stage consistent with `getLeadStage` — the same lead reads identically on the queue, the drawer, and here.
3. Filtering to an empty set renders the named empty state with a working **Clear filters**. No blank screen, no dead end. *(Vigil: empty-filter.)*
4. The scoreboard's "N worked leads with no next action" links to the **No next action** preset, and the count on arrival matches the count on the scoreboard. *(Vigil: scoreboard-handoff.)*
5. **Gone quiet** returns worked, non-terminal leads with no next action or an overdue one and no touch in the threshold window; the threshold is a named constant in `lib/crm/constants.ts`, not a literal in a query.
6. The board renders with the full table loaded: `to_call` and Closed as count rails, six card columns, each sorted oldest-touch-first, first paint acceptable against the budget Mason sets. *(Vigil: full-table-board.)*
7. Dragging a card does nothing, and no affordance suggests otherwise. *(Vigil: full-table-board.)*
8. At 375px the board is stacked collapsible sections with no horizontal scroll. *(Vigil: mobile-board.)*
9. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Open items (Vesper)

- **Column set.** Six card columns proposed. If Taylor reads `intake_sent` and `client` as belonging to `/admin/engagements`, the board drops to four and gets better. Genuine fork — his call, before build.
- **"Gone quiet" threshold.** 14 days is judgment, not measurement. Lives beside `CADENCE` in `lib/crm/constants.ts`. `[PROVISIONAL — Taylor tunes after real call data]`
- **Preset vocabulary.** Four are defensible from the data. Taylor will know if there is a fifth he reaches for.
- **Slicing.** Presented as one surface because that is what it is. Whether it builds as one ticket or two is Mason's call in §Technical.

---

_Vesper — 2026-08-24. §Technical below is Mason's and Forge's._

---

# Technical — Mason (architecture, placement, one-way doors)

Read: the UX section above, `TECH-SCOPE.md` §4/§6/§10, `TECHNICAL-DECISIONS.md` (M-CRM-1…9), the leads and call-attempts schema, and `server/services/leads.ts` end to end.

**Verdict: buildable as specified, no schema change, no new column, no materialized view, no cache.** The design survives contact with the data model because Vesper let the data model shape it rather than fighting it. Two rulings and one refusal below; the rest is placement.

## T1. The load-bearing finding — the board's cost is bounded by work done, not by table size

`getLeadStage` returns `to_call` only when every fact is absent. Reading the ladder in [`leads.ts:392`](../../../server/services/leads.ts): `hadConversation` and `hadTextedLink` are both derived from attempt rows, so they cannot be true when `attemptCount` is zero. The condition collapses to exactly four terms, and its complement is exactly the set of leads that render as a card:

```sql
closed_state    IS NOT NULL
OR engagement_id IS NOT NULL
OR EXISTS (SELECT 1 FROM call_attempts WHERE lead_id = leads.id)
OR EXISTS (SELECT 1 FROM lead_emails   WHERE lead_id = leads.id)
```

Everything else is `to_call`, and **`to_call`'s count is derived by subtraction** — total live minus the cardinality of that set. Never counted independently, so it cannot drift from `getLeadStage`; there is no second definition of "to call" anywhere in the system.

The consequence is the whole answer to Vesper's routed question. The board's expensive set — the leads needing per-row aggregate context — is the **worked** set, which grows with dials Taylor makes, not with leads leadgen imports. A 50,000-row table with 900 worked leads costs the same as a 1,400-row table with 900 worked leads. No read model, no denormalization, no cache invalidation problem, and D-CRM-2 stays untouched.

Both semi-joins are already indexed: `call_attempts_lead_id_idx` and `lead_emails_lead_id_idx`. `engagement_id` carries a unique index. `closed_state` leads `leads_queue_idx`.

**`[RULED — M-CRM-10]` The board's card set is the derived complement of `to_call`, expressed as the four-term predicate above; `to_call` is counted by subtraction and never queried directly.**

## T2. The refusal — the board must not copy `loadQueue`

`loadQueue` does `db.select().from(leads).where(live)` with **no projection and no limit**, pulls every live row into Node, then bands and sorts in JavaScript ([`leads.ts:504`](../../../server/services/leads.ts)). At the 1,406 leads its own docblock cites, that is fine and I am not touching it in this slice. As a *pattern for the board*, it fails the entropy test outright: an agent copying it produces a full-table materialization on every board paint, and the board is the surface most likely to be left open.

**`[RULED]` The workspace queries filter, aggregate, and count in SQL. Column projection is explicit. Card sets are paged. The new file carries a comment saying it deliberately does not follow `loadQueue`'s shape and why — otherwise the next agent averages the two.**

## T3. Placement

`server/services/leads.ts` is ~1,150 lines and holds CSV parsing, the sync upsert, the queue query, stage derivation, lead detail, search, and engagement linkage. It is one file past the point where "the leads service" means anything. Adding the workspace to it makes the misplacement worse and cements it as the pattern.

```
server/services/lead-workspace.ts   # NEW — the /admin/leads surface's reads:
                                    #   filter parsing → query, board card set,
                                    #   column counts, preset predicates.
                                    #   Moves searchLeads + countLeads here (red diff in leads.ts).
server/services/leads.ts            # KEEPS getLeadStage (the one home, imported by
                                    #   queue, workspace, and anything later), sync,
                                    #   loadQueue, loadLeadDetail, engagement linkage.
lib/validators/crm.ts               # gains leadFilterParams (Zod) — see T4
lib/crm/constants.ts                # gains GONE_QUIET_DAYS + the preset registry
app/admin/_components/lead-filters.tsx      # NEW client leaf — the rail
app/admin/_components/lead-list.tsx         # NEW — extracted from the page
app/admin/_components/pipeline-board.tsx    # NEW client leaf — columns, rails, cards
app/admin/(protected)/leads/page.tsx        # thins to: parse → load → render one of two views
```

`getLeadStage` does **not** move. It is the shared law and it already has a home; relocating it to make the new file look self-contained would put one fact in a file named after one surface.

**Doc fix, filed with this slice:** TECH-SCOPE §6's placement map describes `leads.ts` as "sync upsert · queue query · getLeadStage · terminal rulings" — it never listed `searchLeads`, which is how search ended up there unnoticed. The map gets the new file and the corrected description in the same commit. The doc caused the drift; the doc gets fixed at the doc.

## T4. The filter URL is a contract, not a convenience

D-CRM-34 makes presets plain links. That promotes the query-param vocabulary from an implementation detail to a **bookmarkable API** — the scoreboard will link into it, and Taylor will bookmark it. Renaming a param later silently breaks a saved link, which is the failure mode nobody notices until the number is wrong.

**`[RULED]` `leadFilterParams` is a Zod schema in `lib/validators/crm.ts`, parsed once at the page boundary, `unknown` in and a narrow typed object out. Unrecognized params are ignored, never thrown on — a stale bookmark degrades to a wider result set, never to an error page.** Both views and every preset read the same parsed object.

This also kills a live duplication: `queue/page.tsx` hand-rolls a local `one()` extractor and `leads/page.tsx` inlines `Array.isArray(raw) ? raw[0] : raw` twice. Third copy would have landed in this slice. It converges on the validator — not on a `helpers.ts`.

## T5. Indexes — deliberately none in this slice

Facets on `niche` and `city` have no index today, and `searchLeads`' four unanchored `ILIKE '%x%'` cannot use one regardless. At ~1,400 rows the planner will seq-scan faster than it will traverse a B-tree, and a migration is a one-way door with permanent history.

**`[RULED]` No index migration ships with CRM-18/19. Ship, measure against real data, add only when a plan says so.** The threshold and the eventual fix are Forge's, in §F3. Adding indexes now would be gold-plating dressed as diligence, and it is the kind that survives forever because nobody dares delete it.

## T6. Slicing — this is two tickets, and the order matters

| Ticket | Scope | Delivers |
|---|---|---|
| **CRM-18** | Filter rail · list view upgrade (stage, next action, last touch, sort, real paging) · the four presets · the scoreboard link | Taylor's pain #1 (*"I can't filter"*) and #3 (*"who do I round back to"*), and closes the D-CRM-4 dead end (B2) |
| **CRM-19** | The pipeline board | Pain #2 (*"see who's in what stage"*) |

CRM-18 alone is the larger share of the value and it is the half that stops leads getting lost. CRM-19 consumes CRM-18's filter contract and its card-set query, so the dependency is real, not administrative. **Ship 18, use it for a week of call blocks, then build 19** — a week of real use is the cheapest possible input to the board's open column-set question, and it costs nothing to wait.

`00-build-order.md` and `PROGRESS.md` gain both rows at Phase 6 when Taylor ratifies.

## T7. Escalated — Taylor's to ratify, not mine

- **D-CRM-31…35** (§Rulings above). All five are product-behavior rulings against a binding log. I concur with all five and have no amendment. D-CRM-32 in particular is the one I would defend hardest: it is the difference between a board that tells the truth and a board that lies smoothly.
- **Vesper's open item on the column set** — worth answering *after* CRM-18 ships, from a week of real filtering, rather than in the abstract now.
- **A test dependency** — Forge proposes one in §F1. Adding a dev dependency is my door; my ruling is there.

---

# Technical — Forge (code quality, types, proof, entropy)

Scope check first: this is **behavior-changing**, not a refactor. The convergences below (F2, F4) are behavior-preserving and belong in their own commits, landing *before* the feature commits — make the change easy, then make the easy change.

## F1. There is no proof mechanism, and this is the slice that should get one

`package.json` has no `vitest`, no `jest`, no `playwright`, and no test script. Verification across the whole CRM track has been `build · tsc · lint · happy path against Supabase` (TECH-SCOPE §10). For thirteen tickets of UI and orchestration, that was a defensible trade.

It stops being defensible here, for one specific reason: **the preset predicates encode business rules that types cannot see.** "Gone quiet" is *worked, non-terminal, no next action or overdue, no touch in N days*. That is four clauses of Taylor's sales judgment. If one inverts, the surface returns a plausible list of the wrong people, `tsc` stays green, the build passes, and nobody finds out — the failure mode is a lead that quietly never appears, which is precisely the failure this whole slice exists to fix.

**Proposal `[NEEDS MASON + TAYLOR]`:** add `vitest` as the only new dev dependency, one script, and exactly two test files — no runner config beyond defaults, no DB, no React, no fixtures resembling real prospects:

- `server/services/lead-stage.test.ts` — `getLeadStage` across all ten stages plus the ordering law (a paid engagement outranks call history; a terminal ruling outranks everything). This is a pure function with a documented precedence order and zero tests. It is the single most-depended-upon function in the CRM.
- `server/services/lead-presets.test.ts` — each preset predicate: included, excluded, and the boundary (exactly `GONE_QUIET_DAYS` old is on which side?).

**Mason's ruling on the door:** approved. `vitest`, exact-pinned via `yarn add --dev --exact`, scope limited to pure functions in these two files. Not a testing strategy for the repo, not a coverage target, and no test may reach the database — the moment one needs a live connection it stops being cheap and starts being skipped. If it grows past pure functions it comes back to me. `[RULED — Mason]`

If Taylor declines the dependency, the honest fallback is that the predicates get expressed as named, exported pure functions anyway so they are at least readable and greppable — and this slice ships with its riskiest logic unverified, stated plainly rather than papered over.

## F2. Converge the aggregate loader — do not converge the row types

`loadQueueContext` ([`leads.ts:697`](../../../server/services/leads.ts)) is private, and it is already the exact thing the board needs: chunked aggregates over an arbitrary set of lead ids returning attempt count, conversation flag, texted-link flag, last attempt, last disposition, email count, and engagement state. The board needs all seven. The list needs four.

**Move: export it as `loadLeadContext`, unchanged in behavior, into `lead-workspace.ts`, imported by `loadQueue`.** One home for "aggregate facts about a set of leads." Behavior-preserving, provable by types alone, its own commit.

**The move I am explicitly not making:** unifying `LeadListRow` and `QueueLead` into a shared row type. They overlap on eight fields and diverge on nine, and `QueueLead` carries `projectSummary`, `window`, `mapsUrl`, `notes`, `contactName`, and `preferredChannel` that exist solely to prefill call mode. A supertype would hand the board six fields it must not render (see F5) and would couple the two surfaces at exactly the seam where they should be free to move. **Share the derivation, not the shape.** Two honest types beat one type with a comment explaining which half applies.

## F3. `searchLeads` — name the threshold, change nothing

Four unanchored `ILIKE '%x%'` across `business_name`, `phone`, `city`, `niche`, and Vesper wants two more fields (contact name, notes). No index serves this, and the row cap is a bare `limit = 100`.

At ~1,400 rows this is a sub-millisecond seq scan and **it is not the problem.** No profile, no optimization — the week I spent optimizing a function worth 0.3% of the budget is the reason that rule exists.

What ships instead is a threshold, recorded so the next person does not re-derive it: **when `leads` passes ~50k rows, or the query exceeds 100ms against production data, the fix is `pg_trgm` plus a GIN index across the searched columns, or a generated `tsvector`.** Both are migrations, both are Mason's door, and neither happens on a hunch. The two new search fields ride the existing shape — six unindexed ILIKEs cost what four do at this volume.

## F4. Types — make the filter state unrepresentable when wrong

The page currently reads `Record<string, string | string[] | undefined>` and narrows by hand at each use. Every facet becomes a union, exhaustively switched, so adding a bucket breaks the build rather than silently falling through to "show everything":

```ts
type NextActionBucket = "overdue" | "today" | "week" | "later" | "none";
type LastTouchBucket  = "never" | "under7" | "7to30" | "over30";
type LeadSort         = "score" | "lastTouch" | "nextAction" | "name";
type LeadView         = "list" | "board";
```

No boolean soup, no stringly-typed sort key reaching a query builder, no `as` anywhere in the parse path. Zod narrows at the boundary (Mason's T4) and the union is what crosses it. A sort key that reaches SQL unvalidated is the shape injection bugs are made of, and the type system closes it for free.

## F5. Leak test — the card is correct, and it needs to be pinned as correct

The board is the single most over-the-shoulder surface in this product: laptop open, many rows visible, and `leads.notes` holds Taylor's private notes on named individuals at named businesses. Vesper's four-line card carries business name, trade, city, and two dates — no notes, no contact name, no phone. **That passes, and the reason it passes must be written down, because the next person to touch the card will reasonably think "the phone number would be handy here."** It would. It also puts a prospect's direct line on a screen that renders sixty of them at once, and the drawer is one click away.

**`[RULED — Forge]` `notes`, `contactName`, `contactEmail`, `phone`, and `phoneOverride` are not projected into the board card query at all.** Not fetched and hidden — not fetched. A field that never reaches the component cannot be added to the JSX by accident, and the projection is the enforcement point.

Same rule for the list: it already shows a phone column and that is fine at one row per line with a search that got you there deliberately. The board is a different density and a different risk.

## F6. Budget — capture the baseline before the board exists, or the number means nothing

This repo already measures: the window-memo entry in `TECHNICAL-DECISIONS.md` records 1,141ms → 2ms on a 1,406-lead thread. Same discipline here.

- **Budget:** board server-side data load ≤150ms at current volume; list ≤100ms.
- **Baseline to capture during CRM-18**, before CRM-19 exists: current `searchLeads` timing and `loadQueue`'s full-table read, against real data. Without the before-number the after-number is a claim.
- **Method:** same as the window memo — time the service call server-side, record in `TECHNICAL-DECISIONS.md` with the row count it was measured at. A measurement without its n is a story, which is the same rule the scoreboard already runs on (`MIN_N_FOR_RATE`).
- If the board misses budget, the first suspect is per-column paging, not query micro-optimization. Mason's T1 predicate is already the cheap shape.

## F7. Commit sequence

Refactor and behavior never share a diff:

1. `export loadLeadContext` + move to `lead-workspace.ts` — behavior-preserving, types prove it.
2. Move `searchLeads` / `countLeads` — behavior-preserving, red diff in `leads.ts`.
3. `leadFilterParams` validator + converge the three searchParam extractors — behavior-preserving.
4. *(if F1 approved)* the two test files against existing behavior — characterization, before anything changes.
5. Filter rail + list upgrade + presets — behavior-changing, CRM-18.
6. Scoreboard link — one line, closes B2.
7. Board — behavior-changing, CRM-19.

Steps 1–4 are the "make the change easy" half and should land and be reviewed on their own. Steps 5–7 then read as small.

## F8. Accepted as clean

`getLeadStage` is the best function in this codebase — pure, ordered most-authoritative-first, documented at the reason level rather than the what level, and correct enough that Mason's entire T1 ruling falls out of reading it. It needs tests, not changes. The `SYNC_OWNED` allowlist and the `leads` schema docblock are the same quality. None of the above is a criticism of those.

---

_Mason + Forge — 2026-08-24. Nothing above is built. CRM-18/19 rows land in `00-build-order.md` and `PROGRESS.md` on Taylor's ratification of D-CRM-31…35 and the `vitest` dependency._
