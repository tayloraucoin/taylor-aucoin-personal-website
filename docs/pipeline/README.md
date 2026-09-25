# PIPE — Engagement pipeline (how to work this folder)

**Epic:** PIPE — the delivery playbook for a client engagement, reverse-engineered from the Kryshan engagement (2026-09). One ordered list of steps Taylor manages at `/admin/pipeline`; each step carries a markdown prompt he copies into a Claude session, and optionally a client email template. On an engagement's page the same steps become a checklist: copy the prompt with that client's values filled in, mark it done, and — on an email step — compose and send from `hello@` to the client.
**Process model:** the Conscious Connections spec system as adapted in `docs/intake/specs/` — same anatomy, same closure protocol, same template (`../intake/specs/_templates/slice-spec.md`; one home, not a copy).

**Origin.** Taylor, 2026-09-25: "reverse engineer the process that I took with him in order to have a clear pipeline within the admin." Scope and defaults ratified the same day ("Defaults are fine").

## Folder layout

| Path | What |
|---|---|
| `EMAIL-BRIEFS.md` | What each of the three client emails must say. Facts and obligations only — the words are Taylor's |
| `specs/00-build-order.md` | The ordered, checkable queue |
| `specs/PIPE-*.md` | One implementable slice each |
| `specs/PROGRESS.md` / `specs/DEVIATIONS.md` / `specs/TECHNICAL-DECISIONS.md` | The records. `PROGRESS.md` is the only source of truth for Complete |

## Source precedence (when documents disagree)

1. Architecture, placement, and data law → `specs/TECHNICAL-DECISIONS.md` (M-PIPE-n), inheriting `docs/intake/specs/TECHNICAL-DECISIONS.md` (M-INT-7 derived status, M-INT-8 the one-door seam) and `docs/crm/specs/TECHNICAL-DECISIONS.md` (M-CRM-3, the as-sent email record).
2. Admin surface law → `docs/admin/ADMIN-UX-SPEC.md` (D-ADM log: nav order, icons, Light / Dark / System) and `docs/DESIGN-SYSTEM.md` § Admin surface tokens.
3. Site law → repo `CLAUDE.md`. `docs/TASTE-PROFILE.md` § voice binds every word a client receives.
4. On-disk reality + `specs/DEVIATIONS.md` override any stale string in a spec.

## Locked scope (do not re-litigate)

Ratified by Taylor 2026-09-25:

- **One pipeline.** No per-track pipelines; no `pipelines` parent table. A second track's playbook is one additive migration when it is real (M-PIPE-1).
- **At most one email per step.** A second email is a second step, which keeps the list linear.
- **Registrar instructions are pasted per send** into a variable, not kept as a library.
- **Prompts and templates are data, edited in the admin.** Not files in the repo, not a CMS.
- **Plain-text email, from `hello@`, to the engagement's `contact_email`.** No HTML template, no attachments, no CC.
- **Taylor writes every word a client receives.** Placeholder templates ship marked; no agent drafts client copy (memory: human-hand copy standard).

## Non-negotiables (every PIPE ticket)

All of `docs/intake/specs/README.md`'s non-negotiables inherit. Plus:

- **A client never receives a literal `{{placeholder}}`.** The send is refused in the service while any placeholder is unresolved — not merely disabled in the UI (M-PIPE-2).
- **The row is written before the send.** A failed send leaves a visible failed record, never nothing (M-PIPE-3, after M-CRM-3).
- **The recipient comes from the record, inside the service.** The address is shown in the confirm; it is not a field the form posts.
- **No prompt text, email body, or pipeline value in logs or errors.** Ids and counts only, tagged `[pipeline]`.
- **Migrations append-only; Taylor reviews and runs them.** Author SQL + journal + the setup file, then stop.
- **Env only through `lib/env.ts`, and no new variables** — sends use `RESEND_API_KEY` and `NEXT_PUBLIC_SITE_URL` through the existing `from()`.
- **Every admin path from `adminRoutes`.** No inline path strings.

## Kickoff contract

Use `docs/intake/specs/README.md`'s kickoff contract verbatim, substituting `docs/pipeline/specs/`. Commands are Yarn 4 (`yarn build:agent`, `npx tsc --noEmit`, `yarn lint`) — never `npm`, never `yarn build` (repo `CLAUDE.md` § Working method).

## Completion protocol

Three-place closure, every time: the ticket's `Status:` line → `specs/PROGRESS.md` → `specs/DEVIATIONS.md` (+ `specs/TECHNICAL-DECISIONS.md` when applicable). Then tick `specs/00-build-order.md`, which mirrors and never leads.
