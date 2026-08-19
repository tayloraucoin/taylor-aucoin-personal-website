import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { closing } from "@/content/websites";
import { intakeRoutes } from "@/lib/routes";
import { AGORA, BOOKING_URL, SITE } from "@/lib/config";

/**
 * One line, one button. The button is the brightest thing on screen at this
 * scroll depth and nothing here competes with it.
 */
export default function WebsitesClose() {
  return (
    <section className="mt-16 border-t border-(--color-faint) pt-12">
      <p className="mb-7 max-w-[48ch] font-display text-[clamp(20px,2.6vw,28px)] font-medium leading-[1.3] tracking-[-.02em] text-(--color-ink)">
        {closing.line}
      </p>

      <div className="flex flex-wrap gap-3">
        <GradientButton href={intakeRoutes.start}>Start your site →</GradientButton>
        <GhostButton href={BOOKING_URL}>Book a call first</GhostButton>
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase leading-[2] tracking-[.18em] text-(--color-dim)">
        <a
          href={AGORA.phoneHref}
          className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {AGORA.phone}
        </a>
        {" · "}
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {SITE.email}
        </a>
        <br />
        {closing.entity}
      </p>
    </section>
  );
}
