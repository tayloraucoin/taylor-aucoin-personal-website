# FIN — Deviations (append-only)

One line per intentional divergence from a spec. Never rewrite history. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-11 · AUTHORING · Seven FIN tickets authored in one session (ceiling is three per authoring thread) · founder request after a production incident; mitigated by a shared data law in `TECHNICAL-DECISIONS.md` M-FIN-1 and a gate in `00-build-order.md` that holds FIN-2 and FIN-6 until their proposals are ratified.
2026-09-11 · FIN-1 · `getStripe` exported from `server/services/deposit.ts` rather than moved to its own module · one client, one API-version pin; `orders.ts` and the backfill need it and a second `new Stripe()` would be a second pin to drift. A `stripe-client.ts` split is a rename for later if a third consumer appears.
2026-09-11 · FIN-1 · The backfill walks `stripe.checkout.sessions.list` filtered on `metadata.engagement_id` rather than the per-engagement `stripe_checkout_session_id` column · that column holds only the deposit's session; add-ons and extra pages have no column, and one walk covers all three shapes with no second strategy.
2026-09-11 · FIN-1 · `order_status` maps Stripe `uncollectible` to `void` (no `uncollectible` value) · the ledger cares whether money is expected, not why not; `invoice.marked_uncollectible`'s ops email carries the why.
2026-09-11 · FIN-1 · Verified against a throwaway local Postgres 15, not staging · the migration has not been run anywhere Taylor owns; the SQL, the upsert's `coalesce`/`excluded`/`xmax` clauses, and every fill-nulls branch were exercised there because a type-check proves none of them. Found and fixed one real defect this way: a `Date` interpolated into a raw `sql` template is not serialized by postgres-js — now ISO text with `::timestamptz`.
2026-09-11 · FIN-6 · Extra pages become client-purchasable from the add-ons page (Taylor's ruling) · departs from `RUNBOOK-post-intake-charges.md` §1's "have the conversation first" as the *only* path; the CLI and the conversation remain available and the intake document still flags the count. Charge law (M-PORT-38) is intact: client-initiated, hosted Checkout, published price. Mechanism in M-FIN-5.
