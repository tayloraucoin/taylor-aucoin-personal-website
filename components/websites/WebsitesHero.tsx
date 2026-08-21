import Link from "next/link";
import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { hero, heroStats } from "@/content/websites";
import { cleanCoast } from "@/content/websites-clean-coast";
import { intakeRoutes } from "@/lib/routes";
import { AGORA, BOOKING_URL } from "@/lib/config";

/**
 * The h1 is plain, not clever. A metaphor in the largest type on the page
 * costs comprehension the buyer doesn't have to spend — they arrived from a
 * phone call, on a phone, with about forty seconds. The voice lives in the
 * sub, which is short enough to actually get read.
 *
 * The fact row sits ABOVE the CTAs and is deliberately quieter than the
 * `Signal` stat grid: it answers the three questions, then the button is
 * right there and stays the brightest thing on screen (invariant 2).
 *
 * The primary CTA starts the questionnaire, not a call. The sales motion is a
 * phone call, then this URL — so by the time someone is reading this they have
 * already been sold, and the page's job is to not stand between them and
 * starting. Booking a call stays as the ghost, for the ones who want to talk
 * more first.
 *
 * The line under the buttons is load-bearing, not a disclaimer. A gold button
 * labelled "Start" next to a published $1,200 reads as a payment button to
 * someone non-technical, and it isn't one: the next screen is six questions
 * and no charge. Saying so is what makes the button safe to press.
 */
export default function WebsitesHero() {
  return (
    <section className="relative">
      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>{hero.eyebrow}</span>
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
        {hero.title}
      </h1>

      <p className="mb-8 max-w-[48ch] text-base font-light leading-[1.66] text-(--color-body)">
        {hero.sub}
      </p>

      {/* Label left / value right on a phone; value stacked over label on
          desktop via flex-col-reverse, which keeps <dt> before <dd> in the
          DOM without reaching for order utilities. */}
      <dl className="mb-9 grid grid-cols-1 border-y border-(--color-faint) md:grid-cols-3">
        {heroStats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex items-baseline justify-between gap-4 py-3.5 md:flex-col-reverse md:items-start md:gap-1.5 md:py-4 ${
              i > 0
                ? "border-t border-(--color-faint) md:border-t-0 md:border-l md:pl-6"
                : ""
            }`}
          >
            <dt className="font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
              {stat.label}
            </dt>
            <dd className="m-0 font-display text-[22px] font-medium tracking-[-.02em] text-(--color-c2) md:text-[26px]">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <GradientButton href={intakeRoutes.start}>Start your site →</GradientButton>
        <GhostButton href={BOOKING_URL}>Book a call first</GhostButton>
      </div>

      {/* Body type, sentence case, NOT the mono label register. This is the
          one line on the page written for the least confident reader, and
          wide-tracked uppercase at 10px is work to read. Mono earns its place
          on labels and metadata; a sentence that has to be absorbed is neither.

          It said "six questions first" once, which is true of the start form
          and false of the thing it leads to. Undersizing a real interview to
          make a button easier to press buys the click and loses the trust
          twenty minutes later. It states what is safe (no charge yet) without
          making a claim about length. */}
      <p className="mt-5 max-w-[52ch] text-[13.5px] font-light leading-[1.64] text-(--color-dim)">
        A few details to set things up, then the questionnaire. Nothing is
        charged until you&apos;ve seen what you&apos;re starting. Rather talk it
        through first?{" "}
        <a
          href={AGORA.phoneHref}
          className="whitespace-nowrap text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {AGORA.phone}
        </a>
      </p>

      {/* Only offered once there is something to anchor to. */}
      {cleanCoast.published ? (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
          Or see a site I built ·{" "}
          <Link
            href="#clean-coast"
            className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
          >
            {cleanCoast.business} →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
