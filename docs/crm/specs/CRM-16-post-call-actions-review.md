# CRM-16 — Post-call actions & review: the one-motion send, the texted link, the receipt

**Epic:** CRM — call-mode redesign (v1.2) · **Phase 5** · Size: M
**Slice type:** Conversion moments, inline. Failure class: a yes that dead-ends, a mis-sent or unrecorded outbound touch, a show-once link lost.
**Vigil:** Review by *inducing*: fail the Resend send (draft intact, row marked undelivered, retry offered); attempt a re-send to a lead with a prior intro (confirm gate); mint an intake link and navigate before copying (it was shown inline, once — the panel warned); send with no email captured (path is unreachable: the action derives from captured data). QA states which paths it exercised: email-success · email-fail · re-send-confirm · text-mobile · text-desktop · intake-mint · nothing-owed.

**Status:** Complete (2026-08-22)

---

## Outcome

The moment after a good call is one motion. Save lands on the post-call panel with only what is owed: *wants info* with a captured email becomes the intro draft inline — To and body prefilled from the call, promo checkbox, one **Send**; *wants info* preferring text becomes the prefilled text — `sms:` link on the phone, copy-the-body on the laptop — and the touch is recorded; *ready for intake* becomes the prefilled mint with the show-once link and **Copy**. Every conversation then ends on a review screen: what was saved, the committed next date, what went out. **Next lead** continues the block. Non-conversation paths never see any of this. The interim next-step panel from CRM-15 retires here.

## Why / intent

