import { FIELD } from "@/lib/config";
import {
  INTERACTIVE,
  type FieldControl,
  type MountOptions,
} from "../types";
import { buildGeometry } from "./build";
import { depthN, growthFor } from "./growth";
import { drawField, type Scene } from "./draw";

/**
 * The stateful shell: canvas sizing, listeners, the frame loop, and the
 * imperative control handle. Geometry lives in `build.ts`, paint in
 * `draw.ts` — this file owns everything that has a lifetime.
 */
export function mountRootField(
  canvasEl: HTMLCanvasElement,
  wrapEl: HTMLDivElement,
  ctx: CanvasRenderingContext2D,
  opts: MountOptions,
  control: { current: FieldControl | null } | null,
): () => void {
  const { showPads, variant, size, forceDpr, interactive } = opts;
  let paused = false;
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const css = getComputedStyle(document.documentElement);
  const C1 = css.getPropertyValue("--color-c1").trim() || "#8b7be8";
  const C2 = css.getPropertyValue("--color-c2").trim() || "#e8b961";
  const C3 = css.getPropertyValue("--color-c3").trim() || "#fff6e3";
  const growth = growthFor(variant);

  // Everything a paint reads, mutated in place — see Scene in draw.ts.
  const scene: Scene = {
    segs: [],
    pads: [],
    W: 0,
    H: 0,
    t: 0,
    gain: 0,
    mx: -9999,
    my: -9999,
    reduce: reduceMq.matches,
    showPads,
    intensity: opts.intensity,
    // Segment color above the tech threshold. The page splits violet (c1) for
    // circuit and gold (c2) for root — balanced over a tall column. On a 4:1
    // banner the tech side IS the dense side, so that split reads as a flat
    // indigo cast. The banner is single-accent gold: the same `--color-c2`
    // the hero eyebrow, CTA, and ghost button resolve to. One token, one
    // source — change it in globals.css and this follows.
    TRACE_TECH: variant === "banner" ? C2 : C1,
    C2,
    C3,
    growth,
    depthN: depthN(growth),
  };

  let gainTarget = 0;
  let raf = 0;
  let visible = true;
  let last = 0;

  // One 60fps frame, in ms. dt is normalized against this so the tuned
  // per-frame constants keep their exact desktop-at-60Hz feel.
  const BASE_FRAME = 1000 / 60;
  // iOS Safari silently blanks any canvas whose backing store exceeds
  // ~16.7M pixels. Long pages at dpr 2 can cross it; degrade dpr instead.
  const MAX_CANVAS_AREA = 14_000_000;

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
    scene.W = rw;
    scene.H = rh;
    const built = buildGeometry(rw, rh, variant);
    scene.segs = built.segs;
    scene.pads = built.pads;
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
      scene.gain +=
        (gainTarget - scene.gain) * (1 - (1 - FIELD.GLOW_FADE) ** step);
      if (!scene.reduce) scene.t += 0.0052 * step;
      drawField(ctx, scene);
    }

    if (scene.reduce) return; // one static frame, then stop
    raf = requestAnimationFrame(frame);
  }

  // Cursor. Glow eases to zero over any interactive element —
  // a CTA must always be the brightest thing on screen.
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = wrapEl.getBoundingClientRect();
    scene.mx = e.clientX - r.left;
    scene.my = e.clientY - r.top;
    const el = e.target as Element | null;
    gainTarget = el?.closest(INTERACTIVE) ? 0 : 1;
  };
  const onLeave = () => {
    gainTarget = 0;
  };

  // Reduced-motion is honored live. When it lifts, restart the loop —
  // `frame` stopped scheduling itself the moment it went static.
  const onReduceChange = () => {
    scene.reduce = reduceMq.matches;
    if (!scene.reduce) {
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
        Math.abs(r.width - scene.W) < 1 &&
        Math.abs(r.height - scene.H) < 1 &&
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
  drawField(ctx, scene); // paint frame zero even if we mount paused
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
        drawField(ctx, scene);
      },
      getIntensity: () => scene.intensity,
      setIntensity: (v) => {
        scene.intensity = v;
        drawField(ctx, scene); // so the change lands while paused
      },
      getTime: () => scene.t,
      setTime: (v) => {
        scene.t = v;
        drawField(ctx, scene);
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
