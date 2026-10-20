import Image from "next/image";
import { locationLine, story } from "@/content/about";
import { PHOTO, SITE } from "@/lib/config";

/**
 * Intro (D-SITE-67, 69, 172): the page's one eyebrow, the h1, the location
 * line and the story in a 610 column; the headshot 280 right at 1440, first
 * and smaller at 390. The headshot file is home's.
 */
export function AboutIntro() {
  return (
    <section
      aria-label="Intro"
      className="grid gap-8 md:grid-cols-[1fr_280px] md:gap-16"
    >
      {PHOTO && (
        <Image
          src={PHOTO}
          alt={SITE.name}
          width={560}
          height={700}
          priority
          className="h-auto w-[200px] rounded-(--radius) border border-(--color-line-soft) object-cover md:order-last md:w-[280px]"
        />
      )}
      <div>
        <p className="flex items-center gap-3.5 text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase">
          <span aria-hidden className="h-px w-6 bg-(--color-rule)" />
          The person behind the work
        </p>
        <h1 className="mt-5 font-display text-[length:clamp(48px,8vw,var(--text-display))] leading-[1.02] font-medium tracking-(--tracking-display) text-(--color-ink)">
          About
        </h1>
        <p className="mt-3 text-(length:--text-meta) text-(--color-dim)">
          {locationLine}
        </p>
        <div className="mt-8 max-w-[610px] space-y-5">
          {story.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-(length:--text-lede) leading-[1.6] text-(--color-ink)"
                  : "text-(length:--text-body) leading-[1.6] text-(--color-body)"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
