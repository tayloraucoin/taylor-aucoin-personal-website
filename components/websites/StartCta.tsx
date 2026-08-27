import { GradientButton } from "@/components/ui/GradientButton";
import { intakeRoutes } from "@/lib/routes";

/**
 * The mid-page start.
 *
 * The page is long and the "fine, let's do it" moment lands right after the
 * price, not three thousand pixels later at the close. One button, one line,
 * no section label — this is a door in a wall, not a section.
 *
 * `href` and `label` default to the platform track's questionnaire, so that
 * page's call sites are unchanged. The coded track points at a call until its
 * own questionnaire ships.
 */
export default function StartCta({
  line,
  href = intakeRoutes.start,
  label = "Start your site →",
}: {
  line: string;
  href?: string;
  label?: string;
}) {
  return (
    <section className="mt-14 flex flex-col gap-5 border-y border-(--color-faint) py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <p className="max-w-[44ch] text-[15px] font-light leading-[1.6] text-(--color-ink)">
        {line}
      </p>
      <div className="shrink-0">
        <GradientButton href={href}>{label}</GradientButton>
      </div>
    </section>
  );
}
