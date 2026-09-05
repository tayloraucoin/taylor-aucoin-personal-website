# PORT — Portfolio intake track — Build order

**New here? Read [`README.md`](README.md) first** — process, kickoff contract, completion protocol. This file is the ordered, checkable queue, derived from each spec's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in [`PROGRESS.md`](PROGRESS.md). If this file and a spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread (kickoff contract in the README). 4. Close in three places, then tick here.

## Critical path (sequential)

PORT-1 → PORT-2 → PORT-5 → PORT-6 → PORT-8 · **Phase 6:** PORT-11 → PORT-12 → PORT-14 → PORT-17

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


### Phase 6 — Kinds (one form, six kinds of client)

Governing docs: `../CODED-INTAKE-CATEGORY-AUDIT.md` (the finding) and `../CODED-INTAKE-KINDS-UX-SCOPE.md` (the fix; D-PORT-8…14 pending ratification). Where that scope's §12 and a ticket's `## Depends on` disagree, **the ticket wins** and this file follows the ticket.

- [x] **PORT-H1** · Hotfix: no client's name in shipped copy (step-6 person-voice interpolation) · S · (—) — Complete 2026-09-01. The verb is now a copy-pack slot (`personVerb` / `personVerbThird`); PORT-15 adds the remaining packs' verbs and the entity `we` subject
- [x] **PORT-11** · Kind: start-form picker, `siteKind` in answers with `siteKinds` derivation, resolver rewire, pack registry widened — **Mason seam review; durable byte-identical** · M · (PORT-1, PORT-2) — Complete 2026-09-01. Packs live in `lib/intake/showcase-copy.ts`, kinds in `lib/intake/showcase-kinds.ts`; four packs are empty and fall through until PORT-12
- [x] **PORT-12** · Copy packs: practice · entity · venture · service strings, option lists, document labels — draft-marked for Taylor's pass · M · (PORT-11) — Complete 2026-09-01. **Taylor's copy pass edits one file: `lib/intake/showcase-copy.ts`** (`grep 'COPY — pending Taylor'`). `yarn verify:tracks --packs` prints each pack to proofread
- [x] **PORT-16** · Taste sets by pack; uncurated → absent; stub set deleted · S · (PORT-11) — Complete 2026-09-01. **All six sets are uncurated, so every client's step 5 renders without a gallery until Taylor curates one** — `content/intake-examples/<pack>.ts`, each with its own curation contract. `yarn verify:tracks` reports which are still absent
- [x] **PORT-13** · Step 1 by kind: kind line with Change, entity name, stage, team roster with headshots — **non-destructive kind change** · M · (PORT-11, PORT-12) — Complete 2026-09-01. `KnownFact` promoted to `app/websites/intake/_components/`; `PersonEntryCard` beside `ProjectEntryCard`
- [x] **PORT-14** · Step 4 by kind: offer/piece/service entries, the ask block, the ink claims cluster, document sections + three flags — **the slice the audit exists for; Vesper alarm/ink review; Mason output review** · L · (PORT-11, PORT-12, PORT-13) — Complete 2026-09-01. Four flags, not three. New upload field key `piece_images`
- [x] **PORT-15** · The pack-driven steps 2·3·5·6·7·8·9; documents drop with its promise; tools group; the place · M · (PORT-11, PORT-12, PORT-H1) — Complete 2026-09-01. New upload field keys `place` and `documents`; new answers `tools` and `toolsDetail`
- [x] **PORT-17** · Extraction modes people · offerings · pieces · services; pack-aware experience prompt — **third-party data path; Forge review** · M · (PORT-6, PORT-13, PORT-14) — Complete 2026-09-01. **`yarn eval:extract` has never been run live** — it needs an API key and an engagement id; the prompts are ungraded until it is
- [x] **PORT-10** · Business primer (already scoped; sequenced here so its field inventory includes Phase 6's keys) — **Loom cognition review; Opus** · L · (PORT-6, ADM-2) — Complete 2026-09-01. Its inventory is derived, so it proposes into Phase 6's new fields too — 52 fields, 49 quote-or-nothing. `yarn eval:primer:live` 11 cases clean

### Phase 7 — Ingestion

- [x] **PORT-18** · Global ingestion step before "About you" on every coded kind; portfolio sub-types; fast-way copy — **Loom eval-before-prompt; Vesper confirmation, overlay, and the machine-filled mark; Mason transactional write and renumber** · XL in five slices · (PORT-10, PORT-17, ADM-4) — **Slice 1 complete 2026-09-03** (disciplines, fast-way copy). **Complete 2026-09-03**, all five slices. Taylor ratified all six questions. `yarn eval:ingest:live` is clean (5 cases, 27 fields, 26 entries); `PrimerBlock` is retired and its stored proposals still render for engagements that have them. **Never run against a real engagement** — the transaction and the one-shot guard need a database
- [x] **PORT-21** · Files and links: documents read at upload into PORT-20's transcript columns (no migration); links fetched by the model's server-side web fetch, stored as source rows in the `intake` bucket; both feed PORT-18's run with a per-source "as we read it" mark — **Loom read-stage contract; Mason source rows and SSRF posture; Vesper per-source states** · L · (PORT-18, PORT-20) — **Complete 2026-09-03.** `yarn eval:sources` runs the local half free; `yarn eval:sources:live` grades a generated PDF against its own known text. **Taylor: ratify `fflate`, and run migration `0011` — the transcript columns this writes into do not exist on the hosted databases yet**

### Phase 8 — Taylor's read of the whole flow

- [x] **PORT-19** · Questions pass two: `lookingFor` and the CTA question reworded · multiple videos per project with a lead-with tick · Save and close on a project · the reel question retired for a home block on step 9 · videos on Media · five picked from the rows · `comeAcross` on one line · the logo option that said "hate" · a running page count and the input-not-instruction note · an availability follow-up · "Where does your video live?" retired · L · (PORT-14, PORT-15, PORT-18 slice 1) — Complete 2026-09-03. Note 8 (browser recording + transcription) was scoped out at Taylor's request; the brief and its kickoff prompt are `../VOICE-NOTE-TRANSCRIPTION-PRIMER.md` and become **PORT-20**
- [x] **PORT-20** · In-browser voice recording with automatic transcription — **third-party data path; new processor on the privacy page; the recording must survive every failure** · L · (PORT-19) — Complete 2026-09-03. **Taylor runs `db/migrations/0011_bouncy_stranger.sql` and sets `OPENAI_API_KEY`**; until the migration runs, every step page that lists uploads errors. The microphone path and Safari are unverified (no mic in the agent browser, no Safari driver) — see `DEVIATIONS.md`

### Phase 9 — The taste step, redesigned

Governing doc: `../CODED-INTAKE-TASTE-UX-SCOPE.md` (Vesper; approved by Taylor 2026-09-03 — soft minimum, D-PORT-4 reversed in part). Architecture: M-PORT-35…38. Where the scope's §16 and a ticket's `## Depends on` disagree, **the ticket wins** and this file follows the ticket.

- [x] **PORT-22** · Taste contract: the taxonomy, the site shape (1512:982 captures, `role`, `axes`, `styles`, `build`, `embed`, `checkedOn`), `picks` / `references` / `styleBrief`, retired keys kept in the schema, `favourites` derived at read, the document's pick lines and flags — **Mason answer-loss review; no surface** · M · (PORT-16, PORT-19) — Complete 2026-09-04. `picksOf` is the one reader of the legacy shape; `RETIRED_TASTE_KEYS` keeps seven retired questions out of the done screen's agenda. **Sets are still uncurated** — PORT-23 renders against the absent state until Taylor curates one
- [x] **PORT-23** · The step rebuilt: closed groups, full-width rows, the pick block (seven-stop closeness scale with no default, the note), your picks, the footer count that never gates, the client's own sites with the same block, images, the brain dump last; the retired five leave the step; the done-screen shortfall line — **Vesper state review; Continue never disabled** · L · (PORT-22) — Complete 2026-09-04. Seven components under `_components/taste/`; `example-card.tsx` and `favourites-rank.tsx` deleted. **PORT-24's seam is `PickBlock`'s `actions` prop**, rendered beside Select while idle and currently unused
- [x] **PORT-24** · See more: the full-screen overlay, the sandboxed `no-referrer` live frame at ≥ 1024px for `embed: true` only, the capture strip everywhere else, paging across the whole set — **Mason trust review (Referer, one iframe)** · M · (PORT-23) — Complete 2026-09-04. `no-referrer` proven against a header-echoing route; one iframe held across rapid paging. **See more stays on a picked row** (a spec diagram omitted it; see `DEVIATIONS.md`)
- [x] **PORT-25** · Find more like it: the style brief, server-side web search on the pinned model, result links never called checked, Add to my sites → a reference entry — **third-party data path; Forge allow-list review** · M · (PORT-22, PORT-23) — Complete 2026-09-04. Two live runs, allow-list proven against planted decoys. **`MAX_SEARCHES` is 14 and the hosting platforms are deliberately NOT blocked** — blocking a domain blocks its subdomains, and many of the sites worth finding are `name.format.com`
- [x] **PORT-26** · Motion: the add-on notice in both states and the one client-initiated single-item Checkout, allow-listed to `showcase_animations`, settling through the ancillary path — **money path; Forge review; `paid_at` never written** · M · (PORT-23, PORT-3, PORT-9) — Complete 2026-09-04. Forge list exercised against staging with Stripe in test mode, 12 of 12; `paid_at` byte-identical after settlement. **Checkout session creation is unverified** — no minted Stripe price on the tier (PORT-3's outstanding action)
- [x] **PORT-27** · Capture tooling: one command shoots a site at MacBook aspect, reads its framing headers, prints an entry · S · (PORT-22) — Complete 2026-09-04. `yarn capture:example --url … --pack film`. **`playwright` ratified by Taylor** and pinned exact; run `npx playwright install chromium` once per machine

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
| **7 — Kind** | PORT-H1 → PORT-11 | The hotfix is ten minutes and removes another client's name from every screen today; PORT-11 is the seam every Phase 6 slice stands on. **Opus** — the value is that nothing visible changes for anyone who exists today while the seam changes shape |
| **8 — The registry** | PORT-12 → PORT-16 | Both are content modules against precise tables (Vesper's §6 and PORT-7's `ExampleSite` shape). **Sonnet** — mechanical authoring; the only failure is paraphrase, and the cell-by-cell diff is the check |
| **9 — The step surfaces** | PORT-13 → PORT-15 | Step 1 and the seven pack-driven steps: both read the registry batch 8 landed; both are precedented primitives gated by kind. **Opus** for PORT-13's non-destructive kind change and entry-keyed headshots; PORT-15 rides the same thread (Sonnet-class work, but do not switch models mid-batch) |
| **10 — Step 4** | PORT-14 | Alone. The ask block, the ink cluster, four entry shapes, the document, three flags. **Opus, do not choose down** |
| **11 — Sorting** | PORT-17 | Alone. Third-party data path at four times PORT-6's surface; eval before prompt. **Opus** |
| **12 — The primer** | PORT-10 | Alone, already scoped. Its inventory is derived, so running it after PORT-14 means it can propose into the new fields. **Opus, do not choose down** (per its own spec) |
| **13 — The taste contract** | PORT-22 → PORT-27 | Both are the content and answer contract with no surface; PORT-27 prints entries in PORT-22's shape, so writing them together keeps the shape in one head. **Opus** for PORT-22 (the retired-key trap); PORT-27 rides the thread if the dependency is ratified, else the thread stops at the checkpoint |
| **14 — The step** | PORT-23 | Alone. The design signal for the whole deliverable, one new primitive with a real state machine, and a footer that must read as information. **Opus, do not choose down** |
| **15 — See more and Find more** | PORT-24 → PORT-25 | Both compose `PickBlock` and `ReferenceList` from batch 14 and neither touches the other's files; the overlay's trust criteria and the search's allow-list are the same kind of invisible-in-a-screenshot work. **Opus** |
| **16 — Motion** | PORT-26 | Alone. Money, a webhook branch, and the `paid_at` invariant. **Opus, do not choose down** |

**Gates, Phase 6:** batch 8 and batch 9 both need batch 7. Batch 9 needs batch 8 (PORT-13/15 read PORT-12's strings). Batch 10 needs batch 9's first ticket (PORT-13) Complete — if batch 9 split at its checkpoint, PORT-14 may start once PORT-13 alone is Complete. Batch 11 needs batches 9 and 10. Batch 12 gates on nothing in Phase 6 and is recommended after batch 10.

Batch 5 may only start once batches 3 and 4 are Complete (PORT-8 gates on PORT-3, 4, 5, 7). Batches 3 and 4 both gate only on batch 2.

**Gates, Phase 9:** batch 14 needs PORT-22 Complete (batch 13's first ticket — PORT-27 never gates anything). Batches 15 and 16 both need batch 14; they may run in either order or in parallel threads. Curation (Taylor) needs only PORT-22 and, if ratified, PORT-27; the step renders the absent state until a set is curated, so no batch waits on content.

## Ordering constraints (what alphabetical order hides)

- **PORT-1 precedes everything** — the track column, the registry seam, and the entry-key column are the ground every other slice stands on; building a surface first would hardcode track assumptions the cartridge exists to prevent.
- **PORT-3 does not gate PORT-4/5/6/7** — form development runs on `deposit_required=false` engagements (D-INT-9), exactly as INT did. It does gate PORT-8 (the output reports payment state) and PORT-9 (post-intake charges reuse its rows).
- **PORT-5 precedes PORT-6** — extraction prefills the entry blocks; building the extractor before the blocks exist means testing against mocks on the slice whose whole risk is the real prefill path.
- **PORT-7 needs only PORT-2** — the taste step's gallery has no dependency on the entry machinery; parallelize it.
- **PORT-8 last before fast-follow** — the output document is only honest once every step it reports exists.
- **PORT-11 precedes every Phase 6 slice** — `kind`, `groupsFor`, and the widened pack type are what the others branch on; building a roster before kind exists means gating it on `siteKinds`, the answer the audit found read by nothing.
- **PORT-12 precedes PORT-13/14/15** — the steps read strings from the pack; built first they would carry literals, and Taylor's pass would edit the wrong file.
- **PORT-13 precedes PORT-14** — the document's People section is rendered by PORT-14's one `renderEntries`, and it needs `people[]` to exist to be tested against real rows.
- **PORT-14 precedes PORT-17** — the extractor's output schemas derive from PORT-14's entry schemas; built first it would hand-type shapes that then drift.
- **PORT-16 gates nothing** — parallelise it with anything after PORT-11.
- **PORT-22 precedes every Phase 9 surface** — the schema keeps the retired keys and derives legacy favourites; a surface built first would either delete stored answers or invent a second reader of `favourites`.
- **PORT-23 precedes PORT-24, PORT-25, and PORT-26** — all three compose `PickBlock`, `ReferenceList`, or the step's final order; built first they would carry their own copies of the pick grammar.
- **PORT-27 gates nothing and is gated by Taylor** — the dependency decision; manual capture is the default and curation can proceed without it.

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
| PORT-H1 | —                              |
| PORT-11 | PORT-1, PORT-2                 |
| PORT-12 | PORT-11                        |
| PORT-13 | PORT-11, PORT-12               |
| PORT-14 | PORT-11, PORT-12, PORT-13      |
| PORT-15 | PORT-11, PORT-12, PORT-H1      |
| PORT-16 | PORT-11                        |
| PORT-17 | PORT-6, PORT-13, PORT-14       |
| PORT-10 | PORT-6, ADM-2 (recommended after PORT-14) |
| PORT-18 | PORT-10, PORT-17, ADM-4         |
| PORT-21 | PORT-18 (slices 3–5), PORT-20   |
| PORT-19 | PORT-14, PORT-15, PORT-18 (slice 1) |
| PORT-20 | PORT-19                        |
| PORT-22 | PORT-16, PORT-19               |
| PORT-23 | PORT-22                        |
| PORT-24 | PORT-23                        |
| PORT-25 | PORT-22, PORT-23               |
| PORT-26 | PORT-23, PORT-3, PORT-9        |
| PORT-27 | PORT-22, Taylor (dependency)   |
| PORT-28 | PORT-22                        |
| PORT-29 | PORT-22                        |
| PORT-30 | PORT-28, PORT-29               |
| PORT-31 | PORT-30                        |
| PORT-32 | PORT-31                        |

## Ticket-authoring batches (record)

All nine authored 2026-08-26 in one session — logged as a deviation (see `DEVIATIONS.md`), mitigated the same way INT's was: one shared tech scope, one governing UX scope, and the v2 copy doc as the single copy authority across the set.

Phase 6's eight (PORT-H1, PORT-11…17) authored 2026-09-01 in one session by Reeve, Mason, and Vesper — logged as a deviation; mitigated by one audit, one governing kinds scope, and M-PORT-21…24 recorded at authoring so every ticket cites the same placement calls.

Phase 9's six (PORT-22…27) authored 2026-09-03 in one session by Vesper, Mason, and Reeve — logged as a deviation; mitigated by one governing taste scope approved the same day, M-PORT-35…38 recorded at authoring, and the scope's §13 as the single string authority.

Phase 10's five (PORT-28…32) were **not authored as tickets**. Taylor asked for the build directly after ratifying `../CODED-INTAKE-EXAMPLES-ADMIN-UX-SCOPE.md` (D-PORT-21…28) and the architecture pass in `../CODED-INTAKE-EXAMPLES-TECH-SCOPE.md` (M-PORT-41…47), both written before any code. Logged as a deviation; the slice boundaries were kept in the build order so the questionnaire works at every point between them, and `PROGRESS.md` carries the five rows.

## Locked references (do not re-litigate)

- **Decisions:** D-INT-1…12 (`docs/intake/INTAKE-UX-SPEC.md` §13) · D-PORT-1…7 (`../PORTFOLIO-INTAKE-UX-SCOPE.md` §11, pending ratification) · M-INT-1…23 (`docs/intake/specs/TECHNICAL-DECISIONS.md`) · M-PORT-1…24 (`TECHNICAL-DECISIONS.md` here) · D-PORT-8…14 (`../CODED-INTAKE-KINDS-UX-SCOPE.md` §11, pending ratification) · M-PORT-29…32 (PORT-20: transcript storage, per-file budget, the vendor allow-list, the service name) · D-PORT-15…20 (`../CODED-INTAKE-TASTE-UX-SCOPE.md` §14; D-PORT-16 and the D-PORT-4 amendment ruled, the rest provisional) · M-PORT-35…38 (Phase 9: retired keys and the legacy read, the overlay's frame posture, the search's two-call shape, the amended charge law) · **D-PORT-21…28** (`../CODED-INTAKE-EXAMPLES-ADMIN-UX-SCOPE.md` §12, RATIFIED by Taylor 2026-09-04) · **M-PORT-41…47** (Phase 10: the gallery as a request-scoped parameter, the enum-versus-text rule, the fail-closed pack switch, the slug freeze, the capture storage and dimension read, what became of `content/intake-examples/*`, and the one validator both the publish gate and `verify:tracks` call). Cite by ID; reopening requires new evidence routed to Taylor.
- **Binding law:** the README's non-negotiables + repo `CLAUDE.md` invariants + the v2 copy doc's verbatim rule.
- **Launch-blocking set:** PORT-1…PORT-8 (PORT-9 is fast-follow). **For the next client (Holistica): PORT-H1, PORT-11, PORT-12, PORT-13, PORT-14, PORT-16.** PORT-15 and PORT-17 improve the venture path but a call covers what they collect; PORT-10 is leverage, not a gate. Within them: the Durable byte-for-byte guarantee (PORT-1/2), fulfillment generalization + confirm-before-charge (PORT-3), blob-never-lost (PORT-5/6), private storage on per-project uploads (PORT-5), honest output flags (PORT-8).
- **Open Taylor items, Phase 6** (build proceeds on the defaults stated): ratify D-PORT-8…14 (default: proceed as provisional) · the ~90 draft strings in `lib/intake/showcase-copy.ts` after PORT-12 (default: ship marked) · curate the `venture` gallery set first (default: absent state) · the logo add-on's checkout copy vs the entity logo help (default: leave checkout copy; PORT-15 ships the pack help; Taylor reconciles in `content/addon-details.ts`) · keep `other` as a kind (default: keep) · the `/websites/coded` hero vs a start form that sells five other kinds (routed to the marketing thread; not this track's file).
- **Open Taylor items, Phase 10** (nothing proceeds without the first): **run migration `0012_warm_harpoon.sql` and then `db/supabase/setup/03-example-sites-rls.sql`** · confirm the capture bucket id's casing (`public` vs `PUBLIC`) in `server/services/example-captures.ts` · amend this folder's README locked-scope line to read "on any client-facing intake route", so a build thread does not stop at a legitimate `/admin/intake/examples` ticket · the §11 draft strings on the new admin surface (default: ship marked `[COPY — draft]`) · the deferred list in the UX scope §14 (reordering, bulk edit, a dead-link sweep, pick analytics).
- **Open Taylor items, Phase 9** (build proceeds on the defaults stated): ratify `playwright` as a pinned devDependency for PORT-27 (default: manual capture, ticket shelved) · the six group titles and the §13 draft strings (default: ship marked `[COPY — draft]`) · curate the `film` set first against the two research libraries (default: absent state) · the public sales page's "Ranking. You put your favourites in order" line in `content/websites-coded.ts` now describes a retired flow (routed to the marketing thread; not this track's file).
- **Open Taylor items** (build proceeds where marked): Kryshan promo mechanics + $1,600 split · refund sentence · admin panel + care plan sign-offs and billing start · terms coverage · five-pages + coming-soon rows · example-set curation. See `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §10.
