# FIN-2 — `/admin/finances/orders`: the list, the order detail, Import from Stripe, Link to engagement

**Epic:** FIN — finances · **Phase 2** · Size: L
**Slice type:** Admin read surface plus two write actions, one of which settles money. Risk class: an import that runs fulfillment from an id an admin typed wrong; an import that overwrites what the webhook wrote; a link that moves a payment to the wrong client; personal data rendered where it need not be.
**Review:** **Mason — the `settleDepositSession` refactor (webhook and import share one body) and the M-FIN-2 amendment. Forge — import on every object shape, and import of an object already settled by the webhook. Vesper — the list and detail render inside the ADM-1 shell, both themes, D-ADM-13.**

**Status:** Not started — **gated on M-FIN-2 and M-FIN-3 ratified or defaulted per `00-build-order.md`.**

> **Forge — money review.** Against staging with `stripe listen`: import a session the webhook already settled (nothing changes but `imported_*`) · import a session the webhook never saw (settles exactly as the webhook would; invoice email sends) · import a `pi_` (resolves to its session) · import an `in_` open invoice, then paid · import a nonsense id (refused, no write) · import a session from the *other* Stripe tier (refused by Stripe, surfaced plainly). State each by name with the `orders` and `engagements` rows before and after. **Mason — one-way-door review:** the refactor is behaviour-preserving for the webhook; diff the handler's log lines before and after.

---

## Outcome

Finances lights up in the admin rail. Taylor opens Orders and sees every payment, newest first — who, what, how much, when, whether the client's invoice went out — and can open one to see the line items, every Stripe id as a link, and the invoice-email history. Two things he can do from there: paste a Stripe id and have the site record and settle that payment exactly as the webhook would have, and attach an unlinked invoice to the engagement it was for. What this slice does not do: resend an invoice (FIN-3), show revenue totals (§ Later), or move money.

## Why / intent

- **D-ADM-7** — Finances is named in the rail and dimmed; this slice flips `ready` on one item. `ADMIN-UX-SPEC.md` §5 governs the page grammar.
- **M-FIN-1** — the list reads `orders`; it never calls Stripe to render.
- **M-FIN-2 (proposed)** — Import is a sanctioned second rail into fulfillment because the object comes from Stripe's API, not from a client. The two rails share one body.
- **M-FIN-3 (proposed)** — Unlinked is a state with a button, not an error.
- **Taylor, 2026-09-11** — "see order details (money, etc.) and actions like resend client invoice"; "a way to convert an existing order". Import is the conversion, from the UI, after FIN-1's backfill has done it once from the CLI.
- **What this slice is NOT (binding):** no refund, credit, or void action; no editing of amounts; no free-text email field anywhere; no Stripe call on list or detail render.
- **Ground truth:** `app/admin/_components/` (rail, panels, tables — ADM-1) · `server/services/engagement-admin.ts` (`loadEngagementSummaries`, `loadMoneyTotals` — the money-formatting grammar) · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` · `lib/routes.ts` `adminRoutes.revenue` (the reserved slot; this slice adds `orders` and `order(id)` beside it).

**Rulings this slice makes (labelled, logged):**

- **`settleDepositSession(session, opts?: { eventId?: string })` — the event is a log tag, not an input.** The webhook handler passes its id; the import passes none. Same function, same guarded updates, same `recordOrder` call. Logged.
- **`importStripeObject(id, admin)` in `server/services/orders.ts`** accepts `cs_`, `pi_`, or `in_`: `pi_` is resolved to its Checkout session via `stripe.checkout.sessions.list({ payment_intent })`; `cs_` is retrieved with line items; `in_` is retrieved. Then: a session runs `settleDepositSession` (which records the order); an invoice runs `recordOrder` and, when paid, the `invoice_paid` email path via the existing `sendStripeInvoiceEmail`. `imported_at` / `imported_by` stamped from `requireAdmin()`. Logged.
- **Import never un-sets.** It inherits `recordOrder`'s fill-nulls contract and `fulfillDeposit`'s guarded update. A session the webhook already settled changes only `imported_*` and `updated_at`. Logged.
- **`linkOrderToEngagement(orderId, engagementId, admin)`** sets `engagement_id`, `link_reason: "manual"`, and links basket rows by price id for that engagement. Refuses if the order is already linked — unlinking is not offered; a wrong manual link is corrected by hand SQL, deliberately rare. Logged.
- **Personal data on the list is the business name and nothing else.** The email on record appears on the detail only, as the target Resend (FIN-3) will use. `stripe_customer_email` is shown on an unlinked order's detail because it is the one clue to linking it. Logged.

## Experience & states

The list, inside the ADM-1 shell under Finances → Orders: a table — Date · Business (link to the engagement) · What (the product names, or the invoice number for a dashboard invoice) · Amount · Tax · Status chip · Source · Invoice email (Sent / **Stuck** / None, per FIN-3's rule; until FIN-3 ships, Sent or None from `invoice_emails.pdf_storage_path`). Above it, one control: **Import from Stripe** — a single input for a Stripe id and a button; on success the row appears at the top and the detail opens; on refusal one line says why in plain words. Newest first, paginated at 50.

The detail, at `/admin/finances/orders/[id]`: the engagement (or **Unlinked** with the Link control), the line items with cents, amount / tax / total, status, source, `paid_at`, every Stripe id as a deep link to the dashboard on this tier, the invoice-email history (kind, when, PDF archived or not), and `imported_by` when present. The actions row holds Link (unlinked only) and, after FIN-3, Resend.

**States (exhaustive):** list empty (before backfill) · list populated · import idle · import in flight · import succeeded (new row) · import succeeded (already present) · import refused (bad id / wrong tier / Stripe error) · detail linked · detail unlinked · link in flight · link done.

**Failure / edge states (named):** Stripe unreachable during import → one line, nothing written · an id from the other tier → Stripe returns not-found; the line says "not on this tier" only when the id prefix is valid · import of an `unpaid` session → recorded `open`, nothing settled, the line says so · import races the webhook → both idempotent; whichever lands second changes nothing · a linked order whose engagement was deleted → `engagement_id` null by FK rule; renders Unlinked with the stored email · Link pressed on an order already linked → refused, no write.

## Non-negotiables (this slice)

- **One settlement body.** The webhook and Import call the same function; the diff shows the handler shrinking, not a copy.
- **Import and Link are admin actions behind `requireAdmin`**, thin, calling the service.
- **No Stripe call on render.** Deep links are built from ids; nothing is fetched.
- **The list never shows an email address.**
- **No refund, void, or amount edit exists.**

## Data

**Schema changes: none** (FIN-1's columns cover `imported_*` and `link_reason`).

**Tables:** `orders` (read; update via `recordOrder` / `linkOrderToEngagement` only) · `engagement_products` (read; link via service) · `engagements` (read; reconcile fills via FIN-1's helper) · `invoice_emails` (read) · `products` (read).

**Placement:** `app/admin/(protected)/finances/orders/page.tsx` · `app/admin/(protected)/finances/orders/[id]/page.tsx` · `app/admin/(protected)/finances/_actions/import-order.ts`, `link-order.ts` · `app/admin/_components/orders-table.tsx`, `order-detail.tsx`, `import-order-form.tsx` · `server/services/orders.ts` (`importStripeObject`, `linkOrderToEngagement`, `loadOrders`, `loadOrderDetail`) · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` (signature refactor) · `lib/routes.ts` (`adminRoutes.orders`, `adminRoutes.order(id)`) · the rail config (`ready: true` on Orders; Revenue stays dimmed).

