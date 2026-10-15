# <ID> — <title that states the contents>

**Epic:** INT — client intake · **Phase <n>** · Size: <S|M|L>
**Slice type:** <what kind of work; what class of failure it risks>
**Review:** <Mason (migrations/one-way doors) · Forge (money/data-loss paths) — omit if not a risk surface>

**Status:** Not started

> **<Role> — <review type>.** <What must be reviewed, enumerated. What verification must state about its run.>

---

## Outcome

<One paragraph, prose. The world after this ships, in the language of whoever experiences it. Close by naming the adjacent things this slice does NOT do.>

## Why / intent

- **<D-INT-n / M-INT-n / doc §>** — <the authority and what it obliges>.
- **What this slice is NOT (binding):** <the negative, where drift is a real risk>.
- **Ground truth:** <what exists and is consumed, never rebuilt>.

**Rulings this slice makes (labelled, logged):**

- **<The ruling.>** <Why. The tradeoff.> <`[PROVISIONAL — owner]` if applicable.> Logged.

## Experience & states

<Happy path. Then:>

**States (exhaustive):** <every reachable state>

**Failure / edge states (named):** <each with its handling>

## Non-negotiables (this slice)

- **<Imperative.>** <One line of consequence.>

## Data

**Schema changes:** none | described | possibly (describe; Taylor reviews + runs migration; log).

**Tables:** <table (access mode)> — or "none".

**Placement:** <exact paths, per TECH-SCOPE §3; whose call>.

**Validators:** <Zod homes in lib/validators/ — or "none">.

## Accessibility

<This surface's specific traps — or "**None — no surface in this slice.**">

## Acceptance criteria (observable<, and under what conditions>)

1. <Observable behavior.>

N. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- <Authoring knowledge that would otherwise be lost. Non-binding.>

## Dev's call

<What the builder decides. Real alternatives land in TECHNICAL-DECISIONS.md.>

## Out of scope

- **<Excluded thing>** — <where it actually lives>.

## Depends on

- **<TICKET-ID>** — <what this takes from it>. Complete in `PROGRESS.md`. — or "**No slice dependencies.**"

## Recommended execution

**<Model>.** <Why — and the failure mode of choosing down.>

---

### Kickoff (paste into the session)

> Build **<ID> — <title>** (attached spec). **<The one-line law of the slice.>**
> Attach/read first, in order: this spec · `specs/README.md` (kickoff contract + non-negotiables) · `../TECH-SCOPE.md` §<n> · `../INTAKE-UX-SPEC.md` §<n> · <prior tickets — reuse, don't fork> · repo `CLAUDE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> <Restated constraints, imperative, 2–3 sentences.> Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
