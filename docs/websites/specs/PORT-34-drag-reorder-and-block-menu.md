# PORT-34 — Drag to reorder, and a block menu with "Sort by date" and "Remove duplicates"

**Epic:** PORT — coded (showcase) intake · **Phase 11 · touch-ups** · Size: M
**Slice type:** Two new interaction surfaces on the shared `RepeatableBlock`, both borrowed from Conscious Connections, both behind props that default off. Risk class: **four new dependencies** in a folder whose README says "no new dependency beyond `lucide-react`"; a re-sort of held answers, which D-PORT-3 has so far forbidden; the durable track shares the component.
**Review:** Taylor (the dependency question below is a one-way door; nothing here proceeds until it is answered). Forge on the dedupe weight (files must win).

**Status:** Complete (2026-09-14). Taylor approved the four dependencies the same day; pinned exactly (`@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2`, `@radix-ui/react-dropdown-menu@2.1.24`), `yarn add --exact`, no `package-lock.json`. Walked on Taylor's own engagement (34 projects) against the agent dev server: **pointer drag** moved a card, announced, renumbered, autosaved, kept focus on the moved card's grip; **keyboard drag** (Space · arrow · Space, dispatched as real `KeyboardEvent`s with `code`) moved a card once and was flaky on later attempts under synthetic events — hands-on keyboard check still wanted; the Move up / Move down buttons remain the guaranteed floor. **Sort by date** re-sorted the 34 and persisted. **Remove duplicates** collapsed a typed duplicate (the richer, pre-existing copy survived), the menu closed, "Removed 1 duplicate." announced, **Undo** restored it; a second removal persisted through a reload. Dark theme checked. Two fixes found on the walk and shipped: `DndContext` needs `id={useId()}` or dnd-kit's `aria-describedby` counter hydrates differently on server and client; dnd-kit's default announcements read the twelve-character entry keys aloud, replaced with position-based sentences. **Not walked:** 375px, reduced motion (code: the sortable transition is dropped under `useReducedMotion`), the roster and experience blocks (identical wiring), a copy with images winning a dedupe in the browser (covered by a `verify:tracks` case; no project on the engagement holds images yet). Durable: `verify:tracks --document` byte-identical; no durable step file in the diff.

> **Vigil — verification.** Runtime, on step 4 with a list of six: drag a card by its handle with a mouse; move one with the keyboard (Space, arrow, Space) using the same handle; open the block menu, Sort by date, confirm the order and the persisted answer; Remove duplicates on a list that has them, confirm the richest copy and the one with images survive, confirm the six-second undo restores all of them; 375px, both themes, reduced motion. Then the durable services step — no handle, no menu — and `verify:tracks --document` unchanged.

---

## Outcome

A client puts a project where they want it by dragging its handle — or, on a phone or a keyboard, with the Move up / Move down they already have. Each repeatable block on the coded track gains a small ⋮ menu beside its heading with two actions: **Sort by date, newest first**, which does to the whole list what the fast way does to an arriving batch; and **Remove duplicates**, which collapses every group of same-name-same-date entries to its richest copy, with the same six-second undo a single Remove has. Running "Sort this for me" twice already adds nothing new since PORT-33's follow-up (`entry-merge.ts`); this is the cleanup for lists that were doubled before that landed — Taylor's own has 76 projects where there are 34. Nothing here changes the durable track, the answers document's shape, or the extractor.

## Why / intent

- **Taylor, 2026-09-14:** "I thought it would reorder, but it added them twice. how do I clean up duplicates? ellipses menu (see CC repo) and remove duplicates option?" and "drag n drop — what have we used in Conscious Connections?"
- **The CC precedents, read 2026-09-14** (`/Users/taylor/lighthouse/conscious-connections/conscious-connections`):
  - **Drag:** `@dnd-kit/core` `^6.3.1` · `@dnd-kit/sortable` `^10.0.0` · `@dnd-kit/utilities` `^3.2.2` — `packages/ui/src/composed/control/repeatable-list/repeatable-list.tsx` (`reorderable` prop, off by default; a `GripVertical` handle button carrying `attributes`/`listeners`; `PointerSensor` + `KeyboardSensor` with `sortableKeyboardCoordinates`; `verticalListSortingStrategy`; `arrayMove` on drag end; `CSS.Transform.toString(transform)`; `touch-none` on the handle). Also `ranked-list.tsx`, `grounding-photo-tiles.tsx`.
  - **Menu:** `packages/ui/src/composed/control/ellipses-menu/ellipses-menu.tsx` — a Radix `DropdownMenu` (`@radix-ui/react-dropdown-menu`) with a `MoreVertical` trigger, `align="end"`, items as `{ label, onClick, disabled, variant?: "destructive" }`, `stopPropagation` on the trigger.
