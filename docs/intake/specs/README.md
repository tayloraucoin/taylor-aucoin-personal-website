# INT — Client intake track (how to work this folder)

**Epic:** INT — the client intake system for tayloraucoin.com: Stripe deposit gate (Agora's account) → nine-step questionnaire → markdown output emailed to Taylor.
**Process model:** the Conscious Connections spec system (`spec-system-guide.md` in the CC repo), adapted to this single-app repo.

## Folder layout

| Path                                                                | What                                                                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `../INTAKE-UX-SPEC.md`                                              | Governing UX handoff (Vesper). **§13 decision log is binding** — cite `D-INT-n`   |
| `../TECH-SCOPE.md`                                                  | Architecture pass (Mason). Placement map §3 is the placement law for every ticket |
| `../intake-form-build-spec.md` + `../client-intake-requirements.md` | Field inventory and collection rationale — binding beneath the UX spec            |
| `../ADMIN-HANDOFF.md`                                               | Deferred admin scope — out of every INT ticket                                    |
| `00-build-order.md`                                                 | The ordered, checkable queue                                                      |
| `INT-*.md`                                                          | One implementable slice each                                                      |
| `PROGRESS.md` / `DEVIATIONS.md` / `TECHNICAL-DECISIONS.md`          | The records. `PROGRESS.md` is the only source of truth for Complete               |
| `_templates/slice-spec.md`                                          | The blank ticket                                                                  |

## Source precedence (when documents disagree)

1. Product behavior → `INTAKE-UX-SPEC.md` (D-INT log binding), then the build spec, then the requirements doc — per the UX spec's own authority header.
2. Architecture & placement → `TECH-SCOPE.md` (M-INT log in `TECHNICAL-DECISIONS.md`).
3. Site law → repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` + `docs/TASTE-PROFILE.md`. **CLAUDE.md's invariants bind every INT ticket** (v4 Tailwind token syntax, no gradient behind body copy, reduced-motion, LCP law).
4. CC conventions (`/Users/taylor/lighthouse/conscious-connections/conscious-connections/docs/architecture/codebase-conventions.md` and its domain guides) → pattern authority where 1–3 are silent, as translated by `TECH-SCOPE.md`.
5. On-disk reality + `DEVIATIONS.md` override any stale string in a spec.

## Locked scope (do not re-litigate)

- No Form A / public lead capture — the services page + Cal.com is lead capture.
- No admin surface, no tRPC, no monorepo conversion, no analytics on `/intake` (M-INT-2/-4/-10).
- No client accounts, passwords, or credential fields — ever (build spec §5).
- Nine steps exactly; the field inventory is the build spec's §4.

## Non-negotiables (every INT ticket)

- **Answers are never lost.** Autosave contract per UX spec §6.2; a failed save keeps data locally and says so.
- **Fulfillment is webhook-only; the success URL is never trusted** (TECH-SCOPE §6).
- **Nothing reads `engagements` except through `requireEngagement`** (M-INT-8).
- **No answer content, tokens, or file contents in logs, errors, or analytics.**
- **No new hexes; tokens by name; never `-[--` Tailwind syntax** (repo CLAUDE.md trap).
- **No fabricated testimonial/placeholder client data anywhere, including fixtures.**
- **The static site stays static** — nothing in `/intake` may regress PERF-01.
- **Migrations append-only; Taylor reviews and runs them.** Author SQL + journal, then stop.

## Kickoff contract (paste into a fresh build thread, verbatim)

```
You are building ONE ticket from docs/intake/specs/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in PROGRESS.md.
   If not, STOP and say so — never build ahead of a gate.
3. Read the ticket end to end, then its attach-list in order.
4. Read DEVIATIONS.md and TECHNICAL-DECISIONS.md — on-disk reality + those logs
   override any stale string in a spec.

CONSTRAINTS
- Honor every non-negotiable in specs/README.md verbatim. If the spec would force
  you to break one, STOP and ask.
- Placement per TECH-SCOPE.md §3. Routes from lib/routes.ts. env via lib/env.ts only.
- Client leaves in _components/ with 'use client' on line 1. Server Components default.
- Repo CLAUDE.md invariants apply (v4 token syntax; no gradient behind body copy;
  prefers-reduced-motion; no RootField under /intake).

DEFINITION OF DONE
1. npm run build · npx tsc --noEmit · npm run lint pass.
2. Happy path exercised against Supabase when the slice touches data.
3. Ticket Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence; real-alternative choices → TECHNICAL-DECISIONS.md.
6. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket must know.

Do not start the next ticket.
```

## Completion protocol

Three-place closure, every time: the ticket's `Status:` line → `PROGRESS.md` → `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when applicable). Then tick `00-build-order.md`, which mirrors and never leads.
