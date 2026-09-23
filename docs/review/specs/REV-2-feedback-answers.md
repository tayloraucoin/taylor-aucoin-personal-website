# REV-2 — Feedback answers: an optional, versioned `answers` list on submissions, printed in the email

**Epic:** REV — client design review · **Phase 1** · Size: S
**Slice type:** Wire-shape extension (types, validator, email). No schema change. Risk class: a validator that refuses bodies the client site already sends; an email that drops or misorders answers; answer text reaching a log.
**Review:** Mason (contract §4/§4a against the client site's copy; validator agreement; no migration).
**Paired with:** kryshan-film-portfolio `docs/specs/KR-6-feedback-questions.md` (the question set, the form, the action).

**Status:** Complete (2026-09-22) — typecheck, lint and `build:agent` clean; validator and email formatter exercised on a real payload captured from the client site; not exercised against a database (see PROGRESS.md)

---

## Outcome

A review submission may carry `answers: { schema, items[] }`: the reviewer's rankings, 0.0–7.0 sliders, choices and short texts, each item self-describing (id, kind, section, label, value; a scale's two ends and the intake baseline). It is stored whole in `review_submissions.payload` and the `notifyOps` email prints every answered item in form order, grouped by section, with a scale's intake value and the change beside the new one. A submission without `answers` (every REV-1-era body) still validates and emails exactly as before, plus one line: "Structured answers: none sent".

## Why / intent

- kryshan-film-portfolio KR-6 (Taylor: "ask him to rank certain things… spectrum of opinions are helpful too (0.0–7.0)").
- `db/schema/review-submissions.ts` already says a new question must never require a migration here. This slice keeps that promise for the validator and the email too.
- **M-REV-5:** an ordered list, not records keyed by id, because jsonb does not keep key order.

## Changed

| File | Change |
|---|---|
| `lib/types/review.ts` | `ReviewAnswers`, `ReviewAnswer` (union on `kind`: rank, scale, choice, text), `ReviewAnswerOption`; `ReviewSubmission.answers?: ReviewAnswers \| null` |
| `lib/validators/review.ts` | `reviewAnswerInput`, `reviewAnswersInput` (bounds, one-decimal scale, distinct ranked ids, unique item ids), `satisfies` the hand-written types; `answers` optional and nullable on `reviewSubmissionInput` |
| `server/services/review.ts` | `formatReviewAnswers` appended to the `notifyOps` lines; exported so the body can be checked without a send |
| `docs/review/REVIEW-BACKEND-CONTRACT.md` | §3 submission email, §4 shapes, new §4a (answers), §5 payload note. Matches the canonical copy. |

No route handler change: `app/api/review/submissions/route.ts` already validates with `reviewSubmissionInput` and passes the parsed body through. No migration.

## Acceptance criteria

1. A body with only the REV-1 fields validates; so does one with `answers: null`. **Met** (checked with the validator).
2. A body with `answers` validates and is stored whole (`payload: input`, unchanged code path). **Validator met; storage not exercised (no database in the session).**
3. Out-of-range or over-precise scale values and duplicate item ids are refused. **Met** (7.25 and a duplicated id both rejected).
4. The email prints every answered item with its label and value, in order, with intake baselines. **Met** (formatter run on the captured payload; output recorded in PROGRESS.md).
5. `npx tsc --noEmit`, `yarn lint`, `yarn build:agent` clean. **Met.**

## Not in this slice

An admin surface for reading answers; aggregating across rounds; registering question sets here (M-REV-5's revisit trigger).
