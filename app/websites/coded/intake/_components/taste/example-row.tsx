"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import type { ExampleSite } from "@/content/intake-examples";
import { tagsFor } from "@/content/intake-examples/taxonomy";
import { hostOf } from "@/lib/intake/taste-picks";
import { PickBlock, type Pick } from "./pick-block";

/**
 * One example site: what it looks like, whose it is, and what it is made of.
 *
 * **A capture, never a live frame.** Most of the hosts in this gallery refuse
 * to be framed, the ones that allow it are heavy, and a live site inside an
 * accordion inside a form on a phone is a scroll trap. The row is for
 * reacting; looking is what the overlay is for (PORT-24, D-PORT-17).
 *
 * Full column width and stacked, never two-up: a screenshot at 260px cannot
 * show a site's type, and type is most of what is being judged here.
 *
 * **Nothing here may out-dress the step's Continue** — no ring, no gradient, no
 * lift. The gallery is the instrument, not the exhibit (PORT-7's law, and site
 * invariant 2: the interface always wins over the atmosphere).
 */
export function ExampleRow({
  site,
  pick,
  onSave,
  onRemove,
  priority,
  autoEdit = false,
  onEdited,
  onSeeMore,
}: {
  site: ExampleSite;
  pick: Pick | null;
  onSave: (next: Pick) => void;
  onRemove: () => void;
  /** Opens the full-screen view at this site. Absent in a document. */
  onSeeMore?: () => void;
  /** The first row loads eagerly; everything below waits to be scrolled to. */
  priority?: boolean;
  /** Set when the picks list sent the client here to edit this one. */
  autoEdit?: boolean;
  onEdited?: () => void;
}) {
  const row = useRef<HTMLLIElement>(null);
  const preview = useIsPreview();

  // Arriving from the picks list: put the row where they can see it. The
  // composer opens itself; this only moves the page.
  useEffect(() => {
    if (!autoEdit) return;
    row.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [autoEdit]);

  const picked = pick !== null;

  /**
   * See more is offered only where it leads somewhere.
   *
   * A preview has no overlay to open, and a disabled button beside an enabled
   * one asks the reader to work out which of two controls is real. Absent says
   * the same thing in less space and with no ambiguity.
   */
  const seeMore = onSeeMore && !preview ? onSeeMore : null;

  return (
    <li
      ref={row}
      className={`overflow-hidden rounded-(--radius) border transition-colors duration-(--dur-fast) ease-(--ease-out) ${
        picked
          ? "border-[rgb(232_185_97/.55)] bg-(--color-card-hover)"
          : "border-(--color-faint) bg-(--color-card)"
      }`}
    >
      <CaptureGallery site={site} priority={priority} />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
          <p className="font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)">
            {site.name}
          </p>

          {/* One link per row, and it says where it goes. A new tab, because
              leaving mid-form is safe — autosave has kept everything — but
              coming back should not cost them the page. */}
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {hostOf(site.url)} ↗
          </a>
        </div>

        <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-body)">
          {site.role}
        </p>

        <TagChips site={site} />

        <PickBlock
          idPrefix={`pick-${site.key}`}
          pick={pick}
          onSave={onSave}
          onRemove={onRemove}
          openInitially={autoEdit}
          onOpened={onEdited}
          actions={
            seeMore ? (
              <GhostButton type="button" onClick={seeMore}>
                See more
              </GhostButton>
            ) : null
          }
        />
      </div>
    </li>
  );
}

/**
 * The captures, with a way through them.
 *
 * A site with three captures had two of them invisible until the overlay was
 * opened, which made the row a worse first impression than the content
 * deserved. The arrows sit on the image, because that is where the thing they
 * page is.
 *
 * **They have to read on a near-white gallery site and a near-black reel site
 * alike**, so they carry their own ground rather than borrowing the page's: a
 * dark translucent disc, a white glyph, and a hairline. That holds on both, and
 * on a photograph — which either of the palette's own surface tokens would not.
 */
function CaptureGallery({
  site,
  priority,
}: {
  site: ExampleSite;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<ReadonlySet<number>>(new Set());

  const capture = site.captures[index];
  const many = site.captures.length > 1;

  if (!capture || broken.has(index)) {
    return (
      /* A missing capture is quiet, not broken: the row still carries the name,
         the link, and the tags, which is most of what it is for. */
      <div
        aria-hidden
        className="w-full bg-(--color-card-hover)"
        style={{ aspectRatio: "1512 / 982" }}
      />
    );
  }

  return (
    <div className="relative">
      <Image
        src={capture.src}
        alt={`${site.name} — ${capture.alt}`}
        width={capture.width}
        height={capture.height}
        loading={priority && index === 0 ? "eager" : "lazy"}
        sizes="(max-width: 640px) 92vw, 560px"
        onError={() => setBroken((current) => new Set(current).add(index))}
        className="h-auto w-full"
      />

      {many ? (
        <>
          <PageArrow
            label={`Previous capture of ${site.name}`}
            disabled={index === 0}
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            className="left-3"
          >
            ‹
          </PageArrow>

          <PageArrow
            label={`Next capture of ${site.name}`}
            disabled={index === site.captures.length - 1}
            onClick={() =>
              setIndex((current) =>
                Math.min(site.captures.length - 1, current + 1),
              )
            }
            className="right-3"
          >
            ›
          </PageArrow>

          <p
            aria-live="polite"
            className="absolute right-3 bottom-3 rounded-(--radius) border border-white/25 bg-[rgb(6_11_30/.62)] px-2 py-1 font-mono text-[10px] tracking-[.16em] text-white backdrop-blur-[2px]"
          >
            {index + 1} / {site.captures.length}
          </p>
        </>
      ) : null}
    </div>
  );
}

/** A capture-gallery arrow. Always rendered, never hover-revealed. */
function PageArrow({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[rgb(6_11_30/.62)] text-[18px] text-white backdrop-blur-[2px] transition-opacity duration-(--dur-fast) ease-(--ease-out) hover:bg-[rgb(6_11_30/.82)] disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${className ?? ""}`}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

/**
 * The tags, as chips.
 *
 * A middle-dot run read as one long line of shouting; separate shapes let the
 * eye compare two rows at a glance, which is the only thing these are for. Axes
 * first, then styles — the axes are the comparison a client is actually making,
 * and the styles explain a reaction after the fact.
 */
function TagChips({ site }: { site: ExampleSite }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {tagsFor(site).map((tag) => (
        <li
          key={tag}
          className="rounded-(--radius) border border-(--color-faint) px-2 py-1 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
