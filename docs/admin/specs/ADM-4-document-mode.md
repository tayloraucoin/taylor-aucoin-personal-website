# ADM-4 — Intake questions: Document mode, the "Every kind" overview, and the pack diff

**Epic:** ADM — admin shell + intake review · **Phase 4** · Size: L
**Slice type:** A second render mode for the production intake primitives, plus two declaration wrappers around branches that already exist. Risks: a transcription of question copy creeping in; a change in behavior on the live client questionnaire.
**Review:** **Mason — the `Reveal` / `ForKinds` interface-mode branches and the `file-drop` id change.** Verification must state the DOM diff in §Acceptance 4 with its observed result, not a claim that it would pass.

**Status:** Complete (2026-09-02) · Markdown export added 2026-09-03

> **Mason — architecture review.** Reviewed and accepted 2026-09-02 with two
> conditions, both folded in: the client-route DOM check permits exactly two id
> attribute diffs and quotes them (§Acceptance 4), and the `file-drop` entry-key
> fix is its own commit logged in the PORT deviations (§Data).

---

## Outcome

Taylor opens `/admin/intake/questions`, flips one switch, and reads the whole
intake as a document — a Notion-style page in the site's own type, where every
step is a heading, every question is a heading with its help line beneath it,
and each question carries a `[Component Type]` tag and its field key. The words
are the client's words, because the page is still the production components;
they have simply been told to render as prose instead of as controls.

He flips a second switch to **Every kind** and reads the same document with its
branches annotated: questions every kind is asked carry no tag, and questions
only some kinds are asked carry a gold `asked of: studio · venture · business`
line. At the foot sits a derived list of every copy slot whose words change by
pack. That is the base-versus-unique overview he asked for, and it is the
components rather than a table, so it cannot drift.

This slice does not add question editing, an engagement list, an answers viewer,
or the intake document generator. It changes no client-facing word.

## Why / intent

- **Taylor, 2026-09-02** — "several variations of questions based on the type…
  it's a lot of information to digest. Render it in one of two modes: Interface
  UI or Markdown… more like a Notion doc, as if I were writing it all there
  before codifying it. Use `[Component Type]` to explain the UI type. Keep the
  labels, descriptions, etc. that are actually used." And: "is there a way to
  have an overview showing Base Questions vs. ones unique for certain types."
- **D-ADM-6 (binding, fidelity law)** — the preview mounts production step
  components; question copy exists in exactly one place in this repo. The
  document is rendered, never written. A markdown file, a manifest, or a
  transcription fails this ticket.
- **ADM-2 §Failure states** — a step missing from a top-to-bottom review is the
  one defect this surface cannot have. In a document nobody can click, that
  extends to every conditional reveal.
- **M-ADM-1** — the preview seam is a context defaulting to the safe state. The
  render mode rides the same context for the same reason.
- **What this slice is NOT (binding):** not a `questions` table, not editable
  copy, not a `.md` artifact on disk, not a change to
  `app/websites/intake/_lib/use-step-autosave.ts`.
- **Ground truth:** `lib/intake/tracks.ts` (the one resolver);
  `lib/intake/showcase-kinds.ts` (the kind registry); `lib/intake/showcase-copy.ts`
  (`resolvePack`); the 18 step components and the shared primitives beneath them.

**Rulings this slice makes (labelled, logged):**

- **The document is a render mode of the production primitives.** Each primitive
  gains one document branch as a named sibling function in its own file, so the
  interface path diffs as unchanged. Logged as **D-ADM-9** (extends D-ADM-6).
- **Reveals are declared structurally, never in prose.** `Reveal` takes
  `dependsOn={{ field, equals | in | includes }}` or `{{ extra }}` — never a
  hand-written sentence naming a question, which would be a second copy of the
  question's words and would drift from the condition beside it. Logged as
  **D-ADM-10**.
