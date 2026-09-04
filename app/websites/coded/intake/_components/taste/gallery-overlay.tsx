"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ExampleSite } from "@/content/intake-examples";
import { EXAMPLE_GROUPS, tagsFor } from "@/content/intake-examples/taxonomy";
import { hostOf } from "@/lib/intake/taste-picks";
import { PickBlock, type Pick } from "./pick-block";
import { measureStage, SiteStage, type StageBox } from "./site-stage";

/** [COPY — draft] */
const COPY = {
  close: "Close",
  previous: "Previous site",
  next: "Next site",
  open: "Open the site",
};

/**
 * See more: one site, full screen, with the same two questions under it.
 *
 * ## Why this is not `Overlay` and not `MediaLightbox`
 *
 * It borrows `MediaLightbox`'s reasoning and none of its code. That component's
 * contract is server-rendered case-study figures; `components/ui/Overlay`
 * listens for Escape on `document` in the bubble phase and owns `body.overflow`
 * for a route that this surface never mounts. What carries across is the set of
 * decisions each of them had to make and this one does too: portal to `body`
 * (a `backdrop-filter` ancestor would otherwise become the containing block for
 * anything fixed), catch Escape in the **capture** phase so nothing above sees
 * it, save `body.overflow` and restore it to its *prior* value rather than to
 * `""`, and size the stage in explicit pixels because this repo has shipped the
 * `next/image` sizing bug once.
 *
 * ## What it refuses to do
 *
 * **One frame in the DOM, ever.** One site renders at a time and the frame is
 * keyed by site, so paging replaces the element rather than re-pointing it. A
 * gallery that pre-loaded its neighbours would be running three live websites
 * inside a form.
 *
 * **The token never leaves.** This page's URL carries the client's intake
 * token; the frame is `referrerpolicy="no-referrer"` so no framed site ever
 * receives it.
 *
 * **No motion between items.** The stage swaps. A slide transition between two
 * live websites reads as lag, which is the one thing a gallery of other
 * people's sites must not look like.
 */
export function GalleryOverlay({
  sites,
  index,
  onIndex,
  onClose,
  pickFor,
  onSave,
  onRemove,
}: {
  /** The whole gallery, flattened in group order. */
  sites: readonly ExampleSite[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
  pickFor: (siteKey: string) => Pick | null;
  onSave: (siteKey: string, next: Pick) => void;
  onRemove: (siteKey: string) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<StageBox | null>(null);
  const [mounted, setMounted] = useState(false);

  const site = sites[index];
  const atStart = index <= 0;
  const atEnd = index >= sites.length - 1;

  useEffect(() => setMounted(true), []);

  /**
   * Paging, closing, focus, and the scroll lock — all torn down together.
   *
   * `onIndex` and `onClose` are read through refs so this effect does not
   * re-run on every parent render, which would re-measure and re-grab focus
   * mid-interaction.
   */
  const page = useRef(onIndex);
  const close = useRef(onClose);
  page.current = onIndex;
  close.current = onClose;

  const total = sites.length;
  const current = useRef(index);
  current.current = index;

  useEffect(() => {
    const step = (delta: number) => {
      const next = current.current + delta;
      if (next >= 0 && next < total) page.current(next);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Capture phase plus this: nothing above this dialog sees the key.
        event.stopImmediatePropagation();
        close.current();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === "Tab") {
        const focusable = panel.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey, true);

    // Restored to what it was, not to "": this dialog may open from a page
    // that had already locked scrolling for its own reasons.
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus goes to whatever opened this, on the way back out.
    const opener = document.activeElement as HTMLElement | null;

    const measure = () => setBox(measureStage());
    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = priorOverflow;
      opener?.focus();
    };
  }, [total]);

  /**
   * Focus moves into the dialog once there is a dialog to move it into.
   *
   * It cannot happen in the effect above: the first render returns null while
   * the stage is being measured, so `panel` is still empty when that effect
   * runs. Doing it there left focus on the page behind — the Tab trap still
   * worked, but the first Tab went somewhere outside the dialog and a screen
   * reader was never told it had opened.
   */
  const ready = mounted && Boolean(site) && Boolean(box);

  useEffect(() => {
    if (ready) panel.current?.focus();
  }, [ready]);

  if (!mounted || !site || !box) return null;

  const group = EXAMPLE_GROUPS[site.group];

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgb(6_11_30/.92)] px-4 py-4"
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={site.name}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col items-center gap-5 outline-none"
      >
        {/* Where they are, and the way out. */}
        <div className="flex w-full items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
            {group.title} · {index + 1} of {sites.length}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="min-h-11 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {COPY.close}
          </button>
        </div>

        {/* Announced once per move; the eyebrow above carries the same facts
            for anyone who can see them. */}
        <p aria-live="polite" className="sr-only">
          {site.name}, {index + 1} of {sites.length}, {group.title}.
        </p>

        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:justify-center">
          <div className="order-2 flex gap-4 lg:order-none lg:contents">
            <PageButton
              label={COPY.previous}
              disabled={atStart}
              onClick={() => onIndex(index - 1)}
              className="lg:order-1"
            >
              ‹
            </PageButton>
            <PageButton
              label={COPY.next}
              disabled={atEnd}
              onClick={() => onIndex(index + 1)}
              className="lg:order-3"
            >
              ›
            </PageButton>
          </div>

          <div className="order-1 lg:order-2">
            <SiteStage site={site} box={box} />
          </div>
        </div>

        <div className="w-full max-w-[560px] pb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)">
              {site.name}
            </p>

            {/* Always here, whatever the stage is showing — nothing in this
                overlay depends on a frame having worked. */}
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
            >
              {COPY.open} · {hostOf(site.url)} ↗
            </a>
          </div>

          <p className="mt-1 font-body text-[13.5px] font-light leading-[1.5] text-(--color-body)">
            {site.role}
          </p>

          <p className="mt-2 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-dim)">
            {tagsFor(site).join(" · ")}
          </p>

          {/* The same block as the row's, minus See more — we are in it. Keyed
              by site so paging gives the next one its own draft state. */}
          <PickBlock
            key={site.key}
            idPrefix={`overlay-${site.key}`}
            pick={pickFor(site.key)}
            onSave={(next) => onSave(site.key, next)}
            onRemove={() => onRemove(site.key)}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * A paging control. A real button with a text label, always rendered and never
 * hover-revealed — a phone has no hover, and disabled at the ends because a
 * loop hides how big the set is.
 */
function PageButton({
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
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-(--radius) border border-(--color-faint) bg-(--color-card) font-mono text-[16px] text-(--color-dim) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-[rgb(232_185_97/.28)] hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${className ?? ""}`}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}
