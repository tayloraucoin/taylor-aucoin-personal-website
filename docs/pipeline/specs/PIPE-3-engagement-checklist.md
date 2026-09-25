# PIPE-3 — The pipeline on an engagement: checklist, filled-in prompts, done and undo

**Epic:** PIPE — engagement pipeline · **Phase 3** · Size: M
**Slice type:** A section on an existing admin page, plus the variable renderer every later slice uses. Risk class: a prompt copied with the wrong client's values; the renderer resolving a name differently here than in the send.
**Review:** Mason (the renderer is the single home for variable resolution) · Vesper (the section inside the engagement page's rhythm).

**Status:** Complete (2026-09-25) — build, typecheck, lint clean; renderer verified by `yarn verify:pipeline`; not rendered (see PROGRESS.md)

> **Mason — seam review.** `renderPipelineTemplate` is the only code that resolves `{{name}}`; PIPE-4 must call it, not reimplement it. Read the resolution order (saved value → record value → unresolved) and the name grammar against M-PIPE-2.

---

## Outcome

On an engagement's page, under "Where they are", a **Pipeline** section lists the active steps in order, each marked done (with the date) or not. **Copy prompt** copies that step's prompt with this client's values filled in — their first name, business name, domain, and anything Taylor has entered for them before — and says in the result line if any name was left unfilled. **Mark done** and **Undo** toggle the step. Steps done on this engagement that have since been archived still show, marked archived, so the record stays true. This slice does not send email: an email step shows its template's subject and nothing else — no disabled send button stands in for PIPE-4.

## Why / intent

- **Taylor, 2026-09-25** — "associate this all with engagement … linear steps."
- **M-PIPE-2** — the variable grammar, the record names, the override rule.
- **M-PIPE-5** — done is a row.
- **Ground truth:** `app/admin/(protected)/engagements/[id]/page.tsx` (section rhythm: `h2` at `text-sm`, `gap-2`); `loadEngagementAdminDetail`; `IntakeAnswers` (access step: `domainName`, `registrar`).

**Rulings this slice makes (labelled, logged):**

- **Record names:** `firstName` (first word of `contact_name`), `contactName`, `businessName`, `contactEmail`, `domain` (access step `domainName`), `registrar` (access step `registrar`). Blank intake answers resolve to unresolved, not to an empty string. Logged.
- **`renderPipelineTemplate(template, context)` is pure and lives in `lib/pipeline/template.ts`** so a client component can preview with it and the service can enforce with it — two consumers, one home. Logged.
- **The section sits after "Where they are" and before "Money".** The pipeline is what Taylor came to the page to do; money and reminders are reference. `[PROPOSED — Vesper, needs sign-off]`. Logged.

## Experience & states

Each row: number · title · "Done 12 Sep" or nothing · **Copy prompt** (absent without a prompt) · **Mark done** / **Undo**. Email steps show their subject under the title in `--color-dim`.

**States (exhaustive):** no steps in the playbook (line linking to `/admin/pipeline`) · steps, none done · some done · all done · archived-but-done rows · copy idle / copied / copied with unfilled names ("Copied. Not filled: reviewCode") / copy failed · done toggling · toggle failed (state restored, line says so).

**Failure / edge states (named):** double press on Mark done → one row (`onConflictDoNothing`) · Undo on a row already removed → no-op · intake answers missing entirely → record names unresolved, copy still works.

## Non-negotiables (this slice)

- **One renderer.** Nothing else in the codebase parses `{{`.
- **Values resolved on the server from this engagement's id**; the client never posts values it wants substituted.
- **No prompt text or pipeline value in logs.**

## Data

**Schema changes:** none.

**Tables:** `pipeline_steps` (read) · `engagement_step_completions` (read, insert, delete) · `engagements` (read `pipeline_values`, `answers`, contact fields).

**Placement:** `lib/pipeline/template.ts` (`renderPipelineTemplate`, `findTemplateNames`, `NAME_PATTERN`) · `server/services/pipeline.ts` (`loadEngagementPipeline`, `buildTemplateContext`, `setStepDone`) · `app/admin/(protected)/engagements/_actions/pipeline.ts` · `app/admin/_components/engagement-pipeline.tsx` · the engagement page (one section).

**Validators:** `lib/validators/pipeline.ts` — `setStepDoneInput` (engagement uuid, step uuid, done boolean).

## Accessibility

Done state is a word, not only a mark. Toggle buttons carry `aria-pressed`. Copy result lines are `role="status"`. Targets 44px.

## Acceptance criteria (observable)

1. The section lists active steps in playbook order; archiving a step in PIPE-2 removes it here unless it was done on this engagement.
2. Copy on a prompt containing `{{firstName}}` and `{{businessName}}` copies this engagement's values.
3. A prompt with `{{reviewCode}}` and no saved value copies with the placeholder intact and the line names `reviewCode`.
4. `{{ not a name }}` and `{{2x}}` are copied literally and not reported.
5. Mark done shows the date and survives reload; Undo clears it.
6. Unit check: `renderPipelineTemplate` on a fixture covering saved-over-record, blank record, unknown name, and malformed braces.
7. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; rendered in Light and Dark.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The repo has no unit test runner; criterion 6 can be a `scripts/` check run with `tsx`, as REV-2 exercised its formatter.

## Dev's call

Date format (match `EngagementState`) · whether copied values show in a tooltip.

## Out of scope

- **Editing `pipeline_values` directly on the engagement** — the send dialog is where values are entered (PIPE-4); a values panel is roadmap.
- **Sending** — PIPE-4.

## Depends on

- **PIPE-2** — steps to show. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class** for the renderer; the section is small.

---

### Kickoff (paste into the session)

> Build **PIPE-3 — The engagement checklist** (attached spec). **One renderer, pure, in `lib/pipeline/template.ts`. Values resolved server-side from the engagement id.**
> Attach/read first, in order: this spec · `../README.md` · `TECHNICAL-DECISIONS.md` (M-PIPE-2, M-PIPE-5) · `PIPE-2` · the engagement page · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
