# PORT-H1 — Hotfix: no client's name in shipped copy (step 6 person-voice options)

**Epic:** PORT — coded (showcase) intake · **Phase 6 · lead item** · Size: S
**Slice type:** One-string correctness fix on a live client surface. Risk class: another client's name reaching every client's screen today; a paraphrase of the surrounding v2 copy while in the file.
**Review:** none — one component, no data.

**Status:** Complete (2026-09-01) — the options carry the client's own name and the pack's verb; no client name remains in any shipped string on either track. Verified by exhaustive assertion of the resolved options across both packs × named/blank/untrimmed, plus the durable cartridge oracle. One consumer the spec did not name (the admin question-review surface) needed the new prop; see `DEVIATIONS.md`.

---

## Outcome

On step 6 of the coded intake, the "First person or third?" options no longer name Kryshan. They read *First — "I make…"* / *Third — "{name} makes…"* where `{name}` is the client's own step-1 display name, or *They* when that is blank. Nothing else on the step changes. The per-pack verbs (*direct*, *work with*, *build*, *do*) arrive with PORT-15; this slice ships the generic pair only.

## Why / intent

- **Audit §3 step 6 / kinds scope §4 step 6** — `step-words.tsx:18` ships `'Third — "Kryshan directs…"'` to every client.
- **D-PORT-14 `[PROPOSED]`** — no client's name is ever a literal in shipped copy, on any track; the option labels interpolate the step-1 name.
- **What this slice is NOT (binding):** not the pack-aware verbs (PORT-15); not a change to the v2 help line under the question; not a touch on any other string in the file.
- **Ground truth:** `app/websites/coded/intake/_components/steps/step-words.tsx` `PERSON` constant; `about.displayName` is already in the answers document (PORT-4).

**Rulings this slice makes (labelled, logged):**

- **The name is read client-side from the answers the step page already loads.** The step page passes `about.displayName` down as a prop; no new query. With a blank name the label renders the pronoun *They*, never an empty quote. Logged.
- **Film keeps its verb.** The film pack's *"I direct…"* / *"{name} directs…"* is the existing v2 string with the name swapped for the client's; only the generic pack changes verb (*make*). Logged.

## Experience & states

`PERSON` becomes a function of `(flavour, name)`. Rendered: film → *First — "I direct…"* / *Third — "Amy directs…"*; generic → *First — "I make…"* / *Third — "Amy makes…"*; blank name → *Third — "They direct…"* / *"They make…"*. "Not sure — you pick" unchanged.

**States (exhaustive):** name present · name blank · flavour film · flavour generic. No new interactive state.

**Failure / edge states (named):** a name with a trailing space or quotation mark renders trimmed; a name longer than the card can hold wraps within the tap-card (the existing `ChoiceGroup` card wraps; verify at 375px).

## Non-negotiables (this slice)

- **No literal client name anywhere under the showcase tree after this lands** — grep-verified for "Kryshan".
- **The v2 help line and the third option are untouched.**
- **No new query; the name comes from answers already loaded.**

## Data

**Schema changes: none.** **Tables:** none. **Placement:** `step-words.tsx` (the constant becomes a function) · `app/websites/coded/intake/[token]/[step]/page.tsx` (pass `displayName` from `readStepAnswers("about")` to `StepWords`). **Validators:** none.

## Accessibility

The option's accessible name changes with the client's name; the radio group's legend is unchanged. No new trap.

## Acceptance criteria (observable)

1. With `about.displayName = "Amy"` on a generic-flavour engagement, step 6 renders *First — "I make…"* and *Third — "Amy makes…"*.
2. With a blank display name it renders *Third — "They make…"*.
3. On a film-flavour engagement the verb is *direct/directs*.
4. `grep -rn Kryshan app/websites/coded` returns nothing.
5. The durable track's step 5 (voice) is unchanged (it has no such option; confirm no shared file was touched).
6. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The step page already computes `initial` for the current step only; reading `about` for one string is one extra `readStepAnswers` call, not a query.

## Dev's call

Whether the interpolation helper lives inline or beside `copyPackFor` (PORT-15 will want it either way).

## Out of scope

- **Pack-aware verbs and the *we* form for entities** — PORT-15. **Voice-note prompt by pack** — PORT-15.

## Depends on

- **No slice dependencies.** PORT-4 is Complete.

## Recommended execution

**Sonnet.** One function, one prop. Choosing down further is not a thing; the only way to fail this is to "tidy" the neighbouring v2 strings, which criterion 5's diff catches.

---

### Kickoff (paste into the session)

> Build **PORT-H1 — Hotfix: person-voice interpolation** (attached spec). **Swap the literal name for the client's; touch nothing else on the step.**
> Attach/read first, in order: this spec · `specs/README.md` · `../CODED-INTAKE-KINDS-UX-SCOPE.md` §4 step 6 and D-PORT-14 · `step-words.tsx` · this folder's logs.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
