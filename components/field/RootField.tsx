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

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function mountRootField(
  canvasEl: HTMLCanvasElement,
  wrapEl: HTMLDivElement,
  ctx: CanvasRenderingContext2D,
  showPads: boolean,
): () => void {
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = reduceMq.matches;
    const css = getComputedStyle(document.documentElement);
    const C1 = css.getPropertyValue("--color-c1").trim() || "#8b7be8";
    const C2 = css.getPropertyValue("--color-c2").trim() || "#e8b961";
    const C3 = css.getPropertyValue("--color-c3").trim() || "#fff6e3";

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

    function grow(
      x: number,
      y: number,
      ang: number,
      len: number,
      w: number,
      depth: number,
    ) {
      if (depth > 8 || len < 9 || w < 0.3) {
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

      const n = Math.random() < 0.3 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const spread =
          (i - (n - 1) / 2) * (0.42 + Math.random() * 0.3) * (1 - T * 0.55);
        grow(
          bx,
          by,
          a + spread,
          len * (0.71 + Math.random() * 0.15),
          w * (0.71 + Math.random() * 0.1),
          depth + 1,
        );
      }
    }

    function build() {
      const r = wrapEl.getBoundingClientRect();
      builtDpr = window.devicePixelRatio;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (r.width * r.height * dpr * dpr > MAX_CANVAS_AREA) {
        dpr = Math.max(1, Math.sqrt(MAX_CANVAS_AREA / (r.width * r.height)));
      }
      canvasEl.width = r.width * dpr;
      canvasEl.height = r.height * dpr;
      canvasEl.style.width = `${r.width}px`;
      canvasEl.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width;
      H = r.height;
      segs = [];
      pads = [];

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
      const step = dt / BASE_FRAME;
      gain += (gainTarget - gain) * (1 - (1 - FIELD.GLOW_FADE) ** step);
      ctx.clearRect(0, 0, W, H);
      if (!reduce) t += 0.0052 * step;
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
          s.t > 0.5 ? C1 : C2,
          0.05 + 0.08 * (1 - s.d / 9) + breathe * 0.028 + near * 0.45,
        );
        ctx.lineWidth = s.w;
        trace(s);

        const pp = (t * 0.28 + s.ph) % 1;
        if (pp < 0.3 && !reduce && s.d < 6) {
          const k = pp / 0.3;
          ctx.fillStyle = hexToRgba(C3, (1 - k) * 0.34 * (1 - s.d / 8));
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
          ctx.strokeStyle = hexToRgba(C2, 0.09 + pulse * 0.09 + near * 0.55);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 1.4, 0, 7);
          ctx.stroke();
          ctx.fillStyle = hexToRgba(C2, 0.14 + pulse * 0.12 + near * 0.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.55, 0, 7);
          ctx.fill();
        }
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
    const ro = new ResizeObserver(onResize);
    ro.observe(wrapEl);

    build();
    frame(performance.now());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
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
}: {
  showPads?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvasEl || !wrapEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    return mountRootField(canvasEl, wrapEl, ctx, showPads);
  }, [showPads]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 animate-[fieldin_800ms_ease-out_forwards] opacity-0"
      style={{ ["--tw-enter" as string]: "" }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <style>{`@keyframes fieldin { to { opacity: 1 } }`}</style>
    </div>
  );
}
