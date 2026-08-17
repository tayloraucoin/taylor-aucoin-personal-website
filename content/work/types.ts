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

export type Media = {
  src: string;
  alt: string;
  caption?: string;
  /** Portrait / mobile captures — phone-width, centered on a dark field. */
  size?: "full" | "narrow";
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
  media: Media[];
  links?: CaseLink[];
};
