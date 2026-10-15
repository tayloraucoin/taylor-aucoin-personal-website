# PORT-9 — Post-intake charges: extra pages, care-plan activation, and the balance — Taylor-initiated only

**Epic:** PORT — portfolio intake · **Phase 5 (fast-follow)** · Size: M
**Slice type:** Money path, low-frequency, founder-operated. Risk class: any crack that lets a charge exist without Taylor's hand on it — the confirm-before-charge promise is a copy promise this slice makes structural.
**Review:** Forge (money paths).

**Status:** Complete (2026-08-26) — 14 settlement checks pass on both tracks: an extra-page payment stamps its own rows, leaves `paid_at` null and the unpaid build row untouched, and replays no-op; the deposit still settles afterwards recording the build price. Grep confirms no route, action, or component can reach the mint — only `scripts/`. **No real Stripe session has been created** (test mode not exercised); the care plan and balance ship as runbook sections.

> **Forge — money-path review.** Verify the one property everything here serves: **no client-reachable code path can create any of these charges.** State which paths ran: extra-page session for N pages · its webhook settlement onto the basket · a replay · the care-plan activation runbook walked once against test mode.

---

## Outcome

Taylor can charge the things the intake surfaced, without hand-typing amounts: a CLI (per M-INT-5's precedent) mints a hosted Checkout session against an engagement for `extra_page × N`, emails nothing by itself (Taylor sends the link in his own words — the conversation *is* the confirmation), and the existing webhook settles it onto the engagement's basket exactly once. The care plan gets a documented activation runbook (Stripe-side subscription, catalogue-recorded) pending its sign-off. Balance collection is confirmed as the existing invoicing rail's job, not rebuilt here. Nothing in the client's surface changes.

## Why / intent

- **Handoff decision 4 (binding)** — step 8's extra-page pricing needs a post-intake payment path; "the copy promises confirm-before-charge, so the mechanism must make auto-charging impossible."
- **M-PORT-4** — every post-intake charge is Taylor-initiated; the client has no surface that can create a session; structural enforcement, not copy.
- **M-INT-5 precedent** — founder-operated CLI with env credentials is the established shape for low-frequency admin actions while the admin build is deferred.
- **The existing machine** — `extra_page` is already a catalogue row ($150, quantity-shaped, never `offeredAtCheckout`); `engagement_products` already records baskets; the webhook already settles them. This slice composes; it does not build a second money path.
- **What this slice is NOT (binding):** no client-facing UI of any kind; no subscription-mode code (the care-plan deliverable here is a *runbook*, `[PROVISIONAL — Taylor]` until the $100/mo sign-off and billing-start ruling land); no rebuilt invoicing (the balance rides `server/services/agora-invoicing.ts` / `invoices.ts` — confirm and document the pointer, change nothing).
- **Ground truth:** `createDepositCheckout`'s session/basket/settlement shape — the extra-page session is its sibling with quantity, reusing the price-drift assertion and the wholesale-replacement basket rule.

**Rulings this slice makes (labelled, logged):**

- **The extra-page session is minted by `scripts/` CLI taking an engagement id and a page count**, printing the Checkout URL and nothing else; Taylor delivers it personally. Success/cancel URLs land on the engagement's entry route (the client sees their own flow, not a dead end). Logged.
- **Quantity rides Stripe's native `quantity` on the one `extra_page` line** — no per-page rows, no arithmetic outside Stripe. Logged.
- **Settlement marks the basket rows paid without touching `paidAt`** (that column means the build's deposit; an extra-page payment must not make an unpaid engagement read as paid) — the settlement path branches on what the basket contains. Logged.

## Behavior & states

**No client surface.** Operator flow: `yarn tsx scripts/create-extra-page-checkout.ts <engagementId> <count>` → URL printed → Taylor texts/emails it after the conversation → client pays on hosted Checkout → webhook settles the rows → the engagement's record shows the purchase.

**States (exhaustive):** session created (unpaid rows in the basket) · paid (rows stamped) · abandoned (Stripe expires it; unpaid rows replaced wholesale on the next mint — existing rule) · replayed webhook (no-op).

**Failure / edge states (named):** engagement id wrong → the script fails loudly before Stripe is touched; count of zero or negative → refused; price drift on `extra_page` → fail closed (the existing assertion); a client who already paid the deposit paying extra pages → both purchases coexist on the basket with distinct paid stamps.

## Non-negotiables (this slice)

- **No client-reachable path creates any of these charges.** The scripts require env credentials; nothing is routed, actioned, or linked from the app.
- **One money path.** The extra-page session reuses the deposit service's guts; a second session-creation implementation is a defect.
- **`paidAt` keeps exactly one meaning.**
- **Fulfillment stays webhook-only and idempotent.**

## Data

**Schema changes: none.**

**Tables:** `engagements` (read via id — operator context, the M-INT-5 class of exception, documented) · `engagement_products` (basket rows) · `products` (`extra_page` read).

**Placement:** `scripts/create-extra-page-checkout.ts` · `server/services/deposit.ts` (extract/generalize the session+basket core for reuse — the same seam PORT-3 touched, extended not forked) · `docs/websites/RUNBOOK-post-intake-charges.md` (the care-plan activation runbook + the balance pointer to the invoicing rail).

**Validators:** script-side input checks (id shape, count bounds 1–20 `[PROVISIONAL]`).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — Stripe test mode)

1. The script mints a session for 3 extra pages: Checkout shows `extra_page × 3` at $150 each; basket holds unpaid rows at the struck amount.
2. Payment settles the rows exactly once; a replayed webhook no-ops; `paidAt` on the engagement is untouched by an extra-page-only payment (seed a waived engagement to prove it).
3. Re-minting before payment replaces the unpaid rows wholesale (no doubled basket).
4. Bad id and zero count fail before any Stripe call.
5. The runbook exists, names the care-plan steps against test mode as walked once, carries its `[PROVISIONAL]` markers, and points balance collection at the existing invoicing rail with file references.
6. Negative: grep confirms no route, action, or component references the script's capability; the Durable and showcase checkout flows are unchanged (PORT-3's criteria 3–5 re-run green).
7. `yarn build`, `npx tsc --noEmit`, `yarn lint` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The settlement branch (deposit-bearing basket vs not) is the delicate cut — the existing `fulfillDeposit` conflates "basket settled" with "deposit paid" today; separating the stamp from the build-line detection is small but belongs in the same guarded-UPDATE discipline (M-INT-15).
- `scripts/_env.ts` is the established env-collapse for scripts (M-INT-22); reuse it.
- Metadata on the session should say what it is (`charge_kind: extra_pages`, count) — the audit trail is half the point.

