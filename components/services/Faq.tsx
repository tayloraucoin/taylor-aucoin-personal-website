import SectionLabel from "@/components/ui/SectionLabel";
import { faq } from "@/content/services";

/**
 * SVC-10. Native <details>/<summary> — no JS, keyboard-accessible for free,
 * and the global :focus-visible ring applies. Open/close is instant, which
 * is also the correct prefers-reduced-motion behavior; nothing animates, so
 * nothing needs to be frozen.
 */
export default function Faq() {
  return (
    <section className="mt-16">
      <SectionLabel>FAQ</SectionLabel>
      <div className="mt-2">
        {faq.map((item) => (
          <details
            key={item.q}
            className="group border-b border-(--color-faint)"
          >
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-display text-[15px] font-medium tracking-[-.012em] text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-c3) [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden
                className="font-mono text-[11px] text-(--color-dim) group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden
                className="hidden font-mono text-[11px] text-(--color-dim) group-open:inline"
              >
                −
              </span>
            </summary>
            <p className="max-w-[64ch] pb-5 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
