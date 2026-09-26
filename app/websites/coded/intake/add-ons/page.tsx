import { z } from "zod";
import { SITE } from "@/lib/config";
import { parseExtrasQuery } from "@/lib/extras/cart";
import { formatMoney } from "@/lib/intake/money";
import { loadExtrasPage } from "@/server/services/extras";
import { ExtrasCheckout } from "../_components/extras-checkout";
import { Eyebrow } from "../../../intake/_components/eyebrow";
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
        <Eyebrow>Agora · Website build</Eyebrow>
        <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
          Paid. Thank you.
        </h1>
        <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
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
              <dd className="m-0 shrink-0 font-mono text-[12px] tracking-[.06em] text-(--color-ink)">
                {formatMoney(line.unitCents * line.quantity, page.currency)}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-3.5">
            <dt className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
              Total
            </dt>
            <dd className="m-0 font-body text-[16px] text-(--color-ink)">
              {formatMoney(total, page.currency)}
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                + GST
              </span>
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
      <Eyebrow>Agora · Website build</Eyebrow>
      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        Add to {page.businessName}&apos;s site.
      </h1>
      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
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

      <div className="mt-5 space-y-1.5 font-mono text-[10px] uppercase leading-[1.7] tracking-[.18em] text-(--color-dim)">
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
      <Eyebrow>Agora · Website build</Eyebrow>
      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        This link isn&apos;t working.
      </h1>
      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        The address may be incomplete. Send Taylor a note and he&apos;ll send it
        again.
      </p>
      <p className="mt-8">
        <a
          href={`mailto:${SITE.email}`}
          className="font-mono text-[11px] uppercase tracking-[.10em] text-(--color-c2) underline underline-offset-4 hover:text-(--color-c3)"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
