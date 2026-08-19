# INT-3 — Deposit gate: the P0 screen, Stripe Checkout session, webhook fulfillment

**Epic:** INT — client intake · **Phase 2** · Size: L
**Slice type:** Money-adjacent surface + third-party-inbound rail. Risk class: a paid client who looks unpaid (webhook failure), or a fabricated success URL treated as payment.
**Review:** **Forge — money path.** Review by inducing: webhook replay (same event twice), webhook for an already-paid engagement, success-URL visit with no webhook received, cancel-and-retry, signature failure.

**Status:** Code complete (2026-08-18) — webhook signature handling, fulfillment idempotency, and waived-path logic verified against a scratch Postgres with SDK-signed payloads; criteria needing a real Stripe account (live Checkout round-trip, canceled-and-retry) and browser rendering are NOT verified

> **Forge — money path review.** Verification states which paths it exercised: fresh-pay · replayed webhook · fabricated `?paid=1` without webhook · canceled return · `deposit_required=false` bypass · signature-invalid rejection.

---

## Outcome

A client opening their link sees the P0 Confirm & pay screen — their business name as the headline, Taylor's call summary verbatim, the deposit amount in the gold stat treatment — taps one button, pays in hosted Stripe Checkout with a wallet or card, and lands back in the flow with the deposit confirmed. The engagement flips to paid by webhook, exactly once, regardless of what the browser does. Engagements with `deposit_required=false` never see P0. The welcome screen itself and everything after it is INT-4's; this ticket ends at "paid engagement, routed onward."

## Why / intent

- **D-INT-1** — hosted Checkout, zero card UI, no urgency devices. **UX spec §3** is the screen's layout, copy, and state law — anatomy items 1–6 verbatim, including the trust block's three mono lines.
- **D-INT-9** — `deposit_required=false` skips P0 entirely.
- **D-INT-10 `[NEEDS DECISION — Taylor]`** — the refund sentence. Ship the trust block without it; a `TODO(D-INT-10)` placeholder comment (not rendered text) marks the slot. **Blocks real charges, not this build.**
- **TECH-SCOPE §6** — session parameters (mode, `price_data` cad, `customer_email`, `metadata.engagement_id`, success/cancel URLs); **fulfillment is webhook-only**; idempotency guard on `paidAt IS NULL`; raw-body signature verification.
- **CC §3.5** — third-party-inbound → route handler `app/api/stripe/route.ts`; the pay CTA → server action (thin: `requireEngagement`, call `server/services/deposit.ts`, redirect to the session URL).
- **What this slice is NOT (binding):** no refund handling, no partial payments, no amount editing in-app, no Stripe customer objects — one session, one payment, per engagement.

**Rulings this slice makes (labelled, logged):**

- **A new Checkout session is created per pay attempt** (canceled sessions are abandoned, not resumed); the row stores the latest `stripeCheckoutSessionId`. Simpler than session-reuse and Stripe expires strays. Logged.
- **`checkout.session.completed` is the only fulfilling event** in v1; `payment_intent.succeeded` is ignored (redundant for Checkout). Logged.

## Experience & states

**P0 per UX spec §3** — states verbatim from the spec: default · CTA loading (`Opening secure checkout…`, disabled — the flow's only disabled button, D-INT-4) · returned-canceled (one added quiet line, no banner, no red) · paid (P0 never renders again; server routes to W0/INT-4's surface — until INT-4 ships, a minimal "Deposit received" placeholder paragraph, replaced by INT-4 and noted in its spec).

**Failure / edge states (named):**

