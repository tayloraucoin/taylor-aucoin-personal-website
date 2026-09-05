# PORT-23 — The taste step rebuilt: grouped gallery, the pick block, your picks, the count, and the client's own sites

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: L
**Slice type:** The step's whole surface, rebuilt around one new primitive used three times. Risk class: a pick lost between Select and Save; a count that reads as a gate; a scale with a fabricated default; a note lost to a stray Escape or a page away; the `w-auto` image trap at 1512:982.
**Review:** **Vesper — the pick grammar, the counter, the accordion, the states (D-PORT-15/16, D-PORT-4 as amended). Mason — the footer slot and the array writes.**

**Status:** Complete (2026-09-04). Exercised in a browser at 375px against a temporary scratch route carrying a locally curated set — all six shipped sets are uncurated and there is no database in this session, so a real engagement was not reachable. Browser verification found two defects that unit checks would not have: the scale stuck at 1 under key repeat (the M-PORT-17 hazard in a new shape) and a hydration mismatch from entry-key-derived ids. Both fixed and re-verified. The scratch route, its generated captures, and the stale route types it left behind are deleted. **200% text scale was not separately exercised** — the step uses the same fixed-px type scale as every other step on the track and inherits its behaviour unchanged.

> **Vesper — state review.** Walk the matrix in `../CODED-INTAKE-TASTE-UX-SCOPE.md` §6 and §12 on a 375px viewport at 200% text scale: composing → picked → edit → cancel → remove → undo; the scale with no default; the counter yielding the slot at five; the references list opening composing by default. State that Continue was never disabled at any count.

---

## Outcome

