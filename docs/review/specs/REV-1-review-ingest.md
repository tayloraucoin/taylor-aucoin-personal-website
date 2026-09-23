# REV-1 — Review ingest: three tables, the key seam, four endpoints, the minting CLI

**Epic:** REV — client design review · **Phase 1** · Size: M
**Slice type:** Schema plus an authorisation seam plus an HTTP surface for another site's server. Risk class: a migration (one-way door); a key that leaks through a log or a response; a retry that double-writes or double-emails; a round's key reaching another round's rows.
**Review:** Mason (migration diff against contract §5; the seam; idempotency by id).

**Status:** Complete (2026-09-22) — build, typecheck, and lint clean; migration `0017` authored, not run; runtime criteria not exercised against a database (see PROGRESS.md)

> **Mason — one-way-door review.** The generated migration is diffed against `../REVIEW-BACKEND-CONTRACT.md` §5 before Taylor runs it. `server/services/review.ts` is read for: the key never leaving `requireReviewRound`'s hash comparison; every write keyed on the client's id with `onConflictDoNothing`; the delete scoped to the caller's round; the email firing only from the insert that landed. Verification must state which criteria ran against a database and which did not.

---

## Outcome

A client site built from `client-boilerplate` can report its review round to tayloraucoin.com. Taylor runs `yarn review:create --client "Name" --label "Phase 1"`, gets a key once, puts it in the client site's `REVIEW_INGEST_KEY`, and from then on every comment the reviewer pins and the one form they submit land in three new tables under that round. On the first submission Taylor gets a plain-text email with their preferences and their three answers verbatim. Retries from the client site are no-ops. Nothing renders: there is no admin page, no browser caller, and no way to read a key back.

## Why / intent

- **`../REVIEW-BACKEND-CONTRACT.md` §1–§5** — the transport, the four error bodies, the four endpoints, the two shapes, and the three tables. Binding on both repos.
- **M-REV-1** — one bearer key per round, sha-256 hashed, minted by a local CLI and shown once. The same posture as M-INT-5 (CLI creation) and M-INT-6 (hash only).
- **M-REV-2** — ids are the client site's, so a retry after a lost response is idempotent by primary key rather than by heuristic.
- **M-REV-3** — route handlers, not server actions: the caller is another site's server, outside this app's action boundary.
- **M-REV-4** — the first submission stamps the round and emails Taylor via the existing `notifyOps` rail; no admin surface.
- **What this slice is NOT (binding):** no admin UI, no browser-side calls, no CORS, no rate limiting, no comment editing (contract §6).
- **Ground truth:** `notifyOps` in `server/services/emails.ts`, `getDb`, `lib/env.ts`, the route-handler shape of `app/api/intake/upload/route.ts`, the schema style of `db/schema/intake-feedback.ts`. Reused, never forked.

**Rulings this slice makes (labelled, logged):**

- **Bearer resolution lives in one service helper, `resolveRoundFromRequest`.** Four handlers, one parse, one lookup. A handler that parsed its own header would be a second door. Logged.
- **The delete is scoped to the caller's round and answers `{ ok: true }` for any id it does not touch.** One round's key cannot reach another's comments, and a retry cannot fail. Logged.
- **The submission email fires from the service, only on the insert that landed.** Idempotency and the side effect are one decision, not two. Logged (M-REV-4).
- **Wrong-method replies are exported explicitly** as the contract's `405 { error: "method" }`, since Next's default 405 has no body. Logged in DEVIATIONS.

## Experience & states

**No surface.** Observable via `curl`, the client site, the CLI, and the tables.

Happy path: the client site's server calls `GET /api/review/health` with its key → `{ ok, round }`. The reviewer pins a comment → `POST /api/review/comments` → `{ ok: true }`. They reload → `GET /api/review/comments?path=/review/mocks/kit-a` → the comment. They remove it → `DELETE /api/review/comments/<id>` → `{ ok: true }`, and it is gone from the list. They submit → `POST /api/review/submissions` → `{ ok: true }`, `review_rounds.submitted_at` stamped, Taylor emailed.

**States (exhaustive):** a round is *open* (`submitted_at` null) or *submitted*; a comment is *live* or *deleted* (`deleted_at`); a submission exists or does not. A submitted round still accepts comments.

**Failure / edge states (named):** no/malformed/unknown key → 401, one body for all three · body > 64 KB, non-JSON, or failing the schema → 400 · wrong method → 405 · database or unexpected error → 500, logged with ids only · retried comment/submission id → 200, no write · deleted-again or foreign id → 200, no write · email send fails → row kept, 200, error logged naming the round.

