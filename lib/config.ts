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
  "conscious-connections": true,
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

/**
 * The three testimonial slugs the home/services strip leads with, in order.
 * Curation over sort logic — same philosophy as CORE_STACK. Yogesh sits in
 * the third slot over Vaughn deliberately: an engineer Taylor led describing
 * the client/PM/senior multi-hat is the narrative the site sells, and it
 * makes the strip's "and the engineers I led" caption true. Entries missing
 * or unapproved are skipped; remaining slots fill from the visible pool.
 */
export const HOME_TESTIMONIALS = [
  "dawson-whitfield",
  "bruno",
  "yogesh-verma",
] as const;

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
  "Zustand",
  "Zod",
  "Drizzle",
  "Postgres",
  "Supabase",
  "Sanity",
  "Cursor",
  "Claude Code",
  "Claude API",
  "OpenAI API",
  "Turborepo",
  "Git",
  "Linear",
  "agent-orchestrated development",
  "engineering conventions as artifacts",
  "Stripe",
  "Resend",
  "Vercel",
] as const;

/**
 * Google Analytics 4 measurement ID (stream "Taylor Aucoin Web", 15453628349).
 *
 * Read from the environment rather than hardcoded — not because the ID is a
 * secret (it ships in the HTML of every page), but so that preview deploys and
 * local dev, which have no value set, load no tag at all and never pollute the
 * property with traffic that isn't real. Set `NEXT_PUBLIC_GA_ID` on Vercel for
 * the Production environment only.
 *
 * The literal `process.env.NEXT_PUBLIC_GA_ID` reference is required: Next
 * inlines these at build time by static text match, so it cannot be computed.
 */
export const GA_MEASUREMENT_ID: string | null =
  process.env.NEXT_PUBLIC_GA_ID ?? null;

/**
 * Dev-only geo spoof for the consent system.
 *
 * Set a country (and optionally a region) and the middleware treats you as a
 * visitor from there. This overrides the *input* to
 * `lib/consent/jurisdictions.ts`, never its verdict — you are exercising the
 * real table, not bypassing it. Localhost has no Vercel geo headers, so this
 * is the only way to see the banner locally.
 *
 *   { country: "DE" }               → prior-consent   · banner
 *   { country: "GB" }               → prior-consent   · banner
 *   { country: "CA", region: "QC" } → prior-consent   · banner (Law 25)
 *   { country: "CA", region: "QC" } → notice-and-opt-out · no banner
 *   { country: "CH" }               → notice-and-opt-out · no banner
 *   { country: "JP" }               → unrestricted    · no banner
 *   { country: null }               → no geo at all, exercises FALLBACK_REGIME
 *
 * `null` uses the visitor's real location. Read behind `isDev()` in
 * `middleware.ts`, so committing a non-null value by accident cannot reach
 * production — set it back to `null` anyway.
 */
export const DEV_GEO_OVERRIDE: {
  country: string | null;
  region?: string | null;
} | null = null;
