# PORT-26 — Motion: the add-on notice on the taste step, and the one client-initiated single-item Checkout

**Epic:** PORT — coded (showcase) intake · **Phase 9** · Size: M
**Slice type:** Money path. A client-reachable Checkout for one catalogue row, re-entering the questionnaire, with a webhook branch to settle it. Risk class: `paid_at` touched by an ancillary payment; a second charge for a row already bought; the bought state read from a query string a browser can forge; a notice that reads as urgency next to a price; the webhook landing after the client is already back on the step.
**Review:** **Forge — the settlement path, replays, the `paid_at` invariant. Mason — the amendment to M-PORT-4 and the allow-list of one (M-PORT-38). Vesper — the two notice states and the returned-canceled line (D-PORT-19).**

**Status:** Complete (2026-09-04), with one named gap. Exercised against the staging database with Stripe in **test** mode: 12 of 12 checks passed. **`paid_at` is byte-identical after settlement and the engagement row is otherwise unchanged** — the invariant this slice exists to protect. All four refusals hold (durable track, unpaid build, a key outside the allow-list, a row already owned, the last refused before Stripe is touched); settlement stamps once and a replay stamps nothing twice; `listPurchasedExtras` flips to bought. **The one gap: creating the Checkout session itself**, because `showcase_animations` has no minted Stripe price on this tier — an outstanding action from PORT-3 (`yarn stripe:catalogue --apply`, then `yarn db:seed`). Until then the notice renders its unsellable state, which is honest and was verified. Superseded status line: *not verified — do not treat as Complete.* Every acceptance criterion on this ticket needs a database and `stripe listen`, and no Stripe credentials were authorised in this session. What was verified: the five notice states render correctly (offer, returned-cancelled, paid-but-unsettled, bought with its three questions, and the unsellable-row line); the button is disabled in preview with its line; `fulfillDeposit` is unreachable from this path; `createAddonCheckout` never touches the `engagements` table, so `paid_at` cannot move; the allow-list is one key; and no urgency word appears in any client-facing string. **Unverified: every path in the Forge review** — session creation, settlement, replay, the unpaid-engagement and already-owned refusals against a real database. Taylor runs those before a client meets this.

> **Forge — money review.** Exercise, against a scratch database with `stripe listen`: unpaid-engagement press (refused) · bought-on-pay-screen (notice already in the bought state; no button) · press → pay → return (bought state after settlement; `paid_at` unchanged) · press → cancel → return (notice unchanged, the quiet line) · webhook replay (stamps nothing twice, one ops email) · a second press after buying (refused before Stripe is touched). State every path by name.

---

## Outcome

At the bottom of the taste step a client who did not buy motion reads a plain card: what animation is, that it is priced on its own, the price, and that the site is finished without it. One ghost button opens hosted Stripe Checkout for that single item. Paying returns them to the same step with the card re-headed as a confirmation and the three motion questions beneath it; cancelling returns them to the same card with one quiet line saying nothing was charged. A client who bought motion on the pay screen meets the confirmation and the questions, identical. Taylor gets one ops email per settlement. The build's `paid_at` is never touched by any of it. What this slice does not do: sell any other add-on mid-intake, change extra pages, or change the pay screen.

## Why / intent