- **D-PORT-4** (keyboard floor; controls always rendered) — the drag handle is *additional* to Move up / Move down, never a replacement. dnd-kit's `KeyboardSensor` makes the handle itself keyboard-operable, but the text buttons stay because they are discoverable and the handle's keyboard grammar is not.
- **D-PORT-3 (nothing extracted is fact until seen) and the append law** — a re-sort of held answers is a change the client did not make, *unless the client asks for it*. A menu item the client presses is the client asking. That is the ruling this slice needs Taylor to confirm; see below.
- **What this slice is NOT (binding):** not an automatic re-sort on any event; not a change to `mergeIncomingEntries`; not drag on the durable track; not a menu on the durable track; not drag on the taste step's references or the per-project video list (out of the named scope; a later ticket if wanted).
- **Ground truth:** `app/websites/intake/_components/repeatable-block.tsx` (`reorderable`, `keyOf`, `move`, the undo timer) · `app/websites/intake/_components/rank-button.tsx` · `lib/intake/entry-order.ts` (`sortNewestFirst`) · `lib/intake/entry-merge.ts` (`dedupeEntries`, `entryIdentity`, `entryDate`) · `app/websites/coded/intake/_components/steps/step-work.tsx` (`projectFiles`, `pieceFiles` — the files a dedupe weight must see) · this repo already carries `@radix-ui/react-dialog` and `@radix-ui/react-select`, so a Radix dropdown is the house pattern, not a new one.

**Rulings this slice makes (labelled, logged):**

