# PORT-22 — Taste contract: the taxonomy, the site shape, the pick shape, and what the retired questions leave behind

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: M
**Slice type:** Content contract and answer contract, no surface. Risk class: a stored answer under a retired key erased by the shape guard on the client's next save; a legacy favourite silently dropped from the document; a schema-derived inventory proposing into a question nobody is asked any more.
**Review:** **Mason — the answer shape and the legacy read (M-PORT-35). Vesper — the taxonomy vocabularies are hers (D-PORT-15) and are copied, not edited.**

**Status:** Complete (2026-09-04). Every acceptance criterion exercised without a database — both the read and the write path filter through `stepTasteSchema`, so the round trip is provable by composing them, which isolates the guard more sharply than exercising Drizzle's JSONB merge would. The durable document is byte-identical, diffed against a reconstructed pre-change baseline (HEAD predates the uncommitted PORT-18/19/20 work, so HEAD is not the baseline). **All six sets remain uncurated** — this slice ships the shape, not the sites.

> **Mason — answer-loss review.** State three things about the run: that an engagement seeded with `taste.darkOrLight`, `taste.favourites`, and `taste.notes` under the old shape round-trips a save of another taste field with all three byte-identical afterwards; that `yarn eval:primer --inventory` reports no stale key and no retired key in any inventory; and that the durable document is byte-identical before and after.

---

## Outcome

The taste step's data has a new shape and the code around it agrees on that shape before any pixel changes. An example site carries its group, its role line, its three axis tags, up to three style tags, its build level, whether it embeds, when it was last checked, and captures at the MacBook aspect. A client's reactions are `picks` — a site key, a score from one to seven, a note — and their own links are `references` with the same score and note. The five retired questions stay in the schema so nothing already answered is lost, and stop appearing anywhere a client or a machine is asked for them. The intake document prints picks with the site's name, host, score, note, and the build level Taylor curates against; a favourite stored under the old shape prints as an unscored pick. Nothing on any screen changes in this slice: the taste step still renders PORT-7's gallery until PORT-23 replaces it.

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md` §4 (D-PORT-15, provisional — build against)** — the six groups, the three axes, the closed style vocabulary, `role`, `build`, `embed`, `checkedOn`. §16 — the proposed answer shape. §3 — what persists and what goes.
- **D-PORT-4 as amended (Ruled, Taylor 2026-09-03)** — the seven-stop scale is a weight on a why, not a rating in place of one; the drag-rank retires. The README's "no rating sliders" line is amended in this batch (see `DEVIATIONS.md`).
- **M-PORT-17** — array answers are written through the updater form; both new arrays inherit it.
- **PORT-19's `videosOf` pattern** — a legacy answer shape is *derived at read, never written back*. `favourites` → unscored picks follows it exactly.
- **What this slice is NOT (binding):** no change to any step component, no capture assets, no curation, no search service, no checkout. Contract only.
- **Ground truth:** `content/intake-examples/types.ts` + six set files (all uncurated) · `lib/validators/showcase-intake.ts` `stepTasteSchema` · `lib/intake/showcase-answer-labels.ts` · `server/services/output.ts` (`renderValue`, `resolveShowcaseKeys`, `showcaseFlags`, `collectUnanswered`) · `lib/intake/tracks.ts` (`fieldKeysFor`, `textFieldKeysFor`) · the primer's exclusion map and `staleIngestionKeys()` · `scripts/verify-track-cartridge.ts` § PORT-16.

**Rulings this slice makes (labelled, logged):**

- **Retired keys stay in the schema.** `darkOrLight`, `stillness`, `density`, `linksWorthALook`, `closeTab` remain on `stepTasteSchema`, grouped under a `/* retired 2026-09-03 */` comment, because the schema is the shape guard and removing a key erases its stored answer on the next save. They are listed once in `RETIRED_TASTE_KEYS` beside the labels, and `collectUnanswered`, the primer's inventory, and the ingestion inventory exclude that set. `M-PORT-35`. Logged.
- **`favourites` is read, never migrated.** `picksOf(taste)` in `lib/intake/taste-picks.ts` returns `picks` when present, else derives unscored picks from `favourites` carrying each note. Nothing writes the derivation back; the first time the client saves a pick, `picks` is written and `favourites` is left in place untouched. `notes` (the old unfavourited-note map) is never migrated and keeps printing under its existing label. Logged.
- **Search results are not stored.** Only what the client keeps reaches the answers document: a result they add becomes a reference with `source: "search"`. What the machine offered and they declined is not an answer. `[REVISIT — if Taylor asks to see what was suggested]`. Logged.
- **`build` prints in the document, never on the client's screen.** Vesper's §15 item 3, taken on her recommendation. Logged.

## Behavior & states

**No surface.** Described by the shapes below and by what the document prints.

**The content contract** (`content/intake-examples/types.ts`):

```ts
export type ExampleGroup = "dark-cinematic" | "light-editorial" | "type-first" | "warm-textured" | "stills-credits" | "statement";
export type GroundTag = "dark" | "light" | "warm";
export type MotionTag = "still" | "quiet" | "alive";
export type DensityTag = "sparse" | "balanced" | "dense";
export type StyleTag = /* the closed list, UX scope §4.3, verbatim */;
export type BuildLevel = "template" | "designer" | "custom";

