import Link from "next/link";
import { SITE } from "@/lib/config";
import { siteRoutes } from "@/lib/routes";

const LINK =
  "text-(--color-body) transition-colors duration-(--dur-fast) hover:text-(--color-ink)";

/**
 * One footer for every chrome page, placed by the root layout outside each
 * page's main (D-SITE-130): a hairline, the domain with the address beside it
 * on the left, the site links on the right at meta size; it wraps under at
 * 390. Same 1080 column as the header.
 */
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1192px] px-[22px] pb-10 md:px-14">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-(--color-line-soft) pt-6 text-[13px] text-(--color-dim)">
        <p className="flex flex-wrap gap-x-3">
          <span>tayloraucoin.com</span>
          <span>{SITE.email}</span>
        </p>
        <nav aria-label="Site">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href={siteRoutes.about} className={LINK}>
                About
              </Link>
            </li>
            <li>
              <a href={SITE.resume} className={LINK}>
                Résumé<span className="sr-only"> (PDF)</span>
              </a>
            </li>
            <li>
              <Link href={siteRoutes.contact} className={LINK}>
                Contact
              </Link>
            </li>
            <li>
              <a href={SITE.github} className={LINK}>
                GitHub
              </a>
            </li>
            <li>
              <a href={SITE.linkedin} className={LINK}>
                LinkedIn
              </a>
            </li>
            <li>
              <Link href="/privacy" className={LINK}>
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
