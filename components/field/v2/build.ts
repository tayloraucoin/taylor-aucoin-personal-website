import { FIELD } from "@/lib/config";
import { clamp01, type Pad, type Seg, type Variant } from "../types";
import { growthFor } from "./growth";

/**
 * Geometry only. Given a CSS-pixel box and a variant, grow the whole tree
 * synchronously and return it. No canvas, no listeners, no clock — the
 * stateful shell in `mount.ts` owns those. Randomness is unseeded on
 * purpose: every build is a fresh layout, and the resize guard in mount
 * is what keeps that from firing when the geometry didn't change.
 */
export function buildGeometry(
  W: number,
  H: number,
  variant: Variant,
): { segs: Seg[]; pads: Pad[] } {
  const GROWTH = growthFor(variant);
  const segs: Seg[] = [];
  let pads: Pad[] = [];

  const tech = (x: number) =>
    Math.max(0, Math.min(1, (x - W * 0.32) / (W * 0.46)));

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

  function buildPage() {
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

  /**
   * Banner seeding. Same growth rules, different sowing: the page seeds the
   * whole left edge and the bottom-left, both of which land squarely under
   * LinkedIn's avatar. Here the left edge is seeded only in its upper band,
   * and the extra trunks are pushed right of center.
   */
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

  if (variant === "banner") buildBanner();
  else buildPage();

  return { segs, pads };
}