- **`Every kind` renders generic-pack words plus the pack-diff appendix**, and a
  branch whose copy slot has no generic floor prints a stub pointing at the
  appendix rather than rendering nothing. Logged as **D-ADM-11**.
- **The preview context carries `{ render, scope }`.** Rejected: a DOM or
  collector registry (render-phase side effects); server-side
  `renderToStaticMarkup` (unsupported for this client tree); a question manifest
  (rejected at M-ADM-1 and still rejected). Logged as **M-ADM-6**.
- **Per-kind presence facts live on `KindEntry`, not in four components.**
  Crosses into the PORT track's file; mirrored in
  `docs/websites/specs/TECHNICAL-DECISIONS.md`. Logged as **M-ADM-7**.
  `[RATIFIED — Taylor, 2026-09-02]`
- **`file-drop`'s input id includes the entry key.** A real client-path fix, not
  a refactor: today two entries' drop labels both open the first entry's file
  picker. Its own commit. `[RATIFIED — Taylor, 2026-09-02]`

## Experience & states

**Happy path.** `/admin/intake/questions` → header carries three controls:
`Track` (unchanged), **`Mode`** (`Interface` / `Document`), and `View` (the seven
kind views, plus **`Every kind`** last). Choosing `Document` re-renders the same
flow bands as prose. Every choice is in the URL and survives a reload.

**States (exhaustive):**

