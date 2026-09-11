# FIN-6 — The add-ons page under the token: a paid client buys any of their track's add-ons in one Checkout

**Epic:** FIN — finances · **Phase 3** · Size: L
**Slice type:** Money path. A client-reachable multi-item Checkout after the build is bought, settling through the ancillary path, with a PDF invoice. Risk class: `paid_at` touched; a row sold twice; a price that drifts from Stripe; the bought state read from a URL; a client who never paid reaching the page; the durable track regressing.
**Review:** **Forge — settlement of N line items, replays, refusals, `paid_at` byte-identical. Mason — the M-PORT-38 amendment (D-FIN-1) and `settleAncillaryPurchase` growing to a list. Vesper — the page inside the intake grammar; no urgency near a price (D-PORT-19).**

**Status:** Not started — **gated on D-FIN-1 ratified. Not cut until it is.**

> **Forge — money review.** Against staging with `stripe listen`: unpaid engagement reaches the page (refused) · pick two, pay (two rows stamped, one order, one invoice email, `paid_at` byte-identical) · pick one already owned via a forged action (refused before Stripe) · pay, then replay (nothing twice) · cancel (unpaid rows replaced on next press, never stacked) · durable-track deposit, add-on, extra-pages paths regression-run unchanged. State each by name.

---

## Outcome

