# PORT-33 — Entries arrive newest-first, and every list can be reordered by hand

**Epic:** PORT — coded (showcase) intake · **Phase 11 · touch-ups** · Size: S–M
**Slice type:** Ordering law for machine-produced entries plus one missing control on a shared component. Risk class: the durable track shares `RepeatableBlock`, so a careless change there leaks into a locked surface; a sort that re-orders entries a client has already arranged would be editing an answer because something else changed.
**Review:** none beyond the durable regression oracle (`yarn verify:tracks --document`, byte-for-byte).

**Status:** Complete (2026-09-14). Built and verified in the same session as PORT-H5, against the agent dev server (port 4300) and staging, with a synthetic engagement (no real client data; deleted after the walk).

> **Vigil — verification.** Runtime, on the coded track's step 4, with Taylor's own six-project list pasted through the live extractor (`claude-sonnet-5`, real API call): entries returned newest-first, matching the spec exactly (2026, 2025, 2020, 2019, then the two 2018 entries in original order). Move up / Move down walked by click, the `aria-live` announcement confirmed in the page text, the reordered position confirmed to **persist across a full page reload** (autosave). "If you could only show five" rows confirmed date-sorted independent of the manual card reorder. **Not walked:** step 3 (experience) and the step-1 ingest run in the browser — verified instead by the `entry-order.ts`/`mergeIngestion` code path being identical to step 4's, and by the `verify:tracks` cases; keyboard-only operation and 375px wrapping — verified by code (native `<button disabled>`, `flex-wrap`) but not screenshot-confirmed. The durable track: `yarn verify:tracks --document` is **byte-for-byte identical** before and after (diffed directly), and `git status` shows no durable step file touched — only the shared `RepeatableBlock` (default `reorderable=false`) and a new shared `RankButton`.

---

## Outcome

When the fast way returns a client's projects or experience, they are laid out most recent first — the order a credits list, a CV, and the finished site all use — instead of whatever order the model happened to read them in. The same law applies to the step-1 ingest run, so a client who pastes once at the start also gets a sorted list. Every repeatable list on the coded track (projects, experience, offerings, pieces, services, asks, the roster) gains Move up and Move down on each card, always visible, keyboard-first, so a client can put a 2019 short above a 2020 feature because that is how they want it seen. The tickable rows under "If you could only show five" are date-sorted too; the rank remains the order they tick, exactly as today. This slice does **not** re-sort a list the client already has, does not touch the model prompt, and does not change the durable track's blocks in any visible way.

## Root cause (investigated 2026-09-14)