- Mode: `interface` (default, today's screen) · `document`.
- Scope: `one` (default, every named view) · `all` (`Every kind`).
- Track: `durable` · `showcase`. Mode applies to both; `View` and `Every kind`
  render on the showcase track only, as today.
- Reveal, document mode: always rendered, indented, with its `Shown when …` line.
- Reveal, interface mode: identical to today — rendered or not, no wrapper.
- `ForKinds`, scope `one`: identical to today.
- `ForKinds`, scope `all`: both branches rendered, each with its `asked of:` line.
- `ForKinds`, scope `all`, slot absent from the generic pack: stub line only.
- Field: every state the production component already has, in interface mode.
  In document mode there are no interactive states — nothing is focusable.
- Upload, extraction, primer: inert in interface mode (unchanged); documented as
  their tag plus prompt copy in document mode.

**Failure / edge states (named):**

- **A step or primitive with no document branch** — renders its interface form
  inside the document rather than nothing. A visible oddity beats a silent gap,
  and §Acceptance 5 sweeps for it.
- **An uncurated taste set** — the step's existing absent-state sentence renders
  as prose, exactly as it does in interface mode.
- **The product catalogue is unavailable** — only reachable in interface mode;
  the document folds the pay band regardless, because it holds no questions.
- **Unknown `mode` or `kind` search param** — falls back to `interface` /
  `portfolio`, the same law ADM-2 set. No 404.
- **Reduced motion** — the document has nothing that moves.

## Non-negotiables (this slice)

- **No question's words appear in any file this ticket adds.** `Reveal` takes
  field keys and stored values, never a label or an option label.
- **`use-step-autosave.ts` is not opened.** The no-loss contract is out of scope
  and untouched.
- **The client route's rendered DOM is unchanged**, with exactly two permitted id
  diffs (§Acceptance 4). `Reveal` and `ForKinds` emit no wrapper element in
  interface mode.
- **Zero writes, still.** No new network caller; the preview-gating audit is
  re-run and its list restated.
- **No fabricated client data.** Prefill stays empty strings.
- **Tokens by name; never `-[--`.** Every `:focus-visible` ring preserved.

## Data

**Schema changes:** none. No table, no column, no validator.

**Tables:** none. The page's only query remains the product catalogue.

**Placement.** Six commits, in order:

1. **The registry move (M-ADM-7).** `lib/intake/showcase-kinds.ts` — `KindEntry`
   gains `asksRoles`, `asksPortrait`, `asksVideo`, and
   `work: "projects" | "offerings" | "pieces" | "services"`.
   `lib/intake/tracks.ts` — `kindAsks()` and `workShapeFor()` exported.
   `step-about.tsx`, `step-media.tsx`, `step-access.tsx`, `step-work.tsx` — the
   four inline predicates and `ENTRY_KEY` deleted, replaced by the accessors.
   Behaviour-preserving; proved by `yarn verify:tracks`.
2. **The `file-drop` entry-key id fix.** `app/websites/intake/_components/file-drop.tsx`
   — the input id becomes `file-${fieldKey}` plus the entry key where one exists.
   Client-path behaviour change; logged in `docs/websites/specs/DEVIATIONS.md`
   because PORT owns that file, and in the ADM log.
3. **The context and the primitives.** `components/intake/preview-mode.tsx`
   (`{ render, scope }`, `useRenderMode`, `useKindScope`, corrected reader list);
   `app/websites/intake/_components/{field,answer-inputs,choice-group,text-field,file-drop,repeatable-block,known-fact,ink-cluster}.tsx`;
   `field.tsx`, `known-fact.tsx`, `ink-cluster.tsx` gain `"use client"`.
4. **`Reveal`, `ForKinds`, `CheckAnswer`, and their call sites.**
   `app/websites/intake/_components/{reveal,check-answer}.tsx` (both tracks);
   `app/websites/coded/intake/_components/for-kinds.tsx` (coded only — placement
   by consumer); the 9 coded steps, the 6 durable steps with reveals, the entry
   cards, and `showcase-start-form.tsx`. Also `f-fastWay`'s id collision.
5. **The admin surface.** `app/admin/(protected)/intake/questions/page.tsx`
   (resolve `mode`, `kind=all`, fold non-question bands);
   `_components/preview-controls.tsx` (Mode switch, `Every kind`);
   `_components/question-stack.tsx` (mount `PrimerBlock` on the about step);
   `_components/pack-diff.tsx` + `pack-diff.ts`.
6. **The records.** `ADMIN-UX-SPEC.md` §6 + §8; `PROGRESS.md`; `DEVIATIONS.md`;
   `TECHNICAL-DECISIONS.md` (M-ADM-6, M-ADM-7); `00-build-order.md`; the M-PORT
   mirror in `docs/websites/specs/TECHNICAL-DECISIONS.md`.

**Validators:** none.

## Accessibility

- Heading outline stays flat per the 2026-09-01 deviation: `h1` page, `h2` bands
  and steps. Question labels become `h3` in document mode, nesting correctly.
- `[Component Type]` tags, field keys, and `asked of:` lines are text in the
  flow, never `title` attributes and never color-only.
- The document is a document: nothing focusable, so there is no focus order to
  get wrong. The header switches keep their `PRIM-04` rings.
- Contrast: `--color-dim` at 6.67:1 and `--color-c2` per D-CON-1.

## Acceptance criteria (observable, and under what conditions)

1. The preview-gating audit is re-run
   (`grep -rln "fetch(\|_actions/\|use server"` under both intake `_components`
   trees and `_lib`) and **its result stated in the close-out**, including
   `PrimerBlock`, which this ticket promotes from shell-only to preview-mounted.
2. `?mode=document` renders every band: the start form's questions, a folded
   line for deposit and welcome, then nine steps of questions with their tags,
   keys, help lines, and options — on both tracks.
3. `?kind=all` renders every kind-driven branch with an `asked of:` line naming
   kinds computed from the registry, and untagged base questions elsewhere. The
   venture `stage` branch prints its stub line pointing at the appendix.
4. **Run, and quote the result:** on the real client route with no provider,
   `outerHTML` of three steps per track before and after this ticket. The only
   permitted difference is the two id attributes (`f-fastWay` suffixed;
   `file-…` carrying an entry key) — **the diff is quoted in the close-out.**
5. Every question reachable in interface mode across all eight views is present
   in document mode for that view. No step renders `UnrenderedStep`.
6. **Run, and quote the result:** with the network panel open, type into three
   document-mode and three interface-mode fields. No request is issued and no
   `ta-intake:` key appears in `localStorage`.
7. **Run, and quote the result:** the two `file-drop` entry-keyed pickers on one
   page open their own file dialog rather than the first entry's.
8. Select-all on the document pastes into Notion with headings and lists intact.
9. No question's words appear in any file added by this ticket.
10. `yarn verify:tracks` passes; `yarn build:agent`, `npx tsc --noEmit`,
    `yarn lint` pass; `grep -rn -- "-\[--" app components lib` returns nothing.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `Reveal` in interface mode must return `children` or `null` with no element
  around them, or Acceptance 4 cannot pass.
- `ForKinds`'s `otherwise` slot is what makes the either/or branches (portrait
  vs. place, video vs. tools, the four step-4 shapes) legible in scope `all`.
