# PORT — Portfolio intake track (how to work this folder)

**Epic:** PORT — the coded (showcase) intake track for tayloraucoin.com: a second track on the existing intake machine (internal key `showcase`) — public start form → $1,000/$1,900 Stripe checkout → nine-step questionnaire with extraction, per-project uploads, and a taste gallery → markdown output emailed to Taylor. First client: Kryshan Randel.
**Process model:** the Conscious Connections spec system, as already adapted for this repo in `docs/intake/specs/` — same anatomy, same closure protocol, same template (`../../intake/specs/_templates/slice-spec.md`; one home, not a copy).

## Folder layout

| Path | What |
|---|---|
| `../PORTFOLIO-INTAKE-UX-SCOPE.md` | Governing UX scope (Vesper). Its §11 D-PORT log is binding once ratified; D-INT law inherited per its §3 |
| `../portfolio-intake-questions-v2.md` | **Every question and every line of client-facing copy — verbatim.** Approved. Never paraphrase it |
| `../portfolio-intake-handoff-prompt.md` | Scoping-thread decisions 1–7 and the open-items list |
| `../PORTFOLIO-INTAKE-TECH-SCOPE.md` | Architecture pass (Mason). Placement and data law for every PORT ticket |
| `../CODED-INTAKE-CATEGORY-AUDIT.md` | The finding behind Phase 6: the nine steps read through twelve client kinds |
| `../CODED-INTAKE-KINDS-UX-SCOPE.md` | Governing UX scope for Phase 6 (Vesper). Its §11 D-PORT-8…14 are binding once ratified; its §6 tables are the copy source for every new string, draft until Taylor's pass |
| `../CODED-INTAKE-TASTE-UX-SCOPE.md` | Governing UX scope for Phase 9, the taste step (Vesper; approved by Taylor 2026-09-03). Its §14 D-PORT-15…20 bind as provisional; its §13 table is the copy source for every new string, draft until Taylor's pass |
| `00-build-order.md` | The ordered, checkable queue |
| `PORT-*.md` | One implementable slice each |
| `PROGRESS.md` / `DEVIATIONS.md` / `TECHNICAL-DECISIONS.md` | The records. `PROGRESS.md` is the only source of truth for Complete |

## Source precedence (when documents disagree)

