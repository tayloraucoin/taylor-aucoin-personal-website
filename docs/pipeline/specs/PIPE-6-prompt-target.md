# PIPE-6 — Where a prompt runs: Claude or Claude Code

**Epic:** PIPE — engagement pipeline · **Phase 2 (amendment)** · Size: S
**Slice type:** One enum column, one form control, two labels. Risk class: a migration that fails on rows saved before it (the `0018` trap).
**Review:** Mason (the backfill inside `0021`).

**Status:** Complete (2026-09-25) — build, typecheck, lint clean; `0021` applied over pre-existing rows on a throwaway Postgres 15; integration pass 21/21

---

## Outcome

Every prompt step says where its prompt runs, either a regular Claude chat or a Claude Code session. Taylor chooses it with a required "Runs in" choice under the Prompt heading. The playbook list reads "Claude prompt" or "Claude Code prompt", and on both the playbook and an engagement's checklist the copy button names the destination: "Copy for Claude", "Copy for Claude Code". An email-only step has no target. This slice changes nothing about emails, variables, or ordering.

## Why / intent

- **Taylor, 2026-09-25** — "for a prompt step, add a selector for whether it is a regular Claude prompt (not Claude Code) and which are for Claude Code."
- **M-PIPE-7.**

**Rulings this slice makes (labelled, logged):**

- **A required choice with no default.** A default would label every step it was never changed on, silently. Two radio buttons are cheap. Logged.
- **The destination is on the copy button,** at the moment Taylor needs it, not only in the row's metadata. Logged.
- **Labels are the product names, "Claude" and "Claude Code"** (`PROMPT_TARGET_LABELS`), nothing added. Logged.

## Experience & states

Editor: "Runs in ( ) Claude ( ) Claude Code" between the Prompt heading and the textarea. States: unchosen · chosen · refused on save ("Choose where this prompt runs.") when there is a prompt and no choice · ignored when the prompt is empty (dropped on save, not an error).

## Data

**Schema changes:** yes — `0021_fantastic_maddog.sql`: enum `pipeline_prompt_target ('claude', 'claude_code')`; `pipeline_steps.prompt_target` nullable; **a hand-added backfill** setting `'claude'` on any row that already has a prompt; then check `(prompt is null) = (prompt_target is null)`.

**Placement:** `lib/types/pipeline.ts` (`PROMPT_TARGETS`, `PromptTarget`, `PROMPT_TARGET_LABELS` — one home the schema, validator and page all read) · `db/schema/pipeline-steps.ts` · `lib/validators/pipeline.ts` · `server/services/pipeline.ts` · the step form, list, page, and the engagement checklist.

## Acceptance criteria

1. Saving a step with a prompt and no target is refused with the field message; with an empty prompt the target is dropped.
2. The list and the checklist show "Copy for Claude" / "Copy for Claude Code".
3. `0021` applies over a table that already holds a prompt step (backfilled to `claude`) and an email-only step (stays null).
4. The check refuses a prompt without a target and a target without a prompt.
5. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Out of scope

- **Deep links** that open Claude or Claude Code directly — roadmap.
- **More targets** (another model, a terminal command) — one enum value each, when real.

## Depends on

- **PIPE-2, PIPE-3** — the editor and the checklist. Complete.
