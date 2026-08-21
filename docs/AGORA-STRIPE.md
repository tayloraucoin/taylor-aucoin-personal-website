# Agora — Stripe invoicing

Billing for Agora's contracting work (contract engineering, 0→1 builds, fractional CTO). Test-mode built and exercised 2026-08-19.

**Not to be confused with** `server/services/deposit.ts` + `/api/stripe`, which collect website-build deposits for the client side-gig. Same Stripe account (`acct_1U6DiN…`, Agora Network Technologies, Inc.), different business motion, deliberately separate code and separate webhook secrets.

## What exists

| Piece | Path |
|---|---|
| Invoicing service | `server/services/agora-invoicing.ts` |
| Deposit / Checkout service | `server/services/deposit.ts` |
| Catalogue setup | `scripts/setup-stripe-catalogue.ts` (`yarn stripe:catalogue`) |
| **The one webhook endpoint** | `app/api/webhooks/stripe/route.ts` |
| Handlers — one file per event | `app/api/webhooks/stripe/_handlers/` |
| Replay safety | `server/services/stripe-events.ts` + `stripe_events` table |

One Stripe account, one key (`STRIPE_SECRET_KEY`), one endpoint, one signing
secret (`STRIPE_WEBHOOK_SECRET`). An earlier draft split these into `AGORA_*`
duplicates on the mistaken belief there were two accounts; there is one.

## The webhook

`/api/webhooks/stripe` verifies the signature, claims the event, dispatches to
the file that owns that event type, and returns a status. It contains no
business logic. Each event's behaviour lives in exactly one file under
`_handlers/`, registered in `_handlers/index.ts`:

| Event | File | What it does |
|---|---|---|
| `checkout.session.completed` | `checkout-session-completed.ts` | Settles the deposit when `payment_status` is paid; waits when unpaid |
| `checkout.session.async_payment_succeeded` | `checkout-session-async-succeeded.ts` | Settles a delayed payment that cleared |
| `checkout.session.async_payment_failed` | `checkout-session-async-failed.ts` | Notifies Taylor; the client is not emailed |
| `invoice.finalized` | `invoice-finalized.ts` | Emails Taylor the hosted link to send by text or email |
| `invoice.paid` | `invoice-paid.ts` | Notifies Taylor; Stripe has already receipted the client |
| `invoice.payment_failed` | `invoice-payment-failed.ts` | Notifies Taylor with the still-payable link. No dunning |
| `invoice.marked_uncollectible` | `invoice-marked-uncollectible.ts` | Records the write-off rather than letting it happen silently |

`payment_intent.*` is deliberately unhandled — it fires for the same money as
the Checkout events, and two handlers per payment is how double-handling gets
invented.

