import Image from "next/image";
import MediaLightbox from "@/components/work/MediaLightbox";
import { galleryAll } from "@/content/websites-coded";
import type { MediaItem, WorkRow } from "@/content/work";
import { formatPeriod } from "@/lib/work/rows";
import { TEXT_LINK } from "./Section";

const SHOT =
  "block h-auto w-full rounded-[3px] border border-(--color-line-soft)";

/** "kryshanrandel.com" from its URL: the live link's name is its host. */
const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "");

/**
 * One lead-screen example row (D-SITE-113, 114, 116): the desktop and phone
 * shots beside a 370 text column with name (h3), line, meta, the link pair
 * and the client's testimonial. At 390 the desktop shot leads full width and
 * the phone shot is not shown.
 *
 * The shots and "All n images" are buttons onto the row's gallery only when it
 * has images; the lightbox returns focus to `[data-zoom-index]` or
 * `[data-rail-index]`, so "All n images" opens the same gallery as a rail to
 * get its focus back. A missing link or testimonial leaves no gap.
 */
export function ExampleRow({ row }: { row: WorkRow }) {
  const images = row.gallery.filter((item) => !item.video);
  const hasGallery = images.length > 0;
  const allLabel = galleryAll.replace("{n}", String(images.length));
  const indexOf = (shot: MediaItem) =>
    Math.max(
      0,
      images.findIndex((item) => item.src === shot.src),
    );
  const example = row.example;
  const meta = [row.role, formatPeriod(row.period)].filter(Boolean).join(" · ");

  const shot = (item: MediaItem, sizes: string, className: string) => {
    const image = (
      <Image src={item.src} alt={item.alt} sizes={sizes} className={SHOT} />
    );
    return hasGallery ? (
      <button
        type="button"
        data-zoom-index={indexOf(item)}
        aria-label={`${allLabel}, ${row.title}`}
        className={`${className} cursor-zoom-in rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)`}
      >
        {image}
      </button>
    ) : (
      <div className={className}>{image}</div>
    );
  };

  const body = (
    <div
      className={`grid gap-6 border-b border-(--color-line-soft) py-8 ${
        example ? "md:grid-cols-[480px_150px_minmax(0,370px)] md:gap-x-4" : ""
      }`}
    >
      {example && shot(example.desktop, "(min-width: 768px) 480px, 100vw", "")}
      {example?.phone &&
        shot(example.phone, "150px", "hidden self-start md:mt-10 md:block")}

      <div className={example ? "md:pl-6" : ""}>
        <h3 className="text-(length:--text-body) font-medium text-(--color-ink)">
          {row.title}
        </h3>
        <p className="mt-2 text-(length:--text-body) leading-[1.55] text-(--color-body)">
          {row.tagline}
        </p>
        <p className="mt-3 text-(length:--text-meta) text-(--color-dim)">
          {meta}
        </p>
        {(hasGallery || row.liveUrl) && (
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-(length:--text-small)">
            {hasGallery && (
              <button
                type="button"
                data-rail-index={0}
                className={`${TEXT_LINK} cursor-zoom-in`}
              >
                {allLabel}
              </button>
            )}
            {row.liveUrl && (
              <a
                href={row.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TEXT_LINK}
              >
                {hostOf(row.liveUrl)}
              </a>
            )}
          </p>
        )}
        {example?.testimonial && (
          <figure className="mt-6">
            <blockquote className="text-(length:--text-body) leading-[1.5] font-medium text-(--color-ink)">
              {example.testimonial.quote}
            </blockquote>
            <figcaption className="mt-2 text-(length:--text-meta) text-(--color-dim)">
              {[example.testimonial.name, example.testimonial.role]
                .filter(Boolean)
                .join(" · ")}
            </figcaption>
          </figure>
        )}
      </div>
    </div>
  );

  return (
    <li data-example-row={row.id}>
      {hasGallery ? (
        <MediaLightbox items={images} railItems={images}>
          {body}
        </MediaLightbox>
      ) : (
        body
      )}
    </li>
  );
}