There is no ordering step anywhere between the model and the screen. `server/services/extract.ts` returns entries in the order the model emitted them (its instructions say nothing about order; a filmography paste is usually in IMDb's grouping, which is neither chronological nor reverse); `extraction-block.tsx` mints keys and hands them to the step; `step-work.tsx` / `step-experience.tsx` append them; `mergeIngestion` (`lib/intake/ingestion-record.ts:282–293`) appends the step-1 batches the same way. `RepeatableBlock` (`app/websites/intake/_components/repeatable-block.tsx`) has Remove and Add and nothing that moves a card. `TopFive` (`top-five.tsx`) renders its candidate rows in `projects` array order and only the *picked* list has Move up / Move down.

`year` (projects) and `when` (experience, pieces) are free text by design — `'2019-now'`, `'March'`, `'by autumn'`, `'2027'` — because the extractor copies the client's own time expression (`extract.ts`, the "date or period field" rule). So the sort has to read a year out of prose, and be honest about entries where it cannot.

## Why / intent

- **D-PORT-3** — nothing extracted is fact until the client has seen it. A sorted list is easier to see; a re-sorted list is a change under their hands. The sort applies to entries arriving, never to entries already on screen.
- **D-PORT-4 (keyboard floor; controls always rendered, never hover-revealed)** and **TopFive's own law ("the order is the rank")** — the reorder control is the same shape `TopFive` already ships: two text buttons, disabled at the ends, an `aria-live` sentence on every move.
- **PORT-5's append law** (`step-work.tsx` — "A second run never touches an entry already on screen — including one the client has just corrected") — binding here; the sort is applied to the incoming batch before the append and to nothing else.
- **Locked scope: the durable track ships byte-for-byte unaffected.** `RepeatableBlock` is shared. The new control is behind a prop that defaults off.
- **What this slice is NOT (binding):** not a prompt change; not a "sort my list" button on an existing list (see Out of scope); not drag-and-drop (D-PORT-4's amendment retired the drag-rank on the taste step for the same reasons that apply here — a phone has no hover and a keyboard user has no pointer); not a change to the answers document's shape.
- **Ground truth:** `lib/validators/showcase-intake.ts` (`projectEntrySchema.year`, `experienceEntrySchema.when`, `pieceEntrySchema.when` — all `text`) · `app/websites/coded/intake/_components/extraction-block.tsx` (`onEntries`) · `steps/step-work.tsx`, `steps/step-experience.tsx`, `steps/step-about.tsx` (the roster) · `lib/intake/ingestion-record.ts` (`mergeIngestion`) · `app/websites/intake/_components/repeatable-block.tsx` · `top-five.tsx` (`RankButton`, `move`, the announcement pattern) · `server/services/output.ts` (prints arrays in stored order — so **array order is the answer**, and a reorder must persist, not merely display).

**Rulings this slice makes (labelled, logged):**

- **One pure helper, `lib/intake/entry-order.ts`, is the only place a year is read out of prose.** `yearOf(text): number | null` takes the largest four-digit year in `1900…2099` found in the string; the words `now`, `present`, `current`, `ongoing`, `today` (case-insensitive) count as the current year plus one-half, so an open range sorts above a closed one ending this year. `sortNewestFirst<T>(entries, dateOf: (e) => string | undefined): T[]` is a **stable** sort by that key descending; entries with no readable year keep their relative order and go **after** every dated entry. Pure, no `Date` other than `new Date().getFullYear()`. **There is no test runner in this repo**; the cases under Acceptance go into `scripts/verify-track-cartridge.ts` (`yarn verify:tracks`) as `check(...)` lines, which is where the track's other pure invariants already live and which runs with neither network nor database. Logged.
- **Sort at three arrival points, never at rest.** (1) `extraction-block.tsx` before `onEntries`, so every consumer of the fast way gets sorted batches; (2) `mergeIngestion`'s `added` before it is spread, so the step-1 run gets the same law server-side; (3) `TopFive`'s candidate rows, display-only, derived on render. The stored `projects` array is never sorted after the fact. Logged.
- **`dateOf` is `year ?? when`.** Projects carry `year`, experience and pieces carry `when`, offerings/services/people/asks carry neither and come back in their own order from the same call — one code path, no per-shape branching. Logged.
- **Reorder is a `reorderable` prop on `RepeatableBlock`, default `false`.** Every coded-track block passes `true`; no durable file changes. Cards are keyed by `keyOf(item)` when the caller supplies it (every coded entry has `entryKey`), so a moved card keeps its open/shut state and its focused field. Logged.
- **A move commits like a Remove does.** `onChange` with the new array, then the step's own autosave carries it; no explicit flush is required because nothing here leaves the page. `[PROVISIONAL — Forge may prefer `onBlur` after a move for parity with `TopFive.commit`; either is acceptable, the answer is never lost.]` Logged.

## Experience & states

**Fast way (steps 3 and 4).** Paste, Sort this for me, the working indicator, then the entries appear **newest first** below the block. A second run appends its own sorted batch **below** the existing entries (the append law); the after-line already says they appear below. **Ingest run (step 1).** Identical law applied server-side; the client first sees the lists on steps 3 and 4 already sorted.

**Every card on a coded-track repeatable block** shows, in its header row beside Remove: `Move up` · `Move down`, in the same `RankButton` treatment `TopFive` uses (mono, 10px, tracked, dim → gold on hover, disabled at 40% opacity). Rendered always — one card shows both disabled rather than hiding them, so the affordance is learnable. On a move, the sr-only live region reads "*{title or 'Untitled project N'} moved to position {n} of {m}.*" The index chrome (`01`, `02`) renumbers; the moved card keeps focus on the button that was pressed (it moved with the card, because the card is keyed by `entryKey`).

**If you could only show five.** The tickable rows are `sortNewestFirst(projects, p => p.year)`. The "Untitled project N" fallback keeps N as the project's position in the *list above* (`projects.indexOf`), so the number a client sees on the card is the number they see here. The picked list below and its Move up / Move down are unchanged.

**States (exhaustive):** batch fully dated · batch partly dated (undated tail, in source order) · batch undated (source order, unchanged from today) · open range (`2019-now`) · a bare month (`March`, undated → tail) · a second run onto a non-empty list (sorted batch appended) · one-card list (both move buttons disabled) · first / last card (one button disabled) · reduced motion (no motion is added; nothing to respect) · document / review mode (`useIsDocument` — `RepeatableBlock` already returns its `DocTag` form and prints no controls; unchanged).

**Failure / edge states (named):** a year like `2018/2019` → 2019 · `Fall 2020 – Spring 2021` → 2021 · `1999–present` → current year + ½, above a bare current year · a title containing digits (`2001: A Space Odyssey` in `title`, not `year`) — irrelevant, only the date field is read · `year` = `"c. 2005"` → 2005 · a five-digit run (`20180`) → no match, undated · the roster (`people`) — never dated, order preserved, but gains the move buttons like every other block.

## Non-negotiables (this slice)

- **Never re-sort an array the client already holds.** Only arriving batches and the display-only TopFive rows.
- **No durable-track behaviour change.** `reorderable` defaults off; `yarn verify:tracks --document` is byte-identical; `git diff --stat app/websites/intake/_components/steps/` is empty.
- **No prompt change.** The extractor's instructions are untouched; ordering is deterministic code, not a model preference.
- **The move buttons are text, always rendered, keyboard-reachable, with an `aria-live` announcement** — `TopFive`'s existing bar, not a new one.
- **No new strings outside the two button labels and the announcement pattern already in `top-five.tsx`.** Reuse them verbatim.

## Data

**Schema changes: none.** The arrays are already ordered; this slice writes them in a different order. **Tables:** none directly (`engagements.answers` through the existing autosave and `commitIngestion` paths). **Placement:** `lib/intake/entry-order.ts` (new, pure) · `scripts/verify-track-cartridge.ts` (the cases in criterion 1) · `app/websites/coded/intake/_components/extraction-block.tsx` · `lib/intake/ingestion-record.ts` (`mergeIngestion`) · `app/websites/intake/_components/repeatable-block.tsx` (`reorderable`, `keyOf`, the two buttons, the live region) · `app/websites/coded/intake/_components/steps/step-work.tsx`, `step-experience.tsx`, `step-about.tsx` (pass `reorderable` and `keyOf`) · `app/websites/coded/intake/_components/top-five.tsx` (candidate order). `RankButton` moves out of `top-five.tsx` into a small shared file under `app/websites/intake/_components/` so both blocks import one — Forge's "fix the pattern at the pattern".

## Accessibility

Two new buttons per card, each with `aria-label="Move {title} up/down"` as `TopFive` already does; disabled states are real `disabled` attributes, not styling. The live region is one `<p aria-live="polite" class="sr-only">` per block. Target size: the existing `RankButton` padding is the taste step's accepted floor; at 375px the header row wraps rather than truncating (verify).

## Acceptance criteria (observable)

1. ✅ **`yarn verify:tracks` — `entry-order.ts`:** `yearOf` returns `2018` for `"2018"`, `2021` for `"Fall 2020 – Spring 2021"`, `2019` for `"2018/2019"`, current-year-plus-half for `"2019-now"` and `"1999–present"`, `null` for `"March"`, `""`, `undefined`, and `"20180"`. `sortNewestFirst` on `[{y:"2018"},{y:"2026"},{y:"March"},{y:"2020"},{y:""}]` yields `2026, 2020, 2018, March, ""` and is stable for equal keys.
2. ✅ **Fast way:** a step-4 paste whose entries read 2018, 2018, 2020, 2019, 2026, 2025 (Taylor's screenshot) lands as 2026, 2025, 2020, 2019, 2018, 2018 — walked live against the real extractor with Taylor's own six project titles; exact match. **Step 3 (experience) with `when`: verified by code path only** (identical `sortNewestFirst` call, same `dateOf`), not walked live in this session.
3. **Append law:** not exercised live this session (would need a second paste run on a partly-filled step) — verified by code: `extraction-block.tsx` sorts only `result.entries` before the caller's own append.
4. **Ingest run:** not exercised live this session (needs a fresh engagement's step-1 paste) — verified by code: `mergeIngestion` sorts `batch.entries` (the incoming set only) before minting keys and concatenating after `kept`.
5. ✅ **Reorder:** walked live on step 4 — Move down on the top card swapped it with the second, the index chrome renumbered, the live region read "Moved to position 2 of 6.", and **the new order survived a full page reload** (autosave). Walked by click, not by Tab+Enter specifically, and not at 375px. **Step 3, the roster, and the offerings/pieces/services/asks blocks: verified by code** (identical prop wiring), not walked live.
6. **TopFive:** verified by code and by the live walk's page text (six rows rendered date-sorted; the picked-list mechanics are untouched code). Ticking behaviour and the "Untitled project N" agreement not exercised by click in this session.
7. ✅ **Durable:** `yarn verify:tracks --document` diffed byte-for-byte identical, pre- and post-change. The durable services step was not opened in a browser this session; `git status` confirms no durable file changed.
8. ✅ `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Make the change easy first: (a) extract `RankButton` and key `RepeatableBlock` cards by `keyOf` — behaviour-preserving, commit one; (b) add `reorderable` and the helper — commit two. Mixed diffs hide the durable regression.
- `mergeIngestion` runs server-side inside a `FOR UPDATE` transaction (`commitIngestion`); the helper is pure and cheap, so it belongs there, not in the extraction service — the service returns what the model said, and the merge decides how it lands.
- `TopFive`'s `titleFor` uses `projects.indexOf(project)` for the untitled number; keep that after sorting so the numbers agree with the cards.
- The current-year read happens once per sort call, not per comparison.

## Dev's call

Whether the roster (`step-about.tsx` people) gets `reorderable` in this slice or is left for the next pass — it is a five-line addition and Taylor's ask was "these", so the default is yes.

## Out of scope

- **A "Sort by date" button for an existing list.** Taylor may want it; it is a re-sort of held answers and needs its own ruling against D-PORT-3. Not built here. · Drag-and-drop. · Prompt changes. · Any durable-track surface. · Sorting the printed intake document independently of the stored order (the document prints what is stored; that is the contract).

## Depends on

- **No slice dependencies.** PORT-5, PORT-6, PORT-17, PORT-18, PORT-19 are Complete. PORT-H5 is unrelated but should land first so criterion 5 can be walked with images on the cards.

## Recommended execution

**Sonnet, or Cursor composer.** One pure module with a test, one prop on a shared component, four call sites. The way to fail this is to sort the stored array on render (criterion 3 catches it) or to forget the durable default (criterion 7 catches it).

---

### Kickoff (paste into the session)

> Build **PORT-33 — entries arrive newest-first, and every coded list can be reordered** (attached spec). **Sort arriving batches only; add Move up / Move down behind a default-off prop; the durable track does not change.**
> Attach/read first, in order: this spec · `specs/README.md` · `app/websites/intake/_components/repeatable-block.tsx` · `app/websites/coded/intake/_components/top-five.tsx` · `extraction-block.tsx` · `lib/intake/ingestion-record.ts` (`mergeIngestion`) · `steps/step-work.tsx` and `steps/step-experience.tsx` · this folder's logs.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks --document` (diff against a pre-change capture).
