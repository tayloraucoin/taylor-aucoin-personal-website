# FIN — Technical decisions (append-only)

Mason's record for the Finances epic. One entry per real alternative weighed. Inherits M-INT and M-PORT; amendments to those are recorded here and cross-referenced there.

## 2026-09-11 · FIN-1 · M-FIN-1 · An order is a row, not a derivation: `orders` is the ledger, written by one function

**Status:** Adopted — ratified by Taylor 2026-09-11.

**Context:** "An order" does not exist as a thing today. It is re-derived per page from `engagements.stripe_checkout_session_id`, `engagement_products.paid_at`, `invoice_emails`, and a Stripe API call — and only for Checkout the site created. Dashboard-created Stripe invoices leave one `invoice_emails` row and no link to any engagement. The 2026-09-11 incident had no surface that could show "a payment settled and its invoice did not send."
**Options weighed:** A) Keep deriving — a read-only query joining the three tables plus Stripe at request time. No migration, but every page pays a Stripe round trip, dashboard invoices stay unlinkable, and "stuck" has no home. B) A `payments` mirror of Stripe objects — faithful but a second copy of Stripe's whole model, drifting on every API version. C) A thin `orders` table holding exactly what the admin reasons about — engagement, source, Stripe ids, cents, status, paid time — written by one idempotent function from a Stripe object, with `engagement_products.order_id` naming which order bought each row.
**Decision:** C. `orders(id, engagement_id nullable, source checkout|invoice, stripe_object_id unique, stripe_payment_intent_id, amount_cents, tax_cents, currency, status paid|open|failed|refunded|void, paid_at, created_at, updated_at)`; `engagement_products.order_id` nullable FK. `recordOrder(object)` in `server/services/orders.ts` is the only writer: upsert on `stripe_object_id`, fill nulls only. Three callers — the webhook handlers, `scripts/backfill-orders.ts`, and the admin's Import — and no fourth.
**Consequences:** One migration (one-way door, Taylor runs). The admin never calls Stripe to render a list; it calls Stripe only to import. Status is refreshed by the existing invoice webhooks and by a manual import, not by polling. Refunds are reflected as status only when Stripe tells us (`charge.refunded` is *not* subscribed today — a named gap, FIN-2 out of scope, revisit trigger below).
**Revisit trigger:** A second product line with its own money model, or the first refund that has to appear in the ledger without a manual import.

## 2026-09-11 · FIN-1/FIN-2 · M-FIN-2 · Fulfillment is driven by Stripe-verified facts, not only by the webhook

**Status:** Adopted — Taylor deferred to Mason's judgement, 2026-09-11.

**Context:** `docs/intake/specs/README.md` says "Fulfillment is webhook-only; the success URL is never trusted." What that rule protects is that no *client claim* can mark a build paid. The incident showed the rule's cost: when the webhook process died between claiming the event and releasing it, there was no sanctioned way to settle from Stripe's own record short of hand SQL — which is what happened, and it left three fields the webhook would have written unfilled.
**Options weighed:** A) Keep webhook-only; recovery stays hand SQL plus a Stripe "resend" that the stale claim skips. B) Allow an admin, behind `requireAdmin`, to fetch a Checkout session or invoice from Stripe's API by id and run the *same* settlement the webhook runs. The object comes from Stripe over an authenticated call, which is a stronger verification than a signature on a delivered payload, and the settlement functions are already idempotent by query shape.
**Decision (proposed):** B. The rule is restated: *fulfillment is driven only by Stripe-verified facts — the signed webhook or an admin-initiated fetch from Stripe by object id.* The success URL, query strings, and form values remain untrusted. The import path shares `settleDepositSession`'s body (refactored to take the session, with the event id as an optional log tag) so the two rails cannot disagree.
**Consequences:** `docs/intake/specs/README.md` non-negotiable 2 is amended by one clause, logged in its `DEVIATIONS.md`. The import is admin-only, audited (`orders.imported_by`, `imported_at`), and never un-sets a value.
**Default if unratified by FIN-2's start:** build B; the amendment is the cheaper thing to reverse (delete one action) than the hand-SQL habit is.