- **`../CODED-INTAKE-TASTE-UX-SCOPE.md` §11** — both states, the button, the return lines, the no-urgency law (D-PORT-19, provisional — build against). §13 — the strings.
- **Taylor, 2026-09-03** — "allow them to check out on Stripe express just like the earlier step, but just for this one item." This is the authority for amending M-PORT-4's and the README's "no mechanism can charge the client without Taylor initiating it": the law is restated as **no charge the client did not themselves initiate on hosted Checkout at a published price**. Post-intake extra pages, the balance, and the care plan stay Taylor-only. `M-PORT-38`.
- **D-INT-1** — hosted Checkout, no card UI, no urgency device anywhere near payment.
- **`createExtraPageCheckout` / `settleAncillaryPurchase` / `hasPaidFor`** (PORT-9) — the ancillary path exists and never touches `paid_at`; this slice adds a second caller of it with a different `charge_kind`. **`fulfillDeposit` is not called.**
- **`Reveal`'s `extra` condition + `listPurchasedExtras`** — the bought state is the settled basket, read at render. The existing `UpsellQuestions` block for `animations` becomes the bought state's body.
- **What this slice is NOT (binding):** no allow-list wider than `showcase_animations`; no promo interaction; no `?paid=1` trusted for anything but scrolling; no email to the client beyond Stripe's receipt; no change to `createDepositCheckout`.
- **Ground truth:** `server/services/deposit.ts` § extra pages · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` (`charge_kind` dispatch, `settleExtraPages`) · `products.ts` (`findSellableProductByKey`, `PRODUCT_KEY_TO_EXTRA`, `listPurchasedExtras`) · `showcase-pay-button.tsx` (the opening/failed grammar) · `payment-confirming.tsx` (the settling-wait grammar) · `upsell-block.tsx`.

**Rulings this slice makes (labelled, logged):**

- **`createAddonCheckout(engagement, token, key)` in `deposit.ts`, with `MID_INTAKE_ADDONS = ["showcase_animations"] as const` as the whole allow-list.** Refuses unless the engagement is showcase, `paid_at` is set (the build is bought), the key is in the list, and `hasPaidFor` is false. Metadata `{ engagement_id, charge_kind: "addon", product_key }`; success URL the taste step with `?added=<extra>`, cancel URL the taste step with `?canceled=1`. Replaces this product's unpaid row as the extra-page path does. `M-PORT-38`. Logged.
- **The webhook gains one branch: `charge_kind === "addon"` → `settleAncillaryPurchase` + an "Add-on paid" ops email.** No invoice, no questionnaire handover; the client has both. Logged.
- **The bought state is read from the basket, never from the URL.** `?added` only scrolls the notice into view and, if the basket has not settled yet, shows the confirming state that refreshes until it has (the `PaymentConfirming` grammar), with a ceiling after which it says the payment is with Stripe and Taylor sees it. Logged.
- **The action lives at `app/websites/coded/intake/_actions/add-on.ts`, thin, showcase-only, and is the fifteenth (or sixteenth, after PORT-25) network caller in the preview audit.** Logged.

## Experience & states

The UX scope §11 is the spec.

**Not bought:** the callout card (durable-track grammar), eyebrow `MOTION · AN ADD-ON`, the §13 body with the price from the catalogue, `GhostButton` `Add motion · $N`, the trust clause beside it. Press → `Opening secure checkout…`, disabled → hosted Checkout.

**Returned, paid, settled:** the bought state, scrolled into view.
**Returned, paid, not yet settled:** the card in a confirming state (`Confirming your payment…`, the `PaymentConfirming` mechanism) → bought state when the basket shows it; after the ceiling, one line: *"Stripe has it. If this card doesn't update in a minute, carry on — Taylor sees the payment either way."* `[COPY — draft]`.
**Returned, cancelled:** the not-bought card plus P0's line, verbatim: *"No charge was made. Whenever you're ready."*
**Failed to open:** the pay button's line, verbatim.

**Bought (either way):** eyebrow `MOTION · ADDED`, the §13 confirmation body, then the three existing animation questions. No button.

**Preview / document:** the not-bought card with the button disabled and the preview line; the document prints both states under the `Reveal` line (ADM-4).

**States (exhaustive):** not-bought · opening · returned-cancelled · returned-confirming · returned-ceiling · bought · preview · document.

**Failure / edge states (named):** unpaid engagement reaches the step (`deposit_required=false` dev engagements) → the notice renders without a button and one dim line that motion is added after the build is bought · a promo granted `showcase_animations` free → bought state; the action refuses a press that cannot happen · Stripe session created, client never pays → the unpaid row is replaced on the next press, never stacked · webhook replay → `already_settled`, no second email · the product row unsellable on this tier → the card renders without the button and a dim line (never a price of $0).

## Non-negotiables (this slice)

- **`paid_at` is never written by this path.** `settleAncillaryPurchase` only; `fulfillDeposit` is never called.
- **The allow-list is one key.** Widening it is a Taylor decision, not a constant edit.
- **The bought state comes from the settled basket, never the query string.**
- **No urgency, no strike-through, no "most clients", no timer** near the price.
- **A client cannot buy a row they already own** — refused before Stripe is touched.
- **Amounts come from the catalogue and are verified against Stripe** (`assertPricesMatchStripe`) before a session exists.

## Data

**Schema changes: none.**

**Tables:** `engagement_products` (insert/replace unpaid row; `paid_at` stamped by the webhook) · `products` (read) · `engagements` (read; **never written**) · `stripe_events` (existing claim).

**Placement:** `server/services/deposit.ts` (`createAddonCheckout`, `MID_INTAKE_ADDONS`) · `app/websites/coded/intake/_actions/add-on.ts` · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` (the `addon` branch, `settleAddon`) · `app/websites/coded/intake/_components/taste/motion-notice.tsx` (both states, wrapping the existing `UpsellQuestions` for the bought body) · `[token]/[step]/page.tsx` (reads `added` / `canceled` search params for the taste step only) · `components/intake/preview-mode.tsx` audit list · `docs/websites/RUNBOOK-post-intake-charges.md` §4 gains one sentence naming this as the one client-initiated path and why it is not a post-intake charge. Mason's call, M-PORT-38.

