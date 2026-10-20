import Link from "next/link";
import { siteRoutes } from "@/lib/routes";
import { formatPeriod, type WorkEntry } from "@/lib/work/rows";
import { GalleryOpener } from "./GalleryOpener";
import { LIST_TITLES, workIndex } from "./words";

const LINK =
  "inline-flex min-h-11 items-center text-left text-(length:--text-small) leading-[1.2] font-medium text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-3 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) lg:min-h-7";

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/**
 * One piece of work (work-index-build §4, 5): title over tagline, role over
 * period, a right-aligned link stack at 1440; stacked at 390 with role ·
 * period on one line. Every repeated link is described by the row's title.
 * The stack's links are Paper's: Small 15 at weight 500, an 18px line and a
 * 3px underline offset (feedback 2026-10-19: they had been set at body 17).
 * The three columns start at lg, and the title's gives way before the link
 * stack's, so a link never wraps a word per line (feedback round 3).
 */
export function WorkRow({ entry }: { entry: WorkEntry }) {
  const titleId = `work-row-${entry.id}`;
  const images = entry.gallery.filter((item) => !item.video);
  const galleryLabel = (
    entry.tab === "branding"
      ? workIndex.galleryAll.boards
      : workIndex.galleryAll.images
  ).replace("{n}", String(images.length));

  return (
    <li className="grid gap-x-6 border-t border-(--color-line-soft) py-6 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,440px)_170px_minmax(max-content,1fr)] lg:py-8 lg:first:pt-0 lg:last:pb-0">
      <h3
        id={titleId}
        className="text-(length:--text-body) font-normal text-(--color-ink) lg:col-start-1 lg:row-start-1"
      >
        {LIST_TITLES[entry.id] ?? entry.title}
      </h3>
      <p className="mt-1 text-(length:--text-meta) text-(--color-dim) lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-1.5">
        <span className="lg:block">{entry.role}</span>
        <span aria-hidden className="lg:hidden">
          {" "}
          ·{" "}
        </span>
        <span className="lg:mt-1.5 lg:block">{formatPeriod(entry.period)}</span>
      </p>
      <p className="mt-2 text-(length:--text-small) leading-[1.6] text-(--color-body) lg:col-start-1 lg:row-start-2 lg:mt-2">
        {entry.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-0 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:flex-col lg:items-end lg:gap-x-0">
        {entry.caseStudySlug && (
          <Link
            href={siteRoutes.caseStudy(entry.caseStudySlug)}
            scroll
            aria-describedby={titleId}
            className={LINK}
          >
            {workIndex.readStory}
          </Link>
        )}
        <GalleryOpener
          items={entry.gallery}
          label={galleryLabel}
          className={LINK}
          describedBy={titleId}
        />
        {entry.liveUrl && (
          <a
            href={entry.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby={titleId}
            className={LINK}
          >
            {host(entry.liveUrl)}
          </a>
        )}
      </div>
    </li>
  );
}