A client opens the taste step and meets six closed groups with titles that are themselves a first reaction. Opening one shows the sites as full-width rows: the hero at MacBook aspect, the name, the host as a link that opens a new tab, the occupation line, the tags, and two buttons. Select turns the buttons into a seven-stop scale asking how close this is to what they want, a note asking what they like about it with a nudge to look past the home page, Save and Cancel. Saved, the row wears the selected grammar and shows the score and the first lines of the note with Edit and Remove. Below the gallery their picks are listed, with the ask stated once: five is the number. The footer counts picks on this step only and hands the slot back at five. Then the three words and the never-feel-like line, then their own sites as a list with the same scale and note, their saved images, and the brain dump last and largest. Continue works at every count. What this slice does not do: the See more overlay (PORT-24), the AI search (PORT-25), the motion notice (PORT-26).

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md`** — §2 the spine · §5 accordions and rows · §6 the pick grammar, the picked state, your picks, the count (D-PORT-16 **Ruled**: soft minimum, D-INT-4 held) · §8 three words · §10 references, images, brain dump · §12 responsive and accessibility · §13 the strings.
- **D-PORT-4 as amended (Ruled 2026-09-03)** — scale plus note replaces toggle plus rank. Words not icons, keyboard floor, section absent until the first pick all carry.
- **D-INT-4** — Continue is never disabled. **The count is information, not a gate.**
- **PORT-22** — `picksOf`, `hostOf`, the taxonomy, the validators, the labels. Consumed, never rebuilt.
- **M-PORT-17** — every array write uses the updater form.
- **What this slice is NOT (binding):** no overlay, no iframe, no search, no checkout, no drag, no move buttons, no rating default. The retired questions are removed from the step and nowhere else.
- **Ground truth:** `step-taste.tsx`, `example-card.tsx`, `favourites-rank.tsx` (the last two are deleted by this slice) · `app/websites/intake/_components/{step-shell,repeatable-block,text-field,field,file-drop,reveal,document}.tsx` · `app/websites/intake/_lib/save-state.tsx` (the provider pattern the footer count reuses) · `components/ui/GradientButton.tsx` · `[token]/done/page.tsx` · the admin question stack (document mode).

**Rulings this slice makes (labelled, logged):**

- **The footer count rides the save-state provider.** `SaveStateProvider` gains a `note` slot: `useReportFooterNote(node)` from a step body, `<FooterNote />` rendered by the page into `StepShell`'s new `footerNote` prop beside `saveSlot`. Same mechanism as the save indicator, so the shell stays a server component and no second context is invented. `[PROVISIONAL — Mason]`. Logged.
- **The pick block is one component, `PickBlock`, with a `mode: "row" | "reference"` prop** — `row` starts idle with Select (and, once PORT-24 lands, See more); `reference` starts composing. One component, one state machine, one copy source. Logged.
- **Retired questions are removed from the step, not from the schema** (PORT-22). The step never renders them; the document still prints stored answers. Logged.
- **The done screen's shortfall line is a separate list from the unanswered list.** `collectUnanswered` is about empty fields; "3 picked, 5 asked" is a non-empty answer with a stated ask. `tasteShortfall(engagement)` in `output.ts` returns the one line or null; the done page renders it under the same heading. Logged.

## Experience & states

Everything in the UX scope §5, §6, §8, §10, §12 is the spec. Summarised so the builder does not miss a state:

**Accordion (`TasteGroup`):** closed on arrival · open (eased reveal, reduced-motion instant) · several open at once · counts in the header (`N sites`, `N picked` in gold once ≥1) · document and preview modes render every group open.

**Row (`ExampleRow`):** capture (lazy below the fold, explicit dimensions, quiet placeholder on 404) · name · host link (`target="_blank" rel="noreferrer noopener"`) · role · tags (axes then styles, ≤ 2 lines) · buttons: Select, and a See more slot that PORT-24 fills (render Select alone until then — never a disabled See more).

**`PickBlock`:** idle → composing (scale with **no default**; note; Save; Cancel) → picked (`PICKED · n / 7` or dash; note excerpt or the empty-note line; Edit · Remove) → editing (composing with values; Cancel restores) → removed (six-second `Removed. Undo`, the repeatable block's mechanism). Save flushes autosave; typing does not; blur does. Escape never cancels a composing pick.

**Your picks (`YourPicks`):** absent until the first pick; the intro line stating five; compact rows in gallery order (index, name, score, excerpt, Edit → scrolls to and opens that row's composer, opening its group if closed).

**Footer count:** `PICKED · n OF 5` in the next-step slot, numerals gold, never coloured otherwise, announces only at five, yields to `Next · Media` after five is reached and saved; at < 400px yields to the save indicator's offline string.

**References (`ReferenceList`):** `RepeatableBlock` with URL field + `PickBlock mode="reference"`; Cancel on an entry with no URL removes it; entries with no URL are never saved.

**Images:** the existing `inspiration` `FileDrop`, unchanged. **Brain dump:** eight-row minimum, §13 help.

**Done screen:** under "We'll cover these on the call", the shortfall line when picks < 5 and the set is curated.

**Uncurated set:** the PORT-16 absent state holds exactly — no groups, no picks section, no count, the one line — and everything from three words down still renders.

**States (exhaustive):** per element above, plus hover (desktop) · active · focus-visible (2px gold) · disabled (none — nothing on this step disables except in preview, where Save still works locally per the autosave hook's preview I/O) · reduced-motion (accordion, reveal, and scale fill instant; undo still counts).

**Failure / edge states (named):** capture 404 → placeholder, row functional · a pick whose site left the set → shown in Your picks by key with the dim marker, editable, removable · rapid Select on two rows → both compose; saves are independent (updater form) · reload mid-compose → the unsaved composer is gone, the last saved state renders (the note field flushed on blur, so at most the keystrokes since the last blur are lost) · preview mode → everything works locally, nothing writes.

## Non-negotiables (this slice)

- **Continue is never disabled, at any count.** The count is a fact; the ask is stated once.
- **The scale has no default.** An untouched scale saves no score.
- **Escape never discards a note.** A stray key must not cost a sentence.
- **No ring, no gradient, no lift on any row, pick, or button.** Continue stays the brightest thing.
- **Explicit pixel dimensions on every capture.** `w-auto` nowhere on this step.
- **No count colours toward alarm; no "great progress"; no meter.**
- **Retired questions leave the step only.** The schema and the document are PORT-22's and are not touched here.

## Data

**Schema changes: none.**

**Tables:** `engagements` (answers via the existing autosave action).

**Placement** (`app/websites/coded/intake/_components/`): `steps/step-taste.tsx` (rewritten) · `taste/taste-group.tsx` · `taste/example-row.tsx` · `taste/pick-block.tsx` · `taste/pick-scale.tsx` · `taste/your-picks.tsx` · `taste/reference-list.tsx` · delete `example-card.tsx`, `favourites-rank.tsx` · `app/websites/intake/_lib/save-state.tsx` (the note slot) · `app/websites/intake/_components/step-shell.tsx` (`footerNote` prop; durable pages pass nothing) · `[token]/[step]/page.tsx` (renders `<FooterNote />`) · `[token]/done/page.tsx` + `server/services/output.ts` (`tasteShortfall`). A `taste/` subfolder because seven files share one step and nothing else imports them.

**Validators:** PORT-22's. None added.

## Accessibility

Accordion headers are `button`s with `aria-expanded` and a 56px minimum height. The scale is one `role="slider"` (`aria-valuemin/max/now/valuetext`, arrow keys, Home/End) with seven 44px stops that also take a tap. Every button has words. Picks announce on save (`"Picked {name}, 5 of 7"`); the count announces only at five. The empty-note line is text, not a live region. Capture alt from the content file. Focus after Remove goes to the row's Select; after Undo, back to Edit. 375px and 200% text scale are the acceptance conditions, not a follow-up.

## Acceptance criteria (observable — mobile primary, 375px and 200% text scale throughout)

1. On a dev-local curated film set of at least eight sites across three groups, the step renders the groups closed; opening one shows rows with capture, name, host link opening a new tab with `rel="noreferrer noopener"`, role, and tags in the scope's order.
2. Select → composing with an unselected scale; Save with no score and no note stores `{ siteKey }` only; Save with 5 and a note stores `{ siteKey, score: 5, note }`; reload restores the picked state and the group count.
3. Edit restores the values; Cancel while editing restores the prior score and note; Remove shows the undo line for six seconds and Undo restores the pick with its note.
4. Two rows composed and saved within one tick both persist (M-PORT-17 updater).
5. The footer reads `PICKED · 3 OF 5` at three, announces once at five, then shows `Next · Media`; Continue navigates at zero, three, and five. *(Vesper.)*
6. Your picks is absent at zero, appears at one, lists in gallery order with scores, and its Edit opens the right row's composer with its group open.
7. A reference entry with a URL and a score round-trips; one with no URL is not written; a pasted `juliarossetti.com` saves normalised with a scheme.
8. Keyboard-only pass: open a group, tab to Select, set 4 with arrow keys, type a note, Save, Edit, Remove, Undo — no pointer.
9. Reduced motion: no transition on the accordion, the composer reveal, or the scale fill.
10. Escape pressed inside a composing note changes nothing.
11. Uncurated set: no group, no count, no picks section; three words onward render. Document mode in the admin question review prints every group open, the pick block once as prose, and no overlay.
12. The done screen shows `Example sites: 3 picked (we asked for 5)` at three and nothing at five.
13. Negative: `grep` finds no ring, no gradient class, no `w-auto` on the step; the retired five labels appear nowhere on the step; `example-card.tsx` and `favourites-rank.tsx` are gone.
14. Durable track: `/websites/intake` step pages render unchanged with the new `StepShell` prop absent.
15. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint`, `yarn verify:tracks` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The dev-local curated set for verification must not be committed (PORT-16 law); use real 1512:982 captures of any public site, or solid frames at the right dimensions, and say which in the closing report.
- `useReportFooterNote` should accept a `ReactNode | null` and clear on unmount, or the count survives into the next step.
- Scroll-to-and-open from Your picks: a `Map<siteKey, { open(): void; focus(): void }>` registered by rows is enough; no global store.
- The scale's "warm the stops below" fill is `--color-c2` at the ghost-line alpha already used for hover borders; no new colour.

