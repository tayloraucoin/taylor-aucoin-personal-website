# REV-3 — Admin: design reviews (rounds, forms, comments)

**Epic:** REV — client design review · **Phase 1** · Size: S
**Slice type:** Read-only admin surface over REV-1's tables. No schema change, no writes. Risk class: an admin page that exposes the key hash; a read that is not behind `requireAdmin`; answers rendered from the client site's code instead of the stored snapshot.
**Review:** Mason (the seam: reads in `server/services/review.ts`, pages behind `requireAdmin`; `ReviewRound` still omits the hash).

**Status:** Complete (2026-09-22) — typecheck, lint and `build:agent` clean; not rendered against a database (see PROGRESS.md)

---

## Outcome

Taylor opens **Engagements → Design reviews** in `/admin` and sees every round: client, label, live comment count, form count, and when it was submitted. A round's page shows every feedback form the client sent (oldest first; a re-send after revising is a later form). Each form shows the three preferred ids, every structured answer grouped by section, each question's note under its answer, the intake comparison on the re-asked sliders, and the three free-text boxes. Below that, every live comment grouped by the page it was pinned on, with the element's label, the viewport, the time, and a link to that page on the client's site when the round has a `site_url`. Deleted comments are counted, not shown.

## Why

Taylor, 2026-09-22: "make sure that there is an admin view in the taylor-aucoin site for reviewing the feedback coming back from the client site review step (our submission for feedback, including the review comments)." Contract §6 listed this as deferred; the email alone does not show the comments at all.

## Changed

| File | Change |
|---|---|
| `server/services/review.ts` | `loadReviewRoundSummaries` (rounds with live-comment and submission counts), `loadReviewRoundDetail` (round, submissions, live comments, deleted count). Both return `ReviewRound`, which carries no hash. |
| `lib/review/answers.ts` | new: `groupReviewAnswers` (sections of entries, notes folded into their answers), `tenths`, `scaleChange`. Shared by the email (`formatReviewAnswers`) and the admin page, so both read notes the same way. |
| `lib/routes.ts` | `adminRoutes.designReviews`, `adminRoutes.designReview(id)` |
| `app/admin/_components/admin-nav.ts` | "Design reviews" under Engagements (alphabetical inside the section, D-ADM-2), `ready: true` |
| `app/admin/(protected)/design-reviews/page.tsx` | the list |
| `app/admin/(protected)/design-reviews/[id]/page.tsx` | the round; a non-uuid id is a 404 before any query |
| `app/admin/(protected)/design-reviews/[id]/_components/review-answers.tsx` | renders one form's answers from the stored snapshot |

Visual language is copied from `engagements/page.tsx` and `engagements/[id]/page.tsx` (list rows, the well, `--color-*` tokens). Nothing new was invented: no charts, no bars for the sliders, text only.

## Acceptance criteria

1. Both pages call `requireAdmin` and sit under `(protected)`. **Met.**
2. No page or type carries `key_hash`. **Met** (`toReviewRound` is the only mapper).
3. Answers render from the stored payload with notes under their answers. **Met** by construction; the same grouping produced the email checked on a captured payload (PROGRESS.md).
4. `npx tsc --noEmit`, `yarn lint`, `yarn build:agent` clean. **Met.**
5. Rendered with real rows. **Not run:** no admin session and no database in the agent's session (staging only; signing in is Taylor's).

## Not in this slice

Replying to comments, resolving them, exporting, minting rounds from the admin (M-REV-1's revisit trigger).
