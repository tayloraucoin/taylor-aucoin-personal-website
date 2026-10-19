import Image from "next/image";
import { srcKey } from "@/components/work/CaseMedia";
import MediaLightbox from "@/components/work/MediaLightbox";
import { StoryGallery } from "@/components/work/StoryGallery";
import VideoFigure from "@/components/work/VideoFigure";
import type { BuiltContent, CaseStudy, MediaItem } from "@/content/work";
import {
  Block,
  LedgerRow,
  LedgerRows,
  Prose,
  RowText,
  RowTitle,
  sentence,
  TEXT_LINK,
} from "./blocks";
import { allMedia, tileCaption, zoomable, zoomIndex } from "./media";

const IMAGES = "All {n} images";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

/**
 * What I built in the format its study sets (D-SITE-91, 193): `builtFormat`
 * decides, never the media count. One lightbox serves band, rows and paired;
 * the gallery brings its own through StoryGallery.
 */
export function WhatIBuilt({ c }: { c: CaseStudy }) {
  const built = c.built;
  if (Array.isArray(built)) {
    return (
      <Block title="What I built">
        {built.map((p, i) => (
          <Prose key={i} tone="ink">
            {p}
          </Prose>
        ))}
      </Block>
    );
  }
  const items = zoomable(c);
  const count = IMAGES.replace("{n}", String(items.length));

  const body =
    c.builtFormat === "gallery" ? (
      <BuiltGallery c={c} built={built} count={count} />
    ) : c.builtFormat === "band" ? (
      <BuiltBand c={c} built={built} count={count} />
    ) : c.builtFormat === "rows-paired" ? (
      <BuiltRowsPaired c={c} built={built} />
    ) : (
      <BuiltRowsAfter c={c} built={built} />
    );

  const wrapped =
    c.builtFormat !== "gallery" && items.length > 0 ? (
      <MediaLightbox items={items}>{body}</MediaLightbox>
    ) : (
      body
    );

  return (
    <Block title="What I built">
      <Prose tone="ink">{built.intro}</Prose>
      {wrapped}
    </Block>
  );
}

