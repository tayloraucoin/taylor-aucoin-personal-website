# PIPE-4 — Compose and send a step's email to the client

**Epic:** PIPE — engagement pipeline · **Phase 3** · Size: M
**Slice type:** A client-facing send from the admin. Risk class: an email to the wrong engagement; a literal `{{placeholder}}` in a client's inbox; a letter lost to a failed send; a send that leaves no record.
**Review:** Mason (the send service; refusal of unresolved names in the service) · Vesper (the dialog; the confirm) · full verification depth — real inbox, staging.

**Status:** Code complete (2026-09-25) — typecheck and lint clean, `yarn verify:pipeline` 13/13, jsonb merge exercised on Postgres 15; **`yarn build:agent` not run (disk full)**; no staging send (see PROGRESS.md)

> **Verification — risk surface.** On staging, to an inbox Taylor controls: send each of the three briefs' templates once. Send with a field empty (refused, in the UI and — by posting directly — in the service). Kill the network mid-send (row with null `resend_id`, draft kept). Send twice (confirm, second row). Open on a phone: plain text, links tappable.

---

## Outcome

On an email step in an engagement's pipeline, Taylor presses **Write email**. A dialog opens with the template's subject and body already filled in from the record and from anything he entered for this client before. Every name still missing is a labelled field above the body — `reviewUrl`, `reviewCode`, `previewUrl`, `domain` — and typing in one fills it into the letter live. He edits anything he wants, directly in the subject and body. The engagement's money state sits in the dialog as one line. **Send** asks once, naming the business and the address, then sends from `hello@` to the client's `contact_email`. On success the step is marked done, the values he typed are remembered for later steps, and the send appears under the step with its time. This slice does not schedule, sequence, or follow up.

## Why / intent

- **Taylor, 2026-09-25** — "a text area that has the email template already loaded and I can change it for any customizations needed. And then when I hit send, it should send from … hello@tayloraucoin.com to the client's email."
- **M-PIPE-2** — unresolved names refuse the send in the service; saved values override record values.
- **M-PIPE-3** — the row before the send; the body as sent.
- **`EMAIL-BRIEFS.md`** — what the three emails carry; the money line for the domain handoff.
- **Ground truth:** `sendIntroEmail` in `server/services/emails.ts` and `app/admin/_components/intro-email-form.tsx` / `intro-email-dialog.tsx` (draft persistence, re-send confirm, failure contract) · `from()` · `MoneyTable` / `loadEngagementMoney` · `renderPipelineTemplate` (PIPE-3).

**Rulings this slice makes (labelled, logged):**

- **`sendStepEmail` lives in `server/services/emails.ts`** beside `sendIntroEmail`, and reads the recipient from the engagement row itself. The action posts engagement id, step id, subject, body, and the values map — never an address. Logged.
- **The fields fill the letter; the letter does not fill the fields.** A variable field edits the value everywhere it appears in the current subject and body until Taylor edits that stretch of text by hand; after a hand edit the literal text wins. Implementation: the dialog keeps the _template_ and the _values_ and renders; the first hand edit to subject or body freezes that field to literal text, and further value changes then only fill remaining `{{name}}` tokens. `[PROPOSED — Mason/Vesper, needs sign-off]`. Logged.
- **Values saved on success only**, and only names that are not record names — or record names whose value Taylor changed. Logged.
- **Plain text, one `text` part, no HTML.** Same as the intro email. Logged.

## Experience & states

Dialog (Radix, D-ADM-3): To (read-only: contact name and address) · money line · variable fields (if any) · Subject · Body (plain textarea, tall) · **Send** · Cancel. Under the step on the engagement page: "Sent 25 Sep, 14:02" per send, failed sends as "Not sent — 25 Sep, 14:02".

**States (exhaustive):** no template on the step (no button) · composing · names missing (Send disabled, fields marked) · ready · confirming ("Send to <contact name> at <address>, for <business name>?") · sending · sent (dialog closes, step done) · failed (dialog stays, draft kept, line names the failure in words) · resend (a prior send exists: confirm says "This step was already sent on 25 Sep. Send again?").

