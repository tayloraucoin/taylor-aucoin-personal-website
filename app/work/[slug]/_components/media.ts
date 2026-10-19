import { flattenZoomable, srcKey } from "@/components/work/CaseMedia";
import type { CaseStudy, MediaItem } from "@/content/work";

/** The images the lightbox steps through, in order; recordings are not zoomable. */
export const zoomable = (c: CaseStudy): MediaItem[] => flattenZoomable(c.media);

/** The lightbox slot of a screen, matched by file, or -1 for a recording. */
export function zoomIndex(c: CaseStudy, item: MediaItem): number {
  const key = srcKey(item);
  return zoomable(c).findIndex((m) => srcKey(m) === key);
}

/** Every item in every group, in order. */
export const allMedia = (c: CaseStudy): MediaItem[] =>
  c.media.flatMap((g) => g.items);

/**
 * A tile's caption: the item's own, else the short noun phrase of its alt
 * ("Conscious Connections session — Jane's private brain-dump, with ..."
 * reads "Jane's private brain-dump"). Nothing new is written.
 */
export function tileCaption(item: MediaItem): string {
  if (item.caption) return item.caption;
  const tail = item.alt.split(" — ").pop() ?? item.alt;
  const phrase = tail.split(/[,(]/)[0].trim();
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}
