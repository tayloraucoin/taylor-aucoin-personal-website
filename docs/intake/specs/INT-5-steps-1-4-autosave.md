# INT-5 — Steps 1–4 and the autosave engine

**Epic:** INT — client intake · **Phase 3** · Size: L
**Slice type:** Form content + the no-loss persistence contract. Risk class: **answer loss** — the worst client-facing failure the product has (deposit taken, answers gone).
**Review:** **Forge — data-loss path.** Review by inducing: offline mid-step, tab kill mid-edit, two tabs same token, server 500 on save, reconnect after airplane mode.

**Status:** Code complete (2026-08-18) — merge semantics, concurrency, validation, and activity stamping verified against a scratch Postgres; the browser-side autosave behaviours (offline, tab-kill, retry UI) are NOT verified

> **Forge — no-loss review.** Verification states which paths it exercised: online blur-save · step-change save · offline edit + reconnect sync · tab killed within debounce window · concurrent second tab · save-endpoint 500 with retry exhaustion (indicator's gold state, data still local).

---

## Outcome

Steps 1–4 are real: About your business (prefilled identity trio with the mismatch note), What you charge (repeatable service blocks, add-ons, payment fields), How you work (the ink-intro step, customer-provides checkboxes with exclusive-none), Customers and competition (three indexed value fields). Behind them, the autosave engine: every blur and step change merges the step's answers into `engagements.answers` (JSONB, server-merged per step key), `lastActivityAt` touches, the SaveIndicator runs its §6.2 state machine truthfully, and offline edits persist locally and sync on reconnect. A client can fill four steps on a van's flaky LTE and lose nothing. Steps 5–9 remain stubs (INT-6); nothing emails; Done remains a stub (INT-7).

## Why / intent

- **Build spec §4 Steps 1–4 (binding)** — the field inventory, types, help text, and conditional logic, verbatim. This ticket adds no fields and removes none.
- **UX spec §6 (D-INT-6)** — autosave on blur + step change; the SaveIndicator state machine verbatim (`Saved` · `Saving…` >400ms only · offline line · gold trouble line); repeatable-block grammar §6.3 (gold mono indices, quiet remove, 6s inline undo, no confirm dialogs); exclusive-none §6.6; **§7 per-step deltas** — prefilled-not-asked identity fields (D-INT-8), the three-name gold mismatch note (information, not error), Step 3's ink intro, Step 4's three indexed inputs.
- **D-INT-4** — nothing required, no validation walls; Zod schemas are all-optional shape guards, not gatekeepers.
- **CC law** — validators in `lib/validators/intake.ts` shared by actions; actions thin → `server/services/submission.ts`; server merge so two tabs can't clobber whole-document.
- **What this slice is NOT (binding):** no file fields (Step 6's uploads are INT-6 even though Step 2 has none — nothing here touches storage); no answer content in any log line, including error paths.

**Rulings this slice makes (labelled, logged):**

- **Merge granularity is the step key:** the server action receives one step's answer object and merges it into `answers` at that key (shallow, step-scoped). Two tabs editing _different_ steps interleave safely; two tabs on the _same_ step are last-write-wins within that step — accepted for v1, cost stated: a rare self-conflict a solo filler can cause only deliberately. Logged.
- **Local persistence is per-step localStorage keyed by engagement + step, cleared on confirmed server save.** Not IndexedDB — payloads are small text; uploads (the large things) never touch this path. Logged.

## Experience & states

Happy path per build spec §4 tables + UX spec §7 deltas. Field order, help lines, and conditional reveals (§6.5: in-place, 300ms, reduced-motion instant) as specified.

**States (exhaustive):** every field inherits INT-4's primitive matrix; SaveIndicator: idle/saved · saving (>400ms) · offline · trouble (gold, retry link) — transitions faded, never snapped; repeatable block: zero-extra · n blocks · just-removed (undo window) · undo-expired; mismatch note: hidden · shown (2+ differing name fields, non-empty).

**Failure / edge states (named):** save 500 → silent retry (bounded backoff), then trouble state — data remains in localStorage and in the DOM; offline → immediate offline state, edits accumulate locally, reconnect syncs silently and settles to Saved; tab killed pre-debounce → localStorage rehydrates the step on next visit with unsynced values and syncs; token expired mid-session (60-day edge) → next save fails not-found → trouble state; the flow never hard-errors mid-edit.

## Non-negotiables (this slice)

- **No answer is ever lost between a blur and a confirmed save.** The local copy outlives the request.
- **The indicator never lies.** `Saved` renders only after server confirmation; the >400ms rule prevents flicker theater.
- **No required markers, no validation blocks, no disabled Continue** (D-INT-4).
- **Answer content never appears in logs or error messages** — log engagement id + step + byte count at most.
- **Prefilled fields are asked-never-blank:** they render Taylor's values, editable, and are saved like any field.

## Data

**Schema changes: none.**

**Tables:** `engagements` (`answers` merge + `lastActivityAt` via `server/services/submission.ts`; reads through the seam).

**Placement:** `server/services/submission.ts` · `app/intake/[token]/_actions/save-step.ts` · `app/intake/_components/steps/{step-1-business,step-2-pricing,step-3-operations,step-4-positioning}.tsx` · `app/intake/_components/repeatable-block.tsx` · `app/intake/_lib/use-step-autosave.ts` (hooks are not components — segment-local `_lib/`, per CC's promotion rule and platform split; Forge audit 2026-08-18) · `lib/validators/intake.ts` (per-step all-optional schemas) · `lib/types/intake.ts` (flesh out the four step interfaces).

**Validators:** `stepBusinessSchema` … `stepPositioningSchema` — every field `.optional()`; unknown keys stripped (not rejected).

## Accessibility

Step-specific traps on top of INT-4's floor: the mismatch note is `aria-live="polite"` and tied to the fields via `aria-describedby`; repeatable-block remove/undo is announced; exclusive-none state change (clearing siblings) is announced once, not per-checkbox; Step 3's fifteen fields keep a legible tab order through group headers.

## Acceptance criteria (observable — mobile viewport; network throttling and offline via devtools; two devices for the concurrency case)

1. All Step 1–4 fields from build spec §4 render with their specified types, help lines, and conditionals; no field added or dropped (checklist against the spec tables).
2. Identity trio arrives prefilled from the engagement row; editing and blurring persists the edit; the gold mismatch note appears exactly when 2+ non-empty name fields differ and reads as the §7 copy.
3. Blur → `answers.<stepKey>` updated server-side (verify row); step change saves likewise; `lastActivityAt` touches on each save.
4. Airplane mode mid-step: indicator shows the offline line ≤2s after a blur; edits continue; reconnect syncs without user action and settles to `Saved`; the row matches the DOM.
5. Kill the tab within the debounce window; reopen the link: the step rehydrates the unsynced values and syncs them.
6. Force the save action to 500 (dev flag or network block on the action route): retries occur, then the gold trouble line with working retry; no thrown overlay, no data loss.
7. Two tabs, different steps, interleaved edits: both step keys correct in the row afterward.
8. Repeatable services: add three, remove one, undo within 6s → block restored with values; let undo expire → gone from row on next save.
9. Exclusive-none (Step 3 customer-provides): checking `nothing` clears others and vice versa, announced once.
10. Negative: no log line contains an answer string (grep the dev server output after a full run-through).
11. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- One `useStepAutosave(stepKey)` hook owning debounce, queue, localStorage, and indicator state keeps INT-6 from re-implementing the contract — build it as the pattern worth copying.
- Server merge: read `answers`, spread `{ ...answers, [stepKey]: incoming }`, write — inside one UPDATE with `jsonb_set` or a read-modify-write in a transaction; row-level contention is negligible at one filler.
- `navigator.onLine` is a hint, not truth — treat a failed fetch as offline signal too.

## Dev's call

Debounce values · retry/backoff shape · localStorage key format · form state library (plain React state vs `react-hook-form`; build spec §8 suggests RHF — dev decides, log if adopted since it adds a dependency).

## Out of scope

- **Steps 5–9, uploads, voice card** — INT-6. **Reminder emails on abandonment** — INT-8. **Done/completion** — INT-7.

## Depends on

- **INT-4** — StepShell, primitives, SaveIndicator visuals, step registry, navigation. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** The autosave engine's edge cases are the ticket; a cheaper model ships blur-save happy path and the offline/kill/concurrency cases surface as lost answers on a real client.

---

### Kickoff (paste into the session)

> Build **INT-5 — Steps 1–4 + autosave** (attached spec). **No answer is ever lost; the indicator never lies; nothing is required.**
> Attach/read first, in order: this spec · `specs/README.md` · `../intake-form-build-spec.md` §4 Steps 1–4 (field law) · `../INTAKE-UX-SPEC.md` §6, §7 · `INT-4` (primitives — reuse, don't fork) · `../TECH-SCOPE.md` §3 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Server-merge per step key. Local copy outlives the request. No answer content in logs. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
