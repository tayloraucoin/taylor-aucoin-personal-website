# Runbook — charging a client after the intake

Everything here is **Taylor-initiated**. Nothing in this document can be triggered by a client, and that is deliberate: the coded track's step 8 promises that "nothing extra is ever charged without a conversation first", and the mechanism that keeps the promise is that the charge does not exist until you make it (M-PORT-4). There is no route, no action, and no component anywhere in the app that reaches any of these paths.

Applies to both tracks unless a section says otherwise.

---

## 1. Extra pages

The client picked more than the included five on step 8. The intake document flags it for you (`N pages chosen; 5 are included`), and the questionnaire never quoted them a total.

**Have the conversation first.** Agree the number of pages and the price out loud, then:

```bash
yarn charge:extra-pages --engagement <uuid> --pages 3
```

It prints a Checkout URL and sends nothing. **You** send the link, in the same thread where you agreed the pages.

What happens then:

- The client pays on hosted Stripe Checkout, same as the deposit.
- The webhook settles it and stamps the basket, so the engagement's record shows what was actually bought.
- **Their deposit state is untouched.** `paid_at` on the engagement means the build was bought and nothing else may set it — an extra-page payment marking an unpaid engagement as paid would walk someone past the pay screen into a questionnaire they had not bought.
- You get an ops email.

Notes:

- The engagement id is in the admin engagements list.
- Re-running before they pay replaces the previous unpaid extra-page rows rather than stacking them, so a corrected count is just a second run.
- The ceiling is 20 pages per charge. That is a typo guard, not a product rule — a mistyped quantity is the cheapest way to overcharge someone.
- Each track charges its own row (`extra_page` / `showcase_extra_page`). Both are $150; neither is ever offered at checkout.

---

## 2. Care plan

**The coded track does not sell a care plan.** Taylor's ruling, 2026-08-26 (M-PORT-6): nothing recurring is charged until the offer itself is settled. The row exists in the catalogue seeded inactive, it is offered nowhere, it appears in no total, and **no Stripe object has been minted for it**. The v2 doc's row copy waits in that document for the day this changes.

The platform track's care plan (`care_plan`, $250/mo) is unchanged and predates this work.

**To turn the coded plan on later**, in this order:

1. Settle the offer — what it includes, what it costs, what the monthly ceiling is. `docs/websites/WEBSITES-PAGE-SPEC.md` §8 records why this has stayed unpublished; it is the same reason.
2. Add its price to `scripts/setup-stripe-catalogue.ts` with `recurring: "month"`, run `yarn stripe:catalogue --apply` per tier, paste the ids into `scripts/seed-products.ts`.
3. Flip `isActive` and, if it should sell at checkout, `offeredAtCheckout` on the `showcase_care_plan` row.
4. Restore the v2 doc's care-plan row copy to the pay screen **and** the "plus $100/mo, starts …" line — which cannot ship until step 3's start date is a true statement.
5. Subscription-mode checkout does not exist in this codebase. Adding it is a slice, not a config change: `mode: "subscription"` needs a Stripe customer object and its own settlement path.

Until all of that, activating a care plan for a client is a Stripe Dashboard subscription created by hand, against their existing customer record.

---

## 3. The balance

**Not a new mechanism — it rides the existing invoicing rail.** `server/services/invoices.ts` and `server/services/agora-invoicing.ts` already send invoice emails and PDFs, and the balance row is seeded per track (`balance` / `showcase_balance`).

Nothing in the PORT work changed this path. A client who chose pay-in-full (`showcase_full`) has no balance to collect — the row simply never applies to them.

---

## 4. What must never happen

- **A charge the client did not agree to out loud first.** Every path here starts with you running something.
- **`paid_at` set by anything other than a build payment.** It has one meaning. `settleAncillaryPurchase` exists precisely so ancillary money cannot touch it.
- **A client-reachable route to any of this.** If a future ticket adds an admin surface for these, it authenticates as the admin — it does not relax the rule that a client cannot charge themselves.
