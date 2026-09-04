/**
 * One example site in the taste gallery.
 *
 * `width` and `height` are the capture's real intrinsic pixels and they are
 * **required**, not optional. This repo has already shipped the bug they
 * prevent once: `next/image` with an unconstrained width renders a capture at a
 * fraction of its size, silently, with nothing in the console (see
 * `CLAUDE.md`). Making the dimensions part of the content contract is what
 * makes that failure impossible here rather than merely unlikely.
 *
 * `key` is stable and outlives the file. A client's picks are stored by key, so
 * renaming one orphans someone's shortlist; add and retire sites instead of
 * renaming them.
 */
export type ExampleCapture = {
  src: string;
  width: number;
  height: number;
  /** What the capture shows, for someone who cannot see it. */
  alt: string;
};

/**
 * Which accordion a site sits in.
 *
 * **Style, never occupation.** A cinematographer should meet every archetype
 * on this list, because the point of the exercise is finding out which one
 * their eye goes to — sorting the gallery by their job would only show them
 * what people like them already do. Occupation is `role`, a line on the row.
 *
 * The six are the archetypes that recurred across the ~110 film sites in the
 * two research libraries (batch one's four, plus batch two's warm/personality
 * and credits/stills clusters). Batch two's audio-first cluster folds into
 * `type-first`, which is what the text-first archetype looks like for a
 * discipline with nothing to show.
 *
 * Shared across every pack: a venture set and a film set use the same six keys
 * with different sites in them. A group with no sites in a pack does not
 * render (D-PORT-15).
 */
export type ExampleGroup =
  | "dark-cinematic"
  | "light-editorial"
  | "type-first"
  | "warm-textured"
  | "stills-credits"
  | "statement";

/**
 * The three axes every site is tagged on.
 *
 * These are exactly the three questions the step used to ask as radios
 * (`darkOrLight`, `stillness`, `density`), moved from something a client
 * answers cold to a property of things they react to. Five scored picks give a
 * weighted vote on each axis without anyone being asked (D-PORT-20).
 */
export type GroundTag = "dark" | "light" | "warm";
export type MotionTag = "still" | "quiet" | "alive";
export type DensityTag = "sparse" | "balanced" | "dense";

/**
 * The modifiers a client can see in a screenshot.
 *
 * A **closed list**, so tags stay comparable across sites and a pattern in
 * someone's picks is readable rather than anecdotal. Adding one is an edit
 * here plus its words in `taxonomy.ts`, which the type makes mandatory.
 *
 * `splash-gate` is deliberately included: both research libraries carry
 * cautionary references on purpose, and a client picking one tells us
 * something a set of only-good sites cannot.
 */
export type StyleTag =
  | "hover-preview"
  | "full-bleed-video"
  | "grid"
  | "index-nav"
  | "horizontal-scroll"
  | "oversized-type"
  | "serif"
  | "mono"
  | "grain"
  | "monochrome"
  | "one-colour-accent"
  | "letterbox"
  | "lightbox-stills"
  | "single-page"
  | "case-studies"
  | "credits-heavy"
  | "splash-gate";

/**
 * Roughly what it would take to reach this site's level.
 *
 * **Never rendered to a client**, and that is a ruling rather than an
 * oversight (D-PORT-15): a client should never be sorted, steered, or silently
 * ranked by what they can afford to copy. It exists because the research's most
 * useful finding for pricing is that a Format or Fabrik theme reads as
 * high-end, so knowing a favourite is template-level changes what the build
 * costs. It prints in the intake document, next to the pick, for Taylor.
 */
export type BuildLevel = "template" | "designer" | "custom";

export type ExampleSite = {
  key: string;
  name: string;
  url: string;
  /** Their occupation, in their words: "Cinematographer · commercials". */
  role: string;
  group: ExampleGroup;
  axes: { ground: GroundTag; motion: MotionTag; density: DensityTag };
  /**
   * At most three, so a row's tag line stays scannable at 375px.
   *
   * The ceiling is checked by `yarn verify:tracks` rather than expressed as a
   * tuple type: the failure belongs to the content, and a verifier can name the
   * site that broke it while a type error can only point at the file.
   */
  styles: readonly StyleTag[];
  /** Document only. See `BuildLevel`. */
  build: BuildLevel;
  /**
   * Whether this site can be shown live inside a frame.
   *
   * **A curation-time fact, and it cannot be anything else.** Squarespace, Wix,
   * Webflow, Format, and Fabrik all send `X-Frame-Options` by default, and a
   * blocked frame is undetectable from page script — `load` fires on a blocked
   * frame in Chromium, so nothing in the app can tell "refused" from "empty".
   * Taylor opens the site in the overlay once and records what he saw
   * (D-PORT-17). Default `false`; the capture strip is the honest fallback and
   * it is what every narrow viewport gets regardless.
   */
  embed: boolean;
  /**
   * ISO date the link was last confirmed live.
   *
   * Both research libraries warn that personal sites go dark or get rebuilt
   * often. The intake document flags a picked site whose check has gone stale,
   * so a dead link is known before the call rather than during it.
   */
  checkedOn: string;
  /**
   * First capture is the opening view; the rest scroll inside the overlay.
   *
   * The first is shot at the MacBook Pro 14" aspect — **1512 × 982**, captured
   * at 2× (3024 × 1964) — because that is the frame a client pictures when they
   * imagine their own site, and because the overlay's live frame uses the same
   * box, so a capture and a frame are never different shapes.
   */
  captures: readonly ExampleCapture[];
};

/**
 * One pack's gallery, and whether it is fit to show a client.
 *
 * `curated` is a separate flag rather than an inference from `sites.length`,
 * and both must hold: a set marked curated with nothing in it is a content
 * error, and the taste step treats it exactly like an uncurated one rather than
 * rendering an empty grid (D-PORT-12).
 */
export type ExampleSet = {
  curated: boolean;
  sites: readonly ExampleSite[];
};
