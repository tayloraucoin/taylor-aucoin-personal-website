import MediaLightbox from "@/components/work/MediaLightbox";
import type { MediaItem } from "@/content/work";

/**
 * The row's gallery opener: a button drawn as a text link, opening the
 * existing MediaLightbox on the first image. Renders only when the gallery
 * has images, so a row with none shows no opener and no frame.
 */
export function GalleryOpener({
  items,
  label,
  className,
  describedBy,
}: {
  items: MediaItem[];
  label: string;
  className: string;
  describedBy: string;
}) {
  const images = items.filter((item) => !item.video);
  if (images.length === 0) return null;
  return (
    <MediaLightbox items={images}>
      <button
        type="button"
        data-zoom-index={0}
        aria-describedby={describedBy}
        className={`${className} cursor-pointer`}
      >
        {label}
      </button>
    </MediaLightbox>
  );
}
