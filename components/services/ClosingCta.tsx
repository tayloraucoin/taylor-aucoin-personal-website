import { GradientButton } from "@/components/ui/GradientButton";
import { closing } from "@/content/services";
import { BOOKING_URL, SITE } from "@/lib/config";

/**
 * SVC-11. One sentence, one button. The button is the brightest thing on
 * screen at this scroll depth — nothing else here competes.
 */
export default function ClosingCta() {
  return (
    <section className="mt-16 border-t border-(--color-faint) pt-12">
      <p className="mb-7 max-w-[48ch] font-display text-[clamp(20px,2.6vw,28px)] font-medium leading-[1.3] tracking-[-.02em] text-(--color-ink)">
        {closing}
      </p>
      <GradientButton href={BOOKING_URL}>Book a 30-min call →</GradientButton>
      {/* The async door, for visitors not ready to put 30 minutes on a
          calendar. A full contact form is deliberately out of scope for now. */}
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        Not ready to book?{" "}
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {SITE.email}
        </a>
      </p>
    </section>
  );
}
