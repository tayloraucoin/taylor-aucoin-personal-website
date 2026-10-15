# REV — Progress

The **only** authoritative answer to "is this Complete."

**Gate policy:** inherits `docs/intake/specs/PROGRESS.md`'s (Taylor, 2026-08-18) — downstream work may start against an upstream that is *code complete*; the hosted migration and the live round-trip are one pass at the end.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| REV-1 | Review ingest: three tables, the key seam, four endpoints, the minting CLI | — | Complete — build, typecheck, lint clean; migration `0017` authored, not run; not exercised against a database or a client site | 2026-09-22 |
| REV-4 | Sister-repo handshake: shared key, static clientApp, rounds on first contact | REV-1 (code complete) | Complete — build, typecheck, lint clean; refusal paths exercised; migrations 0018–0019 authored, not run | 2026-09-22 |
| REV-3 | Admin: design reviews (rounds, forms, comments) | REV-1, REV-2 (code complete) | Complete — build, typecheck, lint clean; not rendered against a database | 2026-09-22 |
| REV-2 | Feedback answers: optional versioned `answers` on submissions, printed in the email | REV-1 (code complete) | Complete — build, typecheck, lint clean; validator and email formatter run on a payload captured from kryshan-film-portfolio; no migration; not exercised against a database | 2026-09-22 |

## Checklist

- [x] REV-1 · Review ingest
- [x] REV-2 · Feedback answers
- [x] REV-3 · Admin: design reviews
- [x] REV-4 · Sister-repo handshake

## What has been verified, and how

> **Superseded in part by REV-4 (M-REV-6):** there are no per-round keys and no `yarn review:create`. The staging pass below now means: apply `0017`–`0019`, set `REVIEW_INGEST_KEY` on both sides, and send from a client site.

REV-1 was authored without a database in the session. What is verified is what can be verified statically:

| Verified | Result |
|---|---|
| Migration shape | `0017_spotty_spyke.sql` diffed by eye against contract §5: three tables, `review_comments.id` and `review_submissions.id` with no default, `round_id` cascade, `engagement_id` set-null, unique `key_hash` |
| Types agree with the contract | `lib/validators/review.ts` carries `satisfies z.ZodType<ReviewComment>` / `<ReviewSubmission>` against the hand-written contract types; `tsc` is clean |
| Seam | The only reader of `review_rounds` by key is `requireReviewRound`; the four handlers all resolve through `resolveRoundFromRequest` |
| Logging | No log line in the new files interpolates a body, a key, or a comment — ids and counts only, tagged `[review]` |
| Build | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean |

**Not verified — Taylor runs after applying `0017` and `06-review-rls.sql`:** criteria 1–7 in the ticket against staging: mint a round, `curl` the health check, post/list/delete a comment, post a submission twice and confirm one email. Then point a client site's `REVIEW_BACKEND_URL` at staging and walk the reviewer's path.

### REV-2

No database in the session (Taylor runs this repo against staging Supabase only). The client site's real form was filled and sent on :4500 with its backend pointed at a local capture server; the captured body (3,493 bytes, 18 answered items) was then run through this repo's code:

| Verified | Result |
|---|---|
| `reviewSubmissionInput` on the captured body | valid |
| Same body without `answers`, and with `answers: null` | both valid (REV-1 compatibility) |
| A scale of 7.25; a duplicated item id | both rejected |
| `formatReviewAnswers` on the parsed body | every item printed in form order under its section; the re-asked sliders print e.g. `3.4 now · 6.0 at intake · −2.6   (The work 0 ↔ 7 You)` |
| Build | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean |

**Not verified — Taylor's pass with REV-1's:** after `0017` is applied to staging, point the client site at staging, send the form once, and read the `review_submissions.payload` row and the email.

### REV-2 amendment and REV-3

Per-question notes (`<id>.note` text items, contract §4a) were added after Taylor's first walk. A second captured send (1,088 bytes: two notes, one on an unanswered question) validated here, and `formatReviewAnswers`, now built on `lib/review/answers.ts`, printed each note under its answer and the unanswered one on its own.

REV-3's pages build and typecheck. They were **not rendered**: no admin session, and this repo has no local database. **Taylor's pass:** after `0017` is on staging and a round has received a form, open `/admin/design-reviews`, then the round, and check the forms and the comments against the email.