export type ExampleSite = {
  key: string;            // stable, outlives the file (PORT-7 law)
  name: string;
  url: string;            // the host is derived at render, never stored twice
  role: string;           // "Cinematographer · commercials, music video"
  group: ExampleGroup;
  axes: { ground: GroundTag; motion: MotionTag; density: DensityTag };
  styles: readonly StyleTag[];   // at most three — enforced by verify:tracks, not the type
  build: BuildLevel;      // document only
  embed: boolean;         // true only when Taylor has seen it frame (D-PORT-17)
  checkedOn: string;      // ISO date the link was last verified live
  captures: readonly ExampleCapture[];  // [0] is 1512:982 at 2× — 3024 × 1964
};
```

Group titles, one-liners, axis and style display text live in `content/intake-examples/taxonomy.ts` as data keyed by the union values — the one home the accordion headers, the row tags, and the document all read. Strings are Vesper's §13 rows, `[COPY — draft]`-marked in the file.

**The answer contract** (`lib/validators/showcase-intake.ts`):

```ts
const score = z.number().int().min(1).max(7).optional();
picks: z.array(z.object({ siteKey: z.string(), score, note: text })).optional(),
references: z.array(z.object({
  entryKey: z.string(), url: text, score, note: text,
  source: z.enum(["typed", "search"]).optional(),
})).optional(),
styleBrief: text,
// unchanged: wordOne/Two/Three, neverFeelLike, brainDump, animation*
// legacy, read-only: favourites, notes
// retired 2026-09-03, kept for the shape guard: darkOrLight, stillness, density, linksWorthALook, closeTab
```

**What the document prints.** `resolveShowcaseKeys` gains a `taste` branch: each pick renders as `Name (host) — 5/7 — "note" · Dark and cinematic · dark · alive · balanced · template`; a pick whose key is no longer in the set prints its key with "no longer in the gallery"; a reference prints `host — 5/7 — "note" (found by search)` where marked. `showcaseFlags` replaces the favourites flag with two: no picks and no brain dump (as today, reworded), and fewer than five picks (`Only N example sites picked — five were asked for.`). `checkedOn` older than ninety days on a picked site adds one line naming it, so a dead link is known before the call.

**Labels** (`showcase-answer-labels.ts`): `picks: "Example sites picked"`, `score: "How close"`, `references: "Sites they found"`, `url: "Link"`, `styleBrief: "The style they described"`, `source` unlabelled (folded into the reference line). Retired keys keep their labels so old answers still print with words.

**Failure / edge states (named):** a pick with no score prints a dash, never `undefined` · a reference with no URL is skipped by the document and never saved by the step (PORT-23) · an engagement with both `picks` and `favourites` prints `picks` only (the derivation applies only when `picks` is absent) · a curated set whose site has four style tags fails `yarn verify:tracks`, not the build.

## Non-negotiables (this slice)

- **No stored answer is lost.** Retired keys stay in the schema; `favourites` and `notes` are never rewritten.
- **One home per vocabulary.** Group, axis, and style display text exist in `taxonomy.ts` and nowhere else.
- **`build` never reaches a client's screen.** It is a document field.
- **Every capture carries explicit intrinsic dimensions** (the repo trap; PORT-7 law) — the type stays required.
- **Durable document byte-identical.**

## Data

**Schema changes: none.** Answers are JSONB content.

**Tables:** `engagements` (answers, read at render — no write in this slice).

**Placement:** `content/intake-examples/types.ts` (widened) · `content/intake-examples/taxonomy.ts` (new) · six set files (header curation contract updated to the new shape and the 1512:982 capture) · `lib/validators/showcase-intake.ts` · `lib/intake/taste-picks.ts` (new; `picksOf`, `hostOf(url)`) · `lib/intake/showcase-answer-labels.ts` (labels + `RETIRED_TASTE_KEYS`) · `server/services/output.ts` · the primer exclusion map and the ingestion exclusion set (retired keys added; `staleIngestionKeys()` must stay clean) · `scripts/verify-track-cartridge.ts` (three-tag ceiling, capture aspect, `checkedOn` parse, `embed` boolean) · `scripts/eval-primer.ts` line ~255 (the `darkOrLight` fixture moves to a live text key, e.g. `brainDump`). Mason's call, recorded as M-PORT-35.

**Validators:** as above, in `showcase-intake.ts`. `hostOf` is a pure function, not a validator.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. A scratch engagement seeded with `taste: { darkOrLight: "deep", favourites: [{ siteKey: "x", note: "n" }], notes: { y: "m" } }` saves `wordOne` through the step's autosave action; afterwards all three original keys are byte-identical in the row. *(Mason.)*
2. `picksOf` on that engagement returns `[{ siteKey: "x", note: "n" }]` with no `score`; on an engagement with `picks` present it returns `picks` and ignores `favourites`.
3. `collectUnanswered` for a new coded engagement lists none of the five retired keys; `yarn eval:primer --inventory` prints no stale key and none of the five in any inventory.
4. The intake document for the seeded engagement prints the favourite as an unscored pick line, the old note under its old label, and `darkOrLight` under its old label.
5. A dev-local set flipped to `curated: true` with one site carrying every new field renders the document line in the shape above, `build` included; a site with four style tags or a first capture that is not 1512:982 (at any scale) fails `yarn verify:tracks` with a named reason.
6. `yarn verify:tracks`'s three durable-document checks pass unchanged.
7. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `hostOf` strips scheme and a leading `www.`; keep the path if there is one (`duranlevinson.com/hello/musicvideo` is the honest host for that entry).
- The 1512:982 check is a ratio with tolerance (`|w/h − 1512/982| < 0.01`), not an exact pixel match, so a 3024 × 1964 capture and a 1512 × 982 one both pass.
- The retired-key exclusion in `collectUnanswered` is one `filter`; resist a generic "hidden keys" abstraction until a second step retires something.

## Dev's call

The exact `taxonomy.ts` export shape · whether `hostOf` lives in `taste-picks.ts` or beside `videoRef` · the ninety-day staleness constant's name.

## Out of scope

- **Any screen** — PORT-23, PORT-24, PORT-25, PORT-26.
- **Captures and curation** — Taylor, with PORT-27's tooling.
- **The search service** — PORT-25.
- **The public sales page's "Ranking" line** (`content/websites-coded.ts:147` says "you put your favourites in order") — the marketing thread's file (M-PORT-7 locked scope); flagged to Taylor in this batch's report, not touched here.

## Depends on

- **PORT-16** — the six set files and `ExampleSet`. Complete in `PROGRESS.md`.
- **PORT-19** — `videosOf` as the derivation pattern; `resolveShowcaseKeys`. Complete.

## Recommended execution

**Opus.** The whole risk is the one line where a retired key leaves the schema and a stored answer leaves with it, silently, on a surface whose supreme law is that answers are never lost. A cheaper model deletes the five keys because the ticket says they are retired.

---

### Kickoff (paste into the session)

> Build **PORT-22 — Taste contract** (attached spec). **Retired keys stay in the schema; `favourites` is derived, never rewritten; one home per vocabulary; `build` never reaches a client.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §3, §4, §13, §16 · `content/intake-examples/types.ts` + `index.ts` · `lib/validators/showcase-intake.ts` § taste · `lib/intake/project-videos.ts` (the derivation pattern — reuse, don't fork) · `server/services/output.ts` (`resolveShowcaseKeys`, `showcaseFlags`, `collectUnanswered`) · `scripts/verify-track-cartridge.ts` § PORT-16 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (M-PORT-35).
> Nothing on any screen changes. Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks` + `yarn eval:primer --inventory`.
