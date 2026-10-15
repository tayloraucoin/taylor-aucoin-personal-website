# CRM-14 — Conversation capture: the columns, the one-transaction Save, the sync stays safe

**Epic:** CRM — call-mode redesign (v1.2) · **Phase 5** · Size: S
**Slice type:** Schema + service seam extension — no UI. Failure class: a sync clobbering call-captured facts, or a Save that half-commits.

**Status:** Complete (2026-08-22)

> **Mason — migration review.** One migration: three columns. Review column placement, enum shape, and nullability before it applies. The sync-safety property must be argued from `SYNC_OWNED`'s construction, not assumed.

---

## Outcome

One Save commits everything a conversation produced — the attempt row (disposition, interest tags, note), the contact facts learned on the call (name, email, better phone, preferred channel), whether the link was texted, and the next-touch schedule — atomically. If any part fails, nothing persists and the caller gets `{ ok: false }` with the exact payload preserved for verbatim retry. A CSV re-import provably cannot touch any of the new columns. No surface changes here: CRM-15 builds the form that calls this.

## Why / intent

- **D-CRM-25** — the conversation form captures contact name · email · better phone · channel preference · interest tags · notes · a visible next-touch. This slice is that form's data contract.
- **D-CRM-24 / spec §4** — a logged call is never lost; actions return `{ ok }`; failed saves keep their exact payload. The extended payload inherits the same contract.
- **D-CRM-11 / M-CRM-4 (TECH-SCOPE §4)** — sync writes only `SYNC_OWNED` columns; the `SET` clause is generated from that list, so new columns are unsyncable unless someone adds them. Do not add them.
- **CALL-MODE-BRIEF.md, phase-1 outcome** — data-layer flags: `leads` has no contact-name home; channel preference needs a home; next-touch maps onto existing schedule tokens.
- **Ground truth:** `server/services/calls.ts` `logAttempt` already writes the attempt row and the lead's schedule in one transaction — extend that transaction, don't build a second write path. `resolveSchedule(token)` resolves the closed `ScheduleToken` vocabulary server-side (TECHNICAL-DECISIONS 2026-08-21: tokens, never browser-computed datetimes). `leads.phoneOverride` and `leads.contactEmail` already exist.
- **M-CRM-8 (recorded with this scoping)** — the placement decision for the new columns.

**Rulings this slice makes (labelled, logged):**

- **`leads.contactName` text, nullable; `leads.preferredChannel` pgEnum `contact_channel` (`text` · `email`), nullable.** Admin-owned facts about the person, one home each, beside `contactEmail`/`phoneOverride` where the intake prefill already reads (D-INT-8: the client is never asked what Taylor already knows). Logged (M-CRM-8).
- **`call_attempts.linkTexted` boolean nn default false.** A texted link is an asset sent; without a record, the funnel's `info_sent` stage and the scoreboard's "info sent" seam silently under-count the script's primary motion. Per-attempt because the send belongs to the touch. Stage derivation (`getLeadStage`) treats any `linkTexted` attempt like a `lead_emails` row. `[PROVISIONAL — Taylor ratifies: a texted link counts as info sent]`. Logged (M-CRM-8).
- **Next-touch stays tokens.** The visible next-touch field submits a `ScheduleToken` (or an explicit ISO datetime where the UX offers "pick", resolved and validated server-side). No new scheduling machinery; an explicit time from the caller still wins over every default. Logged.

## Behavior & states

**No surface.** Observable through the service contract:

- `logAttempt` input gains optional `contactName` · `contactEmail` · `phoneOverride` · `preferredChannel` · `linkTexted` · (existing) `schedule`. All optional: a bare disposition remains a complete, valid log (D-CRM-8).
- Contact fields write to `leads` inside the same transaction as the attempt insert and schedule update. Empty string means "clear this" for `contactEmail`/`phoneOverride`/`contactName` (established contract, DEVIATIONS 2026-08-21 CRM-6).
- **States (exhaustive):** full conversation payload · disposition-only payload · contact-fields-only-with-disposition · payload with explicit datetime · payload with token · failure mid-transaction (nothing persists) · repeat Save after failure (identical result, no duplicate attempt row from one logical retry path).

## Non-negotiables (this slice)

- **One transaction.** Attempt, lead contact facts, schedule: all or nothing.
- **New columns never enter `SYNC_OWNED`.** Re-import must leave them untouched — verified, not trusted.
- **Tokens resolve server-side.** No browser-computed datetime lands in `nextActionAt` except through server validation.
- **A bare disposition stays sufficient.** Nothing new becomes required.
- **`{ ok }` results, never throws to the surface.** The never-lost contract depends on it.

