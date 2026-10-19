import type { Testimonial } from "@/content/testimonials";
import { Portrait } from "./Portrait";

/**
 * A case study's testimonial (D-SITE-84): the full card without its project
 * link, which would point at itself, with a short span at Quote 20px (18px at
 * 390). The span is the testimonial's `caseStudySpan`, never home's or
 * /about's.
 */
export function CaseStudyTestimonial({
  t,
  span,
}: {
  t: Testimonial;
  span: string;
}) {
  return (
    <figure className="mt-8 grid gap-6 rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-6 md:grid-cols-[240px_1fr] md:gap-x-8 md:p-8">
      <figcaption>
        <Portrait name={t.name} src={t.avatar} className="mb-3" />
        <span className="block text-(length:--text-small) font-medium text-(--color-ink)">
          {t.name}
        </span>
        <span className="mt-0.5 block text-(length:--text-meta) text-(--color-dim)">
          {t.title}
        </span>
        <span className="mt-3 block text-(length:--text-meta) text-(--color-dim)">
          {t.relationshipLine}
        </span>
      </figcaption>
      <blockquote className="max-w-[54ch] text-[18px] leading-[1.55] text-(--color-ink) md:text-[20px]">
        <p>“{span}”</p>
      </blockquote>
    </figure>
  );
}
