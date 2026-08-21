# INT-8 — Resume-link email, reminders cron, token-expiry screen

**Epic:** INT — client intake · **Phase 5** · Size: M · Fast-follow (not first-client-blocking)
**Slice type:** Scheduled outbound + the flow's cold edges. Risk class: over-contact — a reminder that double-sends or nags past completion is a trust burn on a paying client.

**Status:** Code complete (2026-08-18) — token encryption/decryption and the one-column migration verified; the cron sweep's send path and all real email delivery are NOT verified

---

## Outcome

The system now handles the client who wanders off. W0's send-my-link button emails the resume URL (and the first successful autosave triggers it once automatically); a daily Vercel cron sends at most three reminders per engagement — 48h unstarted, 48h abandoned mid-form (deep-linked to their step), day-7 final — all dead the moment `completedAt` exists, all impossible to double-send by construction. The expired-token screen gets its real copy: quiet, warm, one mailto. Nothing else changes; the flow INT-1…7 built is behaviorally identical for a client who finishes in one sitting.

## Why / intent

- **Build spec §7 (binding)** — cadence, three maximum, kill on completion. **UX spec §10** — email register verbatim ("No rush — your answers are saved…"), one button, no hero images, never "you're missing out," never a countdown; D-INT-7.
- **TECH-SCOPE §7** — all sends through `server/services/emails.ts`; `email_events` unique-constraint idempotency (INT-1 built the constraint; this slice is why); cron guarded by `CRON_SECRET`.
- **M-INT-6** — the resume email contains the link the client already has; since plaintext isn't stored, the send must be triggered from a context that possesses the token (the client's own session) — the cron **cannot** compose resume links. Reminders therefore deep-link via a stored, sendable form: see ruling.
- **What this slice is NOT (binding):** no fourth reminder, ever, by any name; no marketing content; no analytics or open-tracking on any email.

**Rulings this slice makes (labelled, logged):**

- **Reminder links use an encrypted copy of the URL token, stored at engagement creation** (`resumeTokenCiphertext`, AES-GCM under `INTAKE_LINK_KEY` from env) — creation is the one moment the service already holds the plaintext, and reminder_1 targets clients who have _never opened the link_, so any store-on-first-visit scheme cannot compose their URL (Forge audit finding, 2026-08-18). The cron decrypts to compose; plaintext still never persists. Tradeoff stated: weaker than hash-only (key + ciphertext together reveal the token) but required for the product's core reminder behavior; key lives only in env. Engagements created before this ships lack ciphertext → they are skipped by the sweep with a log line; re-issue if it matters. `[PROVISIONAL — Mason counter-proposal welcome in TECHNICAL-DECISIONS.md]` Logged.
- **Send-time dedupe is the DB constraint, not application memory:** insert the `email_events` row first — the **partial unique constraint on (`engagementId`,`kind`) covering `reminder_1/2/3` and `completion`** (INT-1; `resume_link` and `output` legitimately repeat) — send on success, delete the row on send failure so the next sweep retries. Crash-safe ordering favors under-sending over double-sending. The auto-resume-email-once behavior uses an existence check on prior `resume_link` rows, not the constraint. Logged.
- **"Abandoned" threshold and cadence constants live in `lib/intake/constants.ts`** — first second-consumer moment (cron + status derivation). Logged.

## Behavior & states

**Cron sweep (daily):** for each incomplete engagement: unstarted 48h+ after `sentAt` → reminder_1 · started, idle 48h+ → reminder_2 (deep link `/intake/[token]/[their current step]`) · day 7 after `sentAt`, still incomplete → reminder_3 · `completedAt` set → nothing, forever. Each kind sends at most once per engagement (constraint).

**Resume email:** on W0 button tap (client session has the token — compose directly) and once automatically after the first successful save if never sent (`resume_link` kind). Subject and body per UX spec §10.

**Expiry screen:** expired token → the INT-4 not-found surface upgraded with final copy: one line, warm, `mailto:` Taylor, no form, no alarm.