## 2026-09-11 · FIN-1 · M-FIN-3 · Dashboard invoices attach to an engagement by customer email, with a manual link for the misses; never by a metadata habit

**Status:** Adopted — Taylor deferred to Mason's judgement, 2026-09-11.

**Context:** A Stripe invoice built by hand carries no `engagement_id`. Two ways to attach it: Taylor types the id into Stripe's metadata box every time, or the site matches the invoice's customer email to `engagements.contact_email`.
**Decision (proposed):** Match on email — most recent engagement with `paid_at` set for that address, else most recent unpaid — and record the rule used in `orders.link_reason` (`metadata` | `email` | `manual` | null). When no match, the order is listed as *Unlinked* and the admin's **Link to engagement** action sets it (M-FIN-2's audit columns apply). Metadata, when present, still wins — a typed id is an explicit statement.
**Consequences:** No habit to forget. A client paying from a second address produces one Unlinked row that takes one click. Email matching never *moves* a link once set.

## 2026-09-11 · FIN-5 · M-FIN-4 · The client's login is the link they already have, made requestable

**Context:** Taylor asked where a client login should live. The engagement's identity is possession of the resume token: the URL, a path-scoped cookie, and an encrypted copy for emailing it back. The public start form already emails the link to a returning address rather than showing anything — a magic link without the name.
**Options weighed:** A) Supabase Auth accounts for clients — a second identity to reconcile with `engagements.contact_email`, password resets, and every token-keyed route double-keyed. B) One page, `/websites/client`, that asks for an email and sends the link; `findResumableByEmail` widened to paid and completed engagements; an expired token reissued before sending.
**Decision:** B. Nothing on screen ever confirms an address exists. The link lands on the entry page, which already routes by state (unpaid → pay gate, in progress → step, complete → `/done`), so `/done` is the paid client's home and grows the two links FIN-6/FIN-7 need.
**Consequences:** Zero new auth surface; the `requireEngagement` seam stays the only door. Cost: a client with two engagements under one address gets the most recent paid one, and Taylor's "Send their link" (FIN-4) covers the rest.

## 2026-09-11 · FIN-6 · M-FIN-5 · Extra pages are sold from the add-ons page with a page count, once per engagement; a second purchase goes through Taylor

**Context:** Taylor ruled that extra pages are purchasable from the add-ons page. `engagement_products` carries a unique index on (engagement, product) — "bought the same add-on twice is a database impossibility rather than a refund conversation" — and the extra-page row is quantity-shaped (`quantity: pages`, `amount_cents` per page).
**Options weighed:** A) Drop the unique index so a client can buy pages on two occasions — loses the invariant every settlement path relies on, and two orders would own two rows for one product. B) On a second purchase, increment `quantity` on the paid row — one row, two orders, the ledger can no longer say which order bought which pages. C) Sell extra pages from the page **once**: a quantity stepper (1–20, the runbook's typo-guard ceiling) on the row while unowned; once owned the row reads "N pages added" with no control, and more pages go through `charge:extra-pages` or a dashboard invoice as today.
**Decision:** C. The invariant stands; the ledger stays one-order-per-row; the common case (a client adding pages after the fact, once) is unassisted. `[PROVISIONAL — Taylor]` on "once": if a second self-serve top-up turns out to be common, B is the amendment, with `order_id` moving to a join table.
**Consequences:** `createExtrasCheckout` takes `{ key, quantity }` items; quantity is 1 for every non-page row and validated 1–20 for the page row. The runbook's "have the conversation first" becomes one of two paths, not the only one; the intake document still flags the page count so Taylor can still open that conversation.
**Revisit trigger:** The first client asking to add pages a second time from the page.
