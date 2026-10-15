# FIN-3 — Resend invoice, the stuck-claim state, and the PDF download

**Epic:** FIN — finances · **Phase 2** · Size: M
**Slice type:** An admin action that emails a client. Risk class: a duplicate invoice in a client's inbox; an invoice sent to the wrong address; a private PDF reachable by URL; a stuck claim misread as sent.
**Review:** **Forge — the claim release-and-reclaim is atomic enough that a double-click sends once. Vigil — the stuck rule and the three states on the row.**

**Status:** Not started

> **Forge — email review.** Against staging with a real inbox: resend a deposit invoice (one email, PDF attached, `pdf_storage_path` rewritten) · resend a Stripe invoice (due and paid kinds) · double-click resend (one email) · resend on a row whose claim is stuck (the 2026-09-11 shape: claimed, no PDF) · resend when the storage archive fails (email still sends; ops notified; the existing non-fatal rule). State each by name.

---

## Outcome

On an order, Taylor sees plainly whether the client's invoice went out — Sent, **Stuck**, or None — and can press Resend to send it again to the email on the engagement record, with the PDF regenerated and re-archived. He can open the archived PDF himself from the same row. When this week's failure happens again, the row says Stuck the moment it happens and the fix is one button. What this slice does not do: send to any other address, send anything unprompted, or change the invoice's contents.

## Why / intent

- **Taylor, 2026-09-11** — "resend client invoice (to email on the record)".
- **`docs/intake/specs/DEVIATIONS.md` § INVOICES** — the send-once claim, the non-fatal archive, the private bucket. All inherited; this slice adds a sanctioned way to run the claim again.
- **The incident** — a claim taken and never released is invisible today. "Stuck" is that state given a name and a surface.
- **What this slice is NOT (binding):** no address input; no template edit; no send to the Stripe customer email when it differs from the record; no public PDF URL.
- **Ground truth:** `server/services/invoices.ts` (`claimInvoiceEmail`, `releaseInvoiceEmail`, `deliverInvoice`, `sendDepositInvoiceEmail`, `sendStripeInvoiceEmail`) · `archiveInvoicePdf` and `INVOICE_PDF_BUCKET` · `db/schema/invoice-emails.ts`.

**Rulings this slice makes (labelled, logged):**

- **Stuck means: an `invoice_emails` row older than 10 minutes with `pdf_storage_path` null.** The archive is the last step of a successful send and is non-fatal only when storage itself fails — in which case ops was emailed, so a Stuck row with no ops email is the crash shape. Ten minutes is generous for a render; `[PROVISIONAL — Taylor]` on the number. Logged.
- **`resendInvoiceEmail(invoiceEmailId, admin)` in `invoices.ts`**: load the row; fetch the Stripe object by `stripe_object_id` (session with line items, or invoice); `releaseInvoiceEmail` then call the existing send function, which reclaims and delivers. The address is the engagement's `contact_email` for a deposit; for a Stripe invoice it is the engagement's `contact_email` when the order is linked, else the invoice's customer email (the only address there is). Logged.
- **The PDF is served by a short-lived signed URL** (`createSignedUrl`, 60 seconds) minted inside an admin action; the bucket stays private; no route serves bytes. Logged.
- **Resend is audited on the row** — `resent_at`, `resent_by` on `invoice_emails`, filled on each resend (last wins; a history is not worth a table). One migration, appended. Logged.

## Experience & states

On the order detail (FIN-2) and, as a chip, on the list row: **Sent** (when, with a PDF link) · **Stuck** (claimed at, no PDF) · **None** (no row — a dashboard invoice with no client email, or an unpaid session). The Resend button sits beside Sent and Stuck; pressing it asks once in-line — "Send the invoice again to <address on record>?" — then sends; the row updates to Sent with the new time. The PDF link opens the archived file in a new tab.

**States (exhaustive):** sent · stuck · none · resend confirming · resend in flight · resend done · resend failed (Stripe or email) · PDF link minting · PDF opened · PDF missing (archive failed; link absent, line says so).