A client whose build is bought opens `/websites/coded/intake/<token>/extras` (or the durable tree's twin) and sees the add-ons of their track they have not bought — the pay screen's own set, priced from the catalogue — ticks any number, and pays once on hosted Checkout. They return to the same page with the bought rows confirmed, receive Agora's PDF invoice for exactly what they bought, and Taylor gets one ops email. The build's `paid_at` is never touched. What this slice does not do: sell extra pages (a conversation and the CLI), sell the care plan, or email anyone an offer (FIN-7).

## Why / intent

- **Taylor, 2026-09-11** — "send a client an email that brings them to a page where they can choose any selection of upsells… specific to which base… maybe another child path."
- **M-PORT-4 as amended by M-PORT-38** — the charge law: client-initiated, hosted Checkout, published price. **D-FIN-1** amends the allow-list from one mid-intake key to *every active `offeredAtCheckout` add-on of the engagement's track, for a paid engagement, from this page*. The law's three clauses are unchanged.
- **PORT-26** — `createAddonCheckout` and `settleAddon` are the pattern; this slice generalises the item count and the entry point. The taste-step motion notice stays as it is.
- **D-INT-1 / D-PORT-19** — hosted Checkout; no urgency device anywhere near a price.
- **`getCheckoutCatalogue(…, engagement.track, …)`** — the track-scoped read the pay screen uses; this page uses it and subtracts owned rows via `listPurchasedExtras` / `hasPaidFor`.
- **What this slice is NOT (binding):** no `offeredAtCheckout: false` row on the page (extra pages, SEO post, care plan, the negotiated build rows); no promo interaction; no quantity input; no change to `createDepositCheckout` or the pay screen; no automatic email.
- **Ground truth:** `server/services/deposit.ts` (`createAddonCheckout`, `createExtraPageCheckout`, `settleAncillaryPurchase`, `assertPricesMatchStripe`) · `deposit-settlement.ts` (`charge_kind` dispatch) · `products.ts` (`listPurchasedExtras`) · `upsell-block.tsx` / the pay screen's add-on rows (the row grammar) · `payment-confirming.tsx`.

**Rulings this slice makes (labelled, logged):**

- **`createExtrasCheckout(engagement, token, keys[])` in `deposit.ts`.** Refuses unless `paid_at` is set, every key is an active `offeredAtCheckout` add-on of `engagement.track`, none is owned, and `keys.length >= 1`. Replaces this engagement's unpaid rows for those products (never stacks). Metadata `{ engagement_id, charge_kind: "extras", product_keys: keys.join(",") }`. Success URL the extras page with `?added=1`, cancel with `?canceled=1`. Prices verified against Stripe before a session exists. Logged.
- **`settleAncillaryPurchase(engagementId, keys: string[])` — the existing function takes a list; the one-key callers pass `[key]`.** Stamps each in one UPDATE; returns which stamped. `recordOrder` (FIN-1) links the rows by price id. Logged.
- **The webhook gains `charge_kind === "extras"` → `settleExtras`**: stamp, record the order, send the PDF invoice with `kind: "extras_paid"` (D-FIN-2), one ops email listing the rows. Logged.
- **`invoice_emails.kind` gains `extras_paid`** — one migration, appended. `InvoiceDocument` is built from the stamped rows, exactly as the deposit's is. Logged.
- **Bought state is the settled basket, never the query string.** `?added=1` scrolls and, if unsettled, shows the confirming grammar with the existing ceiling. Logged.
- **Two routes, one component**: `app/websites/coded/intake/[token]/extras/page.tsx` and `app/websites/intake/[token]/extras/page.tsx`, both rendering `components/intake/extras-page.tsx` with the track's catalogue. The durable twin exists so the law is the same on both tracks; the durable catalogue decides what it shows. Logged.

## Experience & states

The page in the step grammar: eyebrow `ADD TO YOUR BUILD` `[COPY — draft]`, one line saying the site is finished without any of these, then the rows — name, the "How it works" disclosure the pay screen already has (`content/addon-details.ts`), price, a checkbox. Owned rows render as confirmed, unticked, no checkbox. Below: the total of what is ticked and one `GradientButton` `Pay $N` (disabled at zero), with the trust clause beside it. Press → opening state → Checkout. Return paid → the rows confirmed, one quiet confirmation line. Return cancelled → the page as it was with P0's line verbatim: *"No charge was made. Whenever you're ready."*

**States (exhaustive):** nothing left to buy (all owned; one line, no button) · some available · ticking (total updates) · opening · returned-confirming · returned-ceiling · returned-bought · returned-cancelled · unpaid engagement (refused: one line, no rows) · row unsellable on this tier (rendered without checkbox, dim line, never $0) · preview.

**Failure / edge states (named):** a key ticked then bought elsewhere before paying (race with the mid-intake motion path) → Stripe session created for both; settlement stamps what is unpaid; the already-owned row is skipped and the ops email says so — Forge to confirm this is acceptable or the action re-checks ownership at press · price mismatch with Stripe → refused before session, line says the price is being checked · webhook replay → nothing twice · storage fails on archive → the existing non-fatal rule.

## Non-negotiables (this slice)

- **`paid_at` is never written here.** `settleAncillaryPurchase` only.
- **Only `offeredAtCheckout` rows of the engagement's track**, never a hardcoded list.
- **A client cannot buy a row they own** — refused before Stripe.
- **No urgency, strike-through, "most clients", or timer** near a price.
- **Amounts come from the catalogue and are verified against Stripe** before a session exists.
- **The durable track's existing paths are regression-run** and unchanged.

## Data

**Schema changes: yes — one migration, appended:** `alter type invoice_email_kind add value 'extras_paid';`

**Tables:** `engagement_products` (insert/replace unpaid rows; stamp via the webhook) · `products` (read) · `engagements` (read; **never written**) · `orders` (via `recordOrder`) · `invoice_emails` (via the existing claim) · `stripe_events` (existing).

**Placement:** `server/services/deposit.ts` (`createExtrasCheckout`; `settleAncillaryPurchase` signature) · `app/websites/coded/intake/[token]/extras/page.tsx` + `app/websites/intake/[token]/extras/page.tsx` · `app/websites/coded/intake/_actions/extras.ts` + the durable twin (thin; each validates its own track) · `components/intake/extras-page.tsx`, `extras-row.tsx` · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` (`settleExtras`) · `server/services/invoices.ts` (`sendExtrasInvoiceEmail`, mirroring `sendDepositInvoiceEmail`) · `db/migrations/0017_*.sql` · `lib/routes.ts` (`extras(token)` on both route objects) · `docs/websites/RUNBOOK-post-intake-charges.md` §4 amended · `docs/websites/specs/TECHNICAL-DECISIONS.md` gains the M-PORT-38 amendment line pointing here.

**Validators:** `lib/validators/extras.ts` — `token`, `keys` (non-empty array of catalogue keys, deduplicated, max 12).

## Accessibility

Rows are a labelled group; each checkbox's label includes the price; the total is `aria-live="polite"`; the disclosure is the existing one; the confirming state announces once; nothing flashes; 16px controls.

## Acceptance criteria (observable — staging, `stripe listen`, sandbox tier, both tracks)

1. A paid showcase engagement owning nothing sees the six showcase `offeredAtCheckout` add-ons and no others; a durable engagement sees its own track's set.
2. Ticking two and paying → one Checkout with two line items at catalogue prices, `charge_kind: extras`, `product_keys` naming both. *(Forge.)*
3. Settlement stamps both rows once, records one order linked to both, sends one `extras_paid` PDF invoice listing exactly those two, one ops email; `engagements.paid_at` byte-identical. *(Forge.)*
4. Replay → nothing twice. *(Forge.)*
5. A forged action call with an owned key, an unknown key, an `offeredAtCheckout: false` key, or on an unpaid engagement → refused before any Stripe call, each. *(Forge.)*
6. Cancel → the page unchanged, the quiet line; pressing again replaces the unpaid rows rather than stacking.
7. `?added=1` on an engagement with nothing settled → nothing confirmed; the URL bought nothing.
8. All-owned → the one line and no button.
9. The durable track's deposit, extra-pages, and mid-intake add-on paths regression-run unchanged. *(Forge.)*
10. `grep` finds no countdown, "limited", "most clients", or strike-through on the page.
11. The runbook §4 and the M-PORT-38 line are amended and cross-referenced.
12. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `settleAncillaryPurchase`'s list form: `where product_id in (…) and paid_at is null` in one UPDATE, `returning product_id`; compare against the requested set for the ops email.
- `createDepositCheckout` already builds multi-line sessions from the basket; lift its line-item mapping into a helper both callers use rather than duplicating it.
- The Stripe price ids must exist on the tier (`yarn stripe:catalogue --apply`); PORT-26's named gap applies here too — the page must render the unsellable state rather than $0.

## Dev's call

Whether the two thin actions share a body in `components/intake/` or each import the service directly · the confirming ceiling (suggest the deposit path's) · the row component's internals.

## Out of scope

- **Extra pages, care plan, balance** — RUNBOOK, Taylor-initiated, unchanged.
- **The pay screen and the taste-step motion notice** — unchanged.
- **Promo × extras** — not offered.
- **The offer email and the `/done` links** — FIN-7.

## Depends on

- **FIN-1** — `recordOrder`. Complete in `PROGRESS.md`.
- **FIN-5** — the client can reach their `/done`. Complete.
- **D-FIN-1** — ratified. Not defaulted.

## Recommended execution

**Opus, do not choose down.** Money, a webhook branch, a list-shaped settlement, and an invariant whose violation walks a client into a double charge. A cheaper model reuses `fulfillDeposit` "because the session is completed".

---

### Kickoff (paste into the session)

> Build **FIN-6 — The add-ons page** (attached spec). **`paid_at` is never written here; only the track's `offeredAtCheckout` rows; refuse owned rows before Stripe; bought state is the basket, never the URL; no urgency near a price; the durable track ships unchanged.**
> Attach/read first, in order: this spec · `specs/README.md` · `TECHNICAL-DECISIONS.md` · `docs/websites/specs/PORT-26-motion-add-on.md` (the pattern — reuse, don't fork) · `server/services/deposit.ts` · `deposit-settlement.ts` · `products.ts` · the pay screen's add-on rows · `docs/websites/RUNBOOK-post-intake-charges.md` · `docs/websites/specs/TECHNICAL-DECISIONS.md` (M-PORT-4, M-PORT-38) · repo `CLAUDE.md`.
> Close in three places, plus the M-PORT-38 amendment line. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; exercise every named path with `stripe listen` on both tracks and report each by name.