- **Dependencies, pinned exactly, matching CC's majors:** `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2`, `@radix-ui/react-dropdown-menu@2.1.24`. **Approved by Taylor 2026-09-14.** This amends the folder README's "no new dependency beyond `lucide-react`" for these four; both are the Conscious Connections precedent, and Radix was already the house pattern here for dialog and select.
- **The handle is a button, in the card header, before the index chrome.** `GripVertical` from `lucide-react`, 44px hit area, `touch-none`, `cursor-grab`, `aria-label="Drag to reorder"`. On drag the card lifts (opacity 0.6, as CC), the transform is the library's; **`prefers-reduced-motion` drops the transition** — the card still moves, it does not animate. Logged.
- **Drag end commits exactly as a Move does:** `onChange(arrayMove(blocks, from, to))`, plus the same `aria-live` sentence. One code path for "the order changed". Logged.
- **The menu sits in the block heading, not per card.** Both actions are list-level. `MoreVertical`, `aria-label="Actions for this list"`, `align="end"`; items in the house mono/tracked treatment, gold on focus, no destructive red (the palette has no red; "Remove duplicates" is not destructive — it has undo). Logged.
- **Sort by date, newest first — the whole list, through `sortNewestFirst(items, entryDate)`.** Undated entries keep their order at the tail. Disabled (and says why in its label) when fewer than two entries carry a readable year. **This is the one place the app re-sorts held answers, and only because the client pressed it.** Logged, and cited as the D-PORT-3 amendment.
- **Remove duplicates — `dedupeEntries(items, weight)` where `weight` counts filled fields plus a large bonus per attached file.** The copy with images always wins; ties go to the earliest (the one the client has had longest). Disabled when there are none, with the label saying so ("No duplicates"). The removed set goes into the same six-second undo the single Remove uses, restored as a group, in their original positions. Files keyed to a removed copy are **not** deleted — `intake_files` rows stay, the intake document still lists them; only the entry leaves the answers array. `[Forge: confirm the weight makes the filed copy win in every case the 9 differing groups in Taylor's engagement present.]` Logged.
- **Both props default off.** `RepeatableBlock` gains `draggable?: boolean` (requires `reorderable` and `keyOf`) and `actions?: "sort-and-dedupe"` (or an items array; dev's call). The four durable callers pass neither. Logged.

## Experience & states

**Drag.** A card header reads: `⠿  01   Move up · Move down · Remove`. Pointer: press the grip, drag, drop — the other cards part to make room (the library's default), the dropped card settles, the index chrome renumbers, the live region reads "Moved to position n of m." Keyboard: Tab to the grip, Space to lift, ↑/↓ to move, Space to drop — same outcome, same sentence. Touch: the grip is `touch-none`, so a drag from it does not scroll the page; a drag from anywhere else on the card still scrolls (the card is not the handle).

**Menu.** A ⋮ at the right of the block's `Field` label row. Click/Enter opens; Escape or outside-click closes; arrow keys move between the two items. Choosing an item closes the menu, applies the change, announces it ("Sorted, newest first." / "Removed n duplicates.") and, for Remove duplicates, shows the existing "Removed. Undo" line.

**States (exhaustive):** handle at rest · lifting · dragging · dropped · reduced motion · menu closed · open · Sort disabled (fewer than two dated) · Remove duplicates disabled (none) · undo window open · undo pressed · undo expired · document / review mode (`useIsDocument` — neither the handle nor the menu prints; the `DocTag` form is unchanged).

**Failure / edge states (named):** a drag that ends where it started → no `onChange`, no announcement · a drag cancelled with Escape → returns to origin · two duplicates where one has images and the other has the client's edits → the filed one survives, and its `MachineFilledEntry` mark stays whatever it was · a list of one → handle rendered, inert; both menu items disabled · Sort on a list that is already sorted → no `onChange`, announcement still reads "Sorted, newest first."

## Non-negotiables (this slice)

- **Nothing re-sorts without a press.** No sort on mount, on save, on kind change, on a second extraction run.
- **Move up / Move down stay.** The handle is in addition.
- **Undo covers every entry Remove duplicates took**, restored as a group.
- **No file row is deleted by any action here.**
- **The durable track is untouched**: no handle, no menu, `verify:tracks --document` byte-identical, no durable step file in the diff.
- **`prefers-reduced-motion` is respected** on the drag transition.
- **Pinned versions, `yarn add --exact`.** Never `npm`.

## Data

**Schema changes: none.** **Tables:** none directly (`engagements.answers` via autosave). **Placement:** `app/websites/intake/_components/repeatable-block.tsx` (`draggable`, `actions`, the sortable wrapper, the menu) · `app/websites/intake/_components/block-menu.tsx` (new — the Radix dropdown, house-styled; the closest thing to CC's `EllipsesMenu`) · `app/websites/intake/_components/drag-handle.tsx` (new) · `lib/intake/entry-merge.ts` (`dedupeEntries` already takes `weight`; no change unless Forge's check finds one) · `steps/step-work.tsx`, `step-experience.tsx`, `step-about.tsx` (pass the two props; step-work passes a `weight` built from `projectFiles`/`pieceFiles`) · `package.json` (four pinned additions) · `scripts/verify-track-cartridge.ts` (a `weight` case: the filed copy wins over the richer unfiled one).

## Accessibility

The grip is a real `<button>` with an accessible name and dnd-kit's `aria-describedby` instructions; the menu is Radix's (roving focus, Escape, typeahead). Both announce through the block's existing live region. Target sizes: grip 44px; menu trigger 44px. Colour: dim → gold, never red.

## Acceptance criteria (observable)

1. `package.json` carries the four dependencies, pinned; `yarn.lock` updated; no `package-lock.json`.
2. On step 4, dragging card 6's grip above card 1 makes it card 1; the index chrome renumbers; the live region announced; a reload shows the order persisted.
3. Keyboard: Tab to a grip, Space, ↓, Space → the card is one lower; same announcement.
4. `prefers-reduced-motion: reduce` → the drop is instant, no transition.
5. Menu → Sort by date on a list of `2018, 2026, March, 2020` → `2026, 2020, 2018, March`; persisted after reload.
6. Menu → Remove duplicates on Taylor's 76-row list → 34 rows; every surviving row is the richest of its group; every row that had images still has them; Undo within six seconds restores all 76 in their original positions.
7. Menu items disabled with a stating label when they would do nothing.
8. Durable services step: no grip, no ⋮; `yarn verify:tracks --document` byte-identical; `git diff --stat app/websites/intake/_components/steps/` empty.
9. `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` · `yarn verify:tracks` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Wrap the card list in `DndContext` + `SortableContext` only when `draggable`; the durable render path must not mount dnd-kit at all (bundle and behaviour).
- `useSortable({ id: keyOf(item), disabled: !draggable })` per card; the existing `key={keyOf(item)}` is what makes this work.
- The menu's `onClick` must `preventDefault` + `stopPropagation` like CC's, or the block's `Field` label will steal the click.
- `dedupeEntries`'s `weight` for step-work: `richness(entry) + 1000 * filesFor(entry.entryKey).length`.
- The "Removed. Undo" line currently holds one `{ item, index }`; widen it to an array of them.

## Dev's call

Whether `actions` is a fixed enum or an items array like CC's `EllipsesMenuItem[]`. Whether the grip renders on a one-card list (spec says yes, inert, for consistency).

## Out of scope

- Drag on the taste references, the per-project video list, or the roster's roles list. · Deleting file rows. · Any automatic re-sort. · The durable track.

## Depends on

- **Taylor's dependency ruling (above).** PORT-33 Complete. The `entry-merge.ts` follow-up (dedupe on append, thumbnails on return) Complete 2026-09-14.

## Recommended execution

**Opus, or Sonnet with the CC files attached.** The library does the hard part; the way to fail this is to mount dnd-kit on the durable path (criterion 8) or to let Sort run on its own (non-negotiable 1).

---

### Kickoff (paste into the session)

> Build **PORT-34 — drag to reorder, and a block menu** (attached spec). **Both behind default-off props; the durable track does not change; nothing re-sorts without a press.**
> Attach/read first, in order: this spec · `specs/README.md` · `repeatable-block.tsx` · `lib/intake/entry-merge.ts` · CC's `repeatable-list.tsx` and `ellipses-menu.tsx` · this folder's logs.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks --document` (diff against a pre-change capture).
