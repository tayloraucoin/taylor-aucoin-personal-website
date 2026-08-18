import Image from "next/image";
import type { MediaGroup, MediaItem } from "@/content/work";
import Section from "@/components/work/Section";
import MediaLightbox from "@/components/work/MediaLightbox";

/**
 * The case-study media strip. Renders only when there is something to show —
 * `media: []` renders nothing at all and the article closes on Outcome. Media is
 * enrichment, never scaffolding.
 *
 * Images arrive as static imports (see `content/work/types.ts`), which is what
 * makes CLS impossible: Next reads the file at build time and emits intrinsic
 * width/height, so the box is reserved before a byte of image arrives. Nobody
 * hand-maintains dimensions and they cannot drift from the file. Remote URLs
 * would forfeit this — that is why assets live in `public/work/<slug>/`.
 *
 * No `priority` anywhere. The strip sits below Outcome at the bottom of a long
 * article, so it is always below the fold and lazy loading is correct.
 */

/**
 * `sizes` for every slot, derived from the article shell in `CaseBody`:
 * `max-w-[1080px] px-[22px] md:px-14`, border-box, so the content column is
 * 968px at >=1080px viewport, `100vw - 112px` from 768px, `100vw - 44px` below.
 * Two-up rows split that with a 16px gap. Panels inset a further 24px per side.
 * The overlay reuses the same shell, so one set of numbers covers both.
 *
 * These are hand-derived. If the article padding, max-width, or row gap
 * changes, they have to change with it — a wrong `sizes` costs bandwidth
 * silently, it never errors.
 */
const SIZES = {
  full: "(min-width: 1080px) 968px, (min-width: 768px) calc(100vw - 112px), calc(100vw - 44px)",
  fullPanel:
    "(min-width: 1080px) 920px, (min-width: 768px) calc(100vw - 160px), calc(100vw - 92px)",
  half: "(min-width: 1080px) 476px, (min-width: 768px) calc((100vw - 128px) / 2), calc(100vw - 44px)",
  halfPanel:
    "(min-width: 1080px) 428px, (min-width: 768px) calc((100vw - 128px) / 2 - 48px), calc(100vw - 92px)",
  /** Capped at 360px; the cap wins once the viewport clears 360 + 48 + 44. */
  narrow: "(min-width: 452px) 360px, calc(100vw - 92px)",
} as const;

/** Static imports resolve to an object; plain strings stay strings. */
const srcKey = (m: MediaItem) => (typeof m.src === "string" ? m.src : m.src.src);

/**
 * Group items into rows of one or two. Only `half` and `narrow` pair, and only
 * with an immediate neighbour of the same size — pairing is something the
 * content author opts into per item, never inferred from aspect ratio.
 */
function toRows(items: MediaItem[]): MediaItem[][] {
  const rows: MediaItem[][] = [];
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    const next = items[i + 1];
    const pairs = cur.size === "half" || cur.size === "narrow";
    if (pairs && next && next.size === cur.size) {
      rows.push([cur, next]);
      i++;
    } else {
      rows.push([cur]);
    }
  }
  return rows;
}

function Figure({
  m,
  paired,
  zoomIndex,
}: {
  m: MediaItem;
  paired: boolean;
  zoomIndex: number;
}) {
  const size = m.size ?? "full";
  // A lone `half` occupies the full row, so it needs full-width `sizes`.
  const effective = size === "half" && !paired ? "full" : size;
  const panelled = effective === "narrow" || m.frame === "panel";

  const sizes =
    effective === "narrow"
      ? SIZES.narrow
      : effective === "half"
        ? panelled
          ? SIZES.halfPanel
          : SIZES.half
        : panelled
          ? SIZES.fullPanel
          : SIZES.full;

  const imageClasses =
    "h-auto w-full rounded-(--radius) border border-(--color-faint) transition-colors duration-(--dur-fast) ease-(--ease-out) group-hover:border-[rgb(232_185_97/.55)]";

  /**
   * A screen recording. `preload="none"` means nothing downloads until the
   * reader presses play, and the poster is the still we would have shown
   * anyway — so a video entry costs no more than an image until it is wanted.
   * No autoplay and no loop, which is what keeps the reduced-motion contract
   * without a media query: it does not move until asked.
   *
   * `aspect-ratio` from the poster's intrinsic size reserves the box, so a
   * video slot is as CLS-free as an image slot.
   */
  if (m.video) {
    const poster = typeof m.src === "string" ? m.src : m.src.src;
    const ratio =
      typeof m.src === "string" ? undefined : `${m.src.width} / ${m.src.height}`;
    return (
      <figure>
        <video
          controls
          preload="none"
          poster={poster}
          style={ratio ? { aspectRatio: ratio } : undefined}
          className="h-auto w-full rounded-(--radius) border border-(--color-faint)"
        >
          {m.video.altSrc && (
            <source src={m.video.altSrc} type={m.video.altType} />
          )}
          <source src={m.video.src} type="video/mp4" />
        </video>
        {m.caption && (
          <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
            {m.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  /**
   * A real button, so keyboard activation and focus come for free — and so the
   * root field's cursor-glow fades under it without any extra wiring, since
   * RootField watches `a,button,[data-interactive]`. Clicks are delegated up to
   * MediaLightbox, which is what lets this stay a server component.
   *
   * Accessible name comes from the image's own alt text; an aria-label here
   * would only shadow it.
   */
  const trigger = (
    <button
      type="button"
      data-zoom-index={zoomIndex}
      className={`group block w-full cursor-zoom-in rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
        effective === "narrow" ? "max-w-[360px]" : ""
      }`}
    >
      <Image
        src={m.src}
        alt={m.alt}
        sizes={sizes}
        className={imageClasses}
      />
    </button>
  );

  return (
    <figure>
      {panelled ? (
        <div
          className={`flex justify-center rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] px-6 ${
            effective === "narrow" ? "py-10" : "py-8"
          }`}
        >
          {trigger}
        </div>
      ) : (
        trigger
      )}
      {m.caption && (
        <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
          {m.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function CaseMedia({ media }: { media: MediaGroup[] }) {
  const groups = media.filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  // One flat running order across every group — the lightbox pages through the
  // whole strip, not just the cluster the reader clicked into. Video entries are
  // excluded: they are players, not zoom targets, so they must not occupy a slot
  // in the paging order or the counter would count things it cannot show.
  const flat = groups.flatMap((g) => g.items).filter((m) => !m.video);
  const zoomIndex = new Map(flat.map((m, i) => [m, i]));

  return (
    <Section label="Interface">
      <MediaLightbox
        items={flat.map((m) => ({ src: m.src, alt: m.alt, caption: m.caption }))}
      >
        {groups.map((g, gi) => (
          <div key={g.label ?? gi} className={gi > 0 ? "mt-12" : undefined}>
            {/* Same treatment as the sub-headers in `brief.groups` — the strip
                borrows the existing vocabulary rather than inventing a second one. */}
            {g.label && (
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-ink)">
                {g.label}
              </div>
            )}
            {g.intro && (
              <p className="mb-5 max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
                {g.intro}
              </p>
            )}
            <div className="grid gap-4">
              {toRows(g.items).map((row) => (
                <div
                  key={srcKey(row[0])}
                  className={row.length === 2 ? "grid gap-4 md:grid-cols-2" : undefined}
                >
                  {row.map((m) => (
                    <Figure
                      key={srcKey(m)}
                      m={m}
                      paired={row.length === 2}
                      /* -1 for video entries, which never use it. */
                      zoomIndex={zoomIndex.get(m) ?? -1}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </MediaLightbox>
    </Section>
  );
}
