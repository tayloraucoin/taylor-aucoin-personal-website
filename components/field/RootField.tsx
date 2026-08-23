"use client";

import { useEffect, useRef } from "react";
import { FIELD, FIELD_VERSION } from "@/lib/config";
import type { FieldControl, Variant } from "./types";
import { mountRootFieldV1 } from "./v1";
import { mountRootField } from "./v2/mount";

export type { FieldControl } from "./types";

/**
 * RootField — the site's signature.
 *
 * A recursive root system seeded from the left edge and bottom, branching and
 * tapering like mycelium. A `tech(x)` factor ramps left→right; as it rises,
 * branch angles snap toward 45° multiples and segments switch from organic
 * quadratic curves to chamfered PCB routing with vias at the terminals.
 *
 * Roots become circuits. That is the whole idea. Read docs/TASTE-PROFILE.md.
 *
 * Rules encoded across this directory, each learned by breaking it:
 *  - 45°, never 90°. Right angles read as janky.
 *  - Cursor glow is gated by `gain`, which eases to 0 over any interactive
 *    element. The interface always wins over the atmosphere.
 *  - Every fade eases. Nothing snaps.
 *  - The tree is built once per resize, never per frame — and only when the
 *    geometry actually changed. Mobile browsers fire `resize` when the URL bar
 *    collapses during scroll; rebuilding there teleports every node.
 *  - The clock is wall-time, not frame-count. A 120Hz phone must not run 2×
 *    fast, and dropped frames must not slow the field down.
 *  - `prefers-reduced-motion` is live, not sampled once. Chrome DevTools (and
 *    the OS) can flip it while the page is mounted; the field must freeze and
 *    resume accordingly without a remount.
 *
 * Layout of this directory:
 *  - types.ts     shared contracts (Seg, Pad, FieldControl, MountOptions)
 *  - v1.ts        the pre-banner-rework field, frozen for the A/B
 *  - v2/growth.ts fork/taper tuning per variant
 *  - v2/build.ts  geometry — pure, no canvas
 *  - v2/draw.ts   paint — pure function of a Scene
 *  - v2/mount.ts  the stateful shell: sizing, listeners, loop, control
 */
export default function RootField({
  showPads = FIELD.SHOW_PADS,
  variant = "page",
  size,
  dpr,
  intensity = 1,
  interactive = true,
  controlRef,
}: {
  showPads?: boolean;
  /** "banner" re-sows the seeds for a 4:1 cover image. See v2/build.ts. */
  variant?: Variant;
  /** Explicit CSS px — use when an ancestor is CSS-transformed. */
  size?: { w: number; h: number };
  /** Force the backing-store ratio (export renders at 2 regardless of display). */
  dpr?: number;
  /** Alpha multiplier. 1 is the site's tuned value; do not change it on the site. */
  intensity?: number;
  interactive?: boolean;
  controlRef?: React.RefObject<FieldControl | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const w = size?.w;
  const h = size?.h;

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvasEl || !wrapEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    // The A/B arm only exists for the page field. v1 predates the banner,
    // the control handle, and the fixed-size options, so those always get v2.
    if (FIELD_VERSION === 1 && variant === "page") {
      return mountRootFieldV1(canvasEl, wrapEl, ctx, showPads);
    }
    return mountRootField(
      canvasEl,
      wrapEl,
      ctx,
      {
        showPads,
        variant,
        size: w != null && h != null ? { w, h } : null,
        forceDpr: dpr ?? null,
        intensity,
        interactive,
      },
      controlRef ?? null,
    );
    // `intensity` seeds the initial value only; live changes go through
    // controlRef so they never re-seed the tree.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPads, variant, w, h, dpr, interactive, controlRef]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={
        variant === "banner"
          ? "pointer-events-none absolute inset-0"
          : "pointer-events-none absolute inset-0 -z-10 animate-[fieldin_800ms_ease-out_forwards] opacity-0"
      }
      style={{ ["--tw-enter" as string]: "" }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <style>{`@keyframes fieldin { to { opacity: 1 } }`}</style>
    </div>
  );
}
