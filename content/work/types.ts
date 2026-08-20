/**
 * Case study types.
 *
 * Taylor has not confirmed he has screenshots or UI captures for these projects.
 * The template is built to work with `media: []`. It leads with constraints,
 * decisions, and tradeoffs — and treats imagery as optional enrichment.
 *
 * The `decisions` array is the most important field. Do not let it be thin.
 * All prose is Taylor's. Do not "improve" it unprompted.
 */

import type { StaticImageData } from "next/image";

export type Decision = {
  /** Mono chip above the decision statement. Optional — omitted when unset. */
  chip?: string;
  decision: string;
  alternative: string;
  why: string;
};

/** A mono sub-header plus its bullet list. Used by structured `brief`/`process`. */
export type BulletGroup = {
  header: string;
  bullets: string[];
};

/** Structured shape for `brief`: an intro paragraph plus labeled bullet groups. */
export type BriefContent = {
  intro: string;
  groups: BulletGroup[];
};

/** One mini-section of `process`: a card-heading, a short intro, and bullets. */
export type ProcessSection = {
  header: string;
  intro: string;
  bullets: string[];
};

/** Structured shape for `process`: an intro paragraph plus ordered mini-sections. */
export type ProcessContent = {
  intro: string;
  sections: ProcessSection[];
};

/** One LabelCard in the structured `built` grid. */
export type BuiltCard = {
  label: string;
  body: string;
  /** Rare: an outbound doc link inside the card. Only set where truly needed. */
  link?: { label: string; href: string };
};

/** Structured shape for `built`: an intro paragraph plus a LabelCard grid. */
export type BuiltContent = {
  intro: string;
  cards: BuiltCard[];
};

/** One LabelCard in structured `broke` — `chip` is the in-card label, `body` the copy. */
export type BrokeCategory = {
  chip: string;
  body: string;
};

/** Structured shape for `broke`: intro, category bullets, optional closing paragraph. */
export type BrokeContent = {
  intro: string;
  categories: BrokeCategory[];
  closing?: string;
};

/** Structured shape for `outcome`: an intro paragraph plus bullets. */
export type OutcomeContent = {
  intro: string;
  bullets: string[];
};

/** One capture in the media strip. */
export type MediaItem = {
  /**
   * Prefer a static import — `import shot from "@/public/work/<slug>/x.webp"`.
   * Next reads intrinsic width/height at build time, so the layout box is
   * reserved before the image loads and CLS is structurally impossible. A
   * plain string still works but forfeits that, so only reach for one if the
   * asset genuinely cannot live in `public/`.
   */
  src: StaticImageData | string;
  alt: string;
  /** Mono metadata under the image. Short. */
  caption?: string;
  /**
   * "full" (default) — its own row, at content width.
   * "half" — pairs with an *adjacent* `half` into a 2-up row on desktop and
   *   stacks on mobile. A `half` with no neighbouring `half` renders full width,
   *   because a half-width image alone on the left reads as a layout bug.
   * "narrow" — portrait / phone capture, capped at 360px on a dark panel. Two
   *   adjacent `narrow` items sit side by side on desktop, which is how you show
   *   one moment across two devices.
   */
  size?: "full" | "half" | "narrow";
  /**
   * "plain" (default) — the capture sits directly on the ground.
   * "panel" — inset on a dark field. For anything with a light background,
   *   chiefly architecture diagrams, so it does not butt against the page
   *   gradient. `narrow` is always panelled and ignores this.
   */
  frame?: "plain" | "panel";
  /**
   * Turns the entry into a screen recording. `src` stays required and becomes
   * the poster frame, so the slot still reserves the right box and still reads
   * correctly before anything plays — and if the video ever fails to load, a
   * real image is what remains.
   *
   * Deliberately `controls`, `preload="none"`, and never autoplay: nothing
   * downloads until the reader presses play, and `prefers-reduced-motion` is
   * satisfied by construction rather than by a media query. Video entries are
   * not zoomable — a lightbox around a player fights its own controls.
   *
   * NO GIFs. A GIF is many times the size of an equivalent MP4 and always
   * animates, which breaks the reduced-motion contract. Convert to MP4/WebM
   * and use a poster frame.
   */
  video?: {
    /** Path under `public/work/<slug>/`. MP4 (h.264) is the safe default. */
    src: string;
    /** Optional second source, listed first when present — e.g. a WebM. */
    altSrc?: string;
    altType?: string;
  };
};

