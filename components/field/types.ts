/**
 * Shared contracts for the root field. Both implementations (v1, v2) speak
 * these types; the A/B switch in `lib/config.ts` picks which one mounts.
 */

export type Seg = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  w: number;
  t: number;
  d: number;
  ph: number;
};

export type Pad = { x: number; y: number; r: number; ph: number };

export type Variant = "page" | "banner";

export const INTERACTIVE = "a,button,[data-interactive]";

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

export type MountOptions = {
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

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
