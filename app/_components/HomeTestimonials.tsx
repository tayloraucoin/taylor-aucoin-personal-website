import Link from "next/link";
import {
  TestimonialCards,
  type DialogSeed,
} from "@/app/_components/TestimonialCards";
import { homeTestimonials } from "@/content/home";
import { visibleTestimonials } from "@/content/testimonials";
import { siteRoutes } from "@/lib/routes";

/**
 * Testimonials (D-SITE-56): the four approved quotes two by two, Dawson
 * first, no carousel, ending in a link to the full set on /about. Each card
 * opens its full quote in a dialog (feedback round 2); `seed` opens a drawn
 * dialog state.
 */
export function HomeTestimonials({ seed }: { seed?: DialogSeed } = {}) {
  const visible = visibleTestimonials();
  const cards = homeTestimonials.cards.flatMap((card) => {
    const t = visible.find((v) => v.slug === card.slug);
    return t ? [{ t, span: "span" in card ? card.span : undefined }] : [];
  });

  return (
    <section aria-labelledby="testimonials-heading" className="mt-16 md:mt-24">
      <h2
        id="testimonials-heading"
        className="border-b border-(--color-line-soft) pb-6 font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
      >
        {homeTestimonials.heading}
      </h2>
      <TestimonialCards cards={cards} seed={seed} />
      <p className="mt-8">
        <Link
          href={`${siteRoutes.about}#testimonials`}
          className="inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)"
        >
          {homeTestimonials.readAll}
        </Link>
      </p>
    </section>
  );
}
