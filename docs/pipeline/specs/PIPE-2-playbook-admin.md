# PIPE-2 — `/admin/pipeline`: the playbook — list, create, edit, reorder, archive, delete, copy

**Epic:** PIPE — engagement pipeline · **Phase 2** · Size: M
**Slice type:** One admin surface over one table, with server actions. Risk class: a reorder from a stale tab that drops a step; a delete that the database refuses and the page reports as a crash; a template edit lost to a failed save.
**Review:** Vesper (state matrix; the editor in both themes) · Mason (the service seam; the reorder's set check).

**Status:** Not started

> **Vesper — surface review.** Walk every state below in Light and Dark. Copy on a step with no prompt (button absent). Archive, then unarchive, then reorder with archived steps present. Delete a used step (refused, the line says archive instead). Edit, break the network, save (the draft survives).

---

## Outcome

Taylor opens **Pipeline** under Engagements in the rail and sees his playbook: every active step in order, numbered, with its title and whether it carries a prompt, an email, or both. He copies a prompt in one press. He adds a step, edits its title, prompt and email template in a form with a live markdown preview of the prompt, drags steps into a new order, archives a step he no longer uses and brings it back, and deletes a step he made by mistake. Archived steps sit in a collapsed list below the active ones. This slice does not show anything on an engagement (PIPE-3) or send anything (PIPE-4).

## Why / intent

- **Taylor, 2026-09-25** — "the primary action is to copy it, but I also need to be able to edit it … general CRUD for each pipeline step … archive and unarchive."
- **M-PIPE-1, M-PIPE-4, M-PIPE-6.**
- **D-ADM-2** — items inside a section are alphabetical: Design reviews, Engagements, **Pipeline**.
- **D-ADM-3** — Radix overlays and lucide icons only; no component registry.
- **What this slice is NOT (binding):** no variables filled in (the playbook copies the template as written); no version history; no import from files.
- **Ground truth:** `AdminPageHeader`; the copy button in `app/admin/_components/lead-contact.tsx`; the dnd-kit sortable in `app/websites/intake/_components/repeatable-block.tsx` (its screen-reader announcements); the sessionStorage draft in `app/admin/_components/intro-email-form.tsx`; `app/admin/_components/markup.tsx` for the prompt preview if it renders markdown adequately.

**Rulings this slice makes (labelled, logged):**

- **Editing happens on its own route, `/admin/pipeline/[id]`, and creating on `/admin/pipeline/new`** — not in a modal. A prompt is long-form text Taylor will write for minutes at a time; a dialog is the wrong container for that. `[PROPOSED — Vesper, needs sign-off]`. Logged.
- **Copy is the row's primary action; edit is the row's title link.** The copy button carries the result inline ("Copied" for two seconds, or "Couldn't copy — select the text in the step instead"). Logged.
- **Reorder is by drag handle with keyboard support** (dnd-kit's keyboard sensor), saved on drop. No separate Save order button. Logged.

## Experience & states

**List (`/admin/pipeline`).** Header "Pipeline", a one-line description, action **New step**. Then the active steps as rows: handle · number (position + 1) · title (link to edit) · small markers "Prompt" / "Email" · **Copy prompt** (absent when the step has no prompt). Below: "Archived (n)", collapsed by default, rows without handle or number, each with **Unarchive**.

**Edit (`/admin/pipeline/[id]` and `/new`).** Fields: Title (required) · Prompt (monospace textarea, markdown, with a preview toggle) · Email subject · Email body (plain-text textarea). A note under the email fields names the variable syntax `{{name}}` and lists the record names (M-PIPE-2). Actions: **Save** · **Archive** / **Unarchive** · **Delete** (present only when the step has no history; confirm names the title).

**States (exhaustive):** list: empty (hospitality line, New step) · populated · reordering (dragging) · reorder saving · reorder failed (order restored, line says so) · copy idle / copied / copy failed. Edit: new · editing · saving · saved · save failed (draft kept) · validation error (title empty; subject without body or body without subject) · archived step (banner "Archived — not offered on engagements", Unarchive) · delete confirming · delete refused (FK: "This step has been used on an engagement. Archive it instead.") · not found (404).

**Failure / edge states (named):** stale tab reorders a set that has changed → refused, list reloads · save fails → draft in sessionStorage keyed by step id survives a refresh · clipboard API unavailable → failed copy line.

## Non-negotiables (this slice)

- **Every action behind `requireAdmin`; every input through a zod validator.**
- **The reorder service refuses any id list that is not exactly the current active set.**
- **Delete is refused by the database for a used step, and the page says why in words.**
- **No prompt text in logs or error messages.**
- **Tokens by name; never `-[--`; verified in Light and Dark.**

## Data

**Schema changes:** none.

**Tables:** `pipeline_steps` (read, insert, update, delete) · `engagement_step_completions` and `engagement_emails` (read: existence only, to decide whether Delete shows).

**Placement:** `server/services/pipeline.ts` (`listPipelineSteps`, `getPipelineStep`, `createPipelineStep`, `updatePipelineStep`, `setPipelineStepArchived`, `reorderPipelineSteps`, `deletePipelineStep`) · `lib/validators/pipeline.ts` · `lib/routes.ts` (`adminRoutes.pipeline`, `adminRoutes.pipelineStep(id)`, `adminRoutes.pipelineNew`) · `app/admin/_components/admin-nav.ts` (one item, icon from lucide) · `app/admin/(protected)/pipeline/page.tsx` · `app/admin/(protected)/pipeline/[id]/page.tsx` · `app/admin/(protected)/pipeline/new/page.tsx` · `app/admin/(protected)/pipeline/_actions/steps.ts` · `app/admin/(protected)/pipeline/_components/*`.

**Validators:** `lib/validators/pipeline.ts` — `pipelineStepInput` (title 1..200; prompt ≤ 100 000; subject ≤ 300; body ≤ 20 000; subject and body both or neither), `reorderPipelineInput` (uuid array), `pipelineStepId`.

## Accessibility

Drag has a keyboard path and announces moves in words (the repeatable-block precedent), not ids. Copy and handle buttons are labelled with the step's title. Targets 44px. Result lines are `role="status"`. The preview toggle is a real button with `aria-pressed`.

## Acceptance criteria (observable)

1. "Pipeline" appears under Engagements, after Engagements, and is active on `/admin/pipeline` and its children.
2. New step → saved → appears last in the list.
3. Copy prompt puts the prompt, byte for byte, on the clipboard; "Copied" shows; a step with no prompt has no Copy.
4. Dragging a step (mouse and keyboard) and dropping it persists the order across reload.
5. Archive removes a step from the active list and numbers close up; Unarchive returns it to the end.
6. Delete on an unused step removes it; on a step with a completion or an email row, the refusal line shows and the step remains.
7. Saving a subject without a body is refused with a field error.
8. A failed save leaves the typed text in place after a refresh.
9. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; rendered in Light and Dark.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Unarchive to the end: set `position` to max + 1 rather than renumbering.
- `restrict` violations surface as Postgres code `23503`; map that one code, rethrow the rest.

## Dev's call

The icon · whether the preview is a toggle or side-by-side at wide widths · the archived list's collapse control.

## Out of scope

- **The engagement checklist and variable filling** — PIPE-3.
- **Sending** — PIPE-4.
- **Template history, duplication, import/export** — roadmap.

## Depends on

- **PIPE-1** — the table. Complete in `PROGRESS.md`, and `0020` run on the database the page is verified against.

## Recommended execution

**Sonnet is acceptable** for the surface; the reorder set-check and the FK mapping are the parts to read closely.

---

### Kickoff (paste into the session)

> Build **PIPE-2 — The playbook admin** (attached spec). **Copy is the primary action. Reorder refuses a stale set. Delete is refused by the database for a used step.**
> Attach/read first, in order: this spec · `../README.md` · `TECHNICAL-DECISIONS.md` · `docs/admin/ADMIN-UX-SPEC.md` §8–9 · `app/admin/_components/intro-email-form.tsx` (draft persistence) · `app/websites/intake/_components/repeatable-block.tsx` (dnd-kit) · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
