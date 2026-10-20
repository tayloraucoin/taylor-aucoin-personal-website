import { z } from "zod";
import { SITE } from "@/lib/config";
import { parseExtrasQuery } from "@/lib/extras/cart";
import { formatMoney } from "@/lib/intake/money";
import { loadExtrasPage } from "@/server/services/extras";
import { ExtrasCheckout } from "../_components/extras-checkout";
import { PaymentConfirming } from "../../../intake/_components/payment-confirming";

/**
 * The add-ons page (FIN-8): one client's self-serve checkout at a static URL,
 * `?engagement=<id>` plus an optional `&add=` pre-selection. Reusable for as
 * long as their build is settled; Taylor links it once and never again.
 *
 * Every state is read from the basket, never from the query string. Stripe
 * returns with `session_id`, and the page shows that payment's rows once the
 * webhook has stamped them — the confirming screen until then, exactly the
 * pay screen's rule (a URL bought nothing). `canceled=1` adds a quiet line.
 *
 * `[COPY — draft]` throughout; Taylor's to replace.
 */
export default async function AddOnsPage({
  searchParams,
}: {
  searchParams: Promise<{
    engagement?: string;
    add?: string | string[];
    session_id?: string;
    canceled?: string;
  }>;
}) {
  const query = await searchParams;
  const engagementId = z.uuid().safeParse(query.engagement);
  if (!engagementId.success) return <Unavailable />;

  const sessionId =
    typeof query.session_id === "string" &&
    /^cs_[A-Za-z0-9_]+$/.test(query.session_id)
      ? query.session_id
      : undefined;

  const page = await loadExtrasPage({
    engagementId: engagementId.data,
    preselect: parseExtrasQuery(query.add),
    sessionId,
  });

  if (page.state === "unavailable") return <Unavailable />;
  if (page.state === "confirming") {
    return <PaymentConfirming supportEmail={SITE.email} />;
  }

  if (page.state === "paid") {
    const total = page.bought.reduce(
      (sum, line) => sum + line.unitCents * line.quantity,
      0,
    );
    return (
      <div>
        <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
          Paid. Thank you.
        </h1>
        <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
          Your invoice is on its way by email. Taylor will be in touch about
          when the work starts.
        </p>
        <dl className="mt-9 divide-y divide-(--color-faint) border-y border-(--color-faint)">
          {page.bought.map((line) => (
            <div
              key={line.key}
              className="flex items-baseline justify-between gap-4 py-3.5"
            >
              <dt className="font-body text-[16px] leading-[1.4] text-(--color-ink)">
                {line.quantity > 1
                  ? `${line.name} × ${line.quantity}`
                  : line.name}
              </dt>
              <dd className="m-0 shrink-0 text-small tabular-nums text-(--color-ink)">
                {formatMoney(line.unitCents * line.quantity, page.currency)}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-3.5">
            <dt className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
              Total
            </dt>
            <dd className="m-0 font-body text-[16px] text-(--color-ink)">
              {formatMoney(total, page.currency)}
              <span className="ml-2 text-meta text-(--color-dim)">+ GST</span>
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  // `pb-32`: the pay bar is fixed to the bottom, so the page carries its
  // clearance, the same way the intake step shell does.
  return (
    <div className="pb-32">
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        Add to {page.businessName}&apos;s site.
      </h1>
      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        Tick what you&apos;d like and pay when it looks right. Nothing is
        charged until you do, and this page is here whenever you need it.
      </p>

      <ExtrasCheckout
        engagementId={engagementId.data}
        currency={page.currency}
        rows={page.rows}
        preselected={page.preselected}
        ownedKeys={page.ownedKeys}
        canceled={query.canceled === "1"}
      />

      <div className="mt-5 space-y-1.5 text-meta leading-[1.55] text-(--color-dim)">
        <p>Payment handled by Stripe · Apple Pay / Google Pay / card</p>
        <p>Shows as TAYLORAUCOIN.COM on your statement</p>
        <p>Paid invoice emailed to you</p>
      </div>
    </div>
  );
}

/**
 * An address that cannot take a payment: malformed, unknown, or a build not
 * yet settled — one screen for all three, so it never says which.
 */
function Unavailable() {
  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        This link isn&apos;t working.
      </h1>
      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        The address may be incomplete. Send Taylor a note and he&apos;ll send it
        again.
      </p>
      <p className="mt-8">
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