- Webhook arrives before the browser returns → success URL finds `paidAt` already set: normal path, no double handling.
- Browser returns with `?paid=1` but webhook not yet processed → render a "confirming payment" interstitial that polls the engagement state (server component refresh or light client poll — dev's call); **never** mark paid from the param.
- Replayed/duplicate webhook → second delivery no-ops (guard on `paidAt IS NULL`), returns 200.
- Invalid signature → 400, no body echo, no engagement lookup.
- Webhook for an unknown `engagement_id` → 200 with a server-side warning log (event id only, no payload dump) — Stripe retries on non-2xx and this is not retryable.
- Stripe Checkout itself failing (declines, etc.) is Stripe's surface — we design nothing for it.

## Non-negotiables (this slice)

- **The success URL is never trusted.** `paidAt` is set by the verified webhook alone.
- **Fulfillment is idempotent.** Replay produces no second state change.
- **Amounts come from the engagement row.** No amount, currency, or price constant in code.
- **No urgency devices, no red, on or near P0** (D-INT-1, Quiet Gilt law).
- **The webhook route logs event ids and engagement ids only** — never payloads, never emails.

## Data

**Schema changes: none** (columns exist from INT-1).

**Tables:** `engagements` (read via `requireEngagement`; `paidAt`/Stripe-id writes via `server/services/deposit.ts` — the webhook path looks up by `metadata.engagement_id` through a service function, not through the token seam, and this is the one sanctioned non-token reader; note it in the service header).

**Placement:** `server/services/deposit.ts` · `app/intake/[token]/page.tsx` (state-routed entry: unpaid→P0, else onward) · `app/intake/_components/` (P0 client leaves: pay button state) · `app/intake/[token]/_actions/pay.ts` · `app/api/stripe/route.ts`.

**Validators:** webhook payload narrowing via Stripe's own types + `lib/validators/intake.ts` for the action input (token only).

## Accessibility

P0 is the flow's first screen on a phone: single column, the pay CTA ≥48px, focus-visible gold ring, the amount readable by screen readers as text (not only styled digits), the loading state announced via the button's accessible name change. No motion beyond the site's fade norms; `prefers-reduced-motion` collapses it.

## Acceptance criteria (observable — Stripe test mode, webhook via `stripe listen` or dashboard replay)

1. Unpaid engagement's link renders P0 with business name, verbatim summary, amount formatted from the row (cents → `$X,XXX` CAD), and the three trust-block lines. _(Layout per UX spec §3 anatomy.)_
2. Pay CTA → hosted Checkout with the row's amount and prefilled email; completing payment (test card) results in `paidAt` set and the entry route no longer rendering P0.
3. Replaying the same webhook event produces no change (`updatedAt` stable) and a 2xx.
4. Visiting `/intake/[token]?paid=1` on an engagement with `paidAt` null does **not** set paid; the confirming interstitial resolves once the webhook lands.
5. Canceled return renders P0 with the one-line addition; retry creates a fresh session and succeeds.
6. `deposit_required=false` engagement never renders P0 at any point in the flow.
7. Invalid-signature POST to the webhook returns 400 with an empty body.
8. Negative: no red anywhere on P0; no countdowns; the RootField canvas is absent from the route.
9. `npm run build`, `npx tsc --noEmit`, `npm run lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Next 15 route handlers: read the raw body via `await req.text()` before `stripe.webhooks.constructEvent` — `req.json()` breaks signature verification.
- The confirming interstitial can be a server component with `<meta http-equiv="refresh">`-class simplicity or a tiny client poller; pick the one that respects reduced-motion and doesn't spin.
- Restricted key scopes: Checkout Sessions write, Webhook Endpoints read — nothing else.

## Dev's call

Interstitial mechanism · amount formatting util placement (starts local; promotes on second consumer, CC §5.2) · Stripe API version pin string.

## Out of scope

- **W0 welcome screen proper** — INT-4 (this ticket's paid placeholder is throwaway and says so in a comment).
- **Refunds, disputes, receipts** — Stripe's surfaces; refund _policy sentence_ is D-INT-10 (Taylor).
- **Recording deposit state in the output document** — INT-7.

## Depends on

- **INT-2** — `requireEngagement`, domain type, routes. Complete in `PROGRESS.md`. External: Agora restricted key + webhook secret from Taylor for runtime verification.

## Recommended execution

**Opus/Fable-class.** The edge cases are the ticket: a cheaper model wires the happy path and trusts the success URL, which is precisely the defect class this slice exists to prevent.

---

### Kickoff (paste into the session)

> Build **INT-3 — Deposit gate** (attached spec). **Fulfillment is webhook-only and idempotent; the success URL is never trusted; amounts live on the row.**
> Attach/read first, in order: this spec · `specs/README.md` · `../TECH-SCOPE.md` §6 · `../INTAKE-UX-SPEC.md` §3 (P0 anatomy + states, verbatim) · `INT-2` (the seam — reuse, don't fork) · repo `CLAUDE.md` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Raw body for signature verification. New session per attempt. No red, no urgency. Close in three places. Run `npm run build` + `npx tsc --noEmit` + `npm run lint`.