**Failure / edge states (named):** Resend outage mid-sweep → failed sends release their event rows; next sweep retries; partial-sweep crash → already-inserted rows prevent double-send of the sent ones · cron invoked without `CRON_SECRET` → 401, no work · engagement completed between selection and send → the send guard re-checks `completedAt` at send time · reminder for an engagement whose deposit is unpaid → reminders still apply only after `sentAt`; unpaid-and-unstarted gets reminder_1 like anyone (the deposit _is_ step zero of "unstarted").

## Non-negotiables (this slice)

- **Three reminders maximum, killed on completion — enforced by constraint, not intention.**
- **The register is a shrug, not a nudge:** no urgency vocabulary, no countdown, no exclamation marks.
- **No open/click tracking pixels** — Resend's tracking features stay off for this surface.
- **The plaintext URL token is never written to the database** (ciphertext ruling above is the only sanctioned representation) and never appears in logs.

## Data

**Schema changes: described** — one column: `engagements.resumeTokenCiphertext` text (nullable). Migration authored + journaled; **Taylor reviews and runs** (README law). Env addition: `INTAKE_LINK_KEY` (32-byte, base64) via `lib/env.ts`.

**Tables:** `engagements` (read for sweep — via a service-level `listRemindable()` beside the sanctioned readers; ciphertext write) · `email_events` (insert/delete per the dedupe ruling).

**Placement:** `server/services/emails.ts` (extend: reminder bodies, sweep orchestration) · `server/services/engagement.ts` (ciphertext store/decrypt helpers) · `app/api/cron/reminders/route.ts` · `vercel.json` (cron schedule) · `app/intake/_components/` (expiry copy) · `lib/intake/constants.ts`.

**Validators:** none new.

## Accessibility

Emails: plain-text part always present; the one button a real link with full text; expiry screen inherits the flow's floor.

## Acceptance criteria (observable — clock manipulation via seeded timestamps; Resend sandbox)

1. W0 send-my-link delivers the resume email with a working link; first autosave triggers it automatically exactly once for an engagement that never requested it.
2. Seeded engagements at each cadence point receive exactly their one due reminder per sweep; a second sweep the same day sends nothing.
3. Reminder_2's link deep-links to the client's furthest step.
4. Completing the form then forcing all three cadence conditions → zero sends.
5. Simulated send failure (bad key) → event row released; next sweep retries successfully.
6. Cron route without the secret → 401 and no reads.
7. Expired-token link renders the final expiry copy; no red, no form.
8. Negative: `grep` of email bodies for `!`, "hurry", "expires", "miss" (case-insensitive) — clean; no tracking domains in headers.
9. Migration authored + journaled, reviewed by Mason path (one column), run by Taylor.
10. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `node:crypto` AES-256-GCM with a random IV per row, IV prepended to ciphertext — no dependency.
- Vercel cron minimum practical cadence is fine at daily (`0 15 * * *` ≈ morning Pacific); the sweep is idempotent so schedule drift is harmless.
- The INT-6 straggler-upload cleanup, if adopted, rides this sweep — keep it a separate function in the same route.

## Dev's call

Sweep query shape · exact send-hour · email body line breaks · whether reminder_1 also applies to unpaid engagements after N days as written or Taylor prefers manual chasing pre-payment (default: as written; flag at closure).

## Out of scope

- **Any fourth touch, win-back, or re-engagement email** — does not exist, by law.
- **Admin visibility of reminder history** — deferred (`../ADMIN-HANDOFF.md` lists it).

## Depends on

- **INT-7** — completion semantics (`completedAt`) that kill reminders; email service home. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** Scheduled outbound with a crypto ruling and constraint-based idempotency; choosing down yields a sweep that double-sends on retry or mails a completed client — each a one-strike trust burn.

---

### Kickoff (paste into the session)

> Build **INT-8 — Emails + reminders** (attached spec). **Three maximum, dead on completion, dedupe by constraint; the shrug register; plaintext tokens never touch the database.**
> Attach/read first, in order: this spec · `specs/README.md` · `../intake-form-build-spec.md` §7 · `../INTAKE-UX-SPEC.md` §10 · `INT-7` + `INT-2` (email service, seam, ciphertext helpers — reuse, don't fork) · `../TECH-SCOPE.md` §7 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Author the one-column migration and stop for Taylor. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