**Failure / edge states (named):** provider error → row kept with null `resend_id`, draft kept in sessionStorage, "Couldn't send. Your letter is still here." · unresolved name posted directly → service refuses, no row, no send · engagement without `contact_email` → impossible by schema; not handled · double press → the button disables on first press; a second arriving request is a second legitimate send (no send-once law, M-PIPE-3) — the disable is the guard.

## Non-negotiables (this slice)

- **The service re-renders nothing and trusts nothing but the ids:** it checks the posted subject and body contain no `{{name}}` matching `NAME_PATTERN`, loads the address itself, writes the row, sends, records the Resend id.
- **Row before send; failed send leaves the row** (M-CRM-3 posture).
- **Never automatic.** One press, one confirm, one email.
- **No body text or values in logs.** `[pipeline]` + ids.
- **Templates ship as Taylor writes them.** No agent-drafted client copy anywhere in this slice, including fixtures committed to the repo.

## Data

**Schema changes:** none.

**Tables:** `engagements` (read contact fields; update `pipeline_values` via jsonb merge) · `pipeline_steps` (read) · `engagement_emails` (insert, update `resend_id`) · `engagement_step_completions` (insert, `onConflictDoNothing`).

**Placement:** `server/services/emails.ts` (`sendStepEmail`) · `server/services/pipeline.ts` (`listStepEmails`, `rememberPipelineValues`) · `app/admin/(protected)/engagements/_actions/pipeline.ts` (`sendStepEmailAction`) · `app/admin/_components/step-email-dialog.tsx` · `app/admin/_components/engagement-pipeline.tsx` (button + send history).

**Validators:** `lib/validators/pipeline.ts` — `sendStepEmailInput` (engagement uuid, step uuid, subject 1..300, body 1..20 000, values `Record<name, string ≤ 2000>` with names matching `NAME_PATTERN`).

## Accessibility

Each variable field has a visible label (the name, humanised: `reviewCode` → "Review code") and the raw name in a hint. Missing fields are announced when Send is attempted. The confirm is a real dialog step with focus moved to it. Targets 44px.

## Acceptance criteria (observable — staging, real inbox, phone)

1. An email step shows **Write email**; a prompt-only step does not.
2. The dialog opens with subject and body filled from the record and saved values; each unresolved name is a field.
3. Typing in a field fills every occurrence in subject and body; a hand edit to the body is kept.
4. Send is disabled while any `{{name}}` remains; a direct POST with one is refused by the service and writes no row.
5. Send → confirm naming business and address → one email from `hello@tayloraucoin.com` to `contact_email`, plain text, arrives; an `engagement_emails` row holds the exact subject and body with a `resend_id`; the step is done.
6. The next email step on the same engagement opens with the previously typed values filled in.
7. Provider failure → row with null `resend_id`; the draft survives a refresh; the step is not marked done.
8. A second send asks first and writes a second row.
9. The money line shows the engagement's paid / outstanding state.
10. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass; rendered in Light and Dark.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `sql\`${engagements.pipelineValues} || ${JSON.stringify(values)}::jsonb\`` merges without a read-modify-write race.
- The intro-email form's sessionStorage helpers are a pattern to follow, keyed `step-email-draft:<engagementId>:<stepId>`.

## Dev's call

Field order (order of first appearance in the template is the obvious one) · whether the money line reuses `MoneyTable` or a one-line summary of it.

## Out of scope

- **Reading replies** — replies land in Taylor's inbox; nothing here reads mail.
- **Conditional template text** — M-PIPE-2 revisit trigger.
- **HTML email, attachments, CC/BCC** — locked scope.
- **A registrar instruction library** — roadmap.

## Depends on

- **PIPE-3** — the renderer and the section the button lives in. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** Client-facing send; the failures are quiet (a placeholder, a wrong address) and none fail a build.

---

### Kickoff (paste into the session)

> Build **PIPE-4 — Step email send** (attached spec). **No literal placeholder ever reaches a client — refused in the service. Row before send. Address from the record.**
> Attach/read first, in order: this spec · `../README.md` · `../EMAIL-BRIEFS.md` · `TECHNICAL-DECISIONS.md` · `PIPE-3` · `sendIntroEmail` and `intro-email-form.tsx` (reuse the laws, don't fork) · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
