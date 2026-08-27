import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { closing } from "@/content/websites";
import { intakeRoutes } from "@/lib/routes";
import { AGORA, BOOKING_URL, SITE } from "@/lib/config";

/**
 * One line, one button. The button is the brightest thing on screen at this
 * scroll depth and nothing here competes with it.
 *
 * Defaults are the platform track's, so its call site stays a bare
 * `<WebsitesClose />`. "Ready?" opens both pages' closing lines; it is Taylor's
 * word and it stays.
 */
export default function WebsitesClose({
  line = closing.line,
  entity = closing.entity,
  ctaHref = intakeRoutes.start,
  ctaLabel = "Start your site →",
  secondary = { href: BOOKING_URL, label: "Book a call first" },
}: {
  line?: string;
  entity?: string;
  ctaHref?: string;
  ctaLabel?: string;
  secondary?: { href: string; label: string } | null;
} = {}) {
  return (
    <section className="mt-16 border-t border-(--color-faint) pt-12">
      <p className="mb-7 max-w-[48ch] font-display text-[clamp(20px,2.6vw,28px)] font-medium leading-[1.3] tracking-[-.02em] text-(--color-ink)">
        {line}
      </p>

      <div className="flex flex-wrap gap-3">
        <GradientButton href={ctaHref}>{ctaLabel}</GradientButton>
        {secondary ? (
          <GhostButton href={secondary.href}>{secondary.label}</GhostButton>
        ) : null}
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
        {entity}
      </p>
    </section>
  );
}
