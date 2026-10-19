import Image from "next/image";
import MediaLightbox from "@/components/work/MediaLightbox";
import type { MediaItem } from "@/content/work";

const HOME_THUMBS = 2;
const CASE_THUMBS = 4;

/**
 * A story's gallery (D-SITE-39, 182): the lead capture, up to two 160x104
 * thumbs, and "All n images" opening the existing MediaLightbox, unchanged.
 * No carousel. An empty gallery renders nothing at all, no frame (D-SITE-181).
 *
 * The lightbox returns focus to `[data-zoom-index=<last viewed>]`, so "All
 * n" carries index 0 (it opens on the first) and the thumbs carry their own;
 * the lead is a plain image beside them. A gallery of one makes the lead the
 * opener.
 *
 * `size="case"` is the case study's (D-SITE-92): the lead at content width
 * with its caption, then four 207x130 thumbs and the "All n images" tile in a
 * row of five, two per row at 390.
 */
export function StoryGallery({
  items,
  label,
  size = "home",
  caption,
}: {
  items: MediaItem[];
  /** "All {n} images" with n filled in. */
  label: string;
  size?: "home" | "case";
  /** Under the lead, `case` size only. */
  caption?: string;
}) {
  const images = items.filter((item) => !item.video);
  if (images.length === 0) return null;
  const [lead, ...rest] = images;
  const single = images.length === 1;

  if (size === "case") {
    return (
      <MediaLightbox items={images}>
        <figure>
          {single ? (
            <button
              type="button"
              data-zoom-index={0}
              className="block w-full cursor-zoom-in rounded-(--radius)"
            >
              <CaseLead item={lead} />
            </button>
          ) : (
            <CaseLead item={lead} />
          )}
          {caption && (
            <figcaption className="mt-3 text-(length:--text-meta) text-(--color-dim)">
              {caption}
            </figcaption>
          )}
        </figure>
        {!single && (
          <ul className="mt-4 grid grid-cols-2 gap-[11.25px] md:grid-cols-5">
            {rest.slice(0, CASE_THUMBS).map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  data-zoom-index={i + 1}
                  className="block w-full cursor-zoom-in rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={207}
                    height={130}
                    sizes="(min-width: 768px) 207px, 50vw"
                    className="aspect-[207/130] w-full rounded-(--radius) border border-(--color-line-soft) object-cover object-top"
                  />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                data-zoom-index={0}
                className="flex aspect-[207/130] min-h-11 w-full cursor-zoom-in items-center justify-center rounded-(--radius) border border-(--color-line-soft) text-(length:--text-small) text-(--color-body) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:border-(--color-line-strong) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
              >
                {label}
              </button>
            </li>
          </ul>
        )}
      </MediaLightbox>
    );
  }

  const leadImage = (
    <Image
      src={lead.src}
      alt={lead.alt}
      sizes="(min-width: 768px) 520px, 100vw"
      className="block h-auto w-full rounded-(--radius) border border-(--color-line-soft)"
    />
  );

  return (
    <MediaLightbox items={images}>
      {single ? (
        <button
          type="button"
          data-zoom-index={0}
          className="block w-full cursor-zoom-in rounded-(--radius)"
        >
          {leadImage}
        </button>
      ) : (
        leadImage
      )}
      {!single && (
        <ul className="mt-4 flex flex-wrap gap-4">
          {rest.slice(0, HOME_THUMBS).map((item, i) => (
            <li key={i}>
              <button
                type="button"
                data-zoom-index={i + 1}
                className="block cursor-zoom-in rounded-(--radius)"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={160}
                  height={104}
                  sizes="160px"
                  className="h-[104px] w-[160px] rounded-(--radius) border border-(--color-line-soft) object-cover object-top"
                />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              data-zoom-index={0}
              className="flex h-[104px] w-[160px] cursor-zoom-in items-center justify-center rounded-(--radius) border border-(--color-line-soft) text-(length:--text-small) text-(--color-body) transition-colors duration-(--dur-fast) hover:border-(--color-line-strong) hover:text-(--color-ink)"
            >
              {label}
            </button>
          </li>
        </ul>
      )}
    </MediaLightbox>
  );
}

function CaseLead({ item }: { item: MediaItem }) {
  return (
    <Image
      src={item.src}
      alt={item.alt}
      sizes="(min-width: 768px) 1080px, 100vw"
      className="block h-auto w-full rounded-(--radius) border border-(--color-line-soft)"
    />
  );
}
