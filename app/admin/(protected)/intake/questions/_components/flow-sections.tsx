import type { ReactNode } from "react";

/**
 * One labelled band in the review scroll.
 *
 * The nine questionnaire steps were never the whole intake — the start form
 * asks real questions before a client has paid anything, and the pay screen is
 * where the upsell happens. Reviewing the steps alone hid both. Each band says
 * plainly where it sits in the flow, so the order and the payment boundary are
 * legible at a glance (Taylor, 2026-09-01).
 */
export function FlowSection({
  stage,
  title,
  note,
  children,
}: Readonly<{
  stage: string;
  title: string;
  note?: string;
  children: ReactNode;
}>) {
  return (
    <section className="border-t border-(--color-faint) py-10 first:border-t-0">
      <p className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
        {stage}
      </p>
      <h2 className="mt-2 font-(family-name:--font-display) text-[24px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        {title}
      </h2>
      {note ? (
        <p className="mt-2 max-w-[60ch] text-sm text-(--color-dim)">{note}</p>
      ) : null}
      <div className="mt-6 max-w-2xl">{children}</div>
    </section>
  );
}

/**
 * Shown where a screen cannot be rendered because its data is missing.
 *
 * Only the pay screen can hit this, and only when the product catalogue has no
 * sellable row for the track — which in practice means the catalogue has not
 * been pushed to Stripe in this environment, since `toSellable` drops any row
 * without a `stripePriceId`.
 *
 * It prints the underlying error rather than a summary of it. The thrown
 * message names the commands that fix it, and a reviewer who cannot see the
 * pay screen needs those far more than they need a tidy sentence.
 */
export function SectionUnavailable({ reason }: Readonly<{ reason: string }>) {
  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-4">
      <p className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
        Pay screen cannot render here
      </p>
      <p className="mt-3 text-sm text-(--color-body)">{reason}</p>
      <p className="mt-3 text-sm text-(--color-dim)">
        The section is not missing from the client flow — this environment has
        no sellable catalogue row to price it with. Seed the catalogue and this
        renders the real screen at real prices.
      </p>
    </div>
  );
}
