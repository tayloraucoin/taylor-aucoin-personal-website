# REV-4 — Sister-repo handshake: one shared key, a static `clientApp`, rounds on first contact

**Epic:** REV — client design review · **Phase 1** · Size: S
**Slice type:** Authorisation change plus a schema change (two generated migrations). Supersedes M-REV-1 with M-REV-6.
**Status:** Complete (2026-09-22) — typecheck, lint and `build:agent` clean; refusal paths exercised; migrations authored, not run

## Outcome

A client site reports in with the shared `REVIEW_INGEST_KEY` and three identity headers from its own `lib/review/client.ts`. taylor-aucoin checks the key, finds or creates the round by `client_app`, links the engagement when that id exists in its database, and files the comment or form. Nothing is minted.

## Env vars

| Repo | Variable | Value |
|---|---|---|
| taylor-aucoin | `REVIEW_INGEST_KEY` | new. A long random secret (`openssl rand -base64 32`). Same value in every environment the client sites talk to. |
| taylor-aucoin | database, Supabase, Resend, `INTAKE_NOTIFY_EMAIL` | unchanged; already set |
| client site | `REVIEW_BACKEND_URL` | `https://tayloraucoin.com` (or `http://localhost:3000` to test locally) |
| client site | `REVIEW_INGEST_KEY` | the same value as taylor-aucoin's |
| client site | `REVIEW_ACCESS_CODE`, `REVIEW_SESSION_SECRET`, `REVIEW_GATE` | unchanged (the client's gate) |

## Changed

`db/schema/review-rounds.ts` (+ `0018`, `0019`), `lib/env.ts`, `.env.example`, `lib/validators/review.ts` (`reviewCallerInput` replaces `createReviewRoundInput`), `server/services/review.ts` (`resolveRoundFromRequest` → key check, `readCaller`, `findOrCreateRound`; minting removed), `scripts/create-review-round.ts` deleted, `package.json`, `lib/routes.ts`, the admin list (shows `clientApp` and "no engagement linked"), `db/supabase/setup/06-review-rls.sql` (comment), `docs/review/README.md`, the contract.

## Verified

No key, wrong key, missing `clientApp`, a malformed slug and a malformed engagement id each resolve to null (401) before any query; the right key with good identity passes to the database step. `npx tsc --noEmit`, `yarn lint`, `yarn build:agent` clean. **Not run:** the migrations and a real round (Taylor's staging pass).
