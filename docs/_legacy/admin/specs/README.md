# ADM — Admin shell + intake review (how to work this folder)

**Epic:** ADM — restructure `/admin` navigation onto the Conscious Connections
section-and-item model, and add an Intake section whose first surface is a
single-scroll review of every question the intake asks.
**Process model:** the same spec system as `docs/intake/specs/` and
`docs/crm/specs/`.

## Folder layout

| Path                                                       | What                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `../ADMIN-UX-SPEC.md`                                      | Governing UX handoff (Vesper). **§8 decision log is binding** — cite `D-ADM-n` |
| `../TECH-SCOPE.md`                                         | Architecture pass (Mason). Placement map §3 is the placement law               |
| `../../intake/ADMIN-HANDOFF.md`                            | Vesper's deferred-admin content notes. Its cautions bind this track            |
| `00-build-order.md`                                        | The ordered, checkable queue                                                   |
| `ADM-*.md`                                                 | One implementable slice each                                                   |
| `PROGRESS.md` / `DEVIATIONS.md` / `TECHNICAL-DECISIONS.md` | The records. `PROGRESS.md` is the only source of truth for Complete            |

Ticket format is `docs/intake/specs/_templates/slice-spec.md`. This folder does
not keep its own copy.

## Source precedence (when documents disagree)

1. Product behavior and visual law for `/admin` → `../ADMIN-UX-SPEC.md`
   (D-ADM log binding).
2. Architecture and placement → `../TECH-SCOPE.md` (M-ADM log in
   `TECHNICAL-DECISIONS.md`).
3. Site law → repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` +
   `docs/TASTE-PROFILE.md`. **CLAUDE.md's invariants bind every ADM ticket**
   (v4 token syntax, no gradient behind body copy, reduced-motion, focus rings).
4. Intake behavior → `docs/intake/specs/` and its D-INT / M-INT logs. This track
   consumes the intake; it does not get to change it.
5. CC conventions
   (`/Users/taylor/lighthouse/conscious-connections/conscious-connections/packages/ui/src/composed/navigation/admin-shell/`)
   → pattern authority where 1–4 are silent. **Structure transfers; look does
   not** (D-ADM-1).
6. On-disk reality + `DEVIATIONS.md` override any stale string in a spec.

## Locked scope (do not re-litigate)

- **Questions stay hardcoded.** No `questions` table, no CMS, no admin editing
  of question copy. Taylor's explicit call, 2026-09-01. Any ticket that proposes
  a schema for questions is out of scope by definition.
- **No new dependency beyond `lucide-react` and `next-themes`.** The first is
  ratified (D-ADM-1, 2026-09-01) for `/admin` icons; the second carries the
  theme control (D-ADM-13, M-ADM-8, 2026-09-03), ratification pending. No `@dnd-kit`, no shadcn registry, no icon on
  a public surface. The rail is hand-built; the only overlay is the vendored
  Radix sheet.
- **No CRM behavior changes.** ADM-1 moves links. It does not touch the queue,
  the lead drawer, call mode, sync, or any server action.
- **No engagement data on the preview surface.** It renders an empty
  questionnaire and has nothing to read.

## Non-negotiables (every ADM ticket)

- **The preview cannot write.** No network request, no `localStorage` write, no
  server action, on any preview interaction. Proven by a stated run, not
  asserted (TECH-SCOPE §5).
- **Question copy exists once.** The preview mounts production components. No
  manifest, no transcription, no paraphrase (D-ADM-6).
- **The client intake path is unchanged.** After ADM-2, a real intake step still
  autosaves, still recovers from `localStorage`, still shows its indicator.
- **No fabricated client or sample data** anywhere, including preview prefill
  (`docs/intake/ADMIN-HANDOFF.md`).
- **No new hexes; tokens by name; never `-[--` Tailwind syntax.**
- **Every interactive element keeps its `:focus-visible` ring** (`PRIM-04`).
- **Copy in the admin is Taylor's register** — plain, short, no marketing voice
  and no exclamation. Placeholder copy is flagged, not polished.

## Kickoff contract (paste into a fresh build thread, verbatim)

```
You are building ONE ticket from docs/admin/specs/: <TICKET-ID>.

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
- Placement per ../TECH-SCOPE.md §3. Routes from lib/routes.ts only.
- Client leaves in _components/ with 'use client' on line 1. Server Components default.
- Repo CLAUDE.md invariants apply (v4 token syntax; no gradient behind body copy;
  prefers-reduced-motion; focus-visible rings).
- No new npm dependency beyond `lucide-react` and `next-themes`. If you believe you need
  another, STOP and ask. Installs are `yarn add` — never npm.

DEFINITION OF DONE
1. yarn build · npx tsc --noEmit · yarn lint pass.
2. The ticket's stated verification RUN, with its result quoted.
3. Ticket Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence; real-alternative choices → TECHNICAL-DECISIONS.md.
6. Close with 3-5 lines: what shipped, deviations, the one thing the next ticket must know.

Do not start the next ticket.
```

Note the package manager: **Yarn 4**. `npm install` is forbidden by repo
`CLAUDE.md` and will corrupt the lockfile.

## Completion protocol

Three-place closure, every time: the ticket's `Status:` line → `PROGRESS.md` →
`DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when applicable). Then tick
`00-build-order.md`, which mirrors and never leads.