**Failure / edge states (named):** the email provider fails → the claim is released (the existing catch), the row reads Stuck with the failure time, and the line says so · storage fails on re-archive → email sent, `pdf_storage_path` null, ops emailed (existing rule), row reads Stuck — Vigil to confirm this reading is acceptable or the rule needs a `sent_at` column · order unlinked and the Stripe invoice has no email → Resend disabled with one line · double-click → the second press finds the claim taken and reports "already sending".

## Non-negotiables (this slice)

- **The address is read from the record inside the service**, never passed from the client.
- **One email per press**, enforced by the claim, not by UI debouncing.
- **The bucket stays private.** Signed URLs only, 60 seconds.
- **Copy of the invoice is unchanged** — same `InvoiceDocument`, same renderer.

## Data

**Schema changes: yes — one migration, appended:** `alter table invoice_emails add column resent_at timestamptz, add column resent_by text;`

**Tables:** `invoice_emails` (read; release/claim through the existing functions; update audit columns) · `orders` (read) · `engagements` (read `contact_email`) · storage bucket `INVOICE_PDF_BUCKET` (read for signed URL; write via the existing archive).

**Placement:** `server/services/invoices.ts` (`resendInvoiceEmail`, `invoiceEmailState`) · `app/admin/(protected)/finances/_actions/resend-invoice.ts`, `invoice-pdf-url.ts` · `app/admin/_components/invoice-email-chip.tsx`, `resend-invoice-button.tsx` · `db/migrations/0016_*.sql`.

**Validators:** `lib/validators/admin-orders.ts` gains `resendInvoice` (uuid).

## Accessibility

The chip has text; the confirm is an in-line disclosure with focus moved to it and returned on cancel; the in-flight state is announced once; the PDF link names its target and that it opens in a new tab.

## Acceptance criteria (observable — staging, real inbox, sandbox Stripe)

1. A row sent normally reads Sent with its time and a working PDF link that expires within 60 seconds of minting.
2. A row created by claiming and killing the process before delivery (simulate by throwing inside `deliverInvoice` after the claim) reads Stuck after 10 minutes and Sent-nothing before.
3. Resend on Sent → one new email to the engagement's `contact_email` with the PDF attached; `pdf_storage_path` rewritten; `resent_*` stamped. *(Forge.)*
4. Resend on Stuck → same as 3; the row leaves Stuck. *(Forge.)*
5. Resend on a Stripe invoice, due and paid kinds → the matching existing email, once each. *(Forge.)*
6. Two presses inside a second → one email; the second reports "already sending". *(Forge.)*
7. With storage made to fail, Resend sends the email, notifies ops, and the row's state is whatever Vigil ruled in the edge list — recorded in `DEVIATIONS.md`.
8. The PDF URL, fetched after expiry, returns an error; fetched without the signature, returns an error.
9. `grep` finds no `contact_email` or address string passed from any client component to any action.
10. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `sendDepositInvoiceEmail(engagement, session)` wants a `Stripe.Checkout.Session`; retrieve with `expand: ["line_items"]` only if the function reads them (check — it reads the basket, not Stripe).
- Supabase `createSignedUrl(path, 60)` on the service-role client; the admin already has that client behind `requireAdmin`.

## Dev's call

Whether the confirm is a disclosure or a second click state · whether `invoiceEmailState` is computed in SQL or in the loader.

## Out of scope

- **Editing the invoice** — the document is derived; edit the source rows.
- **Sending to another address** — change the engagement's email first (not in this epic).
- **A resend history table** — last-wins columns are enough.

## Depends on

- **FIN-2** — the order detail and list row the button lives on. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet is acceptable; Opus preferred.** The claim machinery exists and is reused; the risk is in reading the address from the wrong place, which the non-negotiable pins.

---

### Kickoff (paste into the session)

> Build **FIN-3 — Resend invoice** (attached spec). **Address from the record, inside the service; one email per press by the claim; the bucket stays private.**
> Attach/read first, in order: this spec · `specs/README.md` · `FIN-2` (the row and detail) · `server/services/invoices.ts` (reuse the claim and the two send functions, don't fork) · `docs/intake/specs/DEVIATIONS.md` § INVOICES · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; send every named path to a real inbox and report each by name.
