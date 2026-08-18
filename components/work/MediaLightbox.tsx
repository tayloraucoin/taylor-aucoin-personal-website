"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { MediaItem } from "@/content/work";

export type ZoomItem = Pick<MediaItem, "src" | "alt" | "caption">;

/**
 * Click-to-zoom for the case-study media strip.
 *
 * Deliberately NOT `components/ui/Overlay`. A case study already renders inside
 * that shell via the intercepting route, and Overlay listens for Escape on
 * `document` and owns `body.overflow` — nesting a second instance means one Esc
 * press closes both dialogs and the scroll lock un-restores wrong. So this is
 * purpose-built to coexist with an Overlay above it:
 *
 *  - Escape is caught in the CAPTURE phase on `document`, which runs before any
 *    bubble-phase listener on `document`, and propagation is stopped there. The
 *    parent Overlay never sees the key, so Esc closes the image and leaves the
 *    case study open. `stopPropagation` alone would not be enough — Overlay's
 *    listener sits on the same node, so it takes `stopImmediatePropagation`.
 *  - `body.overflow` is saved and restored to its PRIOR value, not to "". Inside
 *    an Overlay that prior value is already "hidden", so closing the image does
 *    not silently unlock the case study behind it.
 *  - Rendered through a portal to `document.body`. The Overlay scrim carries
 *    `backdrop-blur`, and a backdrop-filter ancestor becomes the containing
 *    block for fixed-position descendants; the portal keeps `fixed inset-0`
 *    meaning the viewport regardless of what is above it in the tree.
 *
 * Children are the server-rendered figures. Keeping them as children means the
 * ~40 `next/image` elements in a full strip never hydrate — only this shell
 * does. The strip is the last thing on a long page and TBT is already a known
 * problem here (ATM-02); this is not the place to add hydration work.
 *
 * Zoom triggers are located by `[data-zoom-index]` and clicks are delegated, so
 * the figures stay server components. They are real `<button>`s, which also
 * enrolls them in the root field's cursor-glow fade for free — RootField watches
 * `a,button,[data-interactive]`, and the interface always wins over the
 * atmosphere.
 */
