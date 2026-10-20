import { FullTestimonial } from "@/components/testimonials/FullTestimonial";
import { testimonials } from "@/content/testimonials";
import { SITE } from "@/lib/config";
import { pendingFixture } from "../_fixtures";
import { SectionHeading } from "./Row";

/** The canvas draws Bruno's relationship line shorter than his entry's own. */
const LINES: Record<string, string> = {
  bruno: "Future of Cities engagement · 2026",
};

/**
 * Testimonials `#testimonials` (D-SITE-71): one list, two subheads, every
 * approved entry in full. Never `visibleTestimonials()`: a real unapproved
 * entry must not render here whatever the preview flag says (D-SITE-199). The
 * pending card is the synthetic fixture, shown only by `?state=`.
 */
export function AboutTestimonials({ pending }: { pending: boolean }) {
  const approved = testimonials.filter((t) => t.approved);
  const groups = [
    {
      label: "People I worked for",
      items: approved.filter((t) => t.relationship === "worked-for"),
    },
    {
      label: "Engineers I led",
      items: approved.filter((t) => t.relationship === "led"),
    },
  ];
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="mt-16 scroll-mt-24 md:mt-24"
    >
      <SectionHeading id="testimonials-heading" tabIndex={-1}>
        Testimonials
      </SectionHeading>
      {groups.map((g) => (
        <div key={g.label} className="mt-10">
          <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
            {g.label}
          </h3>
          <div className="mt-5 space-y-6">
            {g.items.map((t) => (
              <FullTestimonial
                key={t.slug}
                t={t}
                relationshipLine={LINES[t.slug]}
              />
            ))}
            {pending && g.label === "Engineers I led" && (
              <FullTestimonial t={pendingFixture} pending />
            )}
          </div>
        </div>
      ))}
      <p className="mt-8">
        <a
          href={`${SITE.linkedin}details/recommendations/`}
          className="inline-flex min-h-11 items-center text-(length:--text-meta) text-(--color-dim) underline decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          Read more recommendations on LinkedIn
        </a>
      </p>
    </section>
  );
}