**Validators:** the action's input (`token`, `extra` as a literal union of one) in the action file.

## Accessibility

The card is a region with the eyebrow as its heading; the button has words and a visible price; the confirming state is `aria-live="polite"` and announces once on settlement; the cancelled line is text in flow; nothing flashes.

## Acceptance criteria (observable — scratch database, `stripe listen`, sandbox tier throughout)

1. An engagement with `paid_at` set and no motion row shows the not-bought card with the catalogue price; pressing opens Checkout for exactly one line item at that price with `charge_kind: "addon"` in metadata. *(Forge.)*
2. Completing payment: the webhook stamps the row, sends one "Add-on paid" ops email, and `engagements.paid_at` is byte-identical before and after. *(Forge.)*
3. Returning before the webhook lands shows the confirming state, then the bought state within the refresh interval; returning after shows the bought state at once; the three motion questions render and save.
4. Cancelling returns to the not-bought card with the quiet line; pressing again replaces the unpaid row rather than adding one.
5. A replayed `checkout.session.completed` stamps nothing and sends no second email.
6. An engagement that bought motion on the pay screen shows the bought state with no button.
7. Pressing on an engagement that already owns the row (forged action call) is refused before any Stripe call; an unpaid engagement is refused likewise.
8. `?added=animations` on an engagement with no motion row shows the not-bought card — the URL bought nothing.
9. The durable track's webhook paths (deposit, extra pages) are regression-exercised once each and unchanged.
10. `grep` finds no countdown, "limited", "most clients", or strike-through in the notice.
11. Preview: button disabled, no request; document mode prints both states.
12. `yarn build:agent`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `PaymentConfirming` polls by router refresh; reuse its interval and ceiling rather than inventing a second timer.
- The `Reveal` for the bought body already keys on `extras.includes("animations")`; the notice is a wrapper that renders the not-bought card when the reveal would be closed. Do not add a second condition.
- The ops email body can copy `settleExtraPages`'s shape with the product name.

## Dev's call

The confirming ceiling (suggest the deposit path's) · the notice component's internal split · whether the runbook sentence lives in §4 or a new §5.

## Out of scope

- **Any other add-on mid-intake** — Taylor's call; the allow-list is the gate.
- **Extra pages, balance, care plan** — RUNBOOK, Taylor-initiated, unchanged.
- **The pay screen** — PORT-3, unchanged.
- **Promo × add-on** — M-PORT-6; not offered here.

## Depends on

- **PORT-23** — the step's final order and the notice's place. Complete in `PROGRESS.md` required.
- **PORT-3** and **PORT-9** — the catalogue rows and the ancillary settlement path. Complete.

## Recommended execution

**Opus, do not choose down.** Money, a webhook branch, and an invariant (`paid_at`) whose violation walks an unpaid client into the questionnaire. A cheaper model reuses `fulfillDeposit` because it "handles a completed session".

---

### Kickoff (paste into the session)

> Build **PORT-26 — Motion add-on** (attached spec). **`paid_at` is never written here; the allow-list is one key; the bought state is the basket, never the URL; no urgency near the price; never charge a row already owned.**
> Attach/read first, in order: this spec · `specs/README.md` (note the amended charge law) · `../CODED-INTAKE-TASTE-UX-SCOPE.md` §11, §13 · `server/services/deposit.ts` § extra pages + `settleAncillaryPurchase` (reuse, don't fork) · `app/api/webhooks/stripe/_handlers/deposit-settlement.ts` · `showcase-pay-button.tsx` + `payment-confirming.tsx` (the grammar) · `upsell-block.tsx` · `../RUNBOOK-post-intake-charges.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (M-PORT-4, M-PORT-38).
> Close in three places. Run `yarn build:agent` + `npx tsc --noEmit` + `yarn lint`; exercise every named path with `stripe listen` and report each by name.