export default function MediaLightbox({
  items,
  children,
}: {
  items: ZoomItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  /** Last viewed index, so focus returns to the right thumbnail after paging. */
  const lastIndex = useRef(0);
  const [mounted, setMounted] = useState(false);
  /**
   * The box the zoomed capture has to fit inside: viewport minus the scrim's
   * px-4, and 78% of the height. Measured rather than expressed in CSS because
   * the image needs an EXPLICIT pixel width — see the sizing note below.
   * Initialised during the first client render so the image never renders a
   * frame late; the portal does not exist during SSR, so this cannot mismatch.
   */
  const [box, setBox] = useState(() =>
    typeof window === "undefined"
      ? null
      : { w: window.innerWidth - 32, h: window.innerHeight * 0.78 },
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open !== null) lastIndex.current = open;
  }, [open]);

  const isOpen = open !== null;
  const count = items.length;

  useEffect(() => {
    if (!isOpen) return;

    const step = (delta: number) =>
      setOpen((i) => (i === null ? null : (i + delta + count) % count));

    const onKey = (e: KeyboardEvent) => {
      // Escape must not reach the case-study Overlay's own document listener.
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setOpen(null);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key === "Tab") {
        // Every focusable in the panel is a button, so the cycle is this simple.
        const focusable = panelRef.current?.querySelectorAll("button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Capture phase: runs before the Overlay's bubble-phase listener.
    document.addEventListener("keydown", onKey, true);

    // Captured here, not read in cleanup — the ref could point elsewhere by then.
    const container = containerRef.current;

    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Locking the body does not stop the Overlay's own scroll container, which
    // is the real scroller when a case study is in the panel.
    const scrim = scrimRef.current;
    const block = (e: Event) => e.preventDefault();
    scrim?.addEventListener("wheel", block, { passive: false });
    scrim?.addEventListener("touchmove", block, { passive: false });

    const measure = () =>
      setBox({ w: window.innerWidth - 32, h: window.innerHeight * 0.78 });
    measure();
    window.addEventListener("resize", measure);

    panelRef.current?.focus();

    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = priorOverflow;
      scrim?.removeEventListener("wheel", block);
      scrim?.removeEventListener("touchmove", block);
      container
        ?.querySelector<HTMLElement>(`[data-zoom-index="${lastIndex.current}"]`)
        ?.focus();
    };
  }, [isOpen, count]);

  const onDelegatedClick = (e: React.MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-zoom-index]");
    if (!trigger) return;
    setOpen(Number(trigger.dataset.zoomIndex));
  };

  const item = open === null ? null : items[open];

  /**
   * Scale the capture to fit `box`, preserving ratio, never upscaling past the
   * source. Null when the source has no intrinsic dimensions (a plain string
   * src) or before the viewport is known.
   */
  const dims = item && typeof item.src !== "string" ? item.src : null;
  const scale =
    dims && box ? Math.min(box.w / dims.width, box.h / dims.height, 1) : null;
  const fitted =
    dims && scale !== null
      ? { w: Math.round(dims.width * scale), h: Math.round(dims.height * scale) }
      : null;

  const chip =
    "rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.7)] px-3 py-2 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-body) backdrop-blur transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-[rgb(232_185_97/.55)] hover:text-(--color-ink) disabled:opacity-40";

  return (
    <div ref={containerRef} onClick={onDelegatedClick}>
      {children}
      {/* `open !== null` rather than just `item` so the index narrows for the counter. */}
      {mounted &&
        open !== null &&
        item &&
        createPortal(
          <div
            ref={scrimRef}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[rgb(3_5_16/.94)] px-4 py-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={item.alt}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              /**
               * `w-full` is load-bearing. Without it this column shrinks to fit
               * its widest child, the caption's `max-w-[62ch]` sets that width,
               * and the image's `max-w-full` then clamps to the caption instead
               * of the viewport — the zoomed image came out 473px wide.
               */
              className="flex max-h-full w-full flex-col items-center gap-3 outline-none"
            >
              {/* No tint, no gradient over the capture — the image is the content. */}
              {/*
                TRAP, already hit once: do NOT size the zoomed capture with
                `w-auto` and let intrinsic sizing do the work. `sizes="100vw"`
                makes the browser choose the 3840w candidate, but the optimizer
                never upscales past the source, so a 1536px-wide capture arrives
                as a 1536px file while the srcset still claims 3840w. The browser
                reads that as a 3x image and lays it out at a third of its size —
                a 1536px diagram rendered 514px wide, silently, no console
                warning. CSS `aspect-ratio` does not rescue this either: it only
                derives a MISSING dimension, so it cannot shrink the width when
                max-height is the binding constraint.

                So the fitted size is computed above and passed explicitly. An
                explicit width takes density out of the layout entirely, the
                border hugs the capture at any aspect ratio, and `sizes` becomes
                exact instead of a guess.

                `priority` because this only mounts on an explicit click — the
                reader is already waiting on it, and it never competes with the
                initial page load.
              */}
              {fitted ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={fitted.w}
                  height={fitted.h}
                  sizes={`${fitted.w}px`}
                  priority
                  className="rounded-(--radius) border border-(--color-faint)"
                />
              ) : (
                /* No intrinsic dimensions available. A plain img carries no
                   srcset, so intrinsic sizing is trustworthy here. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={typeof item.src === "string" ? item.src : item.src.src}
                  alt={item.alt}
                  className="h-auto max-h-[78dvh] w-auto max-w-full rounded-(--radius) border border-(--color-faint)"
                />
              )}
              {item.caption && (
                <p className="max-w-[62ch] text-center font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
                  {item.caption}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen((i) => (i === null ? null : (i - 1 + count) % count))}
                  aria-label="Previous image"
                  disabled={count < 2}
                  className={chip}
                >
                  ←
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
                  {open + 1} / {count}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen((i) => (i === null ? null : (i + 1) % count))}
                  aria-label="Next image"
                  disabled={count < 2}
                  className={chip}
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className={chip}
                >
                  Esc
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
