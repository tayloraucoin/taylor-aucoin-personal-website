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
  decision: string;
  alternative: string;
  why: string;
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

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  meta: string;
  role: string;
  period: string;
  stack: string[];
  constraint: string;
  built: string[];
  decisions: Decision[];
  broke?: string;
  outcome: string;
  media: Media[];
  links?: CaseLink[];
};
