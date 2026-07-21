/**
 * Field + ring tunables.
 *
 * These are the knobs Taylor asked to be able to flip without hunting through
 * component code. Change them here; nothing else needs to know.
 */
export const FIELD = {
  /** Vias / pads at the branch terminals. Set false to kill them. */
  SHOW_PADS: true,

  /** Gradient ring rotation, degrees per frame. */
  RING_BASE: 0.55,
  RING_HOVER: 1.7,

  /** Cursor-glow ease. Lower = slower fade. Never make this 1 — nothing snaps. */
  GLOW_FADE: 0.055,

  /** Pixels of page height per root trunk. Higher = sparser field. */
  SEED_DENSITY: 150,
} as const;

export const SITE = {
  name: "Taylor Aucoin",
  role: "Senior product engineer",
  location: "Vancouver",
  url: "https://tayloraucoin.com",
  email: "hello@tayloraucoin.com",
  github: "https://github.com/tayloraucoin",
  linkedin: "https://www.linkedin.com/in/taylor-aucoin/",
  resume: "/taylor-aucoin-resume.pdf",
  tagline:
    "Twelve products taken from zero to one — some to market, some to beta, one to a deliberate stop.",
} as const;

/** 0→1 builds without a full case study on the site. */
export const OTHER_BUILDS = ["Photos", "Hivemind", "Marketplace"] as const;