## Dev's call

Component internals · the scale's DOM (seven buttons inside a slider role vs. a real `<input type="range">` with a custom track — either is acceptable if it has no default, 44px stops, and the value text) · how rows register with Your picks · the accordion's open-state store.

## Out of scope

- **See more and the overlay** — PORT-24 (this slice leaves a slot).
- **Find more like it** — PORT-25 (this slice leaves the section absent, not stubbed).
- **The motion notice and its checkout** — PORT-26. Until then the existing `UpsellQuestions` block for animations stays where the notice will go, so buyers keep their questions.
- **Captures, curation, the capture script** — Taylor and PORT-27.
- **The public sales page's "Ranking" line** — the marketing thread.

## Depends on

- **PORT-22** — the contract, `picksOf`, `hostOf`, the taxonomy, labels, `tasteShortfall`'s inputs. Complete in `PROGRESS.md` required.

## Recommended execution

**Opus, do not choose down.** This is the step that carries the design signal for the whole deliverable, rebuilt around a primitive with a real state machine and a footer that must read as information and never as a gate. A cheaper model gives the scale a default of four, disables Continue at three "because the spec says five," and ships both invisible in a screenshot.

---

### Kickoff (paste into the session)

> Build **PORT-23 — The taste step rebuilt** (attached spec). **Continue never disables; the scale has no default; Escape never loses a note; nothing out-dresses Continue; explicit image dimensions everywhere.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §2, §5, §6, §8, §10, §12, §13 · `PORT-22` (consume, don't rebuild) · `step-taste.tsx` as it stands · `app/websites/intake/_lib/save-state.tsx` and `step-shell.tsx` · `repeatable-block.tsx`, `reveal.tsx`, `document.tsx` · repo `CLAUDE.md` (the `next/image` trap) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Leave a See more slot and no search section; keep the animations `UpsellQuestions` in place for PORT-26. Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint` + `yarn verify:tracks`.
