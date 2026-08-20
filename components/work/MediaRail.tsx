import Image from "next/image";
import { flattenZoomable, MEDIA_SECTION_ID } from "@/components/work/CaseMedia";
import type { MediaGroup } from "@/content/work";

/**
 * The opt-in header thumbnail rail (`mediaPreview` on a case study). Sits
 * below the stack chips so the look and feel of the work is visible inside
 * the sixty-second window, without displacing the decisions-first template —
 * the strip itself stays at the bottom as enrichment.
 *
 * Register: quiet. Small fixed-box thumbnails at dim opacity, the mono
 * "All captures" jump link in the same idiom as CaseLinks. No gradient, no
 * ring — the title and stack keep the header.
 *
 * Thumbnails are real buttons carrying `data-zoom-index`; CaseBody wraps the
 * whole article in one MediaLightbox, whose delegated click handler picks
 * them up exactly like the strip's figures. Indices come from
 * `flattenZoomable`, the shared source of truth, so rail slot N and strip
 * figure N are the same capture.
 *
 * Fixed h/w boxes with `object-cover` on purpose — never `w-auto` (see the
 * next/image sizing trap in CLAUDE.md). Server component; nothing hydrates.
 */
const RAIL_MAX = 4;

export default function MediaRail({ media }: { media: MediaGroup[] }) {
  const flat = flattenZoomable(media);
  if (flat.length === 0) return null;

  const shown = flat.slice(0, RAIL_MAX);

  return (
    <div className="mb-12 flex flex-wrap items-center gap-3">
      {shown.map((m, i) => (
        <button
          key={typeof m.src === "string" ? m.src : m.src.src}
          type="button"
          data-zoom-index={i}
          className="group block cursor-zoom-in rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          <Image
            src={m.src}
            alt={m.alt}
            sizes="96px"
            className="h-14 w-24 rounded-(--radius) border border-(--color-faint) object-cover object-top opacity-75 transition-[opacity,border-color] duration-(--dur-fast) ease-(--ease-out) group-hover:border-[rgb(232_185_97/.55)] group-hover:opacity-100"
          />
        </button>
      ))}
      <a
        href={`#${MEDIA_SECTION_ID}`}
        className="ml-1 border-b border-b-(--color-faint) pb-0.5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-b-(--color-c2) hover:text-(--color-ink)"
      >
        All captures ↓
      </a>
    </div>
  );
}
