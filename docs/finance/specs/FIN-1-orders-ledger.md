# FIN-1 — The `orders` ledger: one table, one writer, the webhook writes it, the backfill converts history

**Epic:** FIN — finances · **Phase 1** · Size: M
**Slice type:** Schema plus a money-adjacent service seam. Risk class: a migration (one-way door); a second writer to the ledger; an import that overwrites a value the webhook wrote; a backfill that double-counts or attaches a payment to the wrong engagement.
**Review:** **Mason — the DDL diff against §Data, and the fill-nulls contract of `recordOrder`. Forge — every webhook path writes exactly one `orders` row per Stripe object, and a replay writes nothing twice.**

**Status:** Not started

> **Mason — one-way-door review.** The generated migration is diffed against the DDL in §Data before Taylor runs it. `recordOrder` is read for the fill-nulls contract: no `set` clause may assign a non-null column from a possibly-null input without a `coalesce` on the existing value. **Forge — money review.** Exercise with `stripe listen` against the staging database: deposit paid · add-on paid · extra pages paid · invoice finalized · invoice paid · each replayed once. State, per path, the `orders` row count before and after.

---

## Outcome

Every payment Stripe has ever reported to this site is one row in `orders`, connected to the engagement it paid for, with the cents, the tax, the Stripe ids, and when it was paid. The webhook writes the row as part of settling; nothing else needs to remember to. A script walks history and creates the rows for every payment made before this table existed — including the one made in production on 2026-09-11 — without touching anything already correct. What this slice does not do: show any of it in the admin (FIN-2), send any email (FIN-3), or change what the client sees.

## Why / intent

- **M-FIN-1** — the ledger is a row, not a derivation; `recordOrder` is its only writer.
- **M-FIN-3 (proposed)** — a dashboard invoice attaches by metadata, then by customer email, else stays unlinked; the rule used is recorded.
- **Taylor, 2026-09-11** — "yes to the orders table, and include a way to convert an existing order (made in production today) into an order record." The backfill is that way, and it is the same function the webhook uses.
- **`docs/intake/specs/DEVIATIONS.md` § INVOICES, 2026-09-11** — the incident this exists to make visible.
- **What this slice is NOT (binding):** no admin surface; no Stripe call at request time anywhere but the backfill; no change to `fulfillDeposit`'s guarded update; no write to `paid_at` outside it.
- **Ground truth:** `server/services/deposit.ts` (`fulfillDeposit`, `settleAncillaryPurchase`) · `app/api/webhooks/stripe/_handlers/*` · `db/schema/engagement-products.ts` · `db/schema/invoice-emails.ts` · `products.stripe_price_id` (the line-item → basket-row key).

**Rulings this slice makes (labelled, logged):**