- The `f-fastWay` id is hard-coded in `extraction-block.tsx` and the block
  renders on steps 3 and 4 — a duplicate id today whenever the stack shows both.
  Suffix it with the step key.
- `EntrySummary` / `CollapseLink` need no document branch: a preview entry is
  always empty, so a card is always open, and a mode switch is a navigation that
  drops local state. Do not add one.
- `StepProposals` stays unmounted on the preview — a preview has no proposals.
- The pack-diff walk is pure data; keep it in `pack-diff.ts` beside its only
  consumer rather than promoting it to `lib/`.

## Dev's call

The exact shape of the document branches (a sibling function per primitive
versus a shared `DocumentField` helper). Whether `kindAsks` takes a union
argument or ships as four named predicates. The indentation treatment on nested
reveals.

## Out of scope

- ~~**Copy as Markdown (a clipboard serialiser)**~~ — **delivered 2026-09-03**
  as a Download Markdown button (Taylor). The concern that deferred it is closed
  by keeping the conversion a pure function of the rendered HTML, with a test
  that renders the real document and asserts every question and option survives.
- **A `no-restricted-imports` rule for the registries** — its own ticket
  (would catch `showcase-start-form.tsx` importing `SHOWCASE_DISCIPLINES`
  directly today).
- **ADM-3's inventory table** — the field keys printed beside each question
  deliver most of it; decide whether ADM-3 survives after this ships.
- **Engagement list, answers viewer, intake document** —
  `docs/intake/ADMIN-HANDOFF.md`'s track.

## Depends on

- **ADM-2** — the route, the preview context, and the flow bands. Complete in
  `PROGRESS.md`.

## Recommended execution

**Opus.** The ticket is wide (a dozen primitives, eighteen steps) but its risk
is concentrated in two places: the interface-mode branches of `Reveal` and
`ForKinds`, which must be invisible, and the `file-drop` id, which is live
client behavior. Both are easy to get subtly wrong in a way that type-checks.

---

### Kickoff (paste into the session)

> Build **ADM-4 — Intake questions: Document mode, the "Every kind" overview,
> and the pack diff** (attached spec). **No file you add may contain a question's
> words, and the client route's rendered DOM must be unchanged apart from the two
> permitted id attributes.**
> Attach/read first, in order: this spec · `specs/README.md` (kickoff contract +
> non-negotiables) · `../TECH-SCOPE.md` §5 · `../ADMIN-UX-SPEC.md` §6 ·
> `ADM-2-intake-preview.md` · `components/intake/preview-mode.tsx` ·
> `lib/intake/showcase-kinds.ts` and `lib/intake/tracks.ts` · repo `CLAUDE.md` ·
> `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (both tracks).
> Work the six commits in `§Data` in order; do not batch them. Never open
> `use-step-autosave.ts`. Never write `-[--`. Acceptance 4, 6, and 7 must be RUN
> and their results quoted. Close in three places. Run `yarn verify:tracks` +
> `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
