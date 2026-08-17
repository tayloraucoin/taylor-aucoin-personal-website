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

/**
 * Cal.com "Intro call" booking link (PRE-03). Every booking CTA on the site
 * resolves here — this constant is the only place the URL lives.
 */
export const BOOKING_URL = "https://cal.com/taylor-aucoin/30min";

/**
 * Portrait photo (PRE-04), served from `public/`. `null` until the asset
 * exists — the bio block renders without it and closes cleanly.
 */
export const PHOTO: string | null = "/images/me-headshot-1.png";

/**
 * Testimonial preview gate (TST-01). While true, entries with
 * `approved: false` render WITH a "pending approval" chip so Taylor can see
 * the feature before confirmations land. MUST be false before deploy (QA-08)
 * — production shows only approved quotes.
 */
export const SHOW_PENDING_TESTIMONIALS = false;

export const SITE = {
  name: "Taylor Aucoin",
  role: "Senior/staff product engineer",
  location: "Vancouver",
  url: "https://tayloraucoin.com",
  email: "hello@tayloraucoin.com",
  github: "https://github.com/tayloraucoin",
  linkedin: "https://www.linkedin.com/in/taylor-aucoin/",
  resume: "/taylor-aucoin-resume.pdf",
  tagline:
    "Twelve products taken from zero to one — consumer marketplaces, AI platforms, healthtech, and accommodation booking.",
  /**
   * Home page `<meta name="description">`. Written to survive truncation at
   * ~160 characters in a Slack or Gmail link preview — which is why it is not
   * composed from `role` + `tagline`. Keep it 140–160 characters.
   */
  metaDescription:
    "Senior/staff product engineer in Vancouver. Twelve products taken from zero to one: consumer marketplaces, AI platforms, healthtech, and booking.",
} as const;

/**
 * Social card image, served from `public/`.
 *
 * `null` until the asset exists. A card that points at a missing file previews
 * worse than no card at all — Slack renders a broken frame instead of falling
 * back to text. Drop `og.png` (1200×630) into `public/`, set this to
 * `"/og.png"`, and every route picks it up; `twitter:card` upgrades from
 * `summary` to `summary_large_image` on its own. See `lib/metadata.ts`.
 */
export const OG_IMAGE: string | null = null;

/** Stack page `<meta name="description">`. 140–160 characters. */
export const STACK_META_DESCRIPTION =
  "The full working stack behind the case studies: languages, frameworks, databases and search, infrastructure, commerce integrations, and AI engineering.";

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
