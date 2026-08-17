import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { availability } from "@/content/services";
import { BOOKING_URL, SITE } from "@/lib/config";

/**
 * SVC-02. Same register as the home hero — mono eyebrow with gold hairline,
 * plain-ink h1, 48ch sub — sized like the /stack page h1 (a page, not the
 * front door). "Available now" carries the one gold accent in the line.
 */
export default function ServicesHero() {
  return (
    <section className="relative">
      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>{SITE.location} · Contract &amp; fractional</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      <h1 className="mb-5 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        Work with me
      </h1>

      <p className="mb-4 max-w-[48ch] text-base font-light leading-[1.66] text-(--color-body)">
        Senior/staff product engineer for contract and fractional engagements —
        remote from {SITE.location}.
      </p>

      <p className="mb-9 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        <span className="text-(--color-c2)">Available now</span>
        {" — "}
        {availability}
      </p>

      <div className="flex flex-wrap gap-3">
        <GradientButton href={BOOKING_URL}>Book a 30-min call →</GradientButton>
        <GhostButton href="/#work">Selected work</GhostButton>
      </div>
    </section>
  );
}
