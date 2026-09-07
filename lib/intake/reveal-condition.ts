/**
 * What opens a follow-up question.
 *
 * Four shapes, because four are what the intake actually uses. Three read an
 * answer on the same step; the fourth reads what the client bought, which is
 * not an answer at all — an add-on's whole question block appears because a
 * purchase settled, never because a box was ticked.
 *
 * ## Why this is data rather than a boolean and a sentence
 *
 * The obvious API is a `when` boolean plus a hand-written "shown when …"
 * string for the review document to print. It was rejected (D-ADM-10): that
 * string would be a question's label typed a second time, and a second copy of
 * a condition can silently disagree with the first. So the condition is
 * structured, `Reveal` evaluates it, and the document line is generated from
 * the same value the branch is decided by.
 *
 * ## Why it lives in `lib` rather than beside `Reveal`
 *
 * It described a component's prop until add-on blocks needed follow-ups of
 * their own (2026-09-07). Those blocks are copy — `UPSELLS` in
 * `showcase-copy.ts` — and copy cannot import a component without pointing the
 * import graph upward. One vocabulary for every reveal on the form was worth
 * more than the type sitting next to its evaluator, so the type came down here
 * and `Reveal` kept the evaluator and the document line.
 */
export type RevealCondition =
  /** A radio's stored value is exactly this. */
  | { field: string; equals: string }
  /** A radio's stored value is one of these. */
  | { field: string; in: readonly string[] }
  /** A checkbox group's stored list contains this. */
  | { field: string; includes: string }
  /** A purchased add-on, not an answer. */
  | { extra: string };