- **CRM-UX-SPEC §3.8 states 3–5** — the contract for this slice. **D-CRM-26** — actions derive from captured data, one motion, nothing re-entered. **D-CRM-27** — review after conversations only.
- **D-CRM-9 stands** — the email remains a full editable draft, promo checkbox appends the code, CASL soft guard copy, confirm on re-send, failure keeps the draft. The dialog's laws move into the panel; the laws do not weaken because the chrome changed.
- **D-CRM-14 stands** — texts stay on Taylor's phone: `sms:` deep link with prefilled body on mobile, copy-the-body on desktop. The app never sends SMS.
- **M-CRM-3 / CRM-7 precedent** — the outbound record is written before the send and kept on failure; `promoIncluded` recorded from the sent body; a send persists a typed-in address to the lead.
- **CRM-14** — `linkTexted` on the attempt is the record of a texted link; `getLeadStage` already counts it `[PROVISIONAL — Taylor]`.
- **Ground truth:** `draftIntroAction`/`sendIntroAction` and `lib/crm/intro-email.ts` are the one home for the email words and send path (server-composed — a localhost link must never reach a prospect). `createIntakeLinkAction` + the show-once inline pattern live in `engagement-panel.tsx`; the plaintext token is never stored (M-INT-6). Reuse all of it; fork none of it.
- **What this slice is NOT (binding):** no change to who *may* be emailed (the CASL posture is M-CRM-3's soft guard, counsel flag standing); no SMS sending machinery; no engagement-panel changes on the lead record — that surface keeps working as is.

**Rulings this slice makes (labelled, logged):**

- **The text body has one home: `lib/crm/intro-text.ts`,** server-composed beside the email for the same reason (origin from env, never `window`). Draft v1 (Drummer, Taylor's register — `[PROVISIONAL — Taylor ratifies copy]`): *"Taylor here, from the call just now. Here's that link: {sales page URL}. Prices are on there too. Text me back if anything's weird."* One link, no exclamation marks, survives the thirty-second check. Logged.
- **The text panel carries the same quiet CASL line as the email** ("Send only after they've asked on a call") — same promise, same treatment, visually learnable. Logged.
- **Recording the text is one tap, honest by default.** The `sms:`/Copy interaction cannot confirm delivery; the panel records `linkTexted` when Taylor taps the send/copy affordance, with an undo inline ("didn't send it" clears it before Next lead). The record claims a text was prepared and taken to the phone — the timeline renders it as "link texted", not "delivered". Logged.
- **Review is a receipt, not a form.** Read-only: disposition, tags, contact captured, notes, next date, actions completed/skipped. The only control is **Next lead** (and Enter). Anything wrong gets fixed on the lead record — one escape link, no inline editing. Logged.

## Experience & states

**State 3 — post-call panel (right column; script column persists left).** Rendered from the Save payload: `wants_info` + channel email (or no preference, email captured) → inline draft: To (editable), Subject, body textarea, promo checkbox, quiet CASL line, **Send** · `wants_info` + channel text → the text block: body shown, `sms:{number}?&body=` anchor on mobile / **Copy text** on desktop, "didn't send it" undo, CASL line · `ready_for_intake` → mint form prefilled (name, email, phone, summary — from the call and the lead), **Create intake link** → show-once URL + **Copy link** with the never-shown-again warning · callback promised → one line: scheduled, when · multiple owed (info + intake) → stacked in that order, each completable independently · nothing owed → skip straight to state 4.
**State 4 — review.** The receipt (ruling above). **Next lead** → advance (CRM-15's state 5).

**States (exhaustive):** each action idle/in-flight/succeeded/failed/skipped · email failure (draft intact, message states what happened, retry) · re-send confirm ("An intro already went to this lead. Send another?") · missing email on the email path (unreachable by construction — the panel offers the email action only when an address was captured; the review screen notes "no email on file" instead) · sent state on the timeline (delivered vs failed marked, existing CRM-7 rendering) · reduced-motion (no panel transition).

**Failure states (named):** Resend failure mid-block · double-click Send (single send — action idempotence via pending state) · navigation away after mint without copy (the warning was shown; the token is gone by design — say so plainly, offer "create a new link" path on the lead record) · text tapped but never sent from the phone (the undo, and the honest "prepared" language).

## Non-negotiables (this slice)

- **Nothing is re-entered.** Every prefill comes from the call's captured data or the lead. If the panel asks for something the conversation form already captured, the slice is wrong.
- **The record precedes the send** (email row before Resend; kept and marked on failure).
- **The app never sends SMS.** `sms:` and clipboard only.
- **The show-once link law holds** (M-INT-6): shown inline, copy affordance, never stored, never re-shown.
- **Send is a choice, never automatic.** "Next lead" without sending is always one click and costs nothing.
- **No urgency styling** — the panel invites, it never pushes.

## Data & AI

**Schema changes: none** (CRM-14 owns `linkTexted`).
**Tables:** `lead_emails` (service write, existing path) · `call_attempts` (`linkTexted` via service) · `leads` (email persist on send — existing CRM-7 behavior) · engagements via `createIntakeLinkAction` (existing).
**Placement:** new `app/admin/_components/post-call-panel.tsx` + `call-review.tsx` (client leaves) · `lib/crm/intro-text.ts` (pure composition) · `focus-card.tsx`/state host wiring (CRM-15's machine gains states 3–4) · `intro-email-dialog.tsx` remains for the lead-record path; the queue path stops importing it.
**tRPC / validators:** reuse `draftIntroAction` · `sendIntroAction` · `createIntakeLinkAction`; one small action for recording/clearing `linkTexted` if it doesn't ride the Save (dev's call with CRM-14).
**AI notes:** **None.**
**Instrumentation:** none — the scoreboard derives from the tables.

## Accessibility

The panel transition announces once, politely. Send/Copy/Next-lead targets ≥44px. The show-once warning is text, not color alone. The `sms:` anchor is a real link with the number visible. Draft textarea keeps the mono/readable treatment from the dialog. Focus lands on the first action when state 3 opens, and on Next lead when state 4 opens — the happy path is Enter-able end to end without a mouse, but Enter never triggers Send (explicit click/space only — a send is not an advance).

## Acceptance criteria (observable)

1. Save with `wants_info` + captured email + channel email lands on the inline draft, To/body prefilled; **Send** delivers, writes the `lead_emails` row first, and the review screen lists "Intro sent to {addr}". *(Vigil: email-success.)*
2. With Resend failing, the draft stays exactly as edited, the row is marked undelivered, retry is offered, and the review screen reflects the failure honestly. *(Vigil: email-fail.)*
3. A second intro to the same lead requires the confirm; declining keeps the draft. *(Vigil: re-send-confirm.)*
4. Channel text on mobile viewport: the `sms:` link carries the number and the composed body; tapping the affordance records `linkTexted`; "didn't send it" clears it. On desktop: **Copy text** puts the body on the clipboard and records the same. The timeline shows "link texted". *(Vigil: text-mobile · text-desktop.)*
5. `ready_for_intake` shows the prefilled mint; creating it renders the show-once URL inline with Copy and the warning; the review screen lists "Intake link created". *(Vigil: intake-mint.)*
6. A conversation with nothing owed skips state 3 entirely and shows the review receipt: disposition, tags, contact captured, next date. **Next lead** (and Enter) advances. *(Vigil: nothing-owed.)*
7. Enter on the post-call panel never sends an email or a text.
8. Non-conversation dispositions never render the panel or the review screen.
9. The interim next-step panel and the queue path's dialog import are gone; the lead-record path's intro dialog still works unchanged.
10. The composed sales-page link in email and text carries the deployed origin (env), never the local host — verified in the rendered body locally.
11. `npm run build` · `npx tsc --noEmit` · `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `IntroEmailDialog`'s draft/send/confirm state logic is the model — lift it into a shared hook or panel component rather than duplicating; the dialog becomes a thin modal shell around the same core.
- The `sms:` body separator differs across platforms (`?body=` vs `&body=`); the existing D-CRM-14 mobile pattern in the codebase (wants-info sms: option) is the reference if present — check before deriving.
- Focus management on state entry is cheap with a `ref` + effect keyed on the machine state.

## Dev's call

Whether `linkTexted` records via the Save payload or a follow-up micro-action · shared-core shape between dialog and panel · stacked-actions layout when both email and intake are owed.

## Out of scope

- **Follow-up sequences, reminders, scheduling beyond the committed next-touch** — the cadence engine owns them (CRM-5, D-CRM-5).
- **Any change to the public intake surface** — D-CRM-10/CRM-8 territory.
- **Text delivery status** — the phone owns the send; the CRM records intent honestly.
- **The lead-record engagement panel** — untouched; it remains the home for linking and unlinking.

## Depends on

- **CRM-15** — the state machine this slice extends (states 3–5), and the Save payload that feeds the panel. Complete in `PROGRESS.md`.

## Recommended execution

**Opus 5** (fast mode is fine — it is the same model with faster output, not a downgrade). Three conversion moments share one panel and each carries an outbound side effect governed by a record-before-send law. Failure mode of choosing down to Sonnet 5: a sent email with no `lead_emails` row, a stored show-once token, or a review screen that reports success on a failed send — trust-breaking defects on the exact surface that converts. Fable 5 is not required here: the reasoning is bounded by three enumerated flows reusing an existing, working send path, where CRM-15's was an open-ended restructure.

---

### Kickoff (paste into the session)

> Build **CRM-16 — Post-call actions & review** (attached spec). Model: **Opus 5**. Run alone.
> **Nothing re-entered; the record precedes the send; the app never sends SMS; the show-once link law holds; sending is a choice.**
> Attach/read first, in order: this spec · `docs/crm/CRM-UX-SPEC.md` §3.8 (states 3–5) + D-CRM-9/14/26/27 · `app/admin/_components/intro-email-dialog.tsx` + `engagement-panel.tsx` + `lib/crm/intro-email.ts` (reuse, don't fork) · CRM-14 + CRM-15 (consume) · `docs/crm/specs/DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last — reality overrides stale strings.
> Retire the interim panel; keep the lead-record dialog working. Close in three places. Run `npm run build` · `npx tsc --noEmit` · `npm run lint`, plus the Vigil induction list, and state which paths you exercised. Do not start the next ticket.