/** The two-column surface list under a gallery or band. */
function SurfaceList({ built }: { built: BuiltContent }) {
  return (
    <ul className="mt-10 grid gap-x-16 md:grid-cols-2">
      {built.cards.map((card) => (
        <li
          key={card.label}
          className="border-b border-(--color-line-soft) py-6 md:py-8"
        >
          <RowTitle>{sentence(card.label)}</RowTitle>
          <div className="mt-2">
            <RowText>{card.body}</RowText>
          </div>
          {card.link && (
            <a href={card.link.href} className={TEXT_LINK}>
              {card.link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function BuiltGallery({
  c,
  built,
  count,
}: {
  c: CaseStudy;
  built: BuiltContent;
  count: string;
}) {
  const media = allMedia(c);
  const label = c.media[0]?.label;
  return (
    <>
      <div className="mt-8">
        <StoryGallery
          items={media}
          label={count}
          size="case"
          caption={
            label
              ? sentence(label).replace(/^(\S)/, (m) => m.toUpperCase())
              : undefined
          }
        />
      </div>
      <SurfaceList built={built} />
    </>
  );
}

/** The screens band: captioned tiles on a surface panel, then the surface list. */
function BuiltBand({
  c,
  built,
  count,
}: {
  c: CaseStudy;
  built: BuiltContent;
  count: string;
}) {
  // The first image is the opening's lead artifact; the band holds the rest.
  const lead = allMedia(c).find((m) => !m.video);
  const tiles = allMedia(c).filter((m) => m !== lead);
  return (
    <>
      <div className="mt-8 rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-6 md:p-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5 md:gap-x-6">
          {tiles.map((item) => (
            <li key={srcKey(item)}>
              <BandTile c={c} item={item} />
            </li>
          ))}
        </ul>
      </div>
      <SurfaceList built={built} />
      <p className="mt-6">
        <button
          type="button"
          data-zoom-index={0}
          className={`inline-flex min-h-11 cursor-zoom-in items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 ${FOCUS}`}
        >
          {count}
        </button>
      </p>
    </>
  );
}

function BandTile({ c, item }: { c: CaseStudy; item: MediaItem }) {
  const caption = tileCaption(item);
  const src = typeof item.src === "string" ? null : item.src;
  if (!src) return null;
  if (item.video) {
    return (
      <figure>
        <VideoFigure
          poster={src.src}
          ratio={`${src.width} / ${src.height}`}
          videoSrc={item.video.src}
          altSrc={item.video.altSrc}
          altType={item.video.altType}
        />
        <figcaption className="mt-2 text-(length:--text-meta) text-(--color-dim)">
          {caption}
        </figcaption>
      </figure>
    );
  }
  return (
    <button
      type="button"
      data-zoom-index={zoomIndex(c, item)}
      className={`group block w-full cursor-zoom-in text-left ${FOCUS}`}
    >
      <Image
        src={src}
        alt=""
        sizes="(min-width: 768px) 190px, 45vw"
        className="block h-auto w-full rounded-(--radius) border border-(--color-line-soft)"
      />
      <span className="mt-2 block min-h-11 text-(length:--text-meta) text-(--color-dim)">
        {caption}
      </span>
    </button>
  );
}

/** Surface rows, then the screens in framed panels with a meta credit. */
function BuiltRowsAfter({ c, built }: { c: CaseStudy; built: BuiltContent }) {
  const screens = allMedia(c).filter(
    (m) => !m.video && typeof m.src !== "string",
  );
  return (
    <>
      <SurfaceRows built={built} />
      {screens.length > 0 && (
        <div className="mt-10">
          <ul className="grid gap-6 md:grid-cols-2">
            {screens.map((item) => (
              <li key={srcKey(item)}>
                <button
                  type="button"
                  data-zoom-index={zoomIndex(c, item)}
                  className={`block w-full cursor-zoom-in rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-3 ${FOCUS}`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    sizes="(min-width: 768px) 520px, 100vw"
                    className="block h-auto w-full rounded-(--radius)"
                  />
                </button>
              </li>
            ))}
          </ul>
          {screens[0].caption && (
            <p className="mt-3 text-(length:--text-meta) text-(--color-dim)">
              {screens[0].caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function SurfaceRows({ built }: { built: BuiltContent }) {
  return (
    <LedgerRows>
      {built.cards.map((card) => (
        <LedgerRow
          key={card.label}
          label={<RowTitle>{sentence(card.label)}</RowTitle>}
        >
          <RowText>{card.body}</RowText>
          {card.link && (
            <a href={card.link.href} className={TEXT_LINK}>
              {card.link.label}
            </a>
          )}
        </LedgerRow>
      ))}
    </LedgerRows>
  );
}

/** Surface rows with a card's screen under the row it shows. */
function BuiltRowsPaired({ c, built }: { c: CaseStudy; built: BuiltContent }) {
  return (
    <LedgerRows>
      {built.cards.map((card) => (
        <LedgerRow
          key={card.label}
          label={<RowTitle>{sentence(card.label)}</RowTitle>}
        >
          <RowText>{card.body}</RowText>
          {card.link && (
            <a href={card.link.href} className={TEXT_LINK}>
              {card.link.label}
            </a>
          )}
          {card.screen && typeof card.screen.src !== "string" && (
            <figure className="mt-6">
              <button
                type="button"
                data-zoom-index={zoomIndex(c, card.screen)}
                className={`block w-full cursor-zoom-in rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-4 md:p-5 ${FOCUS}`}
              >
                <Image
                  src={card.screen.src}
                  alt={card.screen.alt}
                  sizes="(min-width: 768px) 600px, 100vw"
                  className="block h-auto w-full rounded-(--radius)"
                />
              </button>
              {card.screen.caption && (
                <figcaption className="mt-3 text-(length:--text-meta) text-(--color-dim)">
                  {card.screen.caption}
                </figcaption>
              )}
            </figure>
          )}
        </LedgerRow>
      ))}
    </LedgerRows>
  );
}
