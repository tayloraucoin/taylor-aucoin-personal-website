import { hero, heroNote } from "@/content/websites-coded";
import { StartLink } from "./StartLink";

/**
 * The coded page's hero, forked from `WebsitesHero` so the platform page keeps
 * its own (D-SITE-209). Display h1, Lede sub, the one primary button with the
 * note beside it; no eyebrow, stats, call or case link (D-SITE-208).
 */
export function CodedHero() {
  return (
    <section aria-labelledby="websites-title">
      <h1
        id="websites-title"
        className="font-display text-[clamp(44px,6.4vw,76px)] leading-[1.02] font-semibold tracking-(--tracking-display) text-(--color-ink)"
      >
        {hero.title}
      </h1>
      <p className="mt-6 max-w-[56ch] text-(length:--text-body) leading-[1.65] text-(--color-body) md:text-(length:--text-lede)">
        {hero.sub}
      </p>
      <div className="mt-8 flex flex-col gap-4 md:mt-10 md:flex-row md:items-center md:gap-6">
        <StartLink />
        <p className="max-w-[40ch] text-(length:--text-meta) leading-[1.55] text-(--color-dim)">
          {heroNote}
        </p>
      </div>
    </section>
  );
}
