"use client";

import { useEffect, useRef } from "react";
import { FIELD } from "@/lib/config";

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
 * Rules encoded here, each learned by breaking it:
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
 */

type Seg = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  w: number;
  t: number;
  d: number;
  ph: number;
};
type Pad = { x: number; y: number; r: number; ph: number };

const INTERACTIVE = "a,button,[data-interactive]";

/**
 * Imperative handle for the field. Pause and intensity are driven through this
 * rather than through props on purpose: a prop change re-runs the effect, which
 * re-seeds the tree. The tree is random, so re-seeding on pause would throw away
 * the exact frame you were trying to freeze.
 *
 * Only `/banner-export` uses this. The site passes nothing.
 */
export type FieldControl = {
  isPaused: () => boolean;
  setPaused: (v: boolean) => void;
  toggle: () => boolean;
  /** Re-seed a fresh random tree at the current size. */
  rebuild: () => void;
  getIntensity: () => number;
  setIntensity: (v: number) => void;
  /** Field clock, in seconds. The geometry does not depend on it — the tree is
   *  built whole and synchronously — so this only moves the alpha breathing and
   *  the traveling pulse dots. Scrub it to pick an exact frame. */
  getTime: () => number;
  setTime: (v: number) => void;
};

type Variant = "page" | "banner";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

type MountOptions = {
  showPads: boolean;
  variant: Variant;
  /** Explicit CSS px. Bypasses measurement — required when an ancestor is
   *  CSS-transformed, since getBoundingClientRect() reports the scaled box. */
  size: { w: number; h: number } | null;
  /** Force the backing-store ratio instead of deriving it from the display. */
  forceDpr: number | null;
  intensity: number;
  interactive: boolean;
};

