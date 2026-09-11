# FIN-7 — The add-ons offer email, and `/done` gains its two links

**Epic:** FIN — finances · **Phase 3** · Size: S
**Slice type:** One admin-triggered client email and two links on an existing page. Risk class: an email that reads as a sales push (the voice law); a send to the wrong engagement; an offer sent to an unpaid client.
**Review:** **Vesper — the email in the invoice email's grammar, no urgency. Vigil — the send from the seat of an admin on the wrong sibling.**

**Status:** Not started

> **Vigil — feature review.** Send from an engagement with siblings (the confirm names the business and the address). Send on an unpaid engagement (refused; the button is absent). Send twice (second is a plain resend, allowed, logged). Open the email on a phone: one link, one line, nothing else to tap.

---

## Outcome

After a conversation where a client says yes to more, Taylor opens their engagement and presses **Send add-ons offer**. They get one short email from Agora with a single link to their add-ons page. A client who comes back on their own through `/done` finds the same page linked there, beside a link to their invoices-by-email note. What this slice does not do: send anything automatically, sequence follow-ups, or put an offer in front of an unpaid client.

## Why / intent

- **Taylor, 2026-09-11** — "send a client an email that brings them to a page where they can choose any selection of upsells."
- **Step 8's promise and the RUNBOOK's spirit** — nothing extra arrives without a conversation first; the button is pressed after one.
- **`docs/TASTE-PROFILE.md` § voice** — no startup-marketing voice; the invoice email's tone is the ceiling.
- **M-FIN-4** — `/done` is the paid client's home.
- **What this slice is NOT (binding):** no automatic trigger, no reminder cadence, no discount, no "limited time"; no offer button on an unpaid engagement.
- **Ground truth:** `server/services/emails.ts` (`sendRawEmail`, `notifyOps`, the `email_events` window) · `renderInvoiceEmailHtml` (the grammar) · `app/websites/coded/intake/[token]/done/page.tsx` and the durable twin.

**Rulings this slice makes (labelled, logged):**

- **`sendAddonsOffer(engagementId, admin)` in `emails.ts`**: refuses unless `paid_at` is set; builds the extras URL from the decrypted token (reissuing if expired, as FIN-4 does); sends; writes `email_events` with a new kind `addons_offer`. Logged.
- **The email is three lines and one link.** `[COPY — Taylor]` — placeholder ships marked; the slice is not Complete until the copy is his. Logged.
- **`/done` gains two links under its existing closing line**: "Add to your build" → extras; "Your invoices arrive by email from Agora — reply to any of them to reach Taylor." (text, not a link). Logged.

## Experience & states

Admin: one button beside FIN-4's link actions, present only when `paid_at` is set; an in-line confirm naming the business and the address; a result line with the time. Client: the email; `/done` with the two additions.

**States (exhaustive):** button absent (unpaid) · idle · confirming · sending · sent · failed · `/done` with links.

**Failure / edge states (named):** expired token → reissued first, said in the result line · provider down → failed line, no `email_events` row · pressed on a sibling by mistake → the confirm named it; a second press on the right one is allowed.

## Non-negotiables (this slice)

- **Never sent to an unpaid engagement.**
- **Never automatic.**
- **No urgency, no discount, no countdown, no "most clients".**
- **Address from the record, inside the service.**

## Data

**Schema changes: yes — one migration, appended:** `alter type email_event_kind add value 'addons_offer';` (`email_events.kind` is the `email_event_kind` enum in `db/schema/email-events.ts`).

**Tables:** `engagements` (read; reissue via the existing function) · `email_events` (insert).

**Placement:** `server/services/emails.ts` (`sendAddonsOffer`, the template beside the invoice template) · `app/admin/(protected)/engagements/_actions/send-addons-offer.ts` · `app/admin/_components/engagement-link-actions.tsx` (one more button) · `app/websites/coded/intake/[token]/done/page.tsx` + durable twin · `content/` — the copy placeholder where the other client-facing strings live.

**Validators:** `lib/validators/admin-engagements.ts` (uuid).

## Accessibility

Email: one link with words, live text, no image-only content, readable at 16px. Page: the two additions in flow, links with words.

## Acceptance criteria (observable — staging, real inbox, phone)

1. Button absent on an unpaid engagement; present on a paid one.
2. Send → one email to `contact_email` with one link that opens the extras page for that engagement; `email_events` row `addons_offer`.
3. Expired token → reissued, sent, the line says so.
4. `/done` on both tracks shows the two additions; the extras link opens FIN-6's page.
5. `grep` finds no urgency word in the template.
6. The copy is Taylor's (marked placeholder replaced) before Complete.
7. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Reuse the invoice email's outer shell and palette (`lib/invoices/paper.ts`); one new body, not one new template system.

## Dev's call

Where the placeholder copy lives · button placement within the actions row.

## Out of scope

- **Follow-ups, cadences, discounts** — never.
- **Offer on the intake steps** — the taste step's motion notice is the one mid-intake offer (PORT-26).

## Depends on

- **FIN-6** — the page the link opens. Complete in `PROGRESS.md`.
- **FIN-4** — the actions row the button joins. Complete.

## Recommended execution

**Sonnet is acceptable.** Small; the voice law is the risk and Taylor writes the copy.

---

### Kickoff (paste into the session)

> Build **FIN-7 — Add-ons offer email** (attached spec). **Never to an unpaid engagement; never automatic; no urgency; copy is Taylor's.**
> Attach/read first, in order: this spec · `specs/README.md` · `FIN-4` and `FIN-6` · `server/services/emails.ts` · `renderInvoiceEmailHtml` (the grammar) · `docs/TASTE-PROFILE.md` § voice · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`.
