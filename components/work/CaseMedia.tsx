import Image from "next/image";
import type { MediaGroup, MediaItem } from "@/content/work";
import Section from "@/components/work/Section";
import VideoFigure from "@/components/work/VideoFigure";
import { PLAY_TRIANGLE_PATH } from "@/components/work/play-icon";

/**
 * The case-study media strip. Renders only when there is something to show —
 * `media: []` renders nothing at all and the article closes on Outcome. Media is
 * enrichment, never scaffolding.
 *
 * The click-to-zoom lightbox is OWNED BY CaseBody, not here: the header's
 * thumbnail rail (MediaRail) and this strip share one MediaLightbox wrapping
 * the whole article, so both open the same zoom with one paging order. The
 * flat order comes from `flattenZoomable` below — the single source of truth
 * for `data-zoom-index`, used by CaseBody, MediaRail, and this strip alike.
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
export const srcKey = (m: MediaItem) =>
  m.video ? m.video.src : typeof m.src === "string" ? m.src : m.src.src;

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

/** Quiet corner chip on MediaRail thumbnails when a cluster includes video. */
export function RailVideoBadge() {
  return (
    <span
      className="pointer-events-none absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full border border-(--color-faint) bg-[rgb(3_5_16/.72)] backdrop-blur-[2px]"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="ml-px h-2.5 w-2.5 fill-(--color-ink)"
        aria-hidden
      >
        <path d={PLAY_TRIANGLE_PATH} />
      </svg>
    </span>
  );
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
    const player = (
      <VideoFigure
        poster={poster}
        ratio={ratio}
        videoSrc={m.video.src}
        altSrc={m.video.altSrc}
        altType={m.video.altType}
        narrow={effective === "narrow"}
      />
    );
    return (
      <figure>
        {panelled ? (
          <div
            className={`flex justify-center rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] px-6 ${
              effective === "narrow" ? "py-10" : "py-8"
            }`}
          >
            {player}
          </div>
        ) : (
          player
        )}
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

function MediaGrid({
  items,
  zoomIndex,
}: {
  items: MediaItem[];
  zoomIndex: Map<MediaItem, number>;
}) {
  return (
    <div className="grid gap-4">
      {toRows(items).map((row) => (
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
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="mb-3 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-ink)">
      {label}
    </div>
  );
}

function GenerationEyebrow({ generation }: { generation: string }) {
  return (
    <div className="mb-6 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
      {generation}
    </div>
  );
}

function MediaGroupBlock({
  g,
  zoomIndex,
}: {
  g: MediaGroup;
  zoomIndex: Map<MediaItem, number>;
}) {
  const collapseAfter = g.collapseAfter;
  const hasOverflow =
    collapseAfter !== undefined && g.items.length > collapseAfter;
  const visible = hasOverflow ? g.items.slice(0, collapseAfter) : g.items;
  const overflow = hasOverflow ? g.items.slice(collapseAfter) : [];

  const body = (
    <>
      {g.label && <GroupLabel label={g.label} />}
      {g.intro && (
        <p className="mb-5 max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
          {g.intro}
        </p>
      )}
      <MediaGrid items={visible} zoomIndex={zoomIndex} />
      {overflow.length > 0 && (
        <details className="mt-4 group/details">
          <summary
            className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) [&::-webkit-details-marker]:hidden"
          >
            + {overflow.length} more
          </summary>
          <div className="mt-4">
            <MediaGrid items={overflow} zoomIndex={zoomIndex} />
          </div>
        </details>
      )}
    </>
  );

  if (g.frame === "panel") {
    return (
      <div className="rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] px-6 py-8">
        {body}
      </div>
    );
  }

  return body;
}

/**
 * One flat running order across every group — the lightbox pages through the
 * whole strip, not just the cluster the reader clicked into. Video entries are
 * excluded: they are players, not zoom targets, so they must not occupy a slot
 * in the paging order or the counter would count things it cannot show.
 */
export function flattenZoomable(media: MediaGroup[]): MediaItem[] {
  return media
    .filter((g) => g.items.length > 0)
    .flatMap((g) => g.items)
    .filter((m) => !m.video);
}

const RAIL_MAX = 4;

/** Every item, across every group, unfiltered — stills and video alike. */
function flattenAll(media: MediaGroup[]): MediaItem[] {
  return media.filter((g) => g.items.length > 0).flatMap((g) => g.items);
}

/**
 * What the header rail shows, in display order: one item per group for 2+
 * groups (preferring a video when the group has one, so a badged thumbnail's
 * slide IS the video), or the first RAIL_MAX zoomable items for one group.
 */
export function railOrder(media: MediaGroup[]): MediaItem[] {
  const groups = media.filter((g) => g.items.length > 0);
  if (groups.length >= 2) {
    return groups.map((g) => g.items.find((m) => m.video) ?? g.items[0]);
  }
  return flattenZoomable(media).slice(0, RAIL_MAX);
}

/**
 * Paging order when the lightbox opens from the rail: the featured sequence
 * first, then every item on the page once more, walked from the bottom of
 * the strip upward.
 */
export function railLightboxOrder(media: MediaGroup[]): MediaItem[] {
  return [...railOrder(media), ...flattenAll(media).slice().reverse()];
}

/** Anchor id for the strip — the header rail's "All captures" jump target. */
export const MEDIA_SECTION_ID = "interface";

export default function CaseMedia({ media }: { media: MediaGroup[] }) {
  const groups = media.filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  const zoomIndex = new Map(flattenZoomable(media).map((m, i) => [m, i]));

  return (
    <Section label="Interface" id={MEDIA_SECTION_ID}>
      <>
        {groups.map((g, gi) => {
          const showGeneration =
            g.generation !== undefined &&
            (gi === 0 || g.generation !== groups[gi - 1]?.generation);

          return (
            <div key={g.label ?? gi} className={gi > 0 ? "mt-12" : undefined}>
              {showGeneration && g.generation && (
                <GenerationEyebrow generation={g.generation} />
              )}
              <MediaGroupBlock g={g} zoomIndex={zoomIndex} />
            </div>
          );
        })}
      </>
    </Section>
  );
}
