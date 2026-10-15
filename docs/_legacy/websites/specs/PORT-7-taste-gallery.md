# PORT-7 — Taste: the example-site gallery, favourites, and the drag-rank

**Epic:** PORT — portfolio intake · **Phase 2** · Size: L
**Slice type:** New interactive primitives (gallery card, favourites rank) on a long media-heavy screen. Risk class: the repo's known `next/image` sizing trap at scale, keyboard-inoperable drag, and anything out-dressing the CTA.

**Status:** Complete (2026-08-26) — gallery, favourites, and drag-rank verified in a browser: every capture carries explicit dimensions and renders at the correct 16:10, below-fold captures lazy-load, reorder works by button with a polite announcement, and the ranked section is absent until the first favourite. No slider, no ring, no gradient on the step. Found and fixed silent write-loss on array answers (M-PORT-17). **Example sites are a labelled stub set — curation is Taylor's.**

> **Review note.** State three verifications explicitly: every gallery image renders at explicit pixel dimensions (the `w-auto` + `next/image` trap is a shipped bug in this repo — check first, not last); the rank list is fully operable with keyboard only and with drag disabled; and nothing on the step carries a ring or gradient beyond the step's own CTA.

---

## Outcome

The taste step works end to end against a labeled stub set: a gallery of example-site cards (screenshot strip, name, external visit link, favourite toggle, reveal-on-tap note), a ranked favourites list that appears with the first favourite and reorders by drag or by always-rendered move buttons, then the preference questions, the catch-all uploads, and the brain dump — all persisting as answer content through autosave. The example sets are typed TS content modules keyed by discipline, film first with a generic fallback, chosen by the engagement's flavour. Taylor's real curation drops in as content edits, no code.

## Why / intent

- **V2 doc step 5 (binding, verbatim)** — the intro ("This is how we skip the part where a designer shows you three drafts you don't like…"), the card actions and note placeholder ("What catches you — good or bad. A detail, a feeling, the type, the way it moves."), the rank instruction ("Drag your favourites into order, best first. Then tell us why — the why is worth more than the order."), the dark/light options with the film help line and its marked photography/art flavour, the stillness and density scales, "Three words the site should feel like" (`text × 3`), the never-feel-like line, the three catch-alls (images upload · "Links worth a look" · "The brain dump") and the close-a-tab question — every string.
- **Handoff decisions 6 + 7** — favourites toggle + reveal note + drag-to-rank with notes held open; **no rating sliders — the favourites flow replaced them deliberately**; example sites as typed TS (`content/intake-examples/<discipline>.ts`), 12–24 per discipline, Taylor curates, **build against a labeled stub set and say so**.
- **D-PORT-4 (UX scope §6.2)** — words not icons on the toggle; move buttons always rendered as the reorder floor; section absent (not empty) until the first favourite; no minimum, no cap; `aria-live` position announcements; reduced-motion collapses lift/settle.
- **Vesper's implementation notes (handoff)** — gallery screenshots lazy-load so the step doesn't pay for 24 sites up front; nothing on this step may out-shine the CTA.
- **What this slice is NOT (binding):** no lightbox, no rating numerals, no per-card ring; no real curated sites (stub set, honestly labeled `[PENDING — Taylor's curation]` in the content file header); no output rendering (PORT-8).
- **Ground truth:** ChoiceCards, FileDrop, autosave, `resolveFlavour` from PORT-1 — consumed, never rebuilt. `MediaLightbox.tsx` documents the fitted-size computation if needed for reference — but this step ships no lightbox.

**Rulings this slice makes (labelled, logged):**

- **Answer shape:** `taste.favourites` = ordered array of `{siteKey, note}` (order *is* rank); `taste.notes` = map for non-favourite card notes; sites referenced by the content module's stable `siteKey`. A site later removed from the content set renders in the rank list by its stored key with a dim "no longer in the gallery" marker rather than vanishing `[PROVISIONAL — cheap to change]`. Logged.
- **`ExampleSite` content contract:** `{ key, name, url, captures: [{src, width, height, alt}] }` — intrinsic dimensions required in the content file, which is what makes the sizing trap structurally impossible. Stub set: 6 film + 6 generic entries with placeholder captures at real 16:10 dimensions, header-commented as stubs. Logged.
- **The capture strip is a horizontally scrollable row inside the card** (first capture visible, others scroll; no lightbox, no autoplay) per UX scope §6.2. Logged.

## Experience & states

Gallery (one card per site, lazy below the fold) → ranked list (conditional) → preference radios → three-words trio (mono indices) → never-feel-like → uploads → links → brain dump → close-a-tab. Favourite toggle selected = ChoiceCard gold-border grammar, label flips to the `[COPY — new]` selected string (draft-marked). "Visit site" opens a new tab — autosave makes leaving safe.

