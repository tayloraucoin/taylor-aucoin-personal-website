import Image from "next/image";
import { SeeTheWorkLink } from "@/app/_components/WorkTabs";
import { BookCallLink } from "@/components/site/BookCallLink";
import { buttonVariants } from "@/components/ui/Button";
import { homeHero } from "@/content/home";
import { PHOTO, SITE } from "@/lib/config";

/**
 * Home's first screen (D-SITE-50): the label with its accent rule, the name
 * as the page's one h1, the headline, the lede, then the call as the one
 * primary action and See the work as the ghost (A-17). The graded headshot
 * sits right at 1440 and leads at 390 (D-SITE-172). Plain ink throughout:
 * no gradient on the name (house law 3).
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-name"
      className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12"
    >
      {PHOTO && (
        <Image
          src={PHOTO}
          alt={SITE.name}
          width={176}
          height={210}
          priority
          sizes="(min-width: 768px) 176px, 88px"
          className="h-[105px] w-[88px] shrink-0 rounded-(--radius) border border-(--color-line-soft) object-cover md:order-last md:h-[210px] md:w-[176px]"
        />
      )}

      <div className="max-w-[620px]">
        <p className="mb-5 flex items-center gap-4 text-(length:--text-label) font-medium uppercase tracking-(--tracking-label) text-(--color-dim)">
          <span aria-hidden className="h-px w-6 shrink-0 bg-(--color-rule)" />
          {homeHero.label}
        </p>
        <h1
          id="home-name"
          className="font-display text-[clamp(48px,7vw,76px)] font-semibold leading-none tracking-(--tracking-display) text-(--color-ink)"
        >
          {homeHero.name}
        </h1>
        <p className="mt-5 font-display text-[clamp(24px,3.2vw,32px)] font-medium leading-[1.15] tracking-(--tracking-h3) text-(--color-ink)">
          {homeHero.headline}
        </p>
        <p className="mt-5 max-w-[56ch] text-(length:--text-body) leading-[1.6] text-(--color-body) md:text-(length:--text-lede)">
          {homeHero.lede}
        </p>
        <div className="mt-10 flex flex-col gap-3 md:mt-12 md:flex-row">
          <BookCallLink surface="home" placement="hero" />
          <SeeTheWorkLink className={buttonVariants({ variant: "ghost" })}>
            {homeHero.ghost}
          </SeeTheWorkLink>
        </div>
      </div>
    </section>
  );
}
