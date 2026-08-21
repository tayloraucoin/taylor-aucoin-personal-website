import SectionLabel from "@/components/ui/SectionLabel";
import { changeRules, changeTiers, changesClosing } from "@/content/websites";

/**
 * Its own section, not a subsection of pricing.
 *
 * This is the most senior-reading content on the page: it is someone who has
 * run this enough times to know where it goes wrong, which is exactly what
 * both audiences are trying to determine. The closing line is what converts it
 * from a set of restrictions into the reason the price is what it is.
 */
export default function Changes() {
  return (
    <section className="mt-16">
      <SectionLabel>Changes after the build</SectionLabel>

      <p className="mt-6 max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
        Your build includes one finished website, built properly from your
        questionnaire answers. It does not include unlimited tinkering. This is
        the part most people get wrong, so here it is straight.
      </p>

      <dl className="mt-7 border-t border-(--color-faint)">
        {changeTiers.map((tier) => (
          <div
            key={tier.label}
            className="flex items-baseline justify-between gap-6 border-b border-(--color-faint) py-4"
          >
            <dt>
              <span className="block text-[15px] font-light leading-[1.5] text-(--color-ink)">
                {tier.label}
              </span>
              <span className="mt-1 block max-w-[56ch] text-[13.5px] font-light leading-[1.55] text-(--color-dim)">
                {tier.note}
              </span>
            </dt>
            <dd className="m-0 shrink-0 font-mono text-[12px] tabular-nums tracking-[.08em] text-(--color-c2)">
              {tier.price}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-9 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-dim)">
        Three rules that keep this fair both ways
      </p>
      <ol className="mt-4">
        {changeRules.map((rule, i) => (
          <li
            key={rule}
            className="grid grid-cols-1 gap-x-5 gap-y-1.5 py-3 md:grid-cols-[28px_1fr] md:items-baseline"
          >
            <span className="font-mono text-[10px] tracking-[.2em] text-(--color-c2)">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
              {rule}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-[56ch] border-l border-(--color-faint) pl-5 text-[15px] font-light leading-[1.7] text-(--color-dim)">
        {changesClosing}
      </p>
    </section>
  );
}
