import { formatMoney } from "@/lib/intake/money";
import type { Engagement } from "@/server/services/engagement";
import type { SellableProduct } from "@/server/services/products";
import { DepositCheckout, type CheckoutAddonView } from "./deposit-checkout";

/**
 * P0 — Confirm & pay (UX spec §3).
 *
 * The coldest screen in the flow: money, on a phone, from someone who has
 * probably been burned by a web guy before. It answers the three questions
 * they are actually asking — is this the person I spoke to, is this the number
 * we agreed, is this safe — and asks nothing else.
 *
 * There is no countdown, no "offer expires", no scarcity of any kind. The sale
 * already happened on the call; manufactured urgency next to a payment button
 * would be borrowing against the only thing this screen has, which is
 * confidence.
 *
 * The statement line names the site they are standing on, not the legal
 * entity behind it. A client who spoke to Taylor and paid on tayloraucoin.com
 * will recognise TAYLORAUCOIN.COM on their statement; AGORA NETWORK TECH is a
 * charge they do not recognise, which is a chargeback rather than a question.
 * If the descriptor in the Stripe Dashboard ever changes, this line changes
 * with it — a promise about a statement has to be literally true.
 */
export function DepositGate({
  engagement,
  token,
  canceled,
  deposit,
  addons,
  promoCode,
  isAdminTest = false,
}: {
  engagement: Engagement;
  token: string;
  canceled: boolean;
  /** From `?promo=` on the entry URL, prefilled and auto-applied on P0. */
  promoCode?: string;
  /** From `?admin_test_payment=1` — server swaps in the test price when env allows. */
  isAdminTest?: boolean;
  /**
   * The catalogue's deposit row. Display comes from the row; the charge is
   * verified against Stripe at session creation, which is where the
   * screen-cannot-misquote guarantee now lives.
   */
  deposit: SellableProduct;
  /** Optional add-ons offered at checkout, in display order. */
  addons: SellableProduct[];
}) {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;

  const amount = formatMoney(deposit.priceCents, engagement.currency);

  const addonViews: CheckoutAddonView[] = addons.map((a) => ({
    key: a.key,
    name: a.name,
    description: a.description,
    amountCents: a.priceCents,
  }));

  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        {engagement.businessName}
      </h1>

      <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
        Hi {firstName} — here&apos;s everything from our call, ready to go.
      </p>

      <div className="mt-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-6">
        {engagement.projectSummary ? (
          <p className="text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
            {engagement.projectSummary}
          </p>
        ) : null}

        <div
          className={
            engagement.projectSummary
              ? "mt-6 border-t border-(--color-faint) pt-6"
              : ""
          }
        >
          <p className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
            Deposit to start
          </p>
          {/* Solid gold display type — the site's as-built stat-number
              treatment. See DEVIATIONS 2026-08-18. */}
          <p className="mt-2 font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink) tabular-nums">
            {amount}
          </p>
        </div>
      </div>

      {canceled ? (
        <p className="mt-6 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
          No charge was made. Whenever you&apos;re ready.
        </p>
      ) : null}

      {/* Add-ons, total, the terms checkbox, and the pay button. The
          agreement row sits immediately above the button it modifies:
          "by paying, you agree" has to be read before the tap it describes,
          or it isn't notice. */}
      <DepositCheckout
        token={token}
        depositCents={deposit.priceCents}
        currency={engagement.currency}
        addons={addonViews}
        initialPromoCode={promoCode}
        isAdminTest={isAdminTest}
      />

      <div className="mt-5 space-y-1.5 text-meta leading-[1.55] text-(--color-dim)">
        <p>Payment handled by Stripe · Apple Pay / Google Pay / card</p>
        <p>Shows as TAYLORAUCOIN.COM on your statement</p>
        <p>Receipt emailed automatically</p>
      </div>

      {/* D-INT-10, ruled 2026-08-21: refundable in full until the build
          starts; earned once it does. Terms §5 is the binding form of this
          sentence — the two must always agree. */}
      <p className="mt-4 max-w-[48ch] text-meta leading-[1.55] text-(--color-dim)">
        Change your mind before I start building? The deposit comes back in full
        — just ask.
      </p>

      <p className="mt-8 max-w-[48ch] border-t border-(--color-faint) pt-5 text-meta leading-[1.55] text-(--color-dim)">
        Right after this you&apos;ll get a short questionnaire — about 20
        minutes, skip anything you&apos;re not sure about.
      </p>
    </div>
  );
}