## Non-negotiables (this slice)

- **The plaintext key is printed once by the CLI and never persisted, logged, or returned.**
- **No caller-visible distinction between "no key", "bad key", and "unknown key".**
- **No comment text or submission text in any log line or error.** The email is the one exception, by design.
- **Every write idempotent on the client's `id`; the email cannot send twice for one submission.**
- **Route handlers stay thin:** resolve the round, validate, call the service, reply with a contract body.

## Data

**Schema changes:** described — migration `0017_spotty_spyke.sql`, generated with `yarn db:generate`; Taylor reviews and runs. Three new tables per contract §5.

**Tables:** `review_rounds` (insert via CLI; read by key hash; `submitted_at` stamped by the service) · `review_comments` (insert/soft-delete/list via the service) · `review_submissions` (insert via the service). All deny-all RLS: `db/supabase/setup/06-review-rls.sql`.

**Placement:** `db/schema/review-rounds.ts`, `review-comments.ts`, `review-submissions.ts` (+ barrel) · `lib/types/review.ts` · `lib/validators/review.ts` · `lib/routes.ts` (`reviewApiRoutes`) · `server/services/review.ts` · `app/api/review/{health,comments,comments/[id],submissions}/route.ts` + `app/api/review/_lib/http.ts` · `scripts/create-review-round.ts` + `review:create`.

**Validators:** `lib/validators/review.ts` — `reviewCommentInput`, `reviewSubmissionInput` (must agree field for field with the client boilerplate's), `createReviewRoundInput` (CLI).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `yarn review:create --client "X" --label "Y"` inserts a `review_rounds` row whose `key_hash` is 64 hex chars and prints the key exactly once with the not-recoverable warning; `--list` prints rounds without keys.
2. `GET /api/review/health` with that key returns `{ ok: true, round: { label, clientName, submittedAt: null } }`; with no header, a non-Bearer header, or a random key returns `401 { error: "unauthorized" }` — identical bodies.
3. `POST /api/review/comments` with a valid `ReviewComment` returns `200 { ok: true }`; the same body again returns the same and the table has one row.
4. `GET /api/review/comments` lists live comments oldest-first by `createdAt`; `?path=` filters; a soft-deleted comment is absent.
5. `DELETE /api/review/comments/<id>` returns `200 { ok: true }` for a live id, the same id again, an unknown uuid, and another round's id — and only the first changes a row. A non-uuid returns 400.
6. `POST /api/review/submissions` returns `200 { ok: true }`, stamps `review_rounds.submitted_at`, and sends one email; the same body again returns 200, changes nothing, and sends nothing.
7. A body over 64 KB, a non-JSON body, and a body failing the schema each return `400 { error: "bad_request" }`; a wrong method returns `405 { error: "method" }`.
8. `grep` finds no `process.env` read and no `db/client` import in the new files outside `server/services/`; no log line in the new files interpolates a body, a key, or a comment.
9. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `insert … onConflictDoNothing({ target: id }).returning({ id })` yields no row on a retry — that one fact carries both idempotency and "first receipt only".
- Next 15 route params are a `Promise`; `await params` before reading `id`.
- Next's own 405 for an unexported method has no body; the contract wants `{ error: "method" }`.

## Dev's call

Where the shared body reader lives (`app/api/review/_lib/http.ts`) · whether `Content-Type` is enforced (it is, when present) · the composite `(round_id, path)` index versus two.

## Out of scope

- **Admin surface for reading rounds, comments, submissions** — roadmap (contract §6).
- **Browser-side ingest, CORS, public token** — a separate ticket if ever needed.
- **Rate limiting** — the key is the gate; rotation is the remedy.
- **The client site's half** — `client-boilerplate`, against the same contract.

## Depends on

- **No slice dependencies.** Inherits the intake foundation (`getDb`, `lib/env.ts`, `notifyOps`) which is Complete in `docs/intake/specs/PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The failure mode is quiet: a handler that logs a body, a delete that is not scoped to the round, an email that sends on a retry — none of them fail a build.

---

### Kickoff (paste into the session)

> Build **REV-1 — Review ingest** (attached spec). **One door: `requireReviewRound`. Every write idempotent on the client's id. Nothing but ids and counts in logs.**
> Attach/read first, in order: this spec · `../README.md` · `../REVIEW-BACKEND-CONTRACT.md` · `app/api/intake/upload/route.ts` and `server/services/engagement.ts` (reuse the shape, don't fork) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · repo `CLAUDE.md`.
> Responses exactly per contract §2/§3. Routes from `lib/routes.ts`. env via `lib/env.ts` only. Generate the migration, never run it. Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
