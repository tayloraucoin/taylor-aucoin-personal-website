# Intake admin — handoff notes for the later build

Author: Vesper. The admin surface was explicitly deferred (Taylor, 2026-08-18). These are the content requirements the client-facing spec generates, so the future admin task starts warm. Presentation of the admin surface is unspecified on purpose — utilitarian is fine; it is Taylor-only.

## What the admin surface must show

Per engagement (one row each):

- Business name · contact name · **status** · deposit state · last activity timestamp · one-click open of the markdown output.
- Status vocabulary (matches the engagement state machine, now including payment):
  `link created → sent → paid` (or `waived`) `→ started → in progress → abandoned → complete`.
  "Abandoned" is derived (no activity 48h+ after starting), not manually set.

Per-engagement detail:

- The **markdown intake document** (build spec §6 is binding on its format): "Not answered" section collected explicitly, risk flags auto-generated, uploads listed with signed links, voice note linked separately for transcription.
- **Add one flag to the build spec's list:** deposit state (`paid $X on date via Stripe` / `waived`) at the top of the document — the verification call should open knowing money status.
- Reminder history (which of the three fired, when) and a kill switch per engagement.

## Link creation (the admin's write path)

Creating an engagement needs: contact name · business name · phone · email · 1–3 line project summary (renders verbatim on the pay screen — write it for the client's eyes) · deposit amount · `deposit_required` flag. These prefill the client flow; the client is never asked what Taylor already knows.

## Suggested template for the personal link email (Taylor sends this himself)

> Subject: {Business name} — everything from our call
>
> Hey {first name} — great talking today. Here's the link with everything we agreed, the deposit, and a short questionnaire (about 30 minutes, skip anything you're not sure about): {link}
>
> Text me if anything's weird. — Taylor

## Cautions carried over from the specs

- Never render fabricated/placeholder testimonials or sample data in admin previews (requirements doc §E is a legal posture, not a style note).
- Voice notes and call recordings are confidential source material — signed URLs, never public, and they exist only to feed the brand-voice work.
- Reminders: three maximum, all killed on completion (build spec §7). The admin must never grow a "send another nudge" button beyond that ceiling.
