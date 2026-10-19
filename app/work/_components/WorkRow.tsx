import Link from "next/link";
import { siteRoutes } from "@/lib/routes";
import { formatPeriod, type WorkEntry } from "@/lib/work/rows";
import { GalleryOpener } from "./GalleryOpener";
import { LIST_TITLES, workIndex } from "./words";

const LINK =
  "inline-flex min-h-11 items-center text-left text-(length:--text-small) leading-[1.2] font-medium text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-3 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) md:min-h-7";

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/**
 * One piece of work (work-index-build §4, 5): title over tagline, role over
 * period, a right-aligned link stack at 1440; stacked at 390 with role ·
 * period on one line. Every repeated link is described by the row's title.
 * The stack's links are Paper's: Small 15 at weight 500, an 18px line and a
 * 3px underline offset (feedback 2026-10-19: they had been set at body 17).
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
    <li className="grid gap-x-6 border-t border-(--color-line-soft) py-6 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[440px_170px_1fr] md:py-8 md:first:pt-0 md:last:pb-0">
      <h3
        id={titleId}
        className="text-(length:--text-body) font-normal text-(--color-ink) md:col-start-1 md:row-start-1"
      >
        {LIST_TITLES[entry.id] ?? entry.title}
      </h3>
      <p className="mt-1 text-(length:--text-meta) text-(--color-dim) md:col-start-2 md:row-span-2 md:row-start-1 md:mt-1.5">
        <span className="md:block">{entry.role}</span>
        <span aria-hidden className="md:hidden">
          {" "}
          ·{" "}
        </span>
        <span className="md:mt-1.5 md:block">{formatPeriod(entry.period)}</span>
      </p>
      <p className="mt-2 text-(length:--text-small) leading-[1.6] text-(--color-body) md:col-start-1 md:row-start-2 md:mt-2">
        {entry.tagline}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-0 md:col-start-3 md:row-span-2 md:row-start-1 md:mt-0 md:flex-col md:items-end md:gap-x-0">
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