## Dev's call

Script argument parsing · runbook formatting · the count bound.

## Out of scope

- **Any client-facing charge surface** — deliberately never. **Subscription-mode checkout** — a later slice if Taylor's care-plan rulings demand it. **The admin build** — `docs/intake/ADMIN-HANDOFF.md`'s successor scope. **Invoicing changes** — the existing rail owns the balance.

## Depends on

- **PORT-3** — the generalized session/basket/settlement seam and the showcase catalogue. Complete in `PROGRESS.md`.

## Recommended execution

**Opus/Fable-class.** Small surface, money semantics: the `paidAt`-meaning split is exactly the kind of edge a cheaper model flattens into a paid-looking unpaid engagement.

---

### Kickoff (paste into the session)

> Build **PORT-9 — Post-intake charges** (attached spec). **No client-reachable charge path; one money path reused; `paidAt` keeps one meaning; webhook-only, idempotent.**
> Attach/read first, in order: this spec · `specs/README.md` · `../PORTFOLIO-INTAKE-TECH-SCOPE.md` §6, §10 · `PORT-3` (the seam — reuse, don't fork) · `server/services/deposit.ts` · `docs/intake/specs/TECHNICAL-DECISIONS.md` M-INT-5/15/22 · this folder's logs.
> Close in three places. Run `yarn build` + `npx tsc --noEmit` + `yarn lint`.