function mountRootField(
  canvasEl: HTMLCanvasElement,
  wrapEl: HTMLDivElement,
  ctx: CanvasRenderingContext2D,
  opts: MountOptions,
  control: { current: FieldControl | null } | null,
): () => void {
  const { showPads, variant, size, forceDpr, interactive } = opts;
  let intensity = opts.intensity;
  let paused = false;
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = reduceMq.matches;
    const css = getComputedStyle(document.documentElement);
    const C1 = css.getPropertyValue("--color-c1").trim() || "#8b7be8";
    const C2 = css.getPropertyValue("--color-c2").trim() || "#e8b961";
    const C3 = css.getPropertyValue("--color-c3").trim() || "#fff6e3";

    // Segment color above the tech threshold. The page splits violet (c1) for
    // circuit and gold (c2) for root — balanced over a tall column. On a 4:1
    // banner the tech side IS the dense side, so that split reads as a flat
    // indigo cast. The banner is single-accent gold: the same `--color-c2`
    // the hero eyebrow, CTA, and ghost button resolve to. One token, one
    // source — change it in globals.css and this follows.
    const TRACE_TECH = variant === "banner" ? C2 : C1;

    let W = 0;
    let H = 0;
    let segs: Seg[] = [];
    let pads: Pad[] = [];
    let mx = -9999;
    let my = -9999;
    let gain = 0;
    let gainTarget = 0;
    let t = 0;
    let raf = 0;
    let visible = true;
    let last = 0;

    // One 60fps frame, in ms. dt is normalized against this so the tuned
    // per-frame constants keep their exact desktop-at-60Hz feel.
    const BASE_FRAME = 1000 / 60;
    // iOS Safari silently blanks any canvas whose backing store exceeds
    // ~16.7M pixels. Long pages at dpr 2 can cross it; degrade dpr instead.
    const MAX_CANVAS_AREA = 14_000_000;

    const tech = (x: number) =>
      Math.max(0, Math.min(1, (x - W * 0.32) / (W * 0.46)));

    /**
     * Growth shape.
     *
     * The page grows bushes: fork wide, taper fast, die young. That is right
     * for a tall column glimpsed behind text — each trunk is a small dense
     * tuft and the page's height does the distributing.
     *
     * A 1584×396 frame needs the opposite. Short-reach tufts land as isolated
     * clumps with dead space between them, which is what read as "unfinished".
     * The banner forks rarely (often not at all) and tapers slowly, so a trunk
     * travels ~300px instead of ~120px and the routes overlap into one
     * continuous network. Fewer, longer traces — which is also what a real
     * board looks like.
     */
    const GROWTH =
      variant === "banner"
        ? {
            maxDepth: 11,
            minLen: 10,
            minW: 0.26,
            lenDecay: 0.88,
            lenJit: 0.06,
            wDecay: 0.9,
            wJit: 0.05,
            forkChance: 0.3,
            // Forking rises with tech(x), so the network thickens toward the
            // right on its own rather than by sowing more trunks there. Left
            // stays long, open, root-like; right becomes a dense board.
            forkBoost: 0.24,
            fork: 2,
          }
        : {
            maxDepth: 8,
            minLen: 9,
            minW: 0.3,
            lenDecay: 0.71,
            lenJit: 0.15,
            wDecay: 0.71,
            wJit: 0.1,
            forkChance: 0.3,
            forkBoost: 0,
            fork: 3,
          };
    /** Depth normalizer, so the page's `d / 9` tuning survives a deeper tree. */
    const DEPTH_N = GROWTH.maxDepth + 1;

    /**
     * Banner only: LinkedIn's profile photo sits over the lower-left of the
     * cover image, so growth is thinned out there. The falloff is soft and
     * probabilistic — a hard rectangular cut reads as a mask, not as a field.
     */
    function suppressed(x: number, y: number) {
      if (variant !== "banner") return false;
      const lx = clamp01((W * 0.4 - x) / (W * 0.4));
      const ly = clamp01((y - H * 0.38) / (H * 0.34));
      return Math.random() < lx * ly * 0.97;
    }

    function grow(
      x: number,
      y: number,
      ang: number,
      len: number,
      w: number,
      depth: number,
    ) {
      if (depth > 0 && suppressed(x, y)) return;
      if (depth > GROWTH.maxDepth || len < GROWTH.minLen || w < GROWTH.minW) {
        if (x > W * 0.4)
          pads.push({ x, y, r: 0.9 + Math.random() * 1.3, ph: Math.random() });
        return;
      }
      const T = tech(x);
      let a = ang + (Math.random() - 0.5) * (0.6 * (1 - T));
      // Snap toward 45° as we approach the light. Never 90°.
      if (T > 0.15) {
        const q = Math.PI / 4;
        a = a * (1 - T * 0.95) + Math.round(a / q) * q * (T * 0.95);
      }
      const bx = x + Math.cos(a) * len;
      const by = y + Math.sin(a) * len;
      segs.push({ ax: x, ay: y, bx, by, w, t: T, d: depth, ph: Math.random() });

      // n === 1 is a straight continuation, not a fork — that is what lets a
      // banner trace run instead of immediately bushing out.
      const n =
        Math.random() < GROWTH.forkChance + GROWTH.forkBoost * T
          ? GROWTH.fork
          : GROWTH.fork - 1;
      for (let i = 0; i < n; i++) {
        const spread =
          (i - (n - 1) / 2) * (0.42 + Math.random() * 0.3) * (1 - T * 0.55);
        grow(
          bx,
          by,
          a + spread,
          len * (GROWTH.lenDecay + Math.random() * GROWTH.lenJit),
          w * (GROWTH.wDecay + Math.random() * GROWTH.wJit),
          depth + 1,
        );
      }
    }

    function build() {
      const measured = wrapEl.getBoundingClientRect();
      const rw = size ? size.w : measured.width;
      const rh = size ? size.h : measured.height;
      builtDpr = window.devicePixelRatio;
      let dpr = forceDpr ?? Math.min(window.devicePixelRatio || 1, 2);
      if (rw * rh * dpr * dpr > MAX_CANVAS_AREA) {
        dpr = Math.max(1, Math.sqrt(MAX_CANVAS_AREA / (rw * rh)));
      }
      canvasEl.width = rw * dpr;
      canvasEl.height = rh * dpr;
      canvasEl.style.width = `${rw}px`;
      canvasEl.style.height = `${rh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = rw;
      H = rh;
      segs = [];
      pads = [];

      if (variant === "banner") {
        buildBanner();
        return;
      }

      const density = W < 760 ? FIELD.SEED_DENSITY * 1.8 : FIELD.SEED_DENSITY;
      const rows = Math.max(4, Math.round(H / density));
      for (let i = 0; i < rows; i++) {
        grow(
          -16,
          H * ((i + 0.5) / rows) + (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 0.6,
          58 + Math.random() * 30,
          2.3,
          0,
        );
      }
      for (let i = 0; i < 3; i++) {
        grow(
          W * (0.06 + i * 0.15),
          H + 14,
          -Math.PI / 2 + (Math.random() - 0.5) * 0.7,
          50 + Math.random() * 26,
          1.9,
          1,
        );
      }
    }

    /**
     * Banner seeding. Same growth rules, different sowing: the page seeds the
     * whole left edge and the bottom-left, both of which land squarely under
     * LinkedIn's avatar. Here the left edge is seeded only in its upper band,
     * and the extra trunks are pushed right of center.
     */
    /**
     * Gap fill.
     *
     * A trunk picks a random direction, so a seed can wander clean out of its
     * own neighbourhood and leave a hole — and `suppressed()` eats some seeds
     * outright. Sowing more trunks everywhere would just thicken the parts that
     * already worked. So: measure the result, then sow only where it came out
     * thin. This is what makes "no dead gap" a property of the output rather
     * than a property of a lucky seed.
     */
    function fillGaps() {
      const BUCKETS = 18;
      for (let pass = 0; pass < 3; pass++) {
        const hist = new Array(BUCKETS).fill(0);
        for (const s of segs) {
          const mid = (s.ax + s.bx) / 2;
          const b = Math.floor((mid / W) * BUCKETS);
          if (b >= 0 && b < BUCKETS) hist[b]++;
        }
        const median = [...hist].sort((a, b) => a - b)[BUCKETS >> 1];
        const floorCount = median * 0.45;
        let patched = 0;
        for (let b = 0; b < BUCKETS; b++) {
          if (hist[b] >= floorCount) continue;
          patched++;
          const x = W * ((b + 0.5) / BUCKETS);
          // Keep the patch out of the avatar corner: on the left, sow high.
          const leftness = 1 - clamp01(x / (W * 0.42));
          // Patches in the last two buckets aim inward, or they grow straight
          // off the canvas and the bucket stays thin however often we patch it.
          const inward = b >= BUCKETS - 2;
          grow(
            x + (Math.random() - 0.5) * (W / BUCKETS) * 0.7,
            H * (0.1 + Math.random() * 0.8 * (1 - leftness * 0.6)),
            (inward ? Math.PI : 0) + (Math.random() - 0.5) * Math.PI * 0.9,
            44 + Math.random() * 20,
            1.6,
            3,
          );
        }
        if (!patched) break;
      }
    }

    function buildBanner() {
      const jit = () => (Math.random() - 0.5) * 0.6;

      // Left edge, full height. `suppressed()` clears the avatar corner, so
      // the rows don't need to dodge it — letting them start everywhere and
      // thin out keeps the texture continuous instead of cutting a hard band.
      const rows = 5;
      for (let i = 0; i < rows; i++) {
        grow(
          -14,
          H * ((i + 0.5) / rows) + (Math.random() - 0.5) * 34,
          jit(),
          56 + Math.random() * 22,
          2.2,
          0,
        );
      }

      // The spine. This is what closes the gap: trunks sown across the FULL
      // width at roughly 115px centers, each running ~300px under the banner
      // growth params, so consecutive routes overlap rather than sitting as
      // separate islands. Sowing only the left edge cannot work — a trunk runs
      // out of length long before it crosses 1584px.
      const SPINE = 15;
      for (let i = 0; i < SPINE; i++) {
        // u**0.85 tightens the spacing toward the right, where density is
        // wanted; the left stays legible but open.
        const u = (i + 0.5) / SPINE;
        const x = W * (0.04 + 0.94 * u ** 0.85) + (Math.random() - 0.5) * 26;
        // Stratify y with a golden-ratio walk. Independent random y clumps
        // several trunks into one band and leaves a thin stripe elsewhere —
        // that is what left a visible dip around a third of the way across.
        const band = (i * 0.618 + Math.random() * 0.1) % 1;
        // On the left, pull trunks up: a low-left trunk is mostly eaten by
        // `suppressed()` anyway, so placing one there just wastes a seed.
        const leftness = 1 - clamp01(x / (W * 0.42));
        grow(
          x,
          H * (0.08 + 0.84 * band * (1 - leftness * 0.55)),
          (Math.random() - 0.5) * Math.PI * 0.9,
          46 + Math.random() * 22,
          1.7,
          2,
        );
      }

      // Right edge, growing inward. Without these the last ~100px tapers off:
      // a trunk seeded near the edge spends half its growth off-canvas. The
      // left edge is seeded from x = -14 for the same reason. tech(x) is ~1
      // out here, so these snap hard to 45° and arrive as board routing.
      for (let i = 0; i < 4; i++) {
        grow(
          W + 14,
          H * ((i + 0.5) / 4) + (Math.random() - 0.5) * 30,
          Math.PI + jit(),
          50 + Math.random() * 20,
          1.9,
          1,
        );
      }

      // Bottom and top, right half only — anchors the network to the frame the
      // way the page's bottom seeds do, without reaching the avatar corner.
      for (let i = 0; i < 3; i++) {
        grow(
          W * (0.5 + i * 0.18),
          H + 12,
          -Math.PI / 2 + jit(),
          48 + Math.random() * 20,
          1.8,
          2,
        );
      }
      for (let i = 0; i < 2; i++) {
        grow(
          W * (0.62 + i * 0.17),
          -12,
          Math.PI / 2 + jit(),
          46 + Math.random() * 18,
          1.6,
          2,
        );
      }

      fillGaps();

      // Vias stack. A dozen terminals landing within a few px paint their alpha
      // over each other and read as a gold smear rather than a pad — obvious on
      // a 4:1 frame, invisible on the page where they spread over 5000px of
      // height. Keep one per cell.
      const CELL = 9;
      const taken = new Set<string>();
      pads = pads.filter((p) => {
        const k = `${Math.round(p.x / CELL)}:${Math.round(p.y / CELL)}`;
        if (taken.has(k)) return false;
        taken.add(k);
        return true;
      });
    }

    function trace(s: Seg) {
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      if (s.t < 0.34) {
        // Organic: quadratic curve with a perpendicular bow.
        const cx = (s.ax + s.bx) / 2 + (s.by - s.ay) * 0.2;
        const cy = (s.ay + s.by) / 2 - (s.bx - s.ax) * 0.2;
        ctx.quadraticCurveTo(cx, cy, s.bx, s.by);
      } else {
        // Circuit: chamfered 45° route with a rounded corner.
        const dx = s.bx - s.ax;
        const dy = s.by - s.ay;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        let cx: number;
        let cy: number;
        if (ax > ay) {
          cx = s.ax + Math.sign(dx) * (ax - ay);
          cy = s.ay;
        } else {
          cx = s.ax;
          cy = s.ay + Math.sign(dy) * (ay - ax);
        }
        ctx.arcTo(cx, cy, s.bx, s.by, Math.min(5, Math.hypot(dx, dy) / 3));
        ctx.lineTo(s.bx, s.by);
      }
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      for (const s of segs) {
        const px = (s.ax + s.bx) / 2;
        const py = (s.ay + s.by) / 2;
        const near =
          gain > 0.002
            ? Math.max(0, 1 - Math.hypot(px - mx, py - my) / 165) * gain
            : 0;
        const breathe = 0.5 + 0.5 * Math.sin(t * 1.6 + s.ph * 6.3);
        ctx.strokeStyle = hexToRgba(
          s.t > 0.5 ? TRACE_TECH : C2,
          (0.05 + 0.08 * (1 - s.d / DEPTH_N) + breathe * 0.028) * intensity +
            near * 0.45,
        );
        ctx.lineWidth = s.w;
        trace(s);

        const pp = (t * 0.28 + s.ph) % 1;
        if (pp < 0.3 && !reduce && s.d < DEPTH_N * 0.667) {
          const k = pp / 0.3;
          ctx.fillStyle = hexToRgba(
            C3,
            (1 - k) * 0.34 * (1 - s.d / GROWTH.maxDepth) * intensity,
          );
          ctx.beginPath();
          ctx.arc(
            s.ax + (s.bx - s.ax) * k,
            s.ay + (s.by - s.ay) * k,
            1.15,
            0,
            7,
          );
          ctx.fill();
        }
      }

      if (showPads) {
        for (const p of pads) {
          const near =
            gain > 0.002
              ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 150) * gain
              : 0;
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + p.ph * 6.3);
          ctx.strokeStyle = hexToRgba(
            C2,
            (0.09 + pulse * 0.09) * intensity + near * 0.55,
          );
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 1.4, 0, 7);
          ctx.stroke();
          ctx.fillStyle = hexToRgba(
            C2,
            (0.14 + pulse * 0.12) * intensity + near * 0.5,
          );
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.55, 0, 7);
          ctx.fill();
        }
      }
    }

    function frame(now: number) {
      if (!visible) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }
      // Wall-time delta, clamped so a throttled tab resumes where it left off
      // instead of lurching to "catch up".
      const dt = last ? Math.min(now - last, BASE_FRAME * 3) : BASE_FRAME;
      last = now;
      // Paused holds the last painted frame: no clear, no redraw, no advance.
      // The loop keeps scheduling so resuming needs no remount.
      if (!paused) {
        const step = dt / BASE_FRAME;
        gain += (gainTarget - gain) * (1 - (1 - FIELD.GLOW_FADE) ** step);
        if (!reduce) t += 0.0052 * step;
        draw();
      }

      if (reduce) return; // one static frame, then stop
      raf = requestAnimationFrame(frame);
    }

    // Cursor. Glow eases to zero over any interactive element —
    // a CTA must always be the brightest thing on screen.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = wrapEl.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      const el = e.target as Element | null;
      gainTarget = el?.closest(INTERACTIVE) ? 0 : 1;
    };
    const onLeave = () => {
      gainTarget = 0;
    };

    // Reduced-motion is honored live. When it lifts, restart the loop —
    // `frame` stopped scheduling itself the moment it went static.
    const onReduceChange = () => {
      reduce = reduceMq.matches;
      if (!reduce) {
        cancelAnimationFrame(raf);
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    if (reduceMq.addEventListener) {
      reduceMq.addEventListener("change", onReduceChange);
    } else {
      // Safari < 14 only has the deprecated listener API.
      reduceMq.addListener(onReduceChange);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    let builtDpr = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Mobile URL-bar collapse fires resize without changing the page's
        // geometry. The tree is random; rebuilding it here makes every node
        // jump. Only rebuild when the wrap actually changed size — or the
        // display's pixel ratio did (monitor moves still need a rebuild).
        const r = wrapEl.getBoundingClientRect();
        if (
          Math.abs(r.width - W) < 1 &&
          Math.abs(r.height - H) < 1 &&
          window.devicePixelRatio === builtDpr
        )
          return;
        build();
      }, 200);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrapEl);

    // The wrap can change size with no window resize at all — late font or
    // image reflow grows the page under the field. Watch the box itself.
    // (Fires once on observe; the debounced guard skips that no-op.)
    // A fixed-size field has nothing to react to, and its box may be
    // CSS-transformed, which would make the measurement lie.
    const ro = size ? null : new ResizeObserver(onResize);
    ro?.observe(wrapEl);

    build();
    draw(); // paint frame zero even if we mount paused
    raf = requestAnimationFrame(frame);

    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    if (!size) window.addEventListener("resize", onResize);

    if (control) {
      control.current = {
        isPaused: () => paused,
        setPaused: (v) => {
          paused = v;
          last = 0; // resume from now, not from a stale timestamp
        },
        toggle: () => {
          paused = !paused;
          last = 0;
          return paused;
        },
        rebuild: () => {
          build();
          draw();
        },
        getIntensity: () => intensity,
        setIntensity: (v) => {
          intensity = v;
          draw(); // so the change lands while paused
        },
        getTime: () => t,
        setTime: (v) => {
          t = v;
          draw();
        },
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro?.disconnect();
      if (control) control.current = null;
      if (reduceMq.removeEventListener) {
        reduceMq.removeEventListener("change", onReduceChange);
      } else {
        reduceMq.removeListener(onReduceChange);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
}

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
  /** "banner" re-sows the seeds for a 4:1 cover image. See buildBanner(). */
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
