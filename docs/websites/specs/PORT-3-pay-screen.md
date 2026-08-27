# PORT-3 — The pay screen: catalogue rows, plan choice, add-ons, promo, and the fulfillment generalization

**Epic:** PORT — portfolio intake · **Phase 2** · Size: L
**Slice type:** Money path. The edge cases — replayed webhooks, drifted prices, promo-substituted build lines — *are* the ticket.
**Review:** Forge (money/data-loss paths) · Mason (the `fulfillDeposit` generalization — it touches the Durable settlement path).

**Status:** Complete (2026-08-26) — catalogue, plan choice, add-ons, promo override, and the fulfillment generalization verified against a scratch Postgres (31 checks) and in a browser. **Stripe objects are not minted:** `yarn stripe:catalogue --apply` and the id paste-back are Taylor's, and no real charge has been exercised. Found and fixed a cross-track promo leak in the process (M-PORT-11).

> **Forge — money-path review.** Verify: fulfillment idempotency unchanged under replay (M-INT-15's guarded UPDATE untouched); the build-line lookup generalization settles the correct amount for **both** tracks (state which paths ran: durable deposit · showcase half · showcase full · showcase + add-ons · promo-substituted build line · replay of each); price-drift assertion fails closed; no client-controllable amount anywhere.

---

## Outcome

A showcase engagement's pay screen is real: the v2 payment copy, a two-card plan choice (half / full), the add-on rows with info dialogs and a running total, the terms-gated CTA, the promo rail, and hosted Stripe Checkout — all riding the existing machine. The catalogue holds the new rows with real Stripe Prices; `fulfillDeposit` settles a showcase basket exactly once and records what was actually paid. The Durable pay screen is unchanged. The care plan row renders only if signed off, and charges nothing at checkout regardless. No post-intake charge path exists yet (PORT-9).

## Why / intent

- **V2 doc "Payment screen" (binding, verbatim)** — headline "**The build is $2,000.**" with its paragraph; plan labels "Half now, half before launch — **$1,000 today**" / "All up front, 5% off — **$1,900 today**"; the add-on rows' full copy (each row has an info button, "same pattern as the existing checkout"); the italic Stripe note. **Three of the four rows ship: admin panel, logo refresh, booking setup. The care-plan row does not** — Taylor's ruling, M-PORT-6 (logged in `DEVIATIONS.md`); it is the one knowing divergence from the approved copy.
- **Handoff decision 4 (ratified)** — pay-in-full is **its own product row**, never a runtime discount; Kryshan's $1,600 rides the promo mechanism.
- **M-PORT-4 + M-PORT-6 (ruled)** — build-line selection by plan; `fulfillDeposit` finds the build line by `kind === "build"`, not the literal `deposit` key; all post-intake charges are Taylor-initiated; the promo `overridesBuildKey` extension is **Ruled** ("1600 is achievable with a promo code"); the admin panel is **Ruled** live at $500 ("admin panel is an upsell right now"); the care plan is **Ruled** out of checkout entirely ("don't charge for the maintenance care plan until it's done") — nothing recurring is sold in v1, so this slice contains no subscription code at all.
- **D-INT-11 (inherited, as amended)** — add-on checkbox rows + info dialogs (`content/addon-details.ts` pattern), real terms checkbox, CTA disabled until ticked with one dim line under the button. **D-INT-12** — promo rail behind "Have a code from our call?", `?promo=` auto-apply, codes resolve server-side.
- **UX scope §4** — anatomy top to bottom; neither plan preselected; today's charge is the only total; stat-number gradient on the plan amounts only; the trust block's three mono lines; no urgency devices, ever.
- **What this slice is NOT (binding):** no subscription code of any kind — no `mode: "subscription"`, no Stripe customer object, no recurring price, no care-plan row (M-PORT-6, ruled); no extra-page anything (PORT-9); no refund sentence until Taylor rules it (`[NEEDS DECISION]` — render the trust block without it; adding the line is copy-only).
- **Ground truth:** `server/services/{deposit,products}.ts`, the webhook route, `engagement_products`, the promo map, the P0 components — consumed and extended, never rebuilt.

**Rulings this slice makes (labelled, logged):**

- **Plan choice maps to the build line server-side:** the action receives `plan: "half" | "full"` and resolves `showcase_deposit` / `showcase_full` from the catalogue — the browser never names a product key for the build line. Logged.
- **Promo build-line override** (`overridesBuildKey` on the promo map): a code may substitute the build line with another catalogue row; arithmetic never changes, rows do. **Ruled** (M-PORT-6). Kryshan's code seeds `showcase_deposit_1600` ($800) and `showcase_full_1600` ($1,520 = 5% off $1,600) — **the amounts are `[PROVISIONAL]`**, the mechanism is not; changing either is a seed edit plus one `yarn stripe:catalogue --apply`. An override with a full-payment twin keeps both plan cards; without one, only the half card renders. Logged.
- **Admin panel seeds active and `offeredAtCheckout: true`** at $500 (ruled). **The care plan seeds `isActive: false`, `offeredAtCheckout: false`**, renders nowhere, and appears in no total (ruled) — the v2 row's copy stays in the doc for the day it turns on. Logged.

## Experience & states

Anatomy per UX scope §4 (eyebrow `AGORA · PORTFOLIO BUILD` · headline + paragraph · plan ChoiceCards · "Worth adding?" rows · running total (+ care-plan monthly line only when its row is live and its start-date truth is ruled) · terms checkbox + acceptance line · GradientButton → Checkout · trust block · promo rail).

**States (exhaustive):** no plan selected (CTA reads `Pay deposit`, amountless, disabled by the terms gate as today) · plan selected (CTA carries the amount) · add-ons toggled (total updates) · info dialog open (existing pattern, focus-trapped) · promo applied (granted/override lines render; invalid code → the existing quiet handling) · CTA loading `Opening secure checkout…` · returned-canceled ("No charge was made. Whenever you're ready." — the existing string, quiet, nothing red) · paid → never renders again.

**Failure / edge states (named):** price drift vs Stripe → fail closed, quiet retry line, nothing charged (existing `assertPricesMatchStripe`, now over the selected plan's line) · webhook replay → `already_paid`, byte-identical row (M-INT-15) · unknown add-on key → dropped with warning (charge is only ever a subset of what was displayed) · full-payment session abandoned then half chosen on retry → wholesale replacement of unpaid basket rows handles it (existing behavior; verify it).

## Non-negotiables (this slice)

- **Fulfillment is webhook-only; the success URL is never trusted.** The guarded-UPDATE idempotency shape is untouched.
- **No client-controllable amount or product id reaches a charge.** Plan and add-on keys validate against the catalogue server-side.
- **The charge is only ever a subset of what was displayed.**
- **Pay-in-full is a row, not arithmetic.** No discount math anywhere.
- **No urgency devices near payment** (D-INT-1) — nothing counts down, nothing scarce.
- **V2 row copy verbatim** — the add-on descriptions are the sell; they ship as written.

## Data

**Schema changes: none** (columns landed in PORT-1).

**Tables:** `products` (seed + track-filtered reads) · `engagement_products` (basket writes via the existing service) · `engagements` (fulfillment UPDATE).

**Placement:** `scripts/seed-products.ts` + `scripts/setup-stripe-catalogue.ts` (new rows; runbook per M-INT-23) · `server/services/products.ts` (track argument on `listCheckoutAddons` / build-line getters) · `server/services/deposit.ts` (plan resolution; fulfillment `kind`-lookup) · `lib/intake/promo.ts` (`overridesBuildKey`) · pay-screen components under the showcase tree as wrappers over the existing P0 pieces · `content/` add-on info copy per the `addon-details.ts` pattern.

**Validators:** `payPlanInput` (`"half" | "full"`) in `lib/validators/showcase-intake.ts`; add-on selection and promo inputs reused from `lib/validators/intake.ts` (one home).

## Accessibility

Plan cards are a radio group (fieldset/legend); selected state readable at AA; the disabled CTA's explanatory line is programmatically associated (D-INT-11 amendment pattern); dialogs inherit the existing focus trap and escape; the running total announces politely on change, once per change.

## Acceptance criteria (observable — Stripe test mode, `yarn stripe:listen` running)

1. Seed run creates the M-PORT-4/6 rows with track `showcase`, correct amounts, and live/test Stripe ids; Durable catalogue rows byte-unchanged; admin panel active and offered; care plan present, inactive, and not offered.
2. The pay screen renders the v2 copy verbatim (diff), both plan cards, and exactly three add-on rows — admin panel, logo refresh, booking setup. No care-plan row, no monthly line, no recurring amount anywhere on the screen or in any total.
3. Half plan → Checkout charges $1,000 + selected add-ons; full → $1,900 + add-ons; basket rows record the struck amounts; webhook settles `paidAt`, `depositAmountCents` from the build line, terms stamp — for **both** plans.
4. Replayed `checkout.session.completed` → `already_paid`; `paid_at`/`updated_at` byte-identical (the M-INT-15 check, re-run here).
5. Durable regression: a durable engagement's checkout and fulfillment round-trip unchanged (the generalized lookup settles `deposit` exactly as before).
6. Promo: Kryshan's code substitutes the build line; the screen shows $800 (half) / $1,520 (full); the charge matches the screen to the cent; `?promo=` auto-applies; an unknown code is quiet.
7. Terms gate: CTA disabled until ticked, dim line present; ticking enables; the acceptance line's documents open in the Overlay.
8. Returned-canceled renders the quiet line; no error banner; a second attempt succeeds with a fresh session.
9. Negative: no countdowns, no scarcity copy, no discount arithmetic anywhere (grep for the amounts); `extra_page` is not offered at checkout.
10. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `getDepositProduct()` hardcodes key `deposit` — the showcase path wants `getBuildProduct(track, plan)`; keep the Durable-named export delegating to it so call sites don't churn.
- The statement-descriptor suffix (`DEPOSIT`) likely serves both tracks; if Taylor wants a distinct suffix it is one constant — flag, don't invent.
- The v2 note "Add-ons charge with today's payment" is already how the machine works; no code needed, just don't break it.

## Dev's call

Plan-choice component internals · where the showcase add-on info copy lives (extend `addon-details.ts` vs sibling file) · test-tier override row naming.

## Out of scope

- **Extra pages, care-plan activation, balance collection** — PORT-9.
- **Refund sentence** — Taylor (`[NEEDS DECISION]`); copy-only when ruled.
- **Kryshan's real promo rows** — seeded when Taylor rules the split; the mechanism ships now.
- **Terms content changes** — Taylor + a copy pass outside this epic.

## Depends on

- **PORT-2** — the `[token]` state router that mounts this screen. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** This slice edits the settlement path both tracks share. Choosing down produces a checkout that works on the happy path and mis-settles the deal-as-struck on exactly one of: full payment, promo override, or replay.

---

### Kickoff (paste into the session)

> Build **PORT-3 — Pay screen** (attached spec). **Webhook-only fulfillment; the charge is a subset of the display; pay-in-full is a row; no client-controllable amounts; Durable settlement unchanged.**
> Attach/read first, in order: this spec · `specs/README.md` · `../portfolio-intake-questions-v2.md` (payment screen — the copy source) · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §6 · `../PORTFOLIO-INTAKE-UX-SCOPE.md` §4 · `server/services/deposit.ts` + `products.ts` + `lib/intake/promo.ts` (reuse, don't fork) · `docs/intake/specs/TECHNICAL-DECISIONS.md` M-INT-15/20/23 · this folder's logs.
> Exercise both plans, a promo override, and a replay against Stripe test mode. Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
