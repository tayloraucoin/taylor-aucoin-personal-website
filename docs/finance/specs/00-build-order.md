# FIN — build order

Sequenced by dependency and blast radius. One ticket at a time. Nothing is cut
downstream until its upstream reads Complete in `PROGRESS.md`.

## Gate — before FIN-1 · CLEARED 2026-09-11

Decisions for Taylor, batched. Each carries a recommendation and the default
that applies if no answer arrives by the date the work needs one.

- [x] **M-FIN-1** — the `orders` table is the ledger; one writer. **Ratified
      2026-09-11** ("yes to the orders table"; "have Mason begin the first
      batch"). Adopted in `TECHNICAL-DECISIONS.md`.
- [x] **M-FIN-2** — fulfillment by Stripe-verified fact (webhook *or* admin
      import by object id). **Ratified 2026-09-11** — Taylor deferred to
      Mason's judgement ("make this work for me as an operational
      stakeholder"). Adopted.
- [x] **M-FIN-3** — dashboard invoices attach by customer email, manual link
      for misses. **Ratified 2026-09-11**, same deferral. Adopted.
- [x] **D-FIN-1** — a *paid* client may buy, from the add-ons page, any
      active add-on of their track **and extra pages with a page count**, in
      one Checkout. **Ratified by requirement 2026-09-11** ("allow for the
      purchase of extra pages from this add-upsells page"; "just make my
      requirements work"). The M-PORT-38 allow-list is amended accordingly and
      the runbook's "have the conversation first" for extra pages becomes
      Taylor's choice, not the only path — logged in `DEVIATIONS.md`. FIN-6
      is cut.
- [x] **D-FIN-2** — the extras purchase gets Agora's PDF invoice
      (`invoice_emails.kind` gains `extras_paid`). Default in force: yes.
- [x] **D-FIN-3** — the sign-in URL is `/websites/client`. Default in force: yes.

## Execution batches (Reeve, 2026-09-11)

One batch per Mason session. Taylor advances with "begin next batch". A batch
is not begun until the previous one reads Complete in `PROGRESS.md` *and* its
migration, if any, has been run by Taylor — the builder authors SQL and stops.

| Batch | Tickets | Why they travel together | Taylor does before the next |
|---|---|---|---|
| **1** | FIN-1 | One-way door. Alone, so the migration diff is the whole review. | Review `0015`, run it on staging then production; run `yarn orders:backfill` on both; confirm Kryshan's order appears |
| **2** | FIN-2 → FIN-3 | One surface (`/admin/finances`), one service file, FIN-3's button lives on FIN-2's row. Two migrations authored (`0016` audit columns). | Run `0016`; say ratified or no on M-FIN-2 / M-FIN-3 |
| **3** | FIN-4 → FIN-5 | The link machinery: admin side then client side, same service functions. No migration. | Nothing blocking |
| **4** | FIN-6 → FIN-7 | Money path then its email. Two migrations authored (`0017` `extras_paid`, `0018` `addons_offer`). | Run both; write the offer copy |

## Phase 1 — the ledger

- [x] **FIN-1** — The `orders` table, `recordOrder`, webhook writes, backfill
      **Code complete 2026-09-11 — awaiting Taylor's migration run.**
      Size M · **One-way door: migration** · Mason reviews the DDL diff and the
      `recordOrder` fill-nulls contract · Forge exercises the webhook paths
      Unblocks: everything. Converts today's production order (Kryshan) the
      day it lands, from the CLI.

## Phase 2 — the admin reads and repairs

- [ ] **FIN-2** — `/admin/finances/orders`: list, detail, Import from Stripe,
      Link to engagement
      Size L · Reversible · Needs M-FIN-2 and M-FIN-3 ratified or defaulted
      Depends on FIN-1.
- [ ] **FIN-3** — Resend invoice, stuck-claim detection, PDF download
      Size M · Reversible · Email to a client is the risk surface
      Depends on FIN-2 (the row the button lives on).
- [ ] **FIN-4** — Engagement page: Orders section, sibling engagements by
      email, Send their link, Rotate link
      Size M · Reversible · A link email to a client is the risk surface
      Depends on FIN-1 (Orders section) — the two link buttons could ship
      alone, but batching by surface keeps one session on one page.

## Phase 3 — the client comes back

- [ ] **FIN-5** — `/websites/client`: the magic-link sign-in
      Size S · Reversible · Enumeration is the risk surface
      Depends on nothing in FIN; sequenced here so `/done` is already the
      paid client's landing when FIN-6 adds links to it.
- [ ] **FIN-6** — The add-ons page under the token; add-ons and extra pages
      in one Checkout; `charge_kind: "extras"`; invoice for extras
      Size L · **Money path** · Forge — settlement, replays, `paid_at`
      untouched · Mason — the M-PORT-38 amendment · D-FIN-1 ratified
      Depends on FIN-1 (orders are written), FIN-5 (the client can reach it).
- [ ] **FIN-7** — The add-ons offer email; `/done` gains its two links
      Size S · Reversible · Copy is Taylor's
      Depends on FIN-6.

## Later — named, not cut

- **`/admin/finances/revenue`** — monthly totals from `orders`. Small once the
  table exists; no ticket until FIN-2 is Complete and Taylor asks.
- **`charge.refunded` / `charge.dispute.*`** subscriptions so refunds reach
  the ledger without an import. Revisit trigger in M-FIN-1.
- **A stale-claim timeout on `stripe_events`** (claim with `processed_at`,
  reap after N minutes). Flagged 2026-09-11; FIN-3's stuck detection covers the
  symptom, not the cause. Schema change — Mason to propose when asked.
