# PORT-35 — Every upload can be removed, and a set of images can be put in order

**Epic:** PORT — coded (showcase) intake · **Phase 11 · touch-ups** · Size: M
**Slice type:** A missing capability on the shared `FileDrop` plus one schema column. Risk class: **a migration** (one-way door — Taylor runs it); an irreversible storage delete behind a six-second undo; the durable track shares the component and, unlike PORT-33/34, **gets both changes** — see the ruling.
**Review:** Taylor (migration 0016). Forge on `removeUpload`'s scoping.

**Status:** Code complete (2026-09-14) — **not runnable until migration `0016_yummy_bug.sql` is applied**; `listUploads` selects `position`. Taylor is running it himself. **Not walked in a browser**: no remove, undo, or reorder has been exercised against a live database yet. Mechanical: `tsc`, `lint`, `build:agent`, `verify:tracks` pass; the durable document is byte-identical.

> **Vigil — verification (after the migration, on staging).** Step 4, a project with three stills: Remove one → tile says "Removed. Undo" → wait seven seconds → the tile is gone, the object is gone from the bucket, the row is gone; Remove another → Undo within six seconds → it stays, and a reload still shows it. Drag a still by its grip from third to first; reload → still first; the admin engagement page and a rendered intake document list them in that order. Earlier / Later by keyboard. Step 8 portrait (single): Remove and Undo, no grip, no Earlier/Later. Step 7: remove a dropped voice note → its transcript block goes with it. Step 1: remove a document → the source list refreshes without it. Durable step "photos": Remove works; a reorder writes and reads back. 375px: three-column grid, the caption's three rows do not overflow.

---

## Outcome

Every file tile on both tracks has **Remove** — a quiet link, six seconds of undo, and only then the delete. Multi-file drops (project stills, behind the scenes, laurels, brand assets, inspiration, the durable photos and screenshots) can be put in order by dragging a grip on the picture or by **Earlier / Later**, and the order is written to the row, so `listUploads`, `linkUploads`, the admin engagement page, and the intake document all present the images the way the client arranged them. Single-file drops (portrait, headshot, logo, voice note) get Remove only.

## Root cause

`FileDrop` rendered tiles and nothing to do with them; `intake_files` had no order column, so every list and the document printed arrival order and nothing could change it (Taylor, 2026-09-14: "am I able to remove it? … can you also reorder the images? … should be included in the db schema").

## Every touchpoint (accounted for)

| Surface | Field(s) | Multiple | Gets |
|---|---|---|---|
| Coded step 1 · documents | `ingest_documents` | yes | Remove (refreshes the source list via `onRemoved`), order |
| Coded step 1 · roster headshot (`person-entry.tsx`) | `headshot` | no | Remove |
| Coded step 2 · documents (`document-drop.tsx`) | `documents` | yes | Remove, order |
| Coded step 4 · project stills / piece images | `project_images` · `piece_images` | yes | Remove, order (per entry) |
| Coded step 5 · inspiration | `inspiration` | yes | Remove, order |
| Coded step 7 · voice note drop | `voice_note` | no | Remove (the recorder drops its transcript block via `onRemoved` → `removed`) |
| Coded step 7 · writing | `writing` | yes | Remove, order |
| Coded step 8 · place · behind the scenes · laurels · brand assets | multiple | yes | Remove, order |
| Coded step 8 · portrait · logo | single | no | Remove |
| Durable · photos / reviews / voice steps | `logo` `brand_assets` `photos` `portrait` `review_screenshots` `voice_note` `screenshots` `writing` | per field | Remove; order where multiple |
| Step 9 home shortlist | stores file ids | — | a removed id stops rendering; the document already prints an unresolved tick as a marked line |
| Recorded voice note (`voice-recorder.tsx`'s own upload) | `voice_note` | — | appears in the drop's tile list on the next render and is removable there; the recorder itself has no delete (out of scope — "Record another" is its grammar) |

## Rulings (labelled, logged)

- **`intake_files.position integer not null default 0`**, assigned at issuance as `max(position)+1` among siblings (same engagement · field · entry, `IS NOT DISTINCT FROM` on the nullable key) inside the INSERT; rewritten dense on reorder. Reads order `position asc, created_at asc`, so rows from before the column keep arrival order. Migration `db/migrations/0016_yummy_bug.sql`. Logged.
- **Both tracks get Remove and order.** A durable client with the wrong logo is exactly as stuck. The durable *document* is unchanged unless someone reorders (verified byte-identical); this is the one shared-file change in the PORT-33…35 set that is deliberately not gated. `[Taylor: say so if the durable track should stay as it was; it is one `removable`/`sortable` prop away.]` Logged.
- **Remove waits six seconds, then deletes object then row.** Undo cancels the timer; nothing has happened on the server. Object already gone is not an error (a retried remove). Files that never reached the server just vanish. Logged.
- **Reorder sends the whole scope; the server ignores foreign ids and appends unlisted ones.** A stale tab cannot move what it should not know about; a newer upload from another tab is last, not lost. Logged.
- **Three new route shapes on `/api/intake/upload`: `confirm`, `remove`, `reorder`.** One endpoint, one token resolution, per-file JSON replies — the reason the route exists. Logged.
- **The grip sits on the picture; Earlier / Later are the keyboard floor.** Grid strategy (`rectSortingStrategy`); uploading tiles are not sortable until confirmed. Same dnd-kit `id={useId()}` fix as PORT-34. Logged.

## Non-negotiables

- **No delete before the undo window closes.** · **Scoped to the token's engagement** (`removeUpload`, `reorderUploads`). · **The storage path never reaches the client** (`listUploads` strips it). · **Migration is Taylor's to run; never edit it once applied.** · **`prefers-reduced-motion` drops the sortable transition.**

## Data

**Schema:** `intake_files.position` (0016). **Placement:** `db/schema/intake-files.ts` · `server/services/submission.ts` (`siblingsOf`, `nextPosition`, `FILE_ORDER`, `removeUpload`, `reorderUploads`; `listUploads`/`linkUploads` ordered) · `app/api/intake/upload/route.ts` · `app/websites/intake/_lib/upload-file.ts` (`removeIntakeFile`, `reorderIntakeFiles`) · `app/websites/intake/_components/file-drop.tsx` (rewritten around one ordered `tiles` list; `FileTile`; `onRemoved`) · `steps/step-ingest.tsx`, `steps/step-words.tsx`, `voice-recorder.tsx` (`removed`).

## Acceptance criteria

1. `yarn db:migrate` applies 0016; `select position from intake_files limit 1` works.
2. Remove → "Removed. Undo" → after 6s the tile, the object, and the row are gone; `onRemoved` fired.
3. Remove → Undo within 6s → nothing deleted; reload shows the file.
4. Drag or Earlier/Later on a three-still project persists across reload and is the order in `linkUploads` (admin page, document).
5. A single-file drop shows Remove and no order controls.
6. Step 7: removing a dropped note removes its transcript block; step 1: removing a document refreshes the source list.
7. Durable photos step: Remove and order work; `verify:tracks --document` byte-identical (it is).
8. `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` · `yarn verify:tracks` pass (they do).

## Out of scope

Deleting from the recorder's own card · reordering across entries · bulk remove · any change to the upload ladder.

## Depends on

PORT-34 (dnd-kit present). **Migration 0016 applied — Taylor.**
