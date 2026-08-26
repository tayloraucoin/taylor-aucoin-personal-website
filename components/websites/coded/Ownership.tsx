import SectionLabel from "@/components/ui/SectionLabel";
import { hostingTerms, ownership } from "@/content/websites-coded";

/**
 * The coded page's thesis, and the reason it is a section here rather than a
 * paragraph beside the price card the way it is on the platform track.
 *
 * A buyer on this track arrives holding one of two anchors: a $20/month
 * template platform, or a $5,000 agency quote. This passage is the single
 * answer to both of them, because what neither anchor gives you is the thing
 * described here. That earns structural emphasis, not a column.
 *
 * `emphasis` renders in --color-ink against --color-body. It is the one weight
 * change in the section and it lands on Taylor's own sentence, which is carried
 * over from the platform page word for word. It is more literally true here: on
 * that track "you keep everything" means a platform account, and on this one it
 * means the code.
 *
 * Flat --color-spec-bg, no ring. The page's one ring is on the price card and
 * this section sits directly above it; two rings in a row would read as
 * decoration, and this section's argument is that there is nothing hidden.
 *
 * THE HOSTING QUALIFIER IS NOT OPTIONAL AND MUST NOT BE SOFTENED. Taylor's
 * ruling: he will not personally promise free hosting forever, because it is
 * not his promise to make. Free is Vercel's tier, on Vercel's terms, in the
 * client's own account. The page says so and links to the source. Anyone
 * tempted to shorten this to "hosting is free" should read
 * docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md R-7 first.
 */
export default function Ownership() {
  return (
    <section className="mt-16">
      <SectionLabel>What you actually own</SectionLabel>

      <div className="mt-6 rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 md:p-6">
        <p className="max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
          {ownership.before}
          <span className="text-(--color-ink)">{ownership.emphasis}</span>
          {ownership.after}
        </p>
      </div>

      {/* No link here. It lives on the `$0` row of the price card in the next
          section, where the claim is a number and where a sceptic goes to check
          it. The same link twice within 500px read as padding. */}
      <div className="mt-4 border-l border-(--color-faint) pl-5">
        <p className="max-w-[56ch] text-[13.5px] font-light leading-[1.64] text-(--color-dim)">
          {hostingTerms.body}
        </p>
      </div>
    </section>
  );
}
