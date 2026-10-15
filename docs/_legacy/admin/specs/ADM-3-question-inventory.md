# ADM-3 — Question inventory table (keys, labels, types, drift)

**Epic:** ADM — admin shell + intake review · **Phase 3** · Size: S
**Slice type:** Read-only derived view. Risks: becoming a second source of truth.
**Review:** none required.

**Status:** Deferred — roadmap pin. Not scheduled. Do not build without Taylor
asking for it.

---

## Outcome

Alongside the vertical preview, a compact table of what each step *collects*:
step, field key, the label the document will use for it, and the field's type.
Where CC gets this from a `questions` table, we derive it from the Zod schemas
and `ANSWER_LABELS` through `fieldKeysFor` and `labelFor` — so it cannot drift
from the code, because it is the code.

Its real value is the drift it can surface: the form asks in the second person
("What does the customer need to provide?") and the document reports in the
third ("What the customer must provide"). Those are two intentional registers
(`lib/intake/answer-labels.ts` says so), but nothing today shows them side by
side, so a genuine divergence in *meaning* would go unseen.

## Why this is deferred, not cut

It is adjacent to what Taylor asked for, not what he asked for. He asked to read
the questions top to bottom; ADM-2 delivers that. This is the thing a person
wants *after* using ADM-2 for a while, or never. Building it inside ADM-2 would
be creep; cutting it entirely would lose a real idea. So it sits here.

**Decide after a week of ADM-2.** If the preview alone answers the question,
delete this file.

## Sketch (not a spec)

- Derived per track from `fieldKeysFor(track, stepKey)` and
  `labelFor(track, key)`. No new constant, no manifest.
- Rendered as a second view on `/admin/intake/questions`, not a second route —
  the two views answer one question.
- Would highlight: a field key with no entry in `ANSWER_LABELS` (it will fall
  back to the raw key in the client's document, which is a real defect), and a
  step whose schema has a field the component never renders.

That second highlight is arguably the whole justification. If it is, this ticket
should be rewritten as a build-time check rather than a screen.

## Depends on

- **ADM-2** — needs the route and the track resolution it establishes.