- **`recordOrder(input)` takes a discriminated union — `{ kind: "checkout", session, lineItems }` or `{ kind: "invoice", invoice }` — and returns the `orders` row.** Upsert on `stripe_object_id`. Every column is written as `coalesce(existing, incoming)` except `status` and `updated_at`, which always take the incoming value: status is Stripe's fact and may legitimately move (open → paid → refunded). Logged.
- **Basket rows are linked by Stripe price id, scoped to the engagement.** For a Checkout order, each line item's `price.id` is matched to `products.stripe_price_id`; the engagement's unpaid rows for those products get `order_id` and, if null, `paid_at`. Rows already stamped by a prior settlement get `order_id` only. Logged.
- **The engagement is reconciled, never overwritten.** After a Checkout order records, `stripe_payment_intent_id`, `terms_accepted_at`, and `terms_version` on the engagement are filled if null. `paid_at` is never touched here — that stays `fulfillDeposit`'s. Logged.
- **The backfill is a script, not a route, and it is idempotent.** `scripts/backfill-orders.ts`: for each engagement with `stripe_checkout_session_id`, fetch the session and its line items and call `recordOrder`; for each ancillary session (found via `stripe.checkout.sessions.list` filtered by `metadata.engagement_id` — or, if listing by metadata is unavailable on this API version, by walking payment intents on the engagement's customer); for each `invoice_emails` row with a `stripe_object_id` starting `in_`, fetch the invoice and call `recordOrder`. Prints one line per row created, one per row already present, and a total. `--dry-run` prints without writing. Logged.

## Experience & states

No surface. The observable behaviours are database rows and script output.

**States (exhaustive):** order recorded on first settlement · order already present on replay (no change but `updated_at`) · order recorded by backfill for a pre-table payment · order unlinked (no metadata, no email match) · order linked by metadata · order linked by email.

**Failure / edge states (named):** Stripe fetch fails mid-backfill → the script reports the object id and continues; exit code non-zero at the end · a line item's price is not in the catalogue (a dashboard invoice with an ad-hoc line) → the order records with its cents; no basket row is linked; `link_reason` unaffected · two engagements share an email → most recent paid wins; the choice is visible in `link_reason: "email"` and reversible in FIN-2 · a session with `payment_status: "unpaid"` → recorded with `status: "open"`, no basket stamping · the engagement in metadata does not exist → recorded unlinked, logged by id.

## Non-negotiables (this slice)

- **One writer.** `orders` is inserted or updated only inside `recordOrder`.
- **Fill nulls, never overwrite** — except `status` and `updated_at`.
- **`paid_at` on `engagements` is not written here.**
- **The migration is authored and stopped at.** Taylor reviews and runs it.
- **No names, emails, or amounts in log lines** beyond ids and cents.

## Data

**Schema changes: yes — one migration, appended.**

```sql
create type order_source as enum ('checkout', 'invoice');
create type order_status as enum ('open', 'paid', 'failed', 'refunded', 'void');
create type order_link_reason as enum ('metadata', 'email', 'manual');

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  amount_cents integer not null,
  currency text not null,
  engagement_id uuid references engagements(id) on delete set null,
  imported_at timestamptz,
  imported_by text,
  link_reason order_link_reason,
  paid_at timestamptz,
  source order_source not null,
  status order_status not null,
  stripe_customer_email text,
  stripe_object_id text not null unique,
  stripe_payment_intent_id text,
  tax_cents integer
);
create index orders_engagement_id_idx on orders (engagement_id);
create index orders_paid_at_idx on orders (paid_at desc);

alter table engagement_products add column order_id uuid references orders(id) on delete set null;
create index engagement_products_order_id_idx on engagement_products (order_id);
```

`stripe_customer_email` is stored so an unlinked invoice can be linked later without a Stripe round trip; it is the one personal field in the table and is never logged. RLS: deny-all as the setup SQL does for every table; the admin reads through the service role behind `requireAdmin`.

**Tables:** `orders` (insert/update, one writer) · `engagement_products` (update `order_id`, `paid_at` fill) · `engagements` (update: fill `stripe_payment_intent_id`, `terms_accepted_at`, `terms_version`; **never `paid_at`**) · `products` (read) · `invoice_emails` (read, backfill).

**Placement:** `db/schema/orders.ts` (table, enums beside it, relations, row types via `db/schema/index.ts`) · `db/migrations/0015_*.sql` + journal · `server/services/orders.ts` (`recordOrder`, `linkOrderToEngagement` for FIN-2, the email-match helper) · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` (calls `recordOrder` after `fulfillDeposit` / `settleAncillaryPurchase`, before the invoice email) · `invoice-finalized.ts`, `invoice-paid.ts`, `invoice-payment-failed.ts`, `invoice-marked-uncollectible.ts` (each calls `recordOrder` with the invoice; status maps open / paid / failed / void) · `scripts/backfill-orders.ts` + `package.json` script `orders:backfill`.

**Validators:** none — inputs are Stripe SDK types.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — staging database, `stripe listen`, sandbox tier)

1. The generated migration matches §Data's DDL column-for-column (Mason diffs it); it is authored, journaled, and not run by the builder.
2. A deposit Checkout settles → exactly one `orders` row: `source: checkout`, `status: paid`, `engagement_id` from metadata, `link_reason: metadata`, cents equal to `amount_total`, the build row in `engagement_products` carries its `order_id`. *(Forge.)*
3. The same event replayed → row count unchanged; `updated_at` moved; nothing else moved. *(Forge.)*
4. An add-on Checkout and an extra-pages Checkout each settle → one row each; the correct basket rows linked; `engagements.paid_at` byte-identical. *(Forge.)*
5. `invoice.finalized` for a dashboard invoice whose customer email matches an engagement → one row, `source: invoice`, `status: open`, `link_reason: email`. `invoice.paid` for the same → same row, `status: paid`, `paid_at` set. *(Forge.)*
6. An invoice with no matching email → one row, `engagement_id` null, `link_reason` null, `stripe_customer_email` stored.
7. `yarn orders:backfill --dry-run` against staging lists every historical payment with created / present; running it without the flag creates them; running it again creates zero.
8. Backfill on an engagement whose `paid_at` was set by hand and whose build row is unpaid (the 2026-09-11 shape) → the order records, the build row is stamped and linked, `stripe_payment_intent_id` and `terms_*` are filled; `paid_at` unchanged.
9. No `orders` insert or update exists outside `server/services/orders.ts` (`grep -rn "insert(orders)\|update(orders)"` returns one file).
10. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `stripe.checkout.sessions.retrieve(id, { expand: ["line_items"] })` returns line items in one call; the webhook payload does not include them, so the handler fetches once. That is the only Stripe call on the webhook path this slice adds; keep it after the settlement writes so a Stripe timeout cannot block `paid_at`.
- Tax: `session.total_details?.amount_tax` and `invoice.tax` (nullable on this API version — check `2026-07-29.dahlia`'s shape).
- Drizzle upsert: `.onConflictDoUpdate({ target: orders.stripeObjectId, set: { … sql\`coalesce(${orders.x}, excluded.x)\` … } })`.
- `settleDepositSession` will be refactored in FIN-2 to take the session without an event; keep the `recordOrder` call inside the function body, not in the handler wrapper, so the refactor carries it.

## Dev's call

Whether the email-match helper lives in `orders.ts` or `engagement.ts` (it reads `engagements`, so `engagement.ts` is the placement rule; `orders.ts` may import it) · the backfill's session-discovery strategy for ancillary sessions · whether `order_status` gets `uncollectible` or maps it to `void`.

## Out of scope

- **Any admin surface** — FIN-2.
- **Resending anything** — FIN-3.
- **Refund events** — not subscribed; named in `00-build-order.md` § Later.
- **A stale-claim timeout on `stripe_events`** — § Later.

## Depends on

**No slice dependencies.** Gate: M-FIN-1 Adopted in `TECHNICAL-DECISIONS.md`.

## Recommended execution

**Opus, do not choose down.** A migration, an upsert whose every clause has a null-safety rule, and a backfill that runs against production once. A cheaper model writes `set: { paidAt: incoming }` and erases the webhook's timestamp on the first replay.

---

### Kickoff (paste into the session)

> Build **FIN-1 — The `orders` ledger** (attached spec). **One writer; fill nulls, never overwrite; `paid_at` is never written here; author the migration and stop.**
> Attach/read first, in order: this spec · `specs/README.md` · `TECHNICAL-DECISIONS.md` (M-FIN-1, M-FIN-3) · `server/services/deposit.ts` § `fulfillDeposit` + `settleAncillaryPurchase` · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` · `db/schema/engagement-products.ts` + `products.ts` · `docs/intake/specs/DEVIATIONS.md` § INVOICES 2026-09-11 · repo `CLAUDE.md`.
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; exercise every named webhook path with `stripe listen` and report the `orders` row count per path.
