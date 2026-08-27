import GradientRing from "@/components/ui/GradientRing";
import SectionLabel from "@/components/ui/SectionLabel";
import {
  addOns as defaultAddOns,
  ownership as defaultOwnership,
  pricing as defaultPricing,
  type PricedRow,
} from "@/content/websites";

/**
 * The page's ONE GradientRing. Same reasoning as the intake spec's single-ring
 * rule: the ring is the site's signature, and rationing it to the one thing
 * every visitor is scrolling to find gives that thing gravity without
 * decorating the page. Every other card here is flat --color-spec-bg, on both
 * tracks, and neither page gets a second ring.
 *
 * The amount takes the gradient-on-numbers treatment the design system
 * sanctions for stat numbers. That is gradient AS the glyph, never behind
 * body copy — invariant 1 is intact.
 *
 * Two shape differences between the tracks, both driven by content:
 *
 *   `options` — the coded track has two ways to pay and the platform track has
 *   one. A second payment shape is a real decision the buyer makes at this
 *   card, so it renders as a short list under the terms line rather than being
 *   crushed into one sentence. Absent on the platform track, which renders as
 *   it always has.
 *
 *   `ownership` — on the platform track this passage sits beside the card, and
 *   the two-column grid exists for it. On the coded track ownership is promoted
 *   to a section of its own, because there it is the whole differentiator, so
 *   this component takes null and the card stands alone at the same width it
 *   has beside prose. Letting the card stretch to full measure when the column
 *   next to it disappears would make the price the loudest object on a page
 *   whose argument is craft.
 */

type PricingRow = {
  label: string;
  value: string;
  link?: { label: string; href: string };
};

type PricingContent = {
  label: string;
  amount: string;
  currency: string;
  terms: string;
  options?: readonly string[];
  rows: readonly PricingRow[];
};

type Ownership = {
  before: string;
  emphasis: string;
  after: string;
};

export default function Pricing({
  pricing = defaultPricing,
  addOns = defaultAddOns,
  ownership = defaultOwnership,
}: {
  pricing?: PricingContent;
  addOns?: readonly PricedRow[];
  ownership?: Ownership | null;
} = {}) {
  return (
    <section className="mt-16">
      <SectionLabel>What it costs</SectionLabel>

      <div
        className={
          ownership
            ? "mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-10"
            : "mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)]"
        }
      >
        <GradientRing className="px-6 pb-6 pt-[26px] md:px-7 md:pb-7">
          <span className="block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
            {pricing.label}
          </span>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="font-display text-[clamp(38px,6vw,50px)] font-medium leading-none tracking-[-.03em]"
              style={{
                background:
                  "linear-gradient(102deg, var(--color-c2), var(--color-c3))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {pricing.amount}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[.2em] text-(--color-dim)">
              {pricing.currency}
            </span>
          </div>

          <p className="mt-3.5 text-[15px] font-light leading-[1.6] text-(--color-ink)">
            {pricing.terms}
          </p>

          {pricing.options ? (
            <ul className="mt-3 space-y-1.5">
              {pricing.options.map((option) => (
                <li
                  key={option}
                  className="border-l border-(--color-faint) pl-3.5 text-[14px] font-light leading-[1.55] text-(--color-body)"
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-6 border-t border-(--color-faint) pt-2">
            {pricing.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-(--color-faint) py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
                  {row.label}
                </dt>
                <dd className="m-0 max-w-[30ch] text-[13.5px] font-light leading-[1.5] text-(--color-body) sm:text-right">
                  {row.value}
                  {/* The claim and its source travel together. A $0 published
                      without whose $0 it is would be this page's one soft
                      edge. */}
                  {row.link ? (
                    <>
                      {" "}
                      <a
                        href={row.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap text-(--color-c2) underline decoration-(--color-faint) underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
                      >
                        {row.link.label} →
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </GradientRing>

        {/* The platform page's thesis, and the one weight change in that
            section — it lands on the sentence that earns it.

            It sits on the flat spec surface rather than bare on the ground.
            This is the longest run of prose on that page with nothing under it,
            and low on a page that tall it lands in the field's densest zone on
            a phone. The design system's own remedy for body copy over the
            field is a near-opaque surface; the interface wins over the
            atmosphere. Flat, so the ring beside it stays the only one. */}
        {ownership ? (
          <div className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 md:p-6">
            <p className="max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
              {ownership.before}
              <span className="text-(--color-ink)">{ownership.emphasis}</span>
              {ownership.after}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-12">
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-dim)">
          Optional add-ons
        </p>
        <dl className="mt-3 border-t border-(--color-faint)">
          {addOns.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-6 border-b border-(--color-faint) py-4"
            >
              <dt className="max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
                {row.label}
              </dt>
              <dd className="m-0 shrink-0 font-mono text-[12px] tabular-nums tracking-[.08em] text-(--color-c2)">
                {row.price}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
