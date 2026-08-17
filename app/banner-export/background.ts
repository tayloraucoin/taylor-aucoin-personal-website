/**
 * The site's ground, painted twice: once as a CSS string for the on-screen
 * preview, once into a canvas for the PNG export. Both must stay in sync — if
 * you touch one, touch the other, or the exported file will not match what you
 * approved on screen.
 *
 * This mirrors the `body` rule in app/globals.css, with one difference: the
 * site's background is `attachment: fixed` (viewport-relative), while here the
 * percentages resolve against the 1584×396 box. That is the point — the banner
 * gets its own self-contained composition rather than a crop of the page's.
 *
 * Temporary. Deleted with the rest of /banner-export.
 */

/**
 * `--color-ground-a` from globals.css — the site's dark base. Solid, flat.
 *
 * The page ramps this to `--color-ground-b` (#151033), which is a deep indigo,
 * and lays a violet radial over the lower left. Both are correct on a tall page
 * and both read as a purple cast on a 4:1 crop, so the banner takes the base
 * color alone. If you want the page's ramp back, add GROUND_B as a second stop
 * in `paintBackground` and mirror it in BACKGROUND_CSS.
 */
const GROUND_A = "#060b1e";
/** gold, matching rgb(232 185 97 / 0.10) in globals.css — the only accent */
const GLOW_GOLD = { r: 232, g: 185, b: 97, a: 0.1 };

/** Gold only. The violet radial is deliberately not here. */
const GLOWS = [
  // radial-gradient(105% 55% at 84% 8%, gold, transparent 55%)
  { c: GLOW_GOLD, rx: 1.05, ry: 0.55, x: 0.84, y: 0.08, stop: 0.55 },
] as const;

const GRAIN_OPACITY = 0.12;

export const BACKGROUND_CSS = `
  radial-gradient(105% 55% at 84% 8%, rgb(232 185 97 / 0.10) 0%, transparent 55%),
  ${GROUND_A}
`;

const rgba = (c: { r: number; g: number; b: number }, a: number) =>
  `rgba(${c.r},${c.g},${c.b},${a})`;

/**
 * Paint ground + glows into `ctx`, in CSS px (apply your dpr scale first).
 * Grain is deliberately not included here — it must be drawn in device pixels,
 * so `paintGrain` runs separately, after the transform is reset.
 */
export function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.fillStyle = GROUND_A;
  ctx.fillRect(0, 0, w, h);

  for (const glow of GLOWS) {
    const rx = w * glow.rx;
    const ry = h * glow.ry;
    ctx.save();
    ctx.translate(w * glow.x, h * glow.y);
    // Canvas radial gradients are circular; squash to get the CSS ellipse.
    ctx.scale(1, ry / rx);
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    rg.addColorStop(0, rgba(glow.c, glow.c.a));
    // Fade to the same hue at zero alpha, never to `transparent`/black —
    // canvas interpolates un-premultiplied, so fading to black darkens the
    // midpoint and leaves a visible dirty ring.
    rg.addColorStop(glow.stop, rgba(glow.c, 0));
    rg.addColorStop(1, rgba(glow.c, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(-rx * 2, -rx * 2, rx * 4, rx * 4);
    ctx.restore();
  }
}

/**
 * Grain, in device pixels. Without it a 3168px-wide gradient bands badly, and
 * LinkedIn's JPEG pass makes the banding worse, not better.
 */
export function paintGrain(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const tile = document.createElement("canvas");
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext("2d");
  if (!tctx) return;
  const img = tctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 165;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 128;
  }
  tctx.putImageData(img, 0, 0);

  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = GRAIN_OPACITY;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
