import {
  addOns,
  addOnsLabel,
  firstLook,
  pricing,
} from "@/content/websites-coded";
import { LABEL, LABEL_ROW, Section, TEXT_LINK } from "./Section";
import { StartLink } from "./StartLink";

/**
 * What it costs: the price ledger, then the add-ons as a priced row list, then
 * the primary button. Every amount comes from `content/websites-coded.ts`
 * (C-SITE-websites-coded-4); this file holds none. `#add-ons` is linked from
 * outside the page (a client's final review).
 */
export function PriceLedger() {
  const terms = [pricing.terms, ...pricing.options].join(" ");
  const value = "text-(length:--text-body) leading-[1.65] text-(--color-body)";

  return (
    <Section id="cost" heading="What it costs">
      <dl className="mt-8 border-t border-(--color-line-soft)">
        <div className={LABEL_ROW}>
          <dt className={`${LABEL} md:pt-5`}>{pricing.label}</dt>
          <dd className="m-0">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-display text-(length:--text-stat) leading-none font-semibold tracking-(--tracking-display) text-(--color-ink)">
                {pricing.amount}
              </span>
              <span className="text-(length:--text-body) text-(--color-body)">
                {pricing.currency}
              </span>
            </p>
            <p className={`mt-3 ${value}`}>{terms}</p>
          </dd>
        </div>
        <div className={LABEL_ROW}>
          <dt className={`${LABEL} md:pt-1`}>{firstLook.label}</dt>
          <dd className={`m-0 ${value}`}>{firstLook.value}</dd>
        </div>
        {pricing.rows.map((row) => (
          <div key={row.label} className={LABEL_ROW}>
            <dt className={`${LABEL} md:pt-1`}>{row.label}</dt>
            <dd className={`m-0 ${value}`}>
              {row.value}
              {row.link && (
                <span className="mt-2 block">
                  <a
                    href={row.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TEXT_LINK} text-(length:--text-small)`}
                  >
                    {row.link.label}
                  </a>
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div id="add-ons" className="mt-12 scroll-mt-8">
        <p className={LABEL}>{addOnsLabel}</p>
        <dl className="mt-4 border-t border-(--color-line-soft)">
          {addOns.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-6 border-b border-(--color-line-soft) py-4"
            >
              <dt className="max-w-[880px] text-(length:--text-small) leading-[1.65] text-(--color-body) md:text-(length:--text-body)">
                {row.label}
              </dt>
              <dd className="m-0 shrink-0 text-right text-(length:--text-small) font-medium text-(--color-ink) md:text-(length:--text-body)">
                {row.price}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-12">
        <StartLink />
      </div>
    </Section>
  );
}
