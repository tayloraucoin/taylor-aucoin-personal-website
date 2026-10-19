import Link from "next/link";
import { Clock } from "lucide-react";
import type { Testimonial } from "@/content/testimonials";

const LINK =
  "inline-flex min-h-11 items-center text-(length:--text-small) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-body) md:min-h-6";

/**
 * A testimonial in full (D-SITE-71): the who column (name, title, relationship
 * line, project) beside the whole text at Body. `pending` adds the marker atop
 * the text; the clock glyph is decoration, the words carry the meaning.
 * `relationshipLine` overrides the entry's own line where the canvas draws
 * another.
 */
export function FullTestimonial({
  t,
  pending = false,
  relationshipLine,
}: {
  t: Testimonial;
  pending?: boolean;
  relationshipLine?: string;
}) {
  return (
    <figure className="grid gap-6 rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-6 md:grid-cols-[240px_1fr] md:gap-x-8 md:p-8">
      <figcaption>
        <span className="block text-(length:--text-small) font-medium text-(--color-ink)">
          {t.name}
        </span>
        <span className="mt-0.5 block text-(length:--text-meta) text-(--color-dim)">
          {t.title}
        </span>
        <span className="mt-3 block text-(length:--text-meta) text-(--color-dim)">
          {relationshipLine ?? t.relationshipLine}
        </span>
        {t.project &&
          (t.project.href ? (
            <Link href={t.project.href} className={`${LINK} mt-1`}>
              {t.project.label}
            </Link>
          ) : (
            <span className="mt-1 block text-(length:--text-meta) text-(--color-dim)">
              {t.project.label}
            </span>
          ))}
      </figcaption>
      <div>
        {pending && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-(--radius) border border-(--color-border-strong) px-2.5 py-1 text-(length:--text-meta) text-(--color-body)">
            <Clock aria-hidden size={14} strokeWidth={1.5} />
            Pending approval
          </p>
        )}
        <blockquote className="max-w-[68ch] space-y-4 text-(length:--text-body) leading-[1.6] text-(--color-ink)">
          {t.full.map((p, i) => (
            <p key={i}>
              {i === 0 ? "“" : ""}
              {p}
              {i === t.full.length - 1 ? "”" : ""}
            </p>
          ))}
        </blockquote>
      </div>
    </figure>
  );
}
