import { GradientButton } from "@/components/ui/GradientButton";
import SectionLabel from "@/components/ui/SectionLabel";
import { replyLine, steps } from "@/content/services";
import { BOOKING_URL } from "@/lib/config";

/**
 * SVC-08. Three steps with gold mono indices — the Selected Work index
 * register. Static; no cards.
 */
export default function HowToStart() {
  return (
    <section className="mt-16">
      <SectionLabel>How to start</SectionLabel>
      <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="font-mono text-[10px] tracking-[.2em] text-(--color-c2)">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-[18px] font-medium tracking-[-.012em] text-(--color-ink)">
              {s.title}
            </h3>
            <p className="mt-1.5 max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        {replyLine}
      </p>
      {/* The "okay, how do I begin" moment gets its own button — the closing
          CTA is a full FAQ away and the two never share a viewport. */}
      <div className="mt-7">
        <GradientButton href={BOOKING_URL}>Book a 30-min call →</GradientButton>
      </div>
    </section>
  );
}
