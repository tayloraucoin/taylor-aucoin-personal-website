import { hexToRgba, type Pad, type Seg } from "../types";
import type { Growth } from "./growth";

/**
 * Everything one paint needs, as a single mutable record. `mount.ts` creates
 * it once and mutates fields in place (build swaps segs/pads, the frame loop
 * advances t and gain, pointer events move mx/my) — one object, zero per-frame
 * allocation, and this module stays a pure function of its input.
 */
export type Scene = {
  segs: Seg[];
  pads: Pad[];
  W: number;
  H: number;
  /** Field clock, seconds-ish (the tuned 0.0052/frame rate). */
  t: number;
  /** Cursor-glow gain, eased in mount. 0 = atmosphere fully yielded. */
  gain: number;
  mx: number;
  my: number;
  reduce: boolean;
  showPads: boolean;
  intensity: number;
  /** Trace color above the tech threshold — c1 on the page, c2 on the banner. */
  TRACE_TECH: string;
  C2: string;
  C3: string;
  growth: Growth;
  depthN: number;
};

function trace(ctx: CanvasRenderingContext2D, s: Seg) {
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

export function drawField(ctx: CanvasRenderingContext2D, scene: Scene) {
  const { segs, pads, W, H, t, gain, mx, my, reduce, intensity } = scene;
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
      s.t > 0.5 ? scene.TRACE_TECH : scene.C2,
      (0.05 + 0.08 * (1 - s.d / scene.depthN) + breathe * 0.028) * intensity +
        near * 0.45,
    );
    ctx.lineWidth = s.w;
    trace(ctx, s);

    const pp = (t * 0.28 + s.ph) % 1;
    if (pp < 0.3 && !reduce && s.d < scene.depthN * 0.667) {
      const k = pp / 0.3;
      ctx.fillStyle = hexToRgba(
        scene.C3,
        (1 - k) * 0.34 * (1 - s.d / scene.growth.maxDepth) * intensity,
      );
      ctx.beginPath();
      ctx.arc(s.ax + (s.bx - s.ax) * k, s.ay + (s.by - s.ay) * k, 1.15, 0, 7);
      ctx.fill();
    }
  }

  if (scene.showPads) {
    for (const p of pads) {
      const near =
        gain > 0.002
          ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 150) * gain
          : 0;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + p.ph * 6.3);
      ctx.strokeStyle = hexToRgba(
        scene.C2,
        (0.09 + pulse * 0.09) * intensity + near * 0.55,
      );
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 1.4, 0, 7);
      ctx.stroke();
      ctx.fillStyle = hexToRgba(
        scene.C2,
        (0.14 + pulse * 0.12) * intensity + near * 0.5,
      );
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.55, 0, 7);
      ctx.fill();
    }
  }
}
