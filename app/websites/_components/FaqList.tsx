import { faq } from "@/content/websites-coded";
import { Section } from "./Section";

/**
 * Questions: native `<details>`, 880 wide, "+"/"−" hidden from the name, the
 * first item open at load (D-SITE-207). Forked from `components/ui/Faq.tsx`,
 * which `/websites/platform` keeps as it was (D-SITE-209).
 */
export function FaqList() {
  return (
    <Section id="questions" heading="Questions">
      <div className="mt-8 max-w-[880px] border-t border-(--color-line-soft)">
        {faq.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group border-b border-(--color-line-soft)"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 text-(length:--text-body) text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden
                className="shrink-0 text-(--color-dim) group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden
                className="hidden shrink-0 text-(--color-dim) group-open:inline"
              >
                −
              </span>
            </summary>
            <p className="max-w-[680px] pb-6 text-(length:--text-body) leading-[1.65] text-(--color-body)">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