1. Client-facing copy and field inventory → `portfolio-intake-questions-v2.md`, verbatim, flexed only at its marked points.
2. Presentation and interaction → `PORTFOLIO-INTAKE-UX-SCOPE.md` (D-PORT log), inheriting `docs/intake/INTAKE-UX-SPEC.md` (D-INT log) per its §3.
3. Architecture & placement → `PORTFOLIO-INTAKE-TECH-SCOPE.md` (M-PORT log here in `TECHNICAL-DECISIONS.md`), inheriting `docs/intake/TECH-SCOPE.md` (M-INT-1…23).
4. Site law → repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` + `docs/TASTE-PROFILE.md`.
5. On-disk reality + `DEVIATIONS.md` (this folder's, then `docs/intake/specs/DEVIATIONS.md`) override any stale string in a spec.

## Locked scope (do not re-litigate)

- **The Durable track ships byte-for-byte unaffected** (handoff decision 1). Any shared-file change carries a Durable regression check in its acceptance criteria.
- The `/websites` chooser and the coded-track sales page are **another thread's work** (`../PORTFOLIO-MARKETING-EXECUTION-SCOPE.md`) and are already built in the working tree — do not touch `app/websites/page.tsx`, `app/websites/platform/`, or `app/websites/coded/page.tsx`. This track owns `app/websites/coded/intake/**` and nothing else under `app/websites/coded/` (M-PORT-7).
- Internal track key is `showcase`; "portfolio" is public-URL vocabulary only (M-PORT-1).
- Ten steps exactly on the coded track since PORT-18 (nine before it, and nine still on the durable track); every field optional; the v2 doc's inventory plus its dated amendments is binding.
- The taste step's pick grammar is a seven-stop *closeness* scale with no default plus a note, inside a pick the client chose (D-PORT-4 **as amended by Taylor, 2026-09-03** — `../CODED-INTAKE-TASTE-UX-SCOPE.md` §14). The drag-rank is retired. Words not icons, keyboard floor, and absent-until-first-pick carry; a rating in place of a why does not return.
- No admin surface, no tRPC, no analytics on any intake path (M-INT-2/-10 inherited).

## Non-negotiables (every PORT ticket)

All of `docs/intake/specs/README.md`'s non-negotiables inherit (answers never lost; webhook-only fulfillment; the `requireEngagement` seam; no answer content, tokens, blobs, or file contents in logs; no new hexes and never `-[--` Tailwind syntax; no fabricated data anywhere; the static site stays static; migrations append-only, Taylor reviews and runs). Plus, track-specific:

- **V2 copy ships verbatim** — placeholders, help lines, button labels, validation strings. Drift is a defect, and "improved" copy is drift (Taylor's human-hand standard).
- **Nothing extracted reaches the answers document until the user has seen it** (D-PORT-3); the pasted blob is never lost and never logged.
- **The extraction blob goes to the Anthropic API and nowhere else** — no engagement identity attached, model pinned `claude-sonnet-5`.
- **Size is the only thing that may reject a file — never format, never count** — including per-project images.
- **No charge the client did not themselves initiate on hosted Checkout at a published price** (M-PORT-4 as amended by M-PORT-38, Taylor 2026-09-03). Post-intake extra pages, the care plan, and the balance stay Taylor-initiated; the one client-initiated mid-intake path is allow-listed to `showcase_animations` and settles through `settleAncillaryPurchase`, never `fulfillDeposit`.
- **The gradient ring appears exactly once in the flow: the step-6 voice-note card** (D-INT-3 / D-PORT-7).
- **This repo is Yarn 4.** `yarn build` · `npx tsc --noEmit` · `yarn lint`. Never npm (the INT-era `npm run` strings are stale).

## Kickoff contract (paste into a fresh build thread, verbatim)

```
You are building ONE ticket from docs/websites/specs/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in PROGRESS.md.
   If not, STOP and say so — never build ahead of a gate.
3. Read the ticket end to end, then its attach-list in order.
4. Read this folder's DEVIATIONS.md and TECHNICAL-DECISIONS.md, then
   docs/intake/specs/ DEVIATIONS.md + TECHNICAL-DECISIONS.md — on-disk reality
   plus those logs override any stale string in a spec.

CONSTRAINTS
- Honor every non-negotiable in specs/README.md verbatim. If the spec would force
  you to break one, STOP and ask.
- Client-facing copy comes from portfolio-intake-questions-v2.md verbatim — never
  paraphrased, never "improved".
- Placement per PORTFOLIO-INTAKE-TECH-SCOPE.md. Routes from lib/routes.ts. env via
  lib/env.ts only. Client leaves in _components/ with 'use client' on line 1.
- The Durable track at /websites/intake must be behaviorally unchanged by your work.
- Repo CLAUDE.md invariants apply (v4 token syntax; no gradient behind body copy;
  prefers-reduced-motion; no RootField on any intake surface).

DEFINITION OF DONE
1. yarn build · npx tsc --noEmit · yarn lint pass.
2. Happy path exercised against local Postgres/Supabase when the slice touches data.
3. Durable-track regression check run when any shared file was touched.
4. Ticket Status: Complete (YYYY-MM-DD).
5. PROGRESS.md row + checklist ticked.
6. One DEVIATIONS.md line per divergence; real-alternative choices → TECHNICAL-DECISIONS.md.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket must know.

Do not start the next ticket.
```

## Completion protocol

Three-place closure, every time: the ticket's `Status:` line → `PROGRESS.md` → `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when applicable). Then tick `00-build-order.md`, which mirrors and never leads.
