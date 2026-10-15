# INT-2 — Engagement service: the token seam, state derivation, link-creation CLI

**Epic:** INT — client intake · **Phase 1** · Size: M
**Slice type:** The single scoped-access seam. Risk class: authorization — every later surface trusts this door; a leak here is a leak everywhere.

**Status:** Complete (2026-08-18) — all criteria verified against a scratch Postgres

---

## Outcome

The engagement exists as a domain object with exactly one door. `server/services/engagement.ts` owns creation (token minted, hash stored, plaintext returned once), lookup (`requireEngagement(token)` — the only reader of `engagements`), status derivation (`getEngagementStatus`), and activity touching. `scripts/create-engagement.ts` lets Taylor create an engagement from the terminal after a sales call and prints the one-time URL. No page renders yet (INT-3/INT-4); no answer writes (INT-5); no emails (INT-7/INT-8).

## Why / intent

- **M-INT-5/-6/-7/-8** — CLI creation `[PROVISIONAL — Taylor]`; sha-256 token hash, plaintext never persisted; derived status from fact columns; `requireEngagement` as the sole seam.
- **D-INT-8** — prefill: creation captures contact name, business name, phone, email, project summary, deposit amount, `deposit_required`, so no later screen asks what Taylor knows.
- **TECH-SCOPE §5** — token 256-bit base64url; 60-day expiry `[PROVISIONAL]`; miss and expiry indistinguishable to the caller.
- **CC §5.4 verb law** — `requireX` throws; `getX` pure; `createX` writes. Status derivation is a pure function of the row (+ now).
- **What this slice is NOT (binding):** no HTTP surface, no route, no server action. The seam is a service; rails arrive with their tickets.

**Rulings this slice makes (labelled, logged):**

- **Re-issuing a link rotates the token** (new random, new hash, old link dead) rather than revealing the old one — the plaintext does not exist to reveal. `scripts/create-engagement.ts --reissue <id>` covers the lost-link case. Logged.
- **`requireEngagement` returns a narrowed `Engagement` domain type, not the raw row** — `tokenHash` and Stripe ids stay out of the type that circulates into pages and actions. Cost: one mapping function; buys structural non-leakage. Logged.

## Behavior & states

**No surface.** Observable via the CLI and the database.

CLI happy path: `npx tsx scripts/create-engagement.ts --business "…" --contact "…" --email "…" [--phone …] [--summary "…"] [--deposit 50000] [--no-deposit]` → row inserted, URL printed once (`{NEXT_PUBLIC_SITE_URL}/intake/{token}`), warning printed that it will not be shown again.

**States (exhaustive, derived by `getEngagementStatus`):** `created` (row exists) · `sent` (`sentAt` set — the CLI sets it immediately; the distinction survives for the admin build) · `paid` / `waived` · `started` (`startedAt`) · `in_progress` (activity within 48h) · `abandoned` (started, no activity 48h+, not complete) · `complete` (`completedAt`).

**Failure / edge states (named):** unknown token → throws not-found; expired token → the same not-found to callers, with a distinguishable internal reason the INT-8 expiry screen may read; malformed token (wrong length/alphabet) → same not-found, no error-message echo of the input.

## Non-negotiables (this slice)

- **Plaintext token is printed once and never persisted, logged, or included in errors.**
- **No caller-visible distinction between "no such engagement" and "expired"** at the service boundary (existence leak).
- **`requireEngagement` is the only code path that queries `engagements` by token** — and after this slice, the only reader of the table, period.
- **The CLI refuses to run when `NEXT_PUBLIC_SITE_URL` is unset** — a printed link with a wrong origin is a support incident.

## Data

**Schema changes: none.**

**Tables:** `engagements` (read/write via the service only).

**Placement:** `server/services/engagement.ts` · `lib/types/intake.ts` (extend: `Engagement` domain type, `EngagementStatus` union) · `scripts/create-engagement.ts` · `lib/routes.ts` (new: `intakeRoutes.entry(token)`, `.step(token, n)`, `.done(token)`).

**Validators:** `lib/validators/intake.ts` (new: `createEngagementInput` Zod schema, shared by the CLI now and the admin build later — one home).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. Running the CLI inserts a row whose `token_hash` is 64 hex chars, with all supplied fields set, `sentAt` stamped, and prints a URL exactly once.
2. `requireEngagement(printedToken)` returns the domain object; the returned type contains no `tokenHash` and no Stripe ids (type-level check: the fields do not exist on `Engagement`).
3. `requireEngagement` with a random token, a tampered token, and an expired row (set `token_expires_at` in the past manually) all produce the same thrown error shape.
4. `getEngagementStatus` unit-derivable: for hand-set fact-column combinations covering all eight states, the function returns the expected label (exercise via a scratch script or the CLI's `--status <id>` flag — dev's call; no test files, per house rule).
5. `--reissue` prints a new working URL and the old token no longer resolves.
6. Negative: `grep` finds no import of `db/client` outside `db/` and `server/services/` — the seam holds.
7. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `crypto.randomBytes(32).toString("base64url")` + `crypto.createHash("sha256")` — no dependency needed.
- `tsx` as a devDependency for the scripts is fine; CC uses the same class of tooling for seeds.
- Keep `getEngagementStatus` free of I/O so the admin build and the markdown generator reuse it unchanged.

## Dev's call

CLI arg parsing (hand-rolled vs `node:util` parseArgs — no new dependency for this) · internal error taxonomy · 60-day expiry constant's home (`lib/intake/constants.ts` if a second consumer appears, else local to the service).

## Out of scope

- **Any page or action consuming the seam** — INT-3 (pay) and INT-4 (shell).
- **Answer writes / `touch` on autosave** — INT-5 wires `lastActivityAt`.
- **Expiry screen UX** — INT-8.

## Depends on

- **INT-1** — schema, client, env, types skeleton. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The seam's failure mode is quiet: a cheaper model returns the raw row, distinguishes expiry from miss in the message, or logs the token — all invisible until they are incidents.

---

### Kickoff (paste into the session)

> Build **INT-2 — Engagement service** (attached spec). **One door: `requireEngagement`. Plaintext token exists only in the moment of printing.**
> Attach/read first, in order: this spec · `specs/README.md` · `../TECH-SCOPE.md` §5 · `INT-1` (schema ground truth — reuse, don't fork) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> No HTTP surface in this slice. No caller-visible expiry/miss distinction. Routes from `lib/routes.ts`. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
