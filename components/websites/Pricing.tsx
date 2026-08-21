import GradientRing from "@/components/ui/GradientRing";
import SectionLabel from "@/components/ui/SectionLabel";
import { addOns, ownership, pricing } from "@/content/websites";

/**
 * The page's ONE GradientRing. Same reasoning as the intake spec's single-ring
 * rule: the ring is the site's signature, and rationing it to the one thing
 * every visitor is scrolling to find gives that thing gravity without
 * decorating the page. Every other card here is flat --color-spec-bg.
 *
 * The amount takes the gradient-on-numbers treatment the design system
 * sanctions for stat numbers. That is gradient AS the glyph, never behind
 * body copy — invariant 1 is intact.
 */
export default function Pricing() {
  return (
    <section className="mt-16">
      <SectionLabel>What it costs</SectionLabel>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-10">
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
                </dd>
              </div>
            ))}
          </dl>
        </GradientRing>

        {/* The page's thesis, and the one weight change in the section — it
            lands on the sentence that earns it.

            It sits on the flat spec surface rather than bare on the ground.
            This is the longest run of prose on the page with nothing under it,
            and low on a page this tall it lands in the field's densest zone on
            a phone. The design system's own remedy for body copy over the
            field is a near-opaque surface; the interface wins over the
            atmosphere. Flat, so the ring above it stays the only one. */}
        <div className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 md:p-6">
          <p className="max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
            {ownership.before}
            <span className="text-(--color-ink)">{ownership.emphasis}</span>
            {ownership.after}
          </p>
        </div>
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
