import LabelRows from "@/components/ui/LabelRows";
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
        <LabelRows rows={howIWork.map((i) => ({ label: i.lead, body: i.body }))} />
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
