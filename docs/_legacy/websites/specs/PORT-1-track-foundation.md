# PORT-1 — Track foundation: the `showcase` key, the migration, the registries, the parameterized seams

**Epic:** PORT — portfolio intake · **Phase 0** · Size: L
**Slice type:** Cartridge infrastructure + one migration. Risk class: a one-way schema door, and the Durable track silently changing under refactor — the one failure the handoff names as unforgivable.
**Review:** Mason (migration + the seam extraction) — this slice touches shared Durable files.

**Status:** Complete (2026-08-26) — migration authored and verified against a scratch Postgres 15 holding pre-existing rows; `yarn verify:tracks` green (39 checks); the durable intake document proved byte-identical to HEAD's (3,510 bytes, `diff` clean). The migration itself has **not been run against a hosted database** — Taylor reviews and runs it.

> **Mason — migration + regression review.** Review the migration SQL before Taylor runs it (enum, defaults, nullability per M-PORT-3). Then verify the byte-for-byte guarantee: after the seam extraction, the Durable flow at `/websites/intake` renders and behaves identically — state which checks ran (start form render, a step save, resume list, the output generator against a seeded durable engagement).

---

## Outcome

The intake machine knows tracks exist. `IntakeTrackKey` (`durable | showcase`) is a stored fact on engagements and products; the showcase track has a step registry with the v2 doc's nine titles and intros, skeleton validators, and a skeleton label map; and every consumer of step identity — save path, state routing helpers, resume/skipped inventories, the output generator — resolves its registry, schemas, and labels through one new seam (`lib/intake/tracks.ts`) instead of importing the Durable registry directly. No showcase surface exists yet: no routes, no pages, no payment. The Durable track is behaviorally unchanged, verified, and every existing row is `durable` by column default.

## Why / intent

- **Handoff decision 1 (binding)** — one machine, category cartridge: registry contents, example sets, and microcopy vary; persistence, autosave, upload, payment, token security, and completion must not fork. This slice builds the vary-point and nothing else.
- **M-PORT-1** — track key `showcase`; `lib/intake/steps.ts` keeps exporting the Durable registry unchanged; `tracks.ts` is the one resolver.
- **M-PORT-3** — the migration's exact shape: `engagements.track` + `engagements.extraction_runs`, `products.track`, `intake_files.entry_key`; `intake_track` pgEnum; notNull defaults.
- **What this slice is NOT (binding):** no showcase routes or pages (PORT-2); no catalogue rows (PORT-3); no showcase output renderer beyond the seam compiling (PORT-8). And no behavioral change of any kind to the Durable track — refactor, verify, stop.
- **Ground truth:** `lib/intake/steps.ts`, `lib/types/intake.ts`, `lib/validators/intake.ts`, `server/services/{submission,engagement,output}.ts` exist and are consumed, never rebuilt.

**Rulings this slice makes (labelled, logged):**

- **Showcase step keys:** `about · audience · experience · work · taste · words · media · site · access`, in that order, matching v2 steps 1–9. These are the answers document's key space for the track and outlive every surface. Logged.
- **Registry titles and intros ship verbatim from the v2 doc** — titles: "About you" · "Who this site is for" · "Experience and proof" · "The work" · "Taste" · "Your words" · "Media" · "The site itself" · "Accounts and access". Intros where v2 provides one (steps 2–8), byte-for-byte, film flavour with generic fallback at the marked flex points, resolved by `resolveFlavour` (D-PORT-5 rule: exactly one checked discipline with a shipped pack → that pack; else generic). Logged.

## Behavior & states

**No surface.** Observable state: the schema columns exist with correct defaults; `tracks.ts` resolves `durable` to the existing registry/schemas/labels and `showcase` to the new ones; `saveStepAnswers` validates a showcase step key against the showcase schema map and a durable key against the durable one; unknown step keys for a track are rejected exactly as unknown keys are today.

**Failure / edge states (named):** a showcase engagement asked for a durable step key (and vice versa) → the same not-found behavior as any bad step slug, no existence leak; `resolveFlavour` with zero, multiple, or unshipped disciplines → generic, never a broken slot.

## Non-negotiables (this slice)

