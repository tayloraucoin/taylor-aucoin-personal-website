# FIN — build order

Sequenced by dependency and blast radius. One ticket at a time. Nothing is cut
downstream until its upstream reads Complete in `PROGRESS.md`.

## Gate — before FIN-1 · OPEN

Decisions for Taylor, batched. Each carries a recommendation and the default
that applies if no answer arrives by the date the work needs one.

- [ ] **M-FIN-1** — the `orders` table is the ledger; one writer. **Ratified
      verbally 2026-09-11 ("yes to the orders table")** — awaiting the line in
      `TECHNICAL-DECISIONS.md` being marked Adopted. Blocks FIN-1.
- [ ] **M-FIN-2** — fulfillment by Stripe-verified fact (webhook *or* admin
      import by object id). Recommendation: ratify. Cost of being wrong: one
      admin action to delete. Default if silent by FIN-2's start: build it.
      Blocks FIN-2's Import; FIN-1's backfill runs under the same rule.
- [ ] **M-FIN-3** — dashboard invoices attach by customer email, manual link
      for misses. Recommendation: ratify. Default if silent: build it. Blocks
      nothing in FIN-1 (the column exists either way); shapes FIN-2's list.
- [ ] **D-FIN-1** — amend M-PORT-38's allow-list: a *paid* client may initiate
      Checkout for any active `offeredAtCheckout` add-on of their track, from
      the add-ons page, in one multi-item session. Recommendation: ratify —
      it is the pay screen's own set, sold after the fact. Default if silent:
      **FIN-6 is not cut.** This one is money and stays a founder call.
- [ ] **D-FIN-2** — the extras purchase gets Agora's PDF invoice like the
      deposit does (`invoice_emails.kind` gains `extras_paid`). Recommendation:
      yes; a bookkeeper wants one document per payment. Default: yes.
- [ ] **D-FIN-3** — the sign-in URL is `/websites/client`. Recommendation:
      yes; short, on the card, under the service it belongs to. Default: yes.

## Phase 1 — the ledger

- [ ] **FIN-1** — The `orders` table, `recordOrder`, webhook writes, backfill
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
- [ ] **FIN-6** — The add-ons page under the token; multi-item ancillary
      Checkout; `charge_kind: "extras"`; invoice for extras
      Size L · **Money path** · Forge — settlement, replays, `paid_at`
      untouched · Mason — the M-PORT-38 amendment · **Gated on D-FIN-1**
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
