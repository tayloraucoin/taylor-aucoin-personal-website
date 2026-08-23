import type { Variant } from "../types";

export type Growth = {
  maxDepth: number;
  minLen: number;
  minW: number;
  lenDecay: number;
  lenJit: number;
  wDecay: number;
  wJit: number;
  forkChance: number;
  forkBoost: number;
  fork: number;
};

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
const BANNER_GROWTH: Growth = {
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
};

const PAGE_GROWTH: Growth = {
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

export const growthFor = (variant: Variant): Growth =>
  variant === "banner" ? BANNER_GROWTH : PAGE_GROWTH;

/** Depth normalizer, so the page's `d / 9` tuning survives a deeper tree. */
export const depthN = (growth: Growth) => growth.maxDepth + 1;
