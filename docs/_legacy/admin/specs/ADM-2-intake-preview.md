# ADM-2 — Intake question review: preview mode + the vertical stack

**Epic:** ADM — admin shell + intake review · **Phase 2** · Size: L
**Slice type:** Mounts the production client questionnaire inside a private tool. Risks: a preview keystroke reaching a real engagement; a regression in the no-loss autosave contract.
**Review:** **Mason — the `use-step-autosave.ts` diff, line by line.** This hook is the intake's no-loss promise. Verification must state the two runs in §Acceptance, with their observed results, not a claim that they would pass.

**Status:** Complete (2026-09-01)

---

## Outcome

Taylor opens `/admin/intake/questions` and reads the entire intake in one
scroll: nine steps, top to bottom, each question in the exact words the client
sees, in the exact order the client meets them. He can switch between the
website track and the portfolio track, and on the portfolio track between its
two copy packs. He can click the choice groups, expand the repeatable blocks,
and watch the conditional fields reveal — because that behavior is half of what
he is reviewing and a dead screenshot cannot show it.

Nothing he types is saved. Nothing he types touches an engagement, a database,
or `localStorage`. A line at the top of the page says so and does not go away.

This slice does not list engagements, show submitted answers, render an intake
document, or let anyone edit a question. Questions stay hardcoded; this is a
window onto them, not a manager for them.

## Why / intent

- **Taylor, 2026-09-01** — "what I do want is to be able to have a vertical
  interface to look at what questions we are asking from top to bottom. This is
  a better experience for me to review and test things."
- **D-ADM-5** — fields are interactive and local-only; the banner is permanent.
- **D-ADM-6 (binding, fidelity law)** — the preview mounts production step
  components. Question copy exists in exactly one place in this repo and that
  place is the component that asks it.
- **M-ADM-1 / M-ADM-2** — the preview seam and its home. `../TECH-SCOPE.md` §5.
- **What this slice is NOT (binding):** not question editing, not a schema, not
  an engagement viewer, not the intake document. Those are
  `docs/intake/ADMIN-HANDOFF.md`'s track and they must not leak in here just
  because they share the `/admin/intake` prefix.
- **Ground truth:** `lib/intake/tracks.ts` (`stepsFor`, `stepCountFor`,
  `copyPackFor`, `flavourFor`); the 18 step components; the vendored sheet;
  `AdminPageHeader` from ADM-1.

**Rulings this slice makes (labelled, logged):**

- **Preview mode is a context that defaults to off.** A missing provider fails
  to the safe state. Rejected alternatives — a sentinel token, prop-threading
  through 18 components, a transcribed manifest — and why, in
  `../TECH-SCOPE.md` §5. Logged as **M-ADM-1**.
- **The context lives in `components/intake/preview-mode.tsx`.** Two consumers,
  two app trees, carries JSX. Logged as **M-ADM-2**.
- **Both tracks ship, not just the durable one.** They ask different questions;
  a review surface that shows one of two questionnaires is a review surface that
  lies by omission.

## Experience & states

**Happy path.** `/admin/intake/questions` → the page header (`Intake questions`,
with the track switch as its actions slot) → the permanent preview line → then
nine step blocks in order. Each block: step number and title in the intake's own
heading register, the intro where the step has one, then the real fields. A
hairline rule between steps. Switching track re-renders the stack from the other
registry; the URL carries the choice so the view is linkable.

**States (exhaustive):**

- Track: `durable` (Website build) · `showcase` (Portfolio build).
- Copy pack: `generic` · `film`. Control renders on the showcase track only.
- Field: every state the production component already has. They are the
  production components; their matrices come with them.
- Upload field: inert. Prompt copy legible, drop target disabled, one line of
  explanation beneath it.
- Extraction block (showcase, steps 3 and 4): inert, same treatment.
- Save indicator: not rendered. There is nothing to indicate.

**Failure / edge states (named):**

- **A step component throws in preview** (it was written expecting a real
  engagement) — the ticket fixes the component's tolerance for empty props via
  the preview's prop values, not by editing the component's logic. If a
  component genuinely cannot render without an engagement, **stop and report**;
  do not stub it and do not skip the step silently. A step missing from a
  "top to bottom" review is the one bug this surface cannot have.
- **A fourth network caller has appeared** under a step body since
  `../TECH-SCOPE.md` §5 was written — the ticket handles it or stops. See
  Acceptance 1.
- **Unknown `track` or `flavour` search param** — fall back to `durable` /
  `generic`. No 404: this is a review tool and a typo in a query string should
  not send Taylor to an error page.
- **Reduced motion** — inherited; add nothing that escapes the sitewide rule.

## Non-negotiables (this slice)

- **Zero writes.** No `fetch`, no server action, no `localStorage` key, on any
  preview interaction. Proven by a stated run.
- **The production path is byte-for-byte unchanged in behavior.** After this
  ticket a real intake step still autosaves, still rehydrates from
  `localStorage`, still retries with backoff, still shows its indicator.
- **No transcribed question copy.** If the ticket produces a file containing a
  question's words, the ticket is wrong.
- **No fabricated client data as prefill.** `prefill` props take empty strings.
  Not "Acme Plumbing", not a sample business. `docs/intake/ADMIN-HANDOFF.md`
  treats this as legal posture.
- **No engagement id, token, or answer content reaches this surface.** There is
  no engagement to read and the page must not gain a way to read one.
- **Never `-[--token]`.**

## Data

**Schema changes:** none. This track adds no table and no column.

**Tables:** none. The page issues no query.

