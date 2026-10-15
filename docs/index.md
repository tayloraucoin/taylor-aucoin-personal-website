# The practice

The rules people and agents build by in this repo: the practice installed from the toolkit (product-engineering-mastery) on 2026-10-14, and the site and admin it governs. The host's docs from before the practice are history under `docs/_legacy/`.

## Layers

| Layer         | Where                                      | What it is                                                                                                                                                                                                                                                                    | Loads                                             |
| ------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Agent context | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` | What every agent is told: commands, the work loop, House rules, path rules (`house-design.md` is the product's design law)                                                                                                                                                    | always / by path                                  |
| Workflows     | `docs/workflows/`                          | How work moves: the prompt builder (the front door), `tracks/`, shared `stages/`, QA levels, branches                                                                                                                                                                         | the builder when work starts; the rest on request |
| Decisions     | `docs/decisions/`                          | Why the rules are what they are: `ledger.md` (index), `records/`, `changelog.md`                                                                                                                                                                                              | grep on demand                                    |
| Roles         | `docs/roles/<department>/`                 | Who does the work: one prompt per seat; `.claude/agents/` is generated from them                                                                                                                                                                                              | injected, or as a subagent                        |
| Design        | `docs/design/`                             | What UI is built and judged by: Recipe A (`README.md`), `workflow.md`, `skills.md`, `canon.md`, `canon-rubric.md`, `templates/`                                                                                                                                               | by path on UI files                               |
| Engineering   | `docs/engineering/`                        | What code is placed and shipped by: conventions, the stack, templates, schemas; checks in `tooling/`                                                                                                                                                                          | on request; checks always                         |
| Product       | `docs/product/`                            | How work is framed: brief, package, cycle-charter, glossary templates; `brand/` (the brand track's repo scan)                                                                                                                                                                 | when shaping                                      |
| Measurement   | `docs/measurement/`                        | How a change is proven: `metrics/` and `evals/` templates                                                                                                                                                                                                                     | when instrumenting; evals for an AI surface       |
| Runbooks      | `docs/runbooks/`                           | `onboard-agent.md`; the migrate manifest this repo was installed from                                                                                                                                                                                                         | on request                                        |
| Skills        | `.claude/skills/`                          | `tk-batch`, `tk-prompt` (the Stripe skills live at user level, record 0001)                                                                                                                                                                                                   | listing always; body on trigger                   |
| Specs         | `specs/`                                   | `_status.md`; `web/` (the living truth once promoted, and the host's open work as drafted tickets); `_shared/epics/MIG-migration/` (the run and layer 3)                                                                                                                      | by path                                           |
| Legacy        | `docs/_legacy/`                            | The host's docs before the practice, byte for byte: specs, trackers, decision and deviation logs, UX specs, design guides, role prompts, the old `AGENTS.md` and `CLAUDE.md`. History; law only where `AGENTS.md` or a path rule names a file (record 0001 lists each folder) | named files only                                  |

## Precedence (highest first)

1. **Enforced checks.** Lint, types, tests, the critic gate in CI.
2. **The session's explicit instruction.** The agent names any rule the instruction breaks.
3. **The design layer.** `canon.md` is the floor. The product's DESIGN, tokens, components, states and anti-patterns may tighten it, never loosen it.
4. **Accepted decisions** in `docs/decisions/`.
5. **The brief, the UX spec and the contract.** They may request an exception; they never grant one. Stage files (`docs/workflows/stages/`) sit at rung 2 with the session's instruction: their interview mode governs behaviour, never law.
6. **References.**
7. **Role judgment.** It fills silences, labeled as judgment.

## What loads when

- **Always**, the repo's share of each session (≤4,000 tokens; the tool's own prompt, tools and built-in skills come on top): `AGENTS.md` (≤100 lines), `CLAUDE.md` (shim, ≤20 lines), this file (≤80 lines), the skill and subagent listings (≤12 model-invocable skills, descriptions ≤400 characters), and SessionStart hook output (≤150).
- **By path:**
  - `.claude/rules/ui.md` on UI files loads `canon.md` and the product design layer; `ts.md`, `testing.md`, `next.md`, `turbo.md`, `docs.md`, `specs.md` and `deps.md` load on their globs.
  - Nested `AGENTS.md` files load in `apps/` and `packages/`.
- **By trigger:** `tk-motion` on motion work; `shadcn` on component work; references through `docs/references/README.md`, at most 3 files per task.
- **On request:** roles, templates (when filling one), runbooks, decisions (grep the ledger), prompts, workflows.
- **Never:** `docs/research/` (A11: a Frame, Research or UX prompt may attach one file as `[research: <why>]` when nothing distilled covers it; never a build thread); `docs/references/_meta/` outside a library batch; `PROVENANCE.md` outside a disputed finding; `docs/_generated/`; every `README.md` under `docs/` except the references router and `docs/workflows/README.md`.

## Budget per build

This table is the CI contract read by `tooling/budget.ts`.

| Build                   | Loads                                                                                                   | Cap (tokens) |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| UI build                | always 4,000 + design layer 5,000 + brief and package 2,000 + references 1,500 + one skill body 2,500   | 15,000       |
| Non-UI build            | always 4,000 + path rules and nested `AGENTS.md` 1,500 + contract and cited spec 5,000                  | 10,500       |
| Critic pass (forked)    | `canon-rubric.md` and canon §2 + the cited surface file + ≤3 exemplars (screenshots excluded)           | 6,000        |
| Evaluator pass (forked) | evaluator body 4,500 + contract and cited spec 5,000 + evidence index 500 (never the builder's summary) | 10,000       |

A product's own design layer gets about 1,700 of the 5,000; `canon.md` takes the rest. A product `DESIGN.md` holds deltas, never restatements.

## Changing the practice

- Amend the file.
- Add a `changelog.md` entry; a ledger line only for a ruling others will cite; a record in `records/` only for a choice that is hard to undo.
- Nothing lives in two places.
- Prune monthly, using the deletion test on every always-on line. Re-run the critic calibration and the trigger tests at every model upgrade.
