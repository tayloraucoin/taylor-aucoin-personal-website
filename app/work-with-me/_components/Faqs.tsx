import { faq } from "@/content/services";
import { H2 } from "./shared";

/** Every answer open: no accordion, no toggle (C-SITE-services-7). */
export function Faqs() {
  return (
    <section aria-labelledby="faq-heading" className="mt-16 md:mt-24">
      <H2 id="faq-heading">FAQ</H2>
      <dl>
        {faq.map((f) => (
          <div
            key={f.q}
            className="grid gap-x-8 gap-y-2 border-b border-(--color-line-soft) py-6 md:grid-cols-[360px_1fr]"
          >
            <dt>
              <h3 className="text-(length:--text-body) leading-[1.4] font-medium text-(--color-ink)">
                {f.q}
              </h3>
            </dt>
            <dd className="max-w-[640px] text-(length:--text-small) leading-[1.6] text-(--color-body)">
              {f.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