## Data & AI

**Schema changes: described.** One migration, Mason-reviewed: `leads.contactName` text null · `leads.preferredChannel` pgEnum `contact_channel` null · `call_attempts.linkTexted` boolean nn default false. CC Drizzle law: column order, colocated relations, enum in the table's file, types exported.
**Tables:** `leads` (service write) · `call_attempts` (service write).
**Placement:** `db/schema/leads.ts` · `db/schema/call-attempts.ts` · `server/services/calls.ts` (extend `logAttempt`) · `server/services/leads.ts` (`getLeadStage` reads `linkTexted`) · `lib/validators/crm.ts` (`logAttemptInput` extension) · `lib/types/crm.ts` (`ContactChannel`).
**tRPC / validators:** server action unchanged in shape (`logAttemptAction` passes through); Zod home stays `lib/validators/crm.ts`.
**AI notes:** **None.**
**Instrumentation:** none — the scoreboard reads the tables directly (CRM-11 pattern).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. A `logAttempt` call with the full conversation payload produces, in one transaction: one `call_attempts` row (disposition, tags, note, `linkTexted`), updated `leads` contact columns, and the resolved `nextActionAt`. Verified against a real database.
2. A disposition-only payload still succeeds and behaves exactly as today.
3. With the transaction made to fail (e.g. bad FK or forced error), no attempt row, no contact change, and no schedule change persist; the action returns `{ ok: false, message }`.
4. `yarn`-equivalent re-import (`/admin/sync` with a fresh `--crm` CSV) leaves `contactName`, `preferredChannel`, and all previously admin-owned columns untouched on a lead that has them set. *(The sync-safety criterion — run it, don't argue it.)*
5. `getLeadStage` returns `info_sent` for a lead whose only send is an attempt with `linkTexted = true`. **[PROVISIONAL — Taylor.]**
6. An explicit datetime submitted where the UX offers "pick" round-trips through server validation; a token resolves in `America/Vancouver` regardless of server timezone.
7. Empty string clears `contactName` the same way it clears `contactEmail` (maps to null, no validation dead-end).
8. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `logAttempt`'s existing transaction is the extension point; resist a separate `saveConversation` service — two write paths to the same rows is how the never-lost contract gets two behaviors.
- The `contact_channel` enum could tempt a third value (`phone`); don't add vocabulary the UX doesn't capture.
- `getLeadStage`'s aggregate already walks attempts; `bool_or(link_texted)` (or the TS equivalent on the loaded rows) is enough.

## Dev's call

Exact Zod shape for the optional-datetime variant · whether `linkTexted` rides `logAttemptInput` or a dedicated small action when CRM-16 sends after the save · migration filename/ordering.

## Out of scope

- **The conversation form UI** — CRM-15.
- **Composing or sending anything** (email body, text body) — CRM-16.
- **Backfilling `contactName` from engagements** — the intake prefill direction (lead → engagement) is the one that exists; the reverse is a `[REVISIT]`.

## Depends on

**No slice dependencies** (CRM-5, CRM-6 Complete in `PROGRESS.md`).

## Recommended execution

**Sonnet 5.** A settled model extended along an existing seam; the edge cases are enumerated above, and the one-way door (the migration) is gated by human review before it applies. Failure mode of choosing down to Haiku 4.5: a Save that writes the attempt but loses the contact facts when the second statement fails — precisely the half-commit criterion 3 exists to catch, and precisely the kind of thing a cheaper model reports as working.

---

### Kickoff (paste into the session)

> Build **CRM-14 — Conversation capture data contract** (attached spec). Model: **Sonnet 5**. Run alone — this pass applies a migration.
> **One transaction; new columns never enter SYNC_OWNED; a bare disposition stays sufficient.**
> Attach/read first, in order: this spec · `docs/crm/CRM-UX-SPEC.md` §3.8 + D-CRM-24/25 · `docs/crm/TECH-SCOPE.md` §4 · `server/services/calls.ts` + `server/services/leads.ts` (extend, don't fork) · `db/schema/leads.ts` + `db/schema/call-attempts.ts` · `lib/validators/crm.ts` · `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last.
> Migration is Mason-reviewed before it applies. Close in three places. Run `npm run build` · `npx tsc --noEmit` · `npm run lint`, and criterion 4 against a real database. Do not start the next ticket.
