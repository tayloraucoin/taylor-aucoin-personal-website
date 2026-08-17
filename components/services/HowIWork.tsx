import SectionLabel from "@/components/ui/SectionLabel";
import { howIWork, whatImNot } from "@/content/services";

/**
 * SVC-06 + SVC-07. Each principle is a hairline-divided row: gold mono lead
 * phrase, plain body beside it — the inscription register, distinct from
 * every card grid on the page. Static content; nothing gates the field.
 */
export default function HowIWork() {
  return (
    <section className="mt-16">
      <SectionLabel>How I work</SectionLabel>

      <div className="mt-2">
        {howIWork.map((item) => (
          <div
            key={item.lead}
            className="grid grid-cols-1 gap-x-8 gap-y-1.5 border-b border-(--color-faint) py-5 md:grid-cols-[240px_1fr] md:items-baseline"
          >
            <span className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
              {item.lead}
            </span>
            <p className="max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 border-l border-(--color-faint) pl-5">
        {whatImNot.map((line) => (
          <p
            key={line}
            className="text-[15px] font-light leading-[2] text-(--color-dim)"
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