**Replay safety.** Stripe delivers at-least-once. Every handled event is
claimed in `stripe_events` (Stripe's event id as primary key) *before* the
handler runs; a redelivery finds the claim and skips. If a handler throws, the
claim is released and a non-2xx asks Stripe to retry, so a failure is retried
rather than remembered as done. Configure the endpoint in the Dashboard scoped
to the seven types above.

Verified against test mode: a two-line, $19,400 CAD invoice created as a draft, finalized, sent, and issued a working hosted payment page.

## Why Invoicing and not Checkout

The engagements on `/services` are scoped B2B work billed on terms, not a fixed-price product bought in one click. A finalized invoice carries its own hosted payment page, so sending the bill and collecting the money are one step. Checkout Sessions would only earn their place if a productized, self-serve, fixed-fee offer ever appears.

Invoices are created as **drafts** and finalized in a separate call. A five-figure invoice should be read by a human before a client sees it, and finalizing locks the line items.

## Tax — read before enabling

**Status as of 2026-08-19: `automatic_tax` is OFF in code, and must stay off until the steps below are done.**

Stripe Tax's failure mode is silent. With no head office address (settings `status: "pending"`, which is where this account is now) or no active registration in the client's jurisdiction, `automatic_tax: { enabled: true }` raises no error and collects **zero tax** while the invoice looks entirely normal. Past invoices issued that way **cannot be corrected retroactively** — the only remedy is amended filings with the authority.

`server/services/agora-invoicing.ts` exports `taxReadiness()`, which reports settings status and active registrations. Current answer: `status=pending, registrations=0, ready=false`.

### To turn it on

1. **Set the head office address** — Dashboard → Tax → Settings. Until this is done nothing calculates. Note that each sandbox has its own Tax Settings, so this must be done in every environment, and live-mode registrations are separate from test-mode ones.
2. **Confirm the GST/HST registration** with an accountant, register with CRA directly, then record the registration number in Stripe (Dashboard → Tax → Locations, or the Tax Registrations API). Recording it in Stripe does *not* register you with CRA — that is a separate act.
3. **Confirm the product tax code.** The code in use is `txcd_20030000` (General – Services). Stripe's own description calls it a catch-all to use "only if you don't have a more specific category" — the specific software codes describe software sold as a product, not engineering labour. This is a candidate, not a legal determination.
4. **Then** pass `automaticTax: true` to `createDraftInvoice`, and confirm on a test invoice that tax is actually calculated rather than assuming.

### The cross-border question

Clients are a mix of Canadian and US businesses. Those are treated differently — much cross-border B2B service billing is zero-rated or reverse-charged rather than taxed — and getting it right depends on collecting the client's tax ID. `DraftInvoiceInput` accepts `taxId` for this. Route the determination to an accountant; the code supports either answer.

`tax_behavior` is set to `exclusive` on every line: GST is added on top of a quoted professional fee rather than buried inside it. Leaving it `unspecified` is also a common cause of `automatic_tax` failing once switched on.

## The catalogue

Every price comes from `how_we_work.pdf` and `website_toolkit.pdf`. The script
is the source of truth in code; those documents are the source of truth for the
business. If a number changes in the documents, change it in
`scripts/setup-stripe-catalogue.ts` and re-run.

| Product | Price | Amount |
|---|---|---|
| Website build | Deposit — half to start | $600 |
| Website build | Balance — before go-live | $600 |
| Website changes — standard round | Standard round | $500 |
| Website changes — small round | Small round | $250 |
| Extra page | Per page | $150 |
| Online booking setup | Setup | $250 |
| Google Business Profile deep clean | Deep clean | $300 |
| Logo refresh | Refresh | $250 |
| Care Plan | Monthly (recurring) | $250/mo |

All quoted "+ GST", so every Price is `tax_behavior: exclusive` — tax is added
on top rather than carved out of the number the client agreed to.

The ~$22–25/month platform fee is **not** here and must never be: the client
pays it directly to the platform on their own card. Billing it through Agora
would contradict the promise made in both documents.

```bash
yarn stripe:catalogue           # dry run — shows what would change
yarn stripe:catalogue --apply   # make it so
```

Safe to re-run: products are matched by name and prices by nickname, so an
already-correct catalogue reports no changes. Run it once per mode — **test and
live are separate object spaces and a product id from one does not exist in the
other.**

**Changing a price.** Stripe Prices are immutable. Edit the amount in the
script and re-run: the old Price is archived and a new one created. Archiving
is what you want — anything already paid stays attached to the amount actually
charged, so last year's invoices do not silently rewrite themselves. Anything
active on a product that the script does not declare is retired for the same
reason, so a corrected price never sits alongside the wrong one it replaced.

## Keys

Use a **restricted key** (`rk_`), not the account secret key, scoped to Customers (write), Invoices (write), and Tax (read). A restricted key that leaks can do far less than an `sk_`.

Never commit either. A pre-commit hook that greps for `sk_` and `rk_` is worth adding.

## Still to do

- Head office address + registration (above) — blocks tax entirely.
- Register `/api/webhooks/stripe` in the Dashboard, scoped to the seven event types above, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
- Run `yarn stripe:catalogue --deposit <cents> --balance <cents> --iteration <cents>` with your real prices, in each environment, and set the printed price ids.
- Wire balance/iteration invoicing to engagements — the service exists, but nothing yet creates an invoice from a finished website build. Currently manual.
- Complete the account's business profile — `charges_enabled` is currently `false`, so live charges are not yet possible.

## Testing a payment locally

Two processes. Both are required — the second is the one people forget, and
without it a payment succeeds in Stripe and never reaches the app.

```bash
yarn dev
```

```bash
yarn stripe:listen
```

`stripe listen` prints a `whsec_…` on startup. Put it in
`STRIPE_LOCAL_WEBHOOK_SECRET` and restart `yarn dev` — the value is read
through `next.config.ts`, so a running dev server will not pick it up.

`yarn stripe:listen` forwards to port 3000. `yarn dev`'s `autoPort` means it
can land on a different port if 3000 is already taken — if so, forward to that
port instead: `stripe listen --forward-to localhost:<port>/api/webhooks/stripe`.

The secret is regenerated per `stripe listen` session, which is exactly why the
local tier does not share the staging one.

**Why the app cannot fall back to the redirect.** `paid_at` is written only by
a signature-verified webhook. The `?paid=1` on the return URL is a hint that
decides which screen to show and nothing more — anyone can type it. So with no
listener running, Checkout will succeed, Stripe will hold the payment, and the
engagement will correctly still read unpaid. That is the system working, not
failing.

Card `4242 4242 4242 4242`, any future expiry, any CVC.
