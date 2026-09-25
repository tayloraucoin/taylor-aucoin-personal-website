# PIPE-1 — Schema: pipeline steps, completions, sent emails, and remembered values

**Epic:** PIPE — engagement pipeline · **Phase 1** · Size: S
**Slice type:** Schema only. Risk class: a migration (one-way door) on a table the intake depends on (`engagements`); a foreign key that lets history be deleted.
**Review:** Mason (migration diff; FK semantics; the check constraint).

**Status:** Complete (2026-09-25) — build, typecheck, and lint clean; migration `0020_overjoyed_black_bolt.sql` and `07-pipeline-rls.sql` authored, not run (see PROGRESS.md)

> **Mason — one-way-door review.** The generated SQL is read before Taylor runs it, for: column order per CC Drizzle law; timezone-aware timestamps; the `pipeline_values` column added with a default so existing rows fill without a backfill; `restrict` on both FKs to `pipeline_steps`; `cascade` on both FKs to `engagements`; the unique (engagement, step) index; the subject/body pair check. Verification states that no migration was run.

---

## Outcome

The database can hold the playbook and each engagement's run through it. There are three new tables — the ordered steps, which steps an engagement has completed, and every client email sent from a step, as sent — and one new column on `engagements` for the values Taylor types at send time. Nothing renders and nothing writes yet. This slice does not build the admin page (PIPE-2), the engagement checklist (PIPE-3), or the send (PIPE-4).

## Why / intent

- **M-PIPE-1** — one table of ordered steps; archived by timestamp; email subject and body both or neither.
- **M-PIPE-2** — `engagements.pipeline_values`, jsonb, for remembered variables.
- **M-PIPE-3** — `engagement_emails` as the as-sent record, after `lead_emails`.
- **M-PIPE-4** — `restrict` FKs so a used step cannot be deleted.
- **M-PIPE-5** — completion is row presence, unique per (engagement, step).
- **M-PIPE-6** — `position` is not unique.
- **What this slice is NOT (binding):** no service functions, no validators beyond the value type, no pages. Empty seams are not scaffolded before their phase.
- **Ground truth:** `db/schema/lead-emails.ts` (the as-sent pattern), `db/schema/review-rounds.ts` (file shape), `db/supabase/setup/06-review-rls.sql` (the deny-all file).

**Rulings this slice makes (labelled, logged):** the six M-PIPE decisions above, recorded in `TECHNICAL-DECISIONS.md`.

## Experience & states

**No surface.** Observable in the generated SQL and the types.

**States (exhaustive):** a step is *active* (`archived_at` null) or *archived*; it is a *prompt step*, an *email step* (subject and body set), or both. An engagement × step is *done* (row exists) or *not done*. An email row is *sent* (`resend_id` set) or *failed / in flight* (`resend_id` null).

**Failure / edge states (named):** deleting a step with a completion or an email → FK violation (the service maps it in PIPE-2) · a step with a subject and no body → check violation · a second completion for the same pair → unique violation, absorbed by `onConflictDoNothing` in PIPE-3/4 · an engagement deleted → its completions and emails cascade.

## Non-negotiables (this slice)

- **Author the migration; never run it.** Taylor reviews and runs `yarn db:migrate`, then `yarn db:setup`.
- **`pipeline_values` is `not null default '{}'`.** Existing engagements must be valid the moment the migration lands.
- **No edit to an applied migration.** Append `0020`.

## Data

**Schema changes:** yes — one migration, `0020_*`, generated with `yarn db:generate`.

- `pipeline_steps` — `id`, `created_at`, `updated_at` · `archived_at` timestamptz null · `email_body` text null · `email_subject` text null · `position` integer not null · `prompt` text null · `title` text not null. Check: `(email_subject is null) = (email_body is null)`. Index on `position`.
- `engagement_step_completions` — `id`, `created_at` · `completed_at` timestamptz not null default now · `engagement_id` → `engagements` cascade · `step_id` → `pipeline_steps` restrict. Unique (`engagement_id`, `step_id`).
- `engagement_emails` — `id`, `created_at` · `body` text not null · `resend_id` text null · `subject` text not null · `to_email` text not null · `engagement_id` → `engagements` cascade · `step_id` → `pipeline_steps` restrict. Index on `engagement_id`.
- `engagements.pipeline_values` — jsonb `$type<PipelineValues>()` not null default `{}`.

**Tables:** the three above (create) · `engagements` (alter: add column). Deny-all RLS in `db/supabase/setup/07-pipeline-rls.sql` for the three new tables (`engagements` is already covered).

**Placement:** `db/schema/pipeline-steps.ts` · `db/schema/engagement-step-completions.ts` · `db/schema/engagement-emails.ts` (each with colocated relations) · `db/schema/engagements.ts` (column + relations) · `db/schema/index.ts` (barrel + row types) · `lib/types/pipeline.ts` (`PipelineValues`) · `db/supabase/setup/07-pipeline-rls.sql` · `db/migrations/0020_*.sql` + snapshot + journal.

**Validators:** none this slice.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `yarn db:generate` emits one migration, `0020_*`, that creates the three tables and adds `engagements.pipeline_values` with `default '{}'::jsonb not null`, and alters nothing else.
2. The SQL shows `on delete restrict` on both `step_id` FKs, `on delete cascade` on both `engagement_id` FKs, the unique index on (`engagement_id`, `step_id`), and the subject/body check.
3. Every timestamp is `timestamp with time zone`.
4. `07-pipeline-rls.sql` enables RLS on the three tables and revokes from `anon`/`authenticated` under the same role guard as `06`; it is idempotent.
5. `EngagementRow` gains `pipelineValues: PipelineValues`; nothing that maps rows to the `Engagement` domain type breaks.
6. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Drizzle's `check()` comes from `drizzle-orm/pg-core` and goes in the table's extra-config array, beside indexes.
- `engagements.ts` imports its child tables for relations; the new children import `engagements` back. The file's existing note explains why the cycle is safe.

## Dev's call

Index names · whether `pipeline_steps.position` gets an index at all (tens of rows) · docstring wording.

## Out of scope

- **Service functions, validators, admin routes** — PIPE-2 onward.
- **A `pipelines` parent table** — M-PIPE-1, roadmap.
- **Seeding any step** — Taylor enters the playbook himself (PIPE-5).

## Depends on

- **No slice dependencies.** The `engagements` table and the migration rail are Complete in `docs/intake/specs/PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** Small, but a one-way door on the intake's central table.

---

### Kickoff (paste into the session)

> Build **PIPE-1 — Schema** (attached spec). **Author `0020`; never run it. `restrict` to steps, `cascade` to engagements.**
> Attach/read first, in order: this spec · `../README.md` · `TECHNICAL-DECISIONS.md` · `db/schema/lead-emails.ts` and `db/schema/review-rounds.ts` (reuse the shape) · `db/supabase/setup/06-review-rls.sql` · repo `CLAUDE.md`.
> Column order per CC Drizzle law. Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