**States (exhaustive):** card default · favourited · note-open (eased reveal, in place) · note-filled; rank list absent · 1 row · N rows · dragging (2px lift, gold hairline; reduced-motion: instant reflow) · keyboard-moving (announce "Moved to position N of M") · removing (returns the card to unfavourited, note preserved in `taste.notes`); uploads per §6.4; radios per ChoiceGroup.

**Failure / edge states (named):** capture asset 404 → card renders name + link with a quiet placeholder block, never a broken-image icon; zero favourites at completion → legitimate, surfaces in PORT-8's skipped inventory; drag on touch without long-press support → move buttons are always there (the floor is the feature); 24 cards on a throttled profile → lazy-loading keeps initial paint bounded (measure, state the number).

## Non-negotiables (this slice)

- **No rating sliders, no scores, no stars.** The favourites flow is the instrument.
- **Move buttons always rendered; drag is the enhancement.** Keyboard operability is the floor, not a mode.
- **Explicit pixel dimensions on every image** — the content contract enforces it; no `w-auto` sizing anywhere on this step.
- **Nothing out-dresses the CTA** — no ring, no gradient text, no gradient fills on cards or toggles.
- **V2 strings verbatim; the stub set is labeled a stub in the file it lives in.**

## Data

**Schema changes: none.** Favourites, notes, ranks, preferences — all answer content (the JSONB law).

**Tables:** `engagements` (answers merge) · `intake_files` (catch-all uploads, existing path).

**Placement:** `content/intake-examples/{film,generic}.ts` + capture assets under `public/intake-examples/` · `step-taste.tsx`, `example-card.tsx`, `favourites-rank.tsx` under the showcase `_components/` · `lib/validators/showcase-intake.ts` (taste schema) · labels file.

**Validators:** taste schema all-optional; favourites array unbounded; site keys as bounded strings (shape only — existence is a render concern, not a save gate).

## Accessibility

Toggle and note controls are real buttons with visible text (never icon-only); rank rows: drag handle labeled, `aria-live="polite"` on reorder, focus follows the moved row; capture strips scrollable by keyboard (`tabindex` + scroll snapping dev's call) with meaningful alt from the content file; radios keep fieldset/legend; the three-words trio is three labeled inputs, not one comma field; AA contrast on the dim "no longer in the gallery" marker.

## Acceptance criteria (observable — mobile primary; throttled network profile for 5)

1. The step renders every v2 field and string verbatim (diff), gallery populated from the film stub set on a film-discipline engagement and the generic set otherwise (flavour check both ways).
2. Favouriting three sites, noting two, and dragging a new order round-trips through autosave: DB answers show the ordered `{siteKey, note}` array; reload restores gallery toggles, notes, and rank order.
3. Keyboard-only pass: favourite a card, open and fill a note, reorder with move buttons, remove a favourite — no pointer, announcements verified.
4. Reduced motion: no lift/settle animation; reorders reflow instantly; note reveals collapse to instant.
5. Lazy loading: below-fold captures do not load on initial paint (network panel); every rendered capture has explicit width/height (DOM check — the repo trap, verified first).
6. A capture with a broken src renders the quiet placeholder; the card stays functional.
7. Rank section absent with zero favourites; appears with the first; removing the last removes it.
8. Negative: no slider/score/star anywhere; no ring on this step (grep); no gradient beyond the CTA; the stub files carry the `[PENDING — Taylor's curation]` header.
9. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Drag: prefer a small hand-rolled pointer-events implementation over adding a dnd dependency — the list is one-dimensional and the buttons already carry the semantics; a library is novelty budget spent on plumbing (M-INT-style boring-technology law). If a dependency is genuinely cheaper, it lands in TECHNICAL-DECISIONS with the alternative stated.
- `next/image` with the content file's intrinsic dimensions and `sizes` tuned for the 560px column; captures at 2x for retina.
- The selected-toggle string and the removed-site marker are `[COPY — new]` drafts — mark them for Taylor's pass like PORT-6's.

## Dev's call

Drag implementation details within the note above · capture strip scroll mechanics · stub imagery (solid-color placeholder frames are fine; no fake brand screenshots).

## Out of scope

- **Real curation and captures** — Taylor (TECH-SCOPE §10); dropping them in is content-only by construction.
- **Output rendering of taste answers** — PORT-8. **A lightbox** — deliberately none.

## Depends on

- **PORT-2** — StepShell, routes, autosave. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** Two new primitives with full a11y contracts on the step that carries the design signal for the entire deliverable; choosing down ships a drag list that keyboard users cannot rank and images at a third of their size — both invisible in a screenshot.

---

### Kickoff (paste into the session)

> Build **PORT-7 — Taste gallery** (attached spec). **No sliders; move buttons are the floor; explicit image dimensions everywhere; nothing out-dresses the CTA; stub set labeled a stub.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` step 5 (the copy source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §6.2, §9 · repo `CLAUDE.md` (the next/image trap) · `PORT-1` (flavour seam) · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
