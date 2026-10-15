---
title: "0001 — tayloraucoin.com adopts the practice in place, its old docs kept whole as history under docs/_legacy/"
description: Read before changing the spine, the settings, the verify chain or the House rules, or before asking where an old doc, tracker item or instruction line went. Holds every ruling of the migration, each line not carried, each named adjustment and each drafted ticket.
layer: decisions
status: ruling
thread: "MIG"
role: Usher
date: 2026-10-14
last_reviewed: 2026-10-14
supersedes:
load_when:
---

# 0001 — tayloraucoin.com adopts the practice in place, its old docs kept whole as history under docs/_legacy/

## Context and problem

taylor-aucoin is one Next.js 15 app at the repo root (no workspaces, no Turbo), Yarn 4, with Stripe, Supabase, Resend, Anthropic and OpenAI. It had its own spine: a `CLAUDE.md` holding the design law, invariants and traps learned by breaking them, and an `AGENTS.md` holding only Next's vendor block. Its records were 164 markdown files under `docs/` in its own format: seven tracks with specs, progress, deviation and decision logs, three UX specs, design guides, a v1 backlog and a v3 sprint, ten role prompts and a parked operation. The assessment scored it far (23 of 34; S1 = 2). Nothing in `docs/` carried frontmatter, and the practice installs into `docs/`.

- Toolkit: `git@github.com:tayloraucoin/product-engineering-mastery.git` at `80699b2` (branch `feature/conventions-setup`).
- Procedure: the toolkit's `docs/runbooks/migrate/README.md`, `verify.md` and `layer-3.md`, legacy mode, on branch `feature/pem-migration` from `main` at `44a749a`.
- Ruled by Taylor in the question tool on 2026-10-14. The full table is `specs/_shared/epics/MIG-migration/rulings.md`; the report is `assess.md` beside it.

## Considered options

1. Adopt in place, legacy mode: the whole host `docs/` moves to `docs/_legacy/` in one rename commit, `docs/` holds only the practice, and the host's open work becomes drafted tickets.
2. Adopt in place, stay-in-place mode: the host's docs stay where they are and each record kind is mapped, moved or indexed one by one beside the practice's files.
3. A fresh duplicate of the toolkit with the code moved in (the new-project track): loses the history.

## Decision

