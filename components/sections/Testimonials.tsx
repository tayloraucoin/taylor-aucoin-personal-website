import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { visibleTestimonials } from "@/content/testimonials";

/**
 * TST-03 — the compact strip, shared by home (below Selected Work) and the
 * services proof strip. Up to three cards, employer-side ("worked-for")
 * leading, then the full two-sided story lives at /testimonials.
 *
 * Renders nothing when no testimonial is visible (nothing approved and the
 * preview flag off) — no gap, no placeholder ships.
 */
export default function Testimonials() {
  const visible = visibleTestimonials();
  if (visible.length === 0) return null;

  const ordered = [
    ...visible.filter((t) => t.relationship === "worked-for"),
    ...visible.filter((t) => t.relationship === "led"),
  ].slice(0, 3);

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