**Validators:** `lib/validators/admin-orders.ts` — `stripeObjectId` (regex on the three prefixes, length-bounded), `linkOrder` (two uuids).

## Accessibility

Table with a caption and `scope="col"` headers; the status chip has text, not colour alone; the import input is labelled; the result line is `aria-live="polite"`; deep links say where they go ("Open in Stripe"); both themes per D-ADM-13 with gold-700 on paper.

## Acceptance criteria (observable — staging database, sandbox Stripe, both themes)

1. Finances → Orders is a live rail item; Revenue remains dimmed.
2. After FIN-1's backfill, the list shows every order newest first with the columns named; no email address is rendered anywhere on the list.
3. Import of a `cs_` the webhook already settled → one line "already recorded"; `engagements` and `orders` rows byte-identical except `imported_*`, `updated_at`. *(Forge.)*
4. Import of a `cs_` the webhook never saw (stop `stripe listen`, pay, then import) → `paid_at` set, basket stamped, order recorded, invoice email sent once; a later webhook replay changes nothing. *(Forge.)*
5. Import of a `pi_` resolves to its session and behaves as 3 or 4.
6. Import of an open `in_` → order `open`, unlinked or email-linked; import again after paying → `paid`, `paid_at` set, paid-invoice email sent once. *(Forge.)*
7. Import of `cs_nonsense`, of an empty string, and of a valid-shaped id from the other tier → refused with the right line; zero writes.
8. Detail of an unlinked order shows the stored customer email and the Link control; linking attaches it, stamps `link_reason: manual`, links basket rows by price id, and the engagement's page (FIN-4) or summary reflects it.
9. Link on an already-linked order is refused before any write.
10. The webhook handler's log lines are unchanged before and after the refactor (diff attached to the closure).
11. Both themes pass the ADM-1 contrast checks on the table and chips.
12. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `loadMoneyTotals` already formats cents per currency; reuse its formatter.
- The Stripe deep link is `https://dashboard.stripe.com/{test/}payments/<pi>` or `/invoices/<in>`; the tier decides the `test/` segment — read it from `resolveAppTier`, never hardcode.
- Pagination: cursor on `(paid_at, id)`; the ADM tables use offset today — either is fine at this volume; say which.

## Dev's call

Whether Import lives on the list page or a drawer · the table component's internals · whether `pi_` resolution is worth keeping if `sessions.list({ payment_intent })` proves slow.

## Out of scope

- **Resend invoice, stuck detection, PDF download** — FIN-3.
- **Revenue** — § Later.
- **Refunds** — Stripe Dashboard, permanently.
- **Editing an order** — nothing on an order is editable.

## Depends on

- **FIN-1** — the table, `recordOrder`, the backfill. Complete in `PROGRESS.md`.
- **M-FIN-2 / M-FIN-3** — ratified or defaulted per the gate.

## Recommended execution

**Opus, do not choose down.** An admin action that can settle a deposit from a typed id. A cheaper model copies `settleDepositSession` into the import "to keep the webhook safe" and the two drift by the third ticket.

---

### Kickoff (paste into the session)

> Build **FIN-2 — Orders admin and Import** (attached spec). **One settlement body shared by webhook and import; import never un-sets; no Stripe call on render; no email on the list; nothing moves money.**
> Attach/read first, in order: this spec · `specs/README.md` · `TECHNICAL-DECISIONS.md` (M-FIN-1…3) · `FIN-1-orders-ledger.md` (reuse `recordOrder`, don't fork) · `docs/admin/ADMIN-UX-SPEC.md` §5 + D-ADM-7, D-ADM-13 · `app/admin/_components/` (the table grammar) · `server/services/engagement-admin.ts` · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; exercise every named import path with `stripe listen` and report each by name.
