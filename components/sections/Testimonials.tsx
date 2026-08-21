import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { visibleTestimonials } from "@/content/testimonials";
import { HOME_TESTIMONIALS } from "@/lib/config";

/**
 * TST-03 — the compact strip, shared by home (below Selected Work) and the
 * services proof strip. Three cards, curated by HOME_TESTIMONIALS in
 * lib/config.ts (see the rationale there); the full two-sided story lives at
 * /testimonials. Curated slugs that are missing or unapproved are skipped and
 * the slots fill from the remaining visible pool, so the strip never breaks
 * when an approval is toggled.
 *
 * Renders nothing when no testimonial is visible (nothing approved and the
 * preview flag off) — no gap, no placeholder ships.
 */
export default function Testimonials() {
  const visible = visibleTestimonials();
  if (visible.length === 0) return null;

  const curatedSlugs: readonly string[] = HOME_TESTIMONIALS;
  const curated = curatedSlugs
    .map((slug) => visible.find((t) => t.slug === slug))
    .filter((t) => t !== undefined);
  const rest = visible.filter((t) => !curated.includes(t));
  const ordered = [...curated, ...rest].slice(0, 3);

  return (
    <section className="mt-16">
      <SectionLabel>Testimonials</SectionLabel>
      <div className="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        {ordered.map((t) => (
          <TestimonialCard key={t.slug} t={t} />
        ))}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase leading-[2] tracking-[.18em] text-(--color-body) md:text-[10px] md:text-(--color-dim)">
        From the people I worked with, and the engineers I led ·{" "}
        <Link
          href="/testimonials"
          className="whitespace-nowrap text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          All testimonials →
        </Link>
      </p>
    </section>
  );
}
