import {
  teachingCount,
  teachingLedger,
  teachingParagraph,
} from "@/content/about";
import { SectionHeading } from "./Row";

/**
 * Teaching `#teaching`: its h2 takes focus when a link lands here, and the
 * section clears the header (SITE-18 reuses the pattern).
 */
export function Teaching() {
  return (
    <section
      id="teaching"
      aria-labelledby="teaching-heading"
      className="mt-16 scroll-mt-24 md:mt-24"
    >
      <SectionHeading id="teaching-heading" tabIndex={-1} aside={teachingCount}>
        Teaching
      </SectionHeading>
      <ul className="mt-8 grid gap-0 md:grid-cols-4 md:gap-8">
        {teachingLedger.map((c) => (
          <li
            key={c.name}
            className="border-b border-(--color-line-soft) py-4 md:border-b-0 md:py-0"
          >
            <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
              {c.name}
            </h3>
            <p className="mt-1 text-(length:--text-meta) text-(--color-dim)">
              {c.line}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-[610px] text-(length:--text-body) leading-[1.6] text-(--color-body)">
        {teachingParagraph}
      </p>
    </section>
  );
}
