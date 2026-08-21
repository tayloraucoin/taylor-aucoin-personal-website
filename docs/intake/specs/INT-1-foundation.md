# INT-1 — Foundation: dependencies, env surface, db scaffold, schema migration, storage + RLS setup

**Epic:** INT — client intake · **Phase 0** · Size: L
**Slice type:** Ground-laying — schema and connection wiring. Risk class: one-way doors (migration shape, token model columns) cast wrong and inherited by every later slice.
**Review:** **Mason — migration review.** The generated SQL is reviewed as SQL before Taylor runs it.

**Status:** Complete (2026-08-18) — migration verified applied against a scratch Postgres; Taylor runs it against Supabase

> **Mason — migration review.** Review the emitted migration for: column order per CC Drizzle law; timezone-aware timestamps; `token_hash` unique index; `email_events` unique (engagement, kind) index; FK on-delete cascade semantics on `intake_files`/`email_events`; jsonb default `{}` on `answers`. Taylor runs `db:migrate` — the builder authors and stops (README non-negotiable).

---

## Outcome

The repo can hold intake data. Drizzle is wired (`db/` per the placement map), the three tables exist as a reviewed, journal-complete migration, `lib/env.ts` exposes the new variables as the only reader, `supabase/setup/` SQL enables deny-all RLS and creates the private `intake` bucket, and `.env.example` documents the surface. `package.json` gains the pinned data/payment/email dependencies and `db:generate`/`db:migrate` scripts. Nothing user-visible ships; no route, no service logic (INT-2), no Stripe call (INT-3).

## Why / intent

- **TECH-SCOPE §2–§5, §8** — the stack additions, placement map, data model, authorization topology, and env surface this slice instantiates. The data model section is the column-level contract; do not re-derive it.
- **M-INT-6/-7/-8/-9** — token stored as hash; status derived (no enum column); deny-all RLS with server-only access; two-var DB env.
- **Build spec §8 (binding)** — answers as one JSONB column so a new form field never requires a migration.
- **CC law carried over** — Drizzle conventions verbatim (`drizzle-orm-conventions.md` in the CC repo): one file per table, colocated relations, array-form index arg, snake_case DB names, jsonb shape comments pointing at `lib/types/intake.ts`. Migrations append-only with journal parity.
- **What this slice is NOT (binding):** no data access outside `db/client.ts` scaffolding; no `requireEngagement` (INT-2 owns the seam); no seed data containing anything resembling a real business.

**Rulings this slice makes (labelled, logged):**

- **Dependency versions are pinned exact at install time** and recorded in this ticket's closure note + a header comment in `db/client.ts`. CC pins its ORM; we inherit the discipline at our own current-stable versions. Logged.
- **`drizzle.config.ts` sits at repo root** (tooling convention next to `next.config.ts`), pointing at `db/schema`, using `DIRECT_DATABASE_URL`, `schemaFilter: ['public']`. Logged.

## Behavior & states

**No surface.** Observable state is the database and the build: tables exist with RLS enabled and zero policies; the bucket exists and is private; `npx tsc --noEmit` passes with the new modules; the static site builds unchanged.

**Failure / edge states (named):** migration run against the wrong env is prevented by the two-var scheme (runtime URL never used by tooling); missing env vars fail fast in `lib/env.ts` with a named error at boot of any consumer, not at first query.

## Non-negotiables (this slice)

- **Taylor reviews and runs the migration.** Author SQL + journal entry, then stop.
- **`lib/env.ts` remains the only `process.env` reader.** No `process.env` anywhere else, including `drizzle.config.ts` — the config may read env directly only if `lib/env.ts` cannot be imported there; if so, say so in one comment and keep the variable names identical.
- **Migrations append-only; journal parity** (CC `migrations.md` law).
- **No Supabase key of any kind reaches client code.**

## Data

**Schema changes: described** — the full TECH-SCOPE §4 model: `engagements`, `intake_files`, `email_events` (+ `email_event_kind` pgEnum, colocated in `email-events.ts`).

**Tables:** all three (create).

**Placement:** `db/schema/{engagements,intake-files,email-events}.ts`, `db/schema/index.ts`, `db/client.ts`, `db/migrate-client.ts`, `db/supabase/setup/01-rls-and-bucket.sql`, root `drizzle.config.ts`, `lib/env.ts` (extend), `lib/types/intake.ts` (the `IntakeAnswers` interface skeleton: per-step optional sub-objects, keys matching build spec §4 field names), `.env.example`.

**Validators:** none in this slice (INT-5 owns per-step Zod).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `npm install` clean; `drizzle-orm`, `drizzle-kit`, `postgres`, `zod`, `stripe`, `resend`, `@supabase/supabase-js` pinned exact in `package.json`.
2. `npx drizzle-kit generate` emits one migration whose SQL matches TECH-SCOPE §4 (column order, tz timestamps, unique `token_hash`, **partial** unique `(engagement_id, kind)` on `email_events` covering the send-once kinds only, cascade FKs, jsonb `answers` default `{}`) — reviewed by Mason before hand-off to Taylor.
3. Migration + journal committed; journal parity check passes (file count = journal entries).
4. `db/supabase/setup/01-rls-and-bucket.sql` enables RLS on all three tables with zero policies and creates private bucket `intake`; idempotent (safe to re-run).
5. `lib/env.ts` exports typed accessors for every TECH-SCOPE §8 variable; a missing required var throws a named error naming the variable.
6. `lib/types/intake.ts` compiles; every `jsonb` column's schema comment names its interface there.
7. Negative: no route or page added; `app/` diff is empty; the built site's static route list is unchanged.
8. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `postgres` client with `prepare: false` on :6543 exactly as CC's `client.ts`; copy its singleton shape, not its multi-tier env switch.
- Supabase storage buckets can also be created via SQL on `storage.buckets` — keep it in the setup file rather than dashboard clicks so the project is reproducible (CC keeps platform SQL in `supabase/setup/` for the same reason).
- `.nvmrc` exists in CC, not here; Node version is whatever Vercel + local already agree on — don't add one in this ticket.

## Dev's call

Exact pinned versions · `IntakeAnswers` sub-interface naming · whether `db/schema` uses a per-table enum or a shared file for `email_event_kind` (narrowest-scope rule decides; it is used by one table → colocate).

## Out of scope

- **`requireEngagement`, status derivation, CLI** — INT-2.
- **Any Stripe/Resend call** — INT-3/INT-7/INT-8 (deps install only).
- **Seed data** — none for this project; real engagements are created by the CLI.

## Depends on

**No slice dependencies.** External: Supabase project credentials from Taylor before the migration _runs_ (authoring proceeds without).

## Recommended execution

**Opus/Fable-class.** The slice is small in lines but every line is a one-way door; a cheaper model produces a plausible schema that drifts from the CC column law and gets cast in SQL.

---

### Kickoff (paste into the session)

> Build **INT-1 — Foundation** (attached spec). **Author the schema exactly per TECH-SCOPE §4, stop before running the migration — Taylor runs it.**
> Attach/read first, in order: this spec · `specs/README.md` · `../TECH-SCOPE.md` §2–§5, §8 · CC repo `docs/architecture/drizzle-orm-conventions.md` + `docs/ai-guides/db-and-rls-authoring.md` · repo `CLAUDE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Pin dependency versions exact. `lib/env.ts` stays the only env reader. Migrations append-only with journal parity. No policies — RLS deny-all. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
