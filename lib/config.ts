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

/**
 * Case study visibility. `false` hides a project from Selected work and `/work/[slug]`
 * (404). Content stays in `content/work/` — flip back to `true` when you're ready
 * to surface it.
 */
export const WORK_PUBLISHED: Partial<Record<string, boolean>> = {
  "conscious-connections": false,
};

export function isWorkPublished(slug: string): boolean {
  return WORK_PUBLISHED[slug] !== false;
}

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
    "Twelve products taken from zero to one — consumer marketplaces, AI platforms, healthtech, and accommodation booking.",
} as const;

/** 0→1 builds without a full case study on the site. */
export const OTHER_BUILDS = [
  "Social Photography Hub",
  "Artist Hivemind Hub",
  "Crypto Alerts",
  "GIS Drone Imagery Reporting Suite",
] as const;

/**
 * The core-stack line under the Capabilities cards. Curated, not exhaustive —
 * the full taxonomy lives in the résumé PDF, and the deep claims live inside
 * the case studies. Taylor owns the final cut of this list.
 */
export const CORE_STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind",
  "shadcn/ui",
  "tRPC",
  "TanStack Query",
  "Zod",
  "Drizzle",
  "Postgres",
  "Supabase",
  "Sanity",
  "Cursor",
  "Claude Code",
  "Claude API",
  "Turborepo",
  "Git",
  "Linear",
  "agent-orchestrated development",
  "engineering conventions as artifacts",
  "Stripe",
  "Resend",
  "Vercel",
] as const;
