# CRM track — how to work this folder

**Kind:** Contract (per-track). Modeled on `docs/intake/specs/README.md` and the CC spec-system guide.

## Folder layout

| File | Job |
|---|---|
| `../CRM-UX-SPEC.md` | Product behavior. §6 decision log (D-CRM-1…30) is binding; §3.8 is the call-mode contract |
| `../TECH-SCOPE.md` | Architecture, placement, data model. Ratified 2026-08-21 |
| `00-build-order.md` | The ordered, checkable queue |
| `CRM-<n>-<slug>.md` | One ticket per slice (authored in batches; see build order) |
| `PROGRESS.md` | The only source of truth for Complete |
| `DEVIATIONS.md` | Append-only: `YYYY-MM-DD · <id> · <what> · <why>` |
| `TECHNICAL-DECISIONS.md` | Append-only ADRs, `M-CRM-n` |

## Source precedence

1. Product behavior → `CRM-UX-SPEC.md` (D-CRM log binding). The client-facing promo ticket (CRM-8) additionally answers to `docs/intake/INTAKE-UX-SPEC.md` §13.
2. Architecture/placement → `../TECH-SCOPE.md`, which inherits `docs/intake/TECH-SCOPE.md` wholesale.
3. Site law → repo `CLAUDE.md` (D-CRM-16 exempts `/admin` from the visual law; every other rule stands).
4. **On-disk reality + `DEVIATIONS.md` override any stale string in a spec.**

## Locked scope (do not re-litigate)

- Three-axis model; stage derived, never stored (D-CRM-1/2).
- Sync never touches admin-owned columns (D-CRM-11; column lists in TECH-SCOPE §4).
- No SMS sending, no analytics on `/admin`, no urgency devices anywhere (D-CRM-14/16).
- Reminder ceiling stays three; the kill switch only kills (D-CRM-13).
- The two published leadgen CSVs stay frozen; sync consumes only the `--crm` export (M-CRM-5).

## Kickoff contract (paste into a build thread)

```
You are building ONE ticket from docs/crm/specs/: <TICKET-ID>.
OBJECTIVE: ship the ticket's Acceptance criteria — nothing more, nothing less.
BEFORE CODE: state the ticket ID; confirm every "Depends on" entry shows Complete
in PROGRESS.md (if not, STOP); read the spec, then its attach-list in order, then
DEVIATIONS.md + TECHNICAL-DECISIONS.md — reality + logs override stale spec strings.
CONSTRAINTS: honor every non-negotiable verbatim — if the spec forces a break, STOP
and ask. Routes from lib/routes.ts; env through lib/env.ts; server actions thin;
requireAdmin() in every admin action; no Supabase key in any client bundle.
DONE: npm run build · npx tsc --noEmit · npm run lint pass; happy path exercised
against Supabase when the slice touches data; Status line set; PROGRESS.md ticked;
one DEVIATIONS.md line per divergence; close with 3–5 lines. Do not start the next ticket.
```

## Status

Original scoping ratified 2026-08-21; CRM-1…12 built and Complete via batched passes (see DEVIATIONS).
Call-mode redesign (v1.2, D-CRM-23…30) scoped 2026-08-22 — tickets **CRM-13…16** authored; build order Phase 5. `../CALL-SHEET.md` is content consumed by CRM-15 (D-CRM-28): edits to it are Taylor's, not a build concern.