Chosen: option 1, Taylor's ruling (40). The host's records keep their history and their links to each other because they move together, nothing collides under `docs/` (the host's `docs/roles/` was the one collision), and agents read one spine. `yarn verify` and the end check prove it.

### The rulings

| #     | Ruling                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01-03 | Toolkit at `80699b2`; protected branch `main` (`44a749a` = `origin/main`); migration branch `feature/pem-migration`, reset to `main` by Taylor's go-ahead after PR #25 merged the same two commits with an identical tree |
| 11-15 | Prefix `TAY`; app `web` at `.` (`WEB`); tier `overlay`; `agent/{id}`; `db/migrations`; layers 1 and 2 in one day; path far                                                                                                |
| 21    | No conflict listed                                                                                                                                                                                                        |
| 22    | Floor team; push deny operator; session-start and results-gate team; bash-guard and stop-gate operator; sandbox and allow list operator                                                                                   |
| 23    | Operator sandbox hosts: Stripe, Supabase, Resend, Anthropic, OpenAI, the Yarn and npm registries (and loopback)                                                                                                           |
| 24    | Skipped: no tracked settings file. Taylor's untracked local file kept, additions only                                                                                                                                     |
| 31-34 | The human-line table below; 32's ladder as far as `yarn budget` needed; brief "Add a hover glow to the CTA" (passed: a fresh session named `house-design.md`); no nested files                                            |
| 40-45 | Legacy mode; nothing outside `docs/` to map; `AGENTS.md` and `CLAUDE.md` kept whole; move now; the call sheet to `content/crm/call-sheet.md`; 21 open host items drafted                                                  |
| —     | The brand scan to `docs/product/brand/repo-scan.md`; comment paths rewritten in one path-only commit; layer 3 drafted, never built                                                                                        |
| 51-54 | `verify` = lint, typecheck, the smoke test, `build:agent`, then the toolkit's nine checks; no freeze; CI a drafted gap; Taylor runs every hosted step; `build:agent` and `hooks:install` run unsandboxed with his yes     |
| —     | Stripe skills (amendment): `yarn budget`'s skill-body row was red on them, so the eight skills and `skills-lock.json` left the repo and are installed whole at `~/.claude/skills/`                                        |

### The move

- `1dc12bb` (`TAY: migrate step 4, the host's docs to docs/_legacy`): 169 files, 166 of them pure renames. `docs/crm/CALL-SHEET.md` became `content/crm/call-sheet.md`, with `app/admin/(protected)/queue/page.tsx:30` and `next.config.ts:134` changed to the new path; `docs/brand/repo-scan.md` became `docs/product/brand/repo-scan.md`; a new `.prettierignore` keeps the history, the call sheet and the brand scan byte for byte.
- `6747f31` (`TAY: migrate step 4, the paths that pointed into docs/`): 52 paths in 40 files rewritten to their new homes: code comments, `.env.example` comments and two READMEs, nothing else. The 19 edited files that already failed the host's Prettier sit under `.prettierignore`'s `# migrate 4b` comment until layer 3 part 10.
- The old instruction files are kept whole at `docs/_legacy/agents-md-2026-10-14.md` and `docs/_legacy/claude-md-2026-10-14.md`.

What each folder under `docs/_legacy/` holds:

- `admin/`, `crm/`, `finance/`, `intake/`, `pipeline/`, `review/`, `websites/`: each track's scopes and briefs, and under `specs/` its tickets, `PROGRESS.md`, `DEVIATIONS.md`, `TECHNICAL-DECISIONS.md` and build order. Three hold the UX specs: `admin/ADMIN-UX-SPEC.md`, `crm/CRM-UX-SPEC.md`, `intake/INTAKE-UX-SPEC.md`.
- `DESIGN-SYSTEM.md`, `SITE-SPEC.md`, `TASTE-PROFILE.md`: the design law, named by `.claude/rules/house-design.md` and `ui.md` until layer 3 part 9.
- `AGORA-STRIPE.md`: the Agora invoicing and Stripe notes, cited by code comments.
- `TICKETS.md`: the v1 backlog and the CON track. `tickets/v3-contract-sales/`: the v3 sprint (shipped).
- `roles/`: the host's ten role prompts. The practice's seats are now `docs/roles/`.
- `pending/cho-ventures-naming/`: a parked operation (WEB-21).

Host procedures retired: appending to a track's `PROGRESS.md`, `DEVIATIONS.md` or `TECHNICAL-DECISIONS.md` at a ticket's close. The practice's `as-built.md`, the ledger and `specs/_status.md` replace them. No host file under `docs/_legacy/` is edited.

Links the move broke, listed and not rewritten:

- `docs/_legacy/crm/specs/CRM-18-leads-workspace.md`: five relative links (`../../../app/admin/(protected)/…`, `../../../server/services/leads.ts`) now resolve one folder short.
- Seven files under `docs/_legacy/crm/` name `docs/crm/CALL-SHEET.md` 18 times in prose (`CALL-MODE-BRIEF.md`, `CRM-UX-SPEC.md`, and in `specs/`: `CRM-15`, `CRM-17`, `DEVIATIONS.md`, `README.md`, `TECHNICAL-DECISIONS.md`). The file is now `content/crm/call-sheet.md`.

### The human lines

From the old `CLAUDE.md` (line numbers are `docs/_legacy/claude-md-2026-10-14.md`'s). Each `docs/` path inside a carried line now reads `docs/_legacy/`, the one edit a carried line took.

- To `.claude/rules/house-design.md`, verbatim: the one rule (5-11), the Stack's Tailwind, Motion and no-component-library bullets (16-18), the invariants (33-44), the known traps (46-62) and Do not (64-72). By 32's second rung, the `next/image` trap's narrative (50-57) is a pointer to the kept copy, with its rule sentences verbatim.
- To `AGENTS.md` House rules, verbatim: the Stack's Next, content and deploy bullets (15, 19, 20), the `dev:agent` and `build:agent` paragraph (78), the placeholder-copy line (80).
- Not carried: 1-3 (this file was the contract; `AGENTS.md` is now); 24's npm line (the bash guard enforces Yarn); 24's `yarn add --exact` (`deps.md` says pin exactly with `yarn add`); 26-31 (the commands list replaces it); 76 (the work loop, `tk-batch` and `verify` replace one ticket at a time from `docs/TICKETS.md`).
- `AGENTS.md`'s `nextjs-agent-rules` block: vendor-owned and dropped. Next 15.5.23 has no generator and no `node_modules/next/dist/docs/`, so its instruction was false here.

### Settings rows ruled operator

In `.claude/settings.local.json` (gitignored from step 5, `.gitignore` line 53), added to Taylor's existing allow rows: deny `Bash(git push)` and `Bash(git push *)`; the `bash-guard.ts` PreToolUse hook; the `stop-gate.ts` Stop hook; the toolkit's sandbox block with 23's hosts; the toolkit's allow list. `yarn doctor` checks the operator rows. Its 41-rule warning is Taylor's to prune.

### Named adjustments to practice files

The table in `rulings.md` ("Named adjustments to practice files"): `AGENTS.md`, `CLAUDE.md`, `docs/index.md`, the four derived path rules, `tooling/tsconfig.json`, the two hook fixtures and the `spine-without-index/` fixture root, three fixture folders the manifest lacks, three scripts beyond step 3's list (`cost`, `contract:built`, `test:tooling`), and the host's `tsconfig.json`, `eslint.config.mjs` and `.prettierignore` excluding `tooling/`. Also skipped: the manifest's `.claude/skills/shadcn/` (no `components.json`), and layer 3 part 8 (`"use client"` placement), since V4 scored 0. `testing.md`'s `*.test.tsx`, `*.spec.ts` and `playwright.config.*` globs match no file until tests of those kinds exist.

### Gaps drafted

Under `specs/_shared/epics/MIG-migration/tickets/`:

- MIG-1 to MIG-2, day-one gaps: MIG-1 UX promotion, MIG-2 CI running `yarn verify`.
- MIG-3 to MIG-17, layer 3:
  - MIG-3 toolchain majors (part 1).
  - MIG-4 migration check (part 2, Q3).
  - MIG-5 tests beyond the smoke test (part 3).
  - MIG-6 boundaries lint (part 4).
  - MIG-7 env seam (part 5).
  - MIG-8 to MIG-11 SDK seams (part 6): billing, auth, email, AI.
  - MIG-12 token preset (part 7).
  - MIG-13 design layer (part 9).
  - MIG-14 format-all (part 10).
  - MIG-15 the restructure into `apps/web` (part 11, its own epic, last).
  - MIG-16 day-one leftovers (part 12).
  - MIG-17 the docs app (part 13).

The host's open items, under `specs/web/one-offs/`, each opening with `Source: docs/_legacy/…`:

| Ticket | Host item        | Ticket | Host item                               |
| ------ | ---------------- | ------ | --------------------------------------- |
| WEB-1  | FIN-2            | WEB-12 | PORT-35                                 |
| WEB-2  | FIN-3            | WEB-13 | CON-08 (with CON-02/03's keyboard pass) |
| WEB-3  | FIN-4            | WEB-14 | CON-04                                  |
| WEB-4  | FIN-5            | WEB-15 | PERF-01 to 03 (with v3 QA-03)           |
| WEB-5  | FIN-6 (residual) | WEB-16 | SEO-02                                  |
| WEB-6  | FIN-7 (residual) | WEB-17 | SEO-03                                  |
| WEB-7  | CRM-18 (verify)  | WEB-18 | PRIM-05                                 |
| WEB-8  | CRM-19           | WEB-19 | HERO-02                                 |
| WEB-9  | ADM-3            | WEB-20 | SIG-02                                  |
| WEB-10 | INT-3 to INT-8   | WEB-21 | cho-ventures-naming                     |
| WEB-11 | PIPE-5           |        |                                         |

Closed and left as history: the v3 sprint (shipped in 05d1db9 and 9ee268c); the v1 items the code holds; REV-1 to 5 (REV-5 shipped in 3e67805 with no tracker row); PIPE-1 to 4 and 6; the pins and roadmap lines never authored. Those are the FIN later items, the four PIPE roadmap lines, ADM's rail collapse and `no-restricted-imports` rule, and the contact form. The hosted steps closed items still owe are hand-over lines, not tickets.

## Consequences

- **Buys:** one `yarn verify` over the repo's own checks and the practice's; the work loop, roles, subagents and house skills; the floor in every checkout; the old design law where an agent meets UI; every record with its history; every open host item findable by its old id.
- **Costs:**
  - `yarn verify` runs unsandboxed, because `build:agent` reads `.env.local`.
  - The always-on context is at 3,704 of 4,000 tokens and the path rules at 1,437 of 1,500, so a new House rule displaces a line.
  - No CI until MIG-2.
  - The Stripe skills live only in Taylor's `~/.claude/skills/`.
- **Forecloses:** the host's spec format for new work; new work is specified under `specs/`.

## Revisit trigger

A second committer joins (the bash guard and stop gate move to team; MIG-16's split); MIG-1 promotes `specs/web/ux/` and MIG-13 writes the design layer (the `ui.md` and `house-design.md` pointers change); or `yarn budget` fails on a House rule the ladder cannot place.
