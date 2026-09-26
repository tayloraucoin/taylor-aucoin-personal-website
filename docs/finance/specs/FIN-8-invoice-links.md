# FIN-8 — The add-ons page: a static, self-serve checkout per client, with an optional pre-selection

**Epic:** FIN — finances · **Phase 3** · Size: L
**Slice type:** Money path + one-way door (migration `0022`). Builds FIN-6's money path under a static, engagement-addressed entry; replaces FIN-7's offer email with a link Taylor pastes once.
**Status:** Code complete 2026-09-26 — migration `0022` authored, not run. Not exercised against a database or `stripe listen` (Taylor: "I will run migrations at the end").

## Outcome

Every client whose build is paid or waived has one add-ons page:

```
/websites/coded/intake/add-ons?engagement=<engagement id>[&add=showcase_admin_panel,showcase_extra_page:2]
```

It is static and reusable. Taylor puts it wherever the client will see it — a client site's final review, an email — once. `add=` pre-ticks rows; the client can untick them and add anything else their track sells (add-ons, extra pages and posts by count, rounds of changes), then pays on hosted Checkout and returns to the same page, which shows that payment's rows once the webhook has stamped them. They get Agora's paid PDF invoice (`extras_paid`); Taylor gets "Add-ons paid" with the lines. `engagements.paid_at` is never touched.

**Admin → Finances → Invoice links** is a builder, not a record: pick an engagement, tick a pre-selection, copy the URL. It writes nothing.

## Why

- Taylor, 2026-09-26: "a query param that has their engagement… and what the pre-selected options are. So I can have this in the final review page and it's just static… they can self-serve at any time… takes away the bottleneck of me having to create these on a case-by-case basis."
- Ratified 2026-09-26: repeat purchases allowed (M-FIN-6); coded-track rounds added to the catalogue; paid or waived builds are eligible (D-FIN-4).
- FIN-6 / D-FIN-1 already ratified a settled client buying add-ons and pages in one Checkout. M-FIN-7 records the static entry.

## What was built (paths)

| Layer     | Path                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Schema    | `db/schema/engagement-products.ts` (`repeatable`, `checkout_session_id`, partial once-only + pending indexes) · `products.ts` (`repeatable`) · `invoice-emails.ts` (`extras_paid`)                                                                                                                                                                                                                                                                                             |
| Migration | `db/migrations/0022_fin8_repeatable_extras.sql` (generated + hand-added backfill)                                                                                                                                                                                                                                                                                                                                                                                              |
| Catalogue | `scripts/seed-products.ts` — `repeatable` on pages, posts, rounds; `showcase_changes_standard` ($500), `showcase_changes_small` ($250), `showcase_business_card` ($250, added 2026-09-26; add-ons page only, not the pay screen) · `scripts/setup-stripe-catalogue.ts` fixes (below)                                                                                                                                                                                                                                                                                                                                         |
| Services  | `server/services/extras.ts` (new: what the page may sell, the page read, the pay press, the builder read) · `deposit.ts` (`isBuildSettled`, `createExtrasCheckout`, `settleExtrasSession`, `releaseFailedSession`; every basket insert records session + repeatable) · `invoices.ts` (`sendExtrasInvoiceEmail`, quantity-aware lines, session-scoped deposit lines) · `orders.ts` (`linkBasketRows` scoped to the order's session) · `products.ts` (`listInvoiceableProducts`) |
| Webhook   | `_handlers/deposit-settlement.ts` (`charge_kind: "extras"` → `settleExtras`) · `_handlers/checkout-session-async-failed.ts` (charge-kind-aware alert; releases the failed session's rows)                                                                                                                                                                                                                                                                                      |
| Client    | `app/websites/coded/intake/add-ons/page.tsx` · `_components/extras-checkout.tsx` · `_actions/extras.ts`                                                                                                                                                                                                                                                                                                                                                                        |
| Admin     | `app/admin/(protected)/finances/invoice-links/` (builder) · nav "Finances → Invoice links" · engagement page "Add-ons page" line                                                                                                                                                                                                                                                                                                                                               |
| Shared    | `lib/extras/cart.ts` (the `add=` format, both directions) · `lib/validators/extras.ts` · `lib/routes.ts` (`showcaseIntakeRoutes.addOns`, `adminRoutes.invoiceLinks`)                                                                                                                                                                                                                                                                                                           |

## Rules (binding)

- **Address:** the engagement id. Unknown, malformed, and unsettled all render one "isn't working" screen. The page shows the business name and nothing else about the engagement — no email, no contact name, no amounts paid.
- **What it sells:** active rows of the engagement's track, kind `addon` or `round`, price > 0, with a Stripe price on the tier; not owned (one-time rows); not included by an owned row (admin panel ⊃ Supabase setup); prerequisites present (post needs blog). `add=` is filtered to these before anything is ticked, and the pay press re-checks all of it.
- **Quantities:** pages 1–20, posts 1–10, everything else 1.
- **One live attempt per engagement:** a pay press closes every earlier open session in Stripe before replacing unpaid rows; a completed-but-unsettled session refuses the press. A failed async payment releases its rows.
- **Bought state is the basket, never the URL:** the return carries Stripe's `session_id`; the page shows that session's rows only when they are stamped and belong to this engagement.
- **Emails:** paid PDF invoice to the client (`extras_paid`, claim-once) · ops "Add-ons paid" with lines · ops "basket missing" if a session's rows were replaced by another path · ops "Payment failed" naming the charge kind.

## Taylor does, in order

1. Review and run `0022` on staging, then production.
2. `yarn db:seed` then `yarn stripe:catalogue --apply` per tier (mints the two coded rounds; writes `repeatable`).
3. Staging walk with `stripe listen`: open a paid test engagement's page with `add=` → change the cart → pay → paid screen, PDF invoice, ops email, order in the ledger, rows stamped with the session id. Then: cancel; buy a round twice (repeatable); forge an owned key in devtools (refused); an unsettled engagement's id (unavailable); `paid_at` byte-identical throughout.
4. Replace the `[COPY — draft]` strings (page, invoice note).

## Not in this slice

The balance (a build row; still the Stripe invoice rail) · care plan · promo codes · FIN-5's sign-in · extracting a shared row component with the pay screen (a later slice, so the live pay screen is untouched here).
