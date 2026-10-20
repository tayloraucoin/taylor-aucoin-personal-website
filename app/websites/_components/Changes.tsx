import { changeRules, changeTiers } from "@/content/websites";
import {
  changeRulesHeading,
  changesClosing,
  changesIntro,
} from "@/content/websites-coded";
import { Section } from "./Section";

/**
 * Changes after the build: the intro, the three tiers as a priced row list,
 * the three rules, the closing line. The care plan's absent-row marker is not
 * rendered (D-SITE-212). `#changes` is linked from a client site's final review.
 */
export function Changes() {
  return (
    <Section id="changes" heading="Changes after the build">
      <p className="mt-6 max-w-[640px] text-(length:--text-body) leading-[1.7] text-(--color-body)">
        {changesIntro}
      </p>

      <dl className="mt-8 border-t border-(--color-line-soft)">
        {changeTiers.map((tier) => (
          <div
            key={tier.label}
            className="flex items-baseline justify-between gap-6 border-b border-(--color-line-soft) py-4"
          >
            <dt>
              <span className="block text-(length:--text-body) text-(--color-ink)">
                {tier.label}
              </span>
              <span className="mt-1 block text-(length:--text-meta) leading-[1.6] text-(--color-dim) md:text-(length:--text-small)">
                {tier.note}
              </span>
            </dt>
            <dd className="m-0 shrink-0 text-(length:--text-body) font-medium text-(--color-ink)">
              {tier.price}
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-12 font-display text-(length:--text-h4) leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
        {changeRulesHeading}
      </h3>
      <ul className="mt-5 max-w-[760px] space-y-5">
        {changeRules.map((rule) => (
          <li
            key={rule}
            className="grid grid-cols-[28px_1fr] text-(length:--text-body) leading-[1.65] text-(--color-body) md:grid-cols-[40px_1fr]"
          >
            <span
              aria-hidden
              className="mt-[0.7em] block size-1 bg-(--color-dim)"
            />
            {rule}
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-[620px] text-(length:--text-meta) leading-[1.75] text-(--color-dim)">
        {changesClosing}
      </p>
    </Section>
  );
}
