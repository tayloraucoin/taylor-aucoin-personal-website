import Link from "next/link";
import { workWithMe } from "@/content/home";
import { siteRoutes } from "@/lib/routes";

const LINK =
  "inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)";

/**
 * Work with me (D-SITE-57): roles, each with how it is engaged and who it
 * suits, every row a link to /work-with-me; then the link and the one line
 * to /websites.
 */
export function WorkWithMe() {
  return (
    <section aria-labelledby="wwm-heading" className="mt-16 md:mt-24">
      <h2
        id="wwm-heading"
        className="border-b border-(--color-line-soft) pb-6 font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
      >
        {workWithMe.heading}
      </h2>
      <ul>
        {workWithMe.rows.map((row) => (
          <li key={row.role} className="border-b border-(--color-line-soft)">
            <Link
              href={siteRoutes.workWithMe}
              className="grid min-h-11 gap-1 py-5 transition-colors duration-(--dur-fast) hover:bg-(--color-tint) md:grid-cols-[240px_240px_1fr] md:items-baseline md:gap-6 md:py-6"
            >
              <span className="text-(length:--text-lede) font-medium text-(--color-ink)">
                {row.role}
              </span>
              <span className="text-(length:--text-small) text-(--color-dim)">
                {row.terms}
              </span>
              <span className="text-(length:--text-body) text-(--color-body)">
                {row.bestFor}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6">
        <Link href={siteRoutes.workWithMe} className={LINK}>
          {workWithMe.link}
        </Link>
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 text-(length:--text-body) text-(--color-body)">
        <span>{workWithMe.websitesLine}</span>
        <Link href={siteRoutes.websites} className={LINK}>
          {workWithMe.websitesLink}
        </Link>
      </p>
    </section>
  );
}
