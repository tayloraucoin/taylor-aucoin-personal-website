# REV — Deviations (append-only)

One line per intentional divergence from a spec or the contract. Never rewrite history. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-22 · REV-1 · Wrong-method replies are exported explicitly on every route (`methodNotAllowed` re-exported as the unserved verbs) rather than left to Next · Next's default 405 has no body, and the contract §2 wants `{ "error": "method" }`. `HEAD` and `OPTIONS` stay Next's own.
2026-09-22 · REV-1 · `Content-Type` is enforced when present: a declared non-JSON type is a 400 before the body is read · the contract says JSON both ways; a caller declaring otherwise is misconfigured and should hear so. A missing header is tolerated and the body is parsed.
2026-09-22 · REV-1 · `z.iso.datetime({ offset: true })` for `createdAt`/`submittedAt` rather than zod's default Z-only form · the contract says ISO 8601 and means it; a client site that serialises with an offset should not be refused. The client boilerplate's schema should match.
2026-09-22 · REV-1 · `target.selector` requires at least one character, beyond the contract's stated ceiling · an empty selector cannot be resolved by the client site and would be a comment pinned to nothing. Logged so the client-side schema can carry the same floor.
2026-09-22 · REV-1 · One composite index `(round_id, path)` on `review_comments` rather than a single `round_id` index · the list endpoint's two shapes (whole round; one path) both use the prefix, so one index serves both.
2026-09-22 · REV-1 · `listReviewRounds` and `createReviewRoundInput` added beyond the brief's named functions · the CLI's `--list` needs a read and the create path needs validation; both mirror `findEngagementById` and `createEngagementInput`, and neither is a request path.
2026-09-22 · REV-1 · `reviewApiRoutes` added to `lib/routes.ts` · the CLI prints a `curl` line against the health endpoint after minting a key, and a route string written inline there would be a second home for the path.
2026-09-22 · REV-1 · Runtime criteria not exercised — no database in the session · migration `0017` and `06-review-rls.sql` authored and stopped, per the non-negotiable; the round-trip is Taylor's pass after applying them (see `PROGRESS.md`).
2026-09-22 · REV-2 · `formatReviewAnswers` is exported from `server/services/review.ts` · so the email body could be checked on a real payload without a database or a send; it is pure and has no other caller.
2026-09-22 · REV-2 · Answers are an ordered list of self-describing items, not the KR-6 ticket's example of records plus a label map · jsonb sorts object keys; M-REV-5.
2026-09-22 · REV-2 · The email now ends with "Structured answers: none sent" on a submission without answers · one line, so a REV-1-era body reads as deliberate rather than truncated.
2026-09-22 · REV-2 · Runtime storage not exercised; validator and formatter exercised on a payload captured from the client site · no database in the session (Taylor uses staging only); the staging round-trip joins REV-1's pending pass.
2026-09-22 · REV-2 · Per-question notes arrive as `text` items with id `<question id>.note` (contract §4a) and are folded under their answer by `lib/review/answers.ts` · the client site added them after Taylor's first walk; no new shape, so the validator is unchanged.
2026-09-22 · REV-3 · An admin view of rounds, forms and comments, which contract §6 had deferred · Taylor asked for it; read-only, behind `requireAdmin`, and nothing it reads carries the key hash.
2026-09-22 · REV-3 · Route is `/admin/design-reviews`, not `/admin/reviews` · "review" already names the intake's review page in `adminRoutes`; "design reviews" is also the nav label.
2026-09-22 · REV-3 · The form's `commentCount` is labelled "unsent comments counted in their browser" · the client site counts its browser's unsent queue (`countPendingEverywhere`), not the live comments contract §4 describes; the label says what the number is. The contract wording is left for Taylor to settle.
2026-09-22 · REV-3 · Pages not rendered against real rows · no admin session or database in the agent's session.
2026-09-22 · REV-4 · M-REV-1 superseded by M-REV-6: shared `REVIEW_INGEST_KEY` plus a static `clientApp` header instead of hashed per-round keys; the minting CLI and `package.json`'s `review:create` removed · Taylor: the per-round keys were overcomplicated for repos he owns.
2026-09-22 · REV-4 · New migrations `0018` (add `client_app`, unique) and `0019` (drop `key_hash`) rather than editing `0017` · `0017` may already be applied to staging; two generated steps avoid drizzle-kit's interactive rename prompt. `0018` adds a NOT NULL column, so it fails if a round row already exists; none should (no round was ever minted).
2026-09-22 · REV-4 · `reviewApiRoutes` removed from `lib/routes.ts` · its only consumer was the deleted CLI.