/**
 * A cluster of captures under one mono sub-label.
 *
 * `label` and `intro` are both optional, so a single ungrouped run of captures
 * is just `[{ items: [...] }]` — nothing is forced on a case study that has two
 * screenshots and nothing to say about them.
 *
 * Prefer setting `label` to the matching `built` card label. That makes the
 * strip an index back into What I built, in the case study's own vocabulary,
 * instead of a second naming scheme nobody asked for.
 */
export type MediaGroup = {
  label?: string;
  /** One or two sentences of body copy introducing the cluster. Taylor's words. */
  intro?: string;
  items: MediaItem[];
};

/**
 * A quiet outbound link on a case study — proof the work exists in the wild.
 * These are inscribed metadata exits, not CTAs. See CaseLinks.tsx.
 *
 * `href` is optional: a `deprecated` entry with no href renders as
 * non-interactive dim text (e.g. Agora V1). Live/archived links have an href.
 */
export type CaseLink = {
  label: string;
  href?: string;
  status?: "live" | "archived" | "deprecated";
  note?: string;
};

export type AtAGlanceRow = {
  label: string;
  value: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  meta: string;
  /** One-line description under the title on the Selected Work row. Sentence case. */
  tagline: string;
  /**
   * `<meta name="description">` for `/work/[slug]`. Never rendered on the page.
   *
   * This exists because these links get pasted into Slack and email by
   * recruiters, and the preview truncates at ~160 characters. `brief.intro` used
   * to fill this role and got cut mid-sentence every time. State what was built
   * and the role, in 140–160 characters. See `generateMetadata` in
   * `app/work/[slug]/page.tsx`.
   */
  metaDescription: string;
  /** Short role label under the tags on the Selected Work row. Title case — rendered uppercase. */
  roleLabel: string;
  /** Listed on home but not clickable — case page may still exist for direct URLs. */
  inactive?: boolean;
  role: string;
  period: string;
  /**
   * CASE-06 — maps the study to one of the three /services offers. Rendered
   * as a third item in the header's role · period mono row. Only the family
   * office engagement was genuinely fractional and Agora was Taylor's own
   * venture, so employment-era studies use "Maps to ·" bridge phrasing —
   * it labels the shape of the work without misstating the paperwork.
   */
  engagementType: string;
  stack: string[];
  /**
   * Opt-in: renders a small thumbnail rail of the media strip in the header
   * block (below the stack chips), so the look and feel of the work is
   * visible inside the sixty-second window. Thumbnails open the same
   * lightbox as the strip; a quiet anchor jumps to the full strip.
   *
   * Per-study by design: enable it where the visual design is Taylor's
   * (Everbook, Conscious Connections). Leave it off where the visuals are
   * someone else's design credit (Roomvy) — there the media stays bottom-only
   * with its caption. Does nothing when `media` is empty.
   */
  mediaPreview?: boolean;
  /** Renders as "The brief" when set; otherwise use `constraint` ("The constraint"). */
  brief?: string | BriefContent;
  constraint?: string;
  atAGlance?: AtAGlanceRow[];
  process?: string | ProcessContent;
  /** Defined for future use — not rendered. */
  ending?: string;
  /** Defined for future use — not rendered. */
  lessons?: string;
  built: string[] | BuiltContent;
  decisions: Decision[];
  broke?: string | BrokeContent;
  outcome: string | OutcomeContent;
  media: MediaGroup[];
  links?: CaseLink[];
};