**Placement:** per `../TECH-SCOPE.md` §3.
New: `components/intake/preview-mode.tsx`,
`app/admin/(protected)/intake/questions/page.tsx`,
`.../_components/question-preview.tsx`, `.../_components/preview-controls.tsx`.
Edited (minimally, guarded by `useIsPreview()`):
`app/websites/intake/_lib/use-step-autosave.ts`,
`app/websites/intake/_components/file-drop.tsx`,
`app/websites/coded/intake/_components/extraction-block.tsx`.

**Validators:** none. Search params are narrowed to their union in the page,
not validated with Zod — two enums do not need a schema.

## Accessibility

- The step stack is a document, not a widget: real headings in order (`h1` for
  the page, `h2` per step), so heading navigation works.
- The permanent preview line is plain text in the flow, associated with the
  region it describes. It is not an `alert` and must not be announced as one —
  it is orientation, not an emergency.
- Disabled upload targets carry their explanation as text, not a `title`.
- The track switch is a real radio group or a segmented set of links with
  `aria-current`; it is not a div listening for clicks.
- Focus rings per `PRIM-04` on every control the preview renders.

## Acceptance criteria (observable, and under what conditions)

1. The ticket re-runs the network-caller audit
   (`grep -rln "fetch(\|_actions/\|use server"` under both intake `_components`
   trees and `_lib`) and **states the result in its close-out**. If a step-body
   caller exists beyond the three in `../TECH-SCOPE.md` §5, it is handled or the
   ticket stops.
2. `/admin/intake/questions` renders all nine durable steps in order, each with
   its number, title, intro (where present) and its real fields.
3. Switching to the portfolio track renders all nine showcase steps; the copy
   pack control appears; switching to `film` changes the copy the pack flexes.
4. The track and pack are reflected in the URL and survive a reload.
5. **Run, and quote the result:** with the browser network panel open, type into
   three preview fields across three different steps, toggle a choice group, and
   add a repeatable block. No network request is issued. No `ta-intake:` key
   appears in `localStorage`.
6. **Run, and quote the result:** open a real intake step for a real engagement,
   type, and confirm the save indicator reaches `Saved` and the answer persists
   across a reload.
7. Upload fields render their prompt copy with the drop target disabled and a
   visible explanation. Clicking the target opens no file picker.
8. The extraction blocks on showcase steps 3 and 4 are inert and say so.
9. The preview line is present at the top of the content pane and cannot be
   dismissed.
10. No question's words appear in any file added by this ticket.
11. Heading order is `h1` then `h2` per step, with no level skipped.
12. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The step components are uniform: `token`, `initial`, plus some combination of
  `prefill`, `files`, `flavour`, `purchasedExtras`. Preview supplies `token: ""`,
  `initial: {}`, empty-string prefill, empty `files` arrays, and the selected
  flavour. `purchasedExtras` is an empty list — which is the honest default,
  since a preview has bought nothing.
- The stack renderer will end up as a switch over step keys per track, mirroring
  the switch already in `app/websites/intake/[token]/[step]/page.tsx` and its
  showcase twin. That is duplication of a *dispatch table*, not of copy, and it
  is the accepted cost of not touching 18 components. If it can be shared
  cleanly, share it — but not at the price of making the client route more
  complicated than it is.
- `StepShell` is deliberately not reused: it owns a fixed footer, a progress
  bar, and Back/Continue routing, none of which mean anything in a single-scroll
  review. Borrow its heading register; leave the shell alone.
- The `state` returned by the previewing hook should be pinned to `idle` so the
  save indicator has nothing to show even if something renders it.
- `use-step-autosave.ts` is heavily commented and those comments are load-bearing
  — the ordering they describe is the no-loss contract. Add the preview branch
  early and leave the rest of the file alone.

## Dev's call

How the preview branch is factored inside `use-step-autosave` (an early return
to a sibling hook, versus guards at each write site — the early return is
strongly preferred, because a guard you can forget is a guard). Whether the
track switch is links or a client control. The exact hairline treatment between
steps.

## Out of scope

- **Engagement list, submitted answers, intake document viewer** —
  `docs/intake/ADMIN-HANDOFF.md`, its own track.
- **Editing questions, reordering them, a `questions` table** — locked out in
  `specs/README.md` § Locked scope.
- **The question inventory table** — ADM-3, deferred.
- **Retrofitting `AdminPageHeader` onto other admin pages** — ADM-1's out-of-scope
  list, still out of scope.

## Depends on

- **ADM-1** — the Intake section and its route, plus `AdminPageHeader`. Must
  read Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Two reasons. The seam decision is the whole ticket and it is easy to
get subtly wrong in a way that type-checks and passes review — a sentinel, a
guard at the call site instead of the hook, a "temporary" prop. And the diff
lands in the file that carries the intake's no-loss promise, which is the last
file in this repo that should be edited by a model working at low effort.

---

### Kickoff (paste into the session)

> Build **ADM-2 — Intake question review: preview mode + the vertical stack**
> (attached spec). **The preview must be structurally incapable of writing.
> Question copy must exist in exactly one place in this repo when you are done —
> the components that already ask it.**
> Attach/read first, in order: this spec · `specs/README.md` (kickoff contract +
> non-negotiables) · `../TECH-SCOPE.md` §2, §5, §7 · `../ADMIN-UX-SPEC.md` §6 ·
> `lib/intake/tracks.ts` · `app/websites/intake/_lib/use-step-autosave.ts`
> (read every comment) · `app/websites/intake/[token]/[step]/page.tsx` and its
> showcase twin · `docs/intake/ADMIN-HANDOFF.md` § Cautions · repo `CLAUDE.md` ·
> `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Start by re-running the network-caller audit in Acceptance 1 and reporting it.
> No new dependency. No fabricated prefill data. Never write `-[--`. Both
> verification runs in Acceptance 5 and 6 must be RUN and their results quoted.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