- **The Durable track is behaviorally unchanged.** Every shared file touched gets a regression check; the acceptance criteria name them.
- **Step identity has one home per track and one resolver across tracks.** No consumer imports a registry directly after this slice.
- **Answers stay one JSONB document** — nothing in this slice moves answer content into columns.
- **Migration is authored, journaled, and stopped** — Taylor reviews and runs it (standing rule).
- **V2 titles and intros verbatim** — registry content is client-facing copy.

## Data

**Schema changes: described** (M-PORT-3, one migration): `intake_track` pgEnum (`durable`,`showcase`); `engagements.track` notNull default `durable`; `engagements.extraction_runs` integer notNull default 0; `products.track` intake_track notNull default `durable`; `intake_files.entry_key` text nullable. Drizzle-kit generated, journal-complete, append-only.

**Tables:** `engagements`, `products`, `intake_files` (schema only — no new runtime writes here).

**Placement:** `lib/types/intake.ts` (extend) · `lib/intake/tracks.ts` (new) · `lib/validators/showcase-intake.ts` (new, skeleton: nine all-optional object schemas) · `lib/intake/showcase-answer-labels.ts` (new, skeleton) · `db/schema/{engagements,products,intake-files}.ts` (extend) · `server/services/{submission,output}.ts` and the `[token]` state-routing helpers (re-point to the seam). Per TECH-SCOPE §3/§5.

**Validators:** the skeleton schemas; step slices (PORT-4/5/7) fill their fields — same division INT used.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — against a scratch Postgres)

1. Migration applies cleanly to a database holding existing durable rows; every pre-existing engagement and product reads `track = 'durable'`; `extraction_runs = 0`; `entry_key` null everywhere.
2. `tracks.ts` resolves both tracks: registries, schema maps, label maps; `resolveFlavour` returns film only for exactly `["Film or video"]`-shaped input with the film pack shipped, generic otherwise (unit-observable via a script or the type-checked seam).
3. Showcase registry contents match the v2 doc's titles and intros byte-for-byte (diff against the doc's strings).
4. `saveStepAnswers` on a seeded showcase engagement accepts `about` and rejects `business`; on a durable engagement the reverse — verified against the scratch database.
5. Durable regression: start form renders unchanged; a durable step save round-trips; `renderIntakeMarkdown` output for a seeded durable engagement is byte-identical to its pre-slice output (capture before, diff after).
6. No consumer imports `INTAKE_STEPS` or `STEP_SCHEMAS` directly except through `tracks.ts` (grep).
7. Negative: no route, page, or component file added under `app/`.
8. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The pgEnum lives beside `engagements` (narrowest-scope law); `products.track` imports it — check drizzle's cross-file enum import pattern already used by existing schema files.
- Capture the pre-slice durable output document (criterion 5) *before* touching `output.ts` — it is the cheapest regression oracle this slice has.

## Dev's call

Exact `tracks.ts` API shape (object map vs functions) · where the showcase flavour packs' strings live (colocated in tracks.ts vs a content file) · script vs test harness for criteria 2–4.

## Out of scope

- **Routes, pages, chrome suppression for the new prefix** — PORT-2.
- **Catalogue rows and products-service track filters** — PORT-3.
- **Real showcase field schemas and labels** — PORT-4/5/7 (each step slice owns its fields, INT's division).
- **The showcase output renderer's content** — PORT-8.

## Depends on

**No slice dependencies.**

## Recommended execution

**Opus/Fable-class.** The risk is subtle: a refactor of shared seams that must be provably behavior-preserving, plus a one-way migration. Choosing down produces a compiling cartridge that quietly changed a Durable code path nobody re-verified.

---

### Kickoff (paste into the session)

> Build **PORT-1 — Track foundation** (attached spec). **One resolver for step identity; the Durable track byte-for-byte unchanged; migration authored and stopped.**
> Attach/read first, in order: this spec · `specs/README.md` (kickoff contract + non-negotiables) · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §3–5 · `../portfolio-intake-questions-v2.md` (titles + intros, verbatim source) · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §5 · `docs/intake/TECH-SCOPE.md` §3 · this folder's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`, then `docs/intake/specs/` logs.
> Capture the durable output-document oracle before refactoring. Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
