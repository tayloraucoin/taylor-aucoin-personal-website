"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ExampleSite } from "@/content/intake-examples";
import { hostOf } from "@/lib/intake/taste-picks";

/** Below this width a frame would show the site's phone layout, not its hero. */
export const FRAME_MIN_WIDTH = 1024;

/** The MacBook Pro 14" aspect every capture is shot at, and the box a frame gets. */
const ASPECT = 1512 / 982;

/** Room at the stage's sides for the paging arrows on a wide viewport. */
const GUTTER = 112;

/** The stage never gets narrower than this, whatever the viewport does. */
const MIN_WIDTH = 320;

/** How long the capture holds after the frame loads, so nothing flashes. */
const HANDOVER_MS = 400;

export type StageBox = { width: number; height: number; wide: boolean };

/**
 * The largest MacBook-aspect rectangle that fits the viewport.
 *
 * Computed in JavaScript and applied as explicit pixel width and height, not
 * expressed in CSS — this repo has shipped the `next/image` sizing bug once
 * (`CLAUDE.md`), and `aspect-ratio` cannot rescue it because it only derives a
 * *missing* dimension and so cannot shrink a width when the height is what
 * binds. `MediaLightbox` computes its fitted size for the same reason.
 */
export function measureStage(): StageBox {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const wide = vw >= FRAME_MIN_WIDTH;

  const available = Math.max(MIN_WIDTH, vw - (wide ? GUTTER : 32));
  const byHeight = vh * 0.62 * ASPECT;
  const width = Math.max(MIN_WIDTH, Math.round(Math.min(available, byHeight)));

  return { width, height: Math.round(width / ASPECT), wide };
}

/**
 * What a client looks at in the overlay: the site itself where that is
 * possible, and its captures where it is not.
 *
 * ## Why the frame is a curation fact and not a runtime check
 *
 * Squarespace, Wix, Webflow, Format, and Fabrik all send `X-Frame-Options` by
 * default, and between them they host most of the research set. A blocked frame
 * renders blank and **the browser does not tell page script that it was
 * blocked** — `load` fires either way in Chromium. So nothing here can detect
 * it; `embed` is set by whoever curated the set, after opening the site in this
 * overlay and watching it render (D-PORT-17). Default false, and false is the
 * good outcome: the capture strip is honest and always works.
 *
 * The capture sits **under** the frame from the first paint and hands over only
 * once the frame has loaded. A client sees the site immediately either way, a
 * slow frame never shows a blank box, and a frame that never arrives leaves the
 * capture in place with nobody told anything alarming.
 */
export function SiteStage({
  site,
  box,
}: {
  site: ExampleSite;
  box: StageBox;
}) {
  const framed = box.wide && site.embed;
  const [loaded, setLoaded] = useState(false);
  const [handedOver, setHandedOver] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  // A new site is a new stage: the old frame's load state must not carry over
  // or the incoming capture would hide before its frame had painted.
  useEffect(() => {
    setLoaded(false);
    setHandedOver(false);
    setShown(0);
    strip.current?.scrollTo({ left: 0 });
  }, [site.key]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setHandedOver(true), HANDOVER_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  const first = site.captures[0];

  if (framed) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-(--radius) border border-(--color-faint) bg-(--color-card)"
        style={{ width: box.width, height: box.height }}
      >
        <iframe
          // Keyed so paging replaces the element rather than re-pointing it,
          // which keeps "one frame in the DOM" true by construction.
          key={site.key}
          src={site.url}
          title={`Live view of ${hostOf(site.url)}`}
          loading="lazy"
          /**
           * No forms, no top-level navigation, no downloads, no modals.
           * `allow-same-origin` grants the framed site its *own* origin, so its
           * scripts and cookies work; it grants nothing on ours.
           */
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          /**
           * The one line that matters most here. This page's URL carries the
           * client's intake token, and a framed site must never receive it.
           */
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          width={box.width}
          height={box.height}
          className="block h-full w-full border-0"
        />

        {first ? (
          <Image
            src={first.src}
            alt={`${site.name} — ${first.alt}`}
            width={box.width}
            height={box.height}
            className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-(--dur-base) ease-(--ease-out) ${
              handedOver ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="shrink-0" style={{ width: box.width }}>
      <div
        ref={strip}
        onScroll={(event) => {
          const el = event.currentTarget;
          setShown(Math.round(el.scrollLeft / Math.max(1, box.width)));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-(--radius) border border-(--color-faint) bg-(--color-card)"
        style={{ width: box.width, height: box.height }}
      >
        {site.captures.map((capture, index) => (
          <Image
            key={capture.src}
            src={capture.src}
            alt={
              index === 0
                ? `${site.name} — ${capture.alt}`
                : `${site.name} — ${capture.alt}`
            }
            width={box.width}
            height={box.height}
            className="block shrink-0 snap-start"
            style={{ width: box.width, height: box.height }}
          />
        ))}
      </div>

      {/* Dots only when there is more than one capture to move between. */}
      {site.captures.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2">
          {site.captures.map((capture, index) => (
            <button
              key={capture.src}
              type="button"
              aria-label={`Capture ${index + 1} of ${site.captures.length}`}
              aria-current={index === shown}
              onClick={() =>
                strip.current?.scrollTo({
                  left: index * box.width,
                  behavior: "smooth",
                })
              }
              className={`h-2.5 w-2.5 rounded-full transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
                index === shown ? "bg-(--color-c2)" : "bg-(--color-faint)"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
