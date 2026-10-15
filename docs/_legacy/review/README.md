# REV — Client design review (how to work this folder)

**Epic:** REV — the review backend for tayloraucoin.com: every client site built from `client-boilerplate` carries a `/review/*` layer where the client pins comments on mocks and submits a preference form; those land here, admitted by the shared sister-repo key and filed under the client site's static `clientApp`, and Taylor reads them by email and at `/admin/design-reviews`.
**Process model:** the Conscious Connections spec system as adapted in `docs/intake/specs/` — same anatomy, same closure protocol, same template (`../intake/specs/_templates/slice-spec.md`; one home, not a copy).

## Folder layout

| Path | What |
|---|---|
| `REVIEW-BACKEND-CONTRACT.md` | **The contract between the two codebases.** A copy — the canonical file is `client-boilerplate/docs/REVIEW-BACKEND-CONTRACT.md`. Change that one first, then this one, then both implementations |
| `specs/00-build-order.md` | The ordered, checkable queue |
| `specs/REV-*.md` | One implementable slice each |
| `specs/PROGRESS.md` / `specs/DEVIATIONS.md` / `specs/TECHNICAL-DECISIONS.md` | The records. `PROGRESS.md` is the only source of truth for Complete |

## Source precedence (when documents disagree)

1. Wire shapes, statuses, storage → `REVIEW-BACKEND-CONTRACT.md` (§1–§5). It binds both repos; a change here without a change there is a defect.
2. Architecture, placement, and data law → `specs/TECHNICAL-DECISIONS.md` (M-REV-n), inheriting `docs/intake/specs/TECHNICAL-DECISIONS.md` (M-INT-5, M-INT-6, M-INT-8 — the CLI-minted, hashed credential and the one-door seam).
3. Site law → repo `CLAUDE.md`. No surface renders in this epic yet, so `docs/DESIGN-SYSTEM.md` and `docs/TASTE-PROFILE.md` bind only when one does.
4. On-disk reality + `specs/DEVIATIONS.md` override any stale string in a spec.

## Locked scope (do not re-litigate)

- **The caller is a server, never a browser.** No CORS, no origin check, no public token (contract §6). A future browser surface gets its own token and its own ticket.
- **One shared key, `REVIEW_INGEST_KEY`, the same in this repo and every client site** (M-REV-6, superseding M-REV-1). It says "one of Taylor's repos"; the `X-Review-Client-App` header says which. Rounds are created on first contact; there is no minting. A leaked key is rotated here and in every client site.
- **Every write is idempotent on a client-supplied `id`.** The client site retries lost writes with the same id, and a retry must be a no-op end to end — including the submission email.
- **No admin UI for reading results.** Taylor reads the email and the table. Roadmap, not this epic's first slice.
- **No editing of comments.** Delete and re-add.

## Non-negotiables (every REV ticket)

All of `docs/intake/specs/README.md`'s non-negotiables inherit. Plus:

- **Every ingest request resolves its round through `resolveRoundFromRequest`** (key check, identity headers, find-or-create). One door, as `requireEngagement` is for engagements (M-INT-8, M-REV-6).
- **No comment text, no submission text, no key in logs, errors, or responses beyond what the contract returns.** Ids and counts only, tagged `[review]`. The submission email is the one place the free text travels, because it is Taylor's own inbox.
- **Responses are exactly the contract's.** Four fixed error bodies; every success `{ ok: true, ... }`. A handler never composes its own.
- **Migrations append-only; Taylor reviews and runs them.** Author SQL + journal, then stop.
- **Env only through `lib/env.ts`, and no new variables** — the ingest uses `DATABASE_URL`, `RESEND_API_KEY`, and `INTAKE_NOTIFY_EMAIL`, which exist.

## Kickoff contract

Use `docs/intake/specs/README.md`'s kickoff contract verbatim, substituting `docs/review/specs/` and reading `REVIEW-BACKEND-CONTRACT.md` first in the attach-list. Commands are Yarn 4 (`yarn build:agent`, `npx tsc --noEmit`, `yarn lint`) — never `npm`, never `yarn build` (repo `CLAUDE.md` § Working method).

## Completion protocol

Three-place closure, every time: the ticket's `Status:` line → `specs/PROGRESS.md` → `specs/DEVIATIONS.md` (+ `specs/TECHNICAL-DECISIONS.md` when applicable). Then tick `specs/00-build-order.md`, which mirrors and never leads.
