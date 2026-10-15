# PORT-16 — Taste sets by pack, and the uncurated-absent state: no placeholder art ever reaches a client

**Epic:** PORT — coded (showcase) intake · **Phase 6** · Size: S
**Slice type:** Content-module reshape plus one absence. Risk class: a stub capture rendering for a real client; a client's stored favourite orphaned by a set change; an "empty" gallery instead of an absent one.
**Review:** Vesper — the absent state is an absence with one line, not an empty card grid.

**Status:** Complete (2026-09-01) — six sets, one file each with its own curation contract, all uncurated; the stub set and its six placeholder captures are deleted and nothing under `content/` or `public/` references them. The taste step renders the gallery and the favourites list only when a set is curated. Durable document byte-identical. **The render branch was not exercised in a browser** — no database in this session to mint an engagement; the data invariants are asserted and the branch is type-checked.

> **Review note.** State that `content/intake-examples/film.ts` no longer exists and no capture under `public/intake-examples/stub-*` is referenced; that a venture engagement's step 5 renders no `ExampleCard` and no favourites section; and that a seeded engagement with a stored favourite under a retired stub key still round-trips its `favourites` array unchanged.

---

## Outcome

The example-site gallery is keyed by pack. Until Taylor curates a set, the taste step renders without the gallery and the favourites list, showing one honest sentence in their place and collecting everything else on the step as before. The six invented placeholder sites are deleted, not kept as a set. When a curated set lands it is a content edit: one file per pack, the shape PORT-7 defined, and a `curated: true` flag.

## Why / intent

- **Audit B1** — both sets map to six placeholders whose header forbids shipping them. **Kinds scope §4 step 5, §5.6** — absent, not empty; the line. **D-PORT-12 `[PROPOSED]`** — sets keyed by pack; uncurated means absent.
- **PORT-7** — `ExampleSite` shape, capture dimensions law, favourites stored by `siteKey`; keys are stable and outlive the file. **M-PORT-17** — array answers and the updater.
- **What this slice is NOT (binding):** not curation (Taylor's, and the curation contract per set is recorded in each file's header); no change to the favourites primitive, the drag-rank, or the notes map; no discipline-specific sets beyond the existing film/generic split within portfolio.
- **Ground truth:** `content/intake-examples/index.ts`, `types.ts`, `film.ts` (to delete) · `step-taste.tsx` · `example-card.tsx`, `favourites-rank.tsx`.

**Rulings this slice makes (labelled, logged):**

- **`examplesFor(flavour, disciplines?)` returns `ExampleSet = { sites, curated }`.** (Mason.) Portfolio and studio refine by discipline as today (film set when exactly one discipline is film); every other flavour maps to its pack's set. Six files: `film.ts`, `generic.ts`, `practice.ts`, `entity.ts`, `venture.ts`, `service.ts`, each exporting an empty `sites` array and `curated: false` with the curation contract in its header. Logged.
- **A set with `curated: false` or zero sites renders the absent state.** Both conditions, because a curated set with zero sites is a content error and should not show an empty grid either. Logged.
- **Stored favourites are never touched by a set change.** A favourite whose `siteKey` is not in the current set is kept in the array and simply not rendered in the rank list; the document prints its key. This is D-PORT-11 at the gallery. Logged.
- **The stub captures under `public/intake-examples/` are deleted with the stub file.** They exist only to be looked at by a client, which the header forbids. Logged.

## Experience & states

**Absent state (every pack until curated):** step intro (v2, verbatim) → one dim line in flow: *"The example sites for this kind of build are still being chosen. Skip that part for now; everything below still counts, and we'll look at sites together on the call."* `[COPY — pending Taylor]` → dark-or-light → stillness → density → three words → never feel like → inspiration uploads → links → brain dump → close-tab. No `ExampleCard`, no favourites section, no ring, no placeholder image in the DOM.

**Curated state:** exactly PORT-7's step.

**States (exhaustive):** absent (uncurated or empty) · curated with zero favourites (favourites section absent, PORT-7 law) · curated with favourites. All other step states inherited.

**Failure / edge states (named):** a curated set whose capture lacks dimensions → a type error at build (existing contract); an engagement with favourites under stub keys → kept in the answers document, absent from the rank, printed by key in the document, listed by the done screen as answered (it was).

## Non-negotiables (this slice)

- **No placeholder site or capture reaches the DOM for any engagement.**
- **Absent, not empty:** zero `ExampleCard`s and no favourites section in the uncurated state; the line renders instead.
- **Stored favourites are never modified by this slice.**
- **The `ExampleSite` shape and the dimensions law are unchanged.**

## Data

**Schema changes: none.** **Tables:** none (answers unchanged).

**Placement:** `content/intake-examples/{film,generic,practice,entity,venture,service}.ts` · `index.ts` (`ExampleSet`, `examplesFor(flavour, disciplines)`) · `step-taste.tsx` (the absent branch) · `[token]/[step]/page.tsx` (pass `disciplines` alongside `flavour` for the portfolio/studio refinement) · delete `film.ts`'s stub contents and `public/intake-examples/stub-*.svg`.

**Validators:** none.

## Accessibility

The absent-state line is body text in flow, not a live region. No focus change. The step's heading structure is unchanged so the skipped-list grammar on the done screen still reads correctly.

## Acceptance criteria (observable)

1. A venture engagement's step 5 renders the intro, the absent line, and every non-gallery field; `document.querySelectorAll` for the card and rank components returns zero. *(Vesper.)*
2. A portfolio-film engagement's step 5 renders the same absent state (film is uncurated too), which is a change from today's stub gallery — stated explicitly in the closing report so nobody reads it as a regression.
3. A seeded engagement with `taste.favourites: [{ siteKey: "stub-film-1" }]` loads step 5 without error, saves another field, and its `favourites` array is byte-identical afterwards.
4. Flipping `venture.ts` to `curated: true` with one real-shaped site (dev-local, not committed) renders PORT-7's gallery with that one card; flipping back restores the absent state.
5. `content/intake-examples/film.ts` contains no stub; `public/intake-examples/` contains no `stub-*` file; grep the repo for `example.test` returns nothing.
6. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Keep the header text from the old `film.ts` (curation guidance) in every new set file; it is the contract Taylor curates against.
- The step already receives `flavour`; adding `disciplines` is one more prop from `readStepAnswers("about")`.

## Dev's call

Whether `curated` is a boolean or inferred from `sites.length > 0` plus an explicit flag (the ruling says both must hold) · file naming.

## Out of scope

- **Curating any set** — Taylor; venture first, then service and practice (kinds scope §10). **The dark-or-light help by pack** — PORT-15. **Any change to favourites, notes, or drag-rank** — PORT-7 owns them.

## Depends on

- **PORT-11** — `flavour` for the six packs. Complete in `PROGRESS.md` required. PORT-7 Complete.

## Recommended execution

**Sonnet.** A content-module reshape and one conditional branch. The only subtlety is criterion 3, and it is a negative test, not a design.

---

### Kickoff (paste into the session)

> Build **PORT-16 — Taste sets by pack** (attached spec). **No placeholder reaches the DOM; absent, not empty; stored favourites untouched.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §4 step 5, §5.6, D-PORT-12 · `content/intake-examples/*` · `step-taste.tsx` · `PORT-7` · this folder's logs.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
