import type {
  BuildLevel,
  DensityTag,
  ExampleGroup,
  ExampleSite,
  GroundTag,
  MotionTag,
  StyleTag,
} from "./types";

/**
 * The words for every value in the gallery's vocabulary.
 *
 * **One home, three consumers.** The accordion headers, the tags on a row, and
 * the intake document all read from here, so a group cannot be called one thing
 * on screen and another in the document Taylor builds from. `types.ts` owns the
 * shapes; this file owns the language, which is the half Taylor edits.
 *
 * Every string below is `[COPY — draft]` per the taste scope §13 and needs his
 * human-hand pass before a client sees it. The group titles and their lines
 * matter most: they are the first thing anyone reads on the step, and a client
 * decides whether to open an accordion from the title alone.
 *
 * Each map is typed `Record<Union, …>`, so adding a value to a union in
 * `types.ts` fails the build here until someone writes its words. That is the
 * point — a tag with no words renders as a raw key, which is the one failure
 * this file exists to prevent.
 */

/**
 * The accordions, and the sentence under each title.
 *
 * A `Record` rather than an array so the type enforces that every group has
 * words; the order they appear in is `GROUP_ORDER` below.
 */
export const EXAMPLE_GROUPS: Record<
  ExampleGroup,
  { title: string; line: string }
> = {
  // [COPY — draft] — every string in this map.
  "dark-cinematic": {
    title: "Dark and cinematic",
    line: "The footage is the light. Reel up top, a grid underneath, motion on hover.",
  },
  "light-editorial": {
    title: "Light and editorial",
    line: "White space, good type, the work hung like prints.",
  },
  "type-first": {
    title: "Type does the work",
    line: "Almost no images up front. An index, a list, names that carry weight.",
  },
  "warm-textured": {
    title: "Warm and textured",
    line: "Grain, paper, colour, a bit of personality. Breaks the black-or-white habit.",
  },
  "stills-credits": {
    title: "Stills and credits",
    line: "Frames and credit lists carry it. Built for people with more credits than cut footage.",
  },
  statement: {
    title: "Statement pieces",
    line: "Custom-built, motion-heavy, the site is part of the work.",
  },
};

/**
 * The order the accordions appear in.
 *
 * The genre default first and the extreme last, so a client meets the familiar
 * before the exotic and the list reads as a spectrum rather than a menu.
 *
 * Hand-written, because an object's key order is not a thing to depend on for
 * something a reader will want to reorder deliberately. `yarn verify:tracks`
 * checks it holds every group exactly once — the same drift-guard pattern the
 * primer's hand-written inventories use.
 */
export const GROUP_ORDER: readonly ExampleGroup[] = [
  "dark-cinematic",
  "light-editorial",
  "type-first",
  "warm-textured",
  "stills-credits",
  "statement",
];

/** [COPY — draft] */
export const GROUND_TAGS: Record<GroundTag, string> = {
  dark: "Dark",
  light: "Light",
  warm: "Warm",
};

/** [COPY — draft] */
export const MOTION_TAGS: Record<MotionTag, string> = {
  still: "Still",
  quiet: "Quiet",
  alive: "Alive",
};

/** [COPY — draft] */
export const DENSITY_TAGS: Record<DensityTag, string> = {
  sparse: "Sparse",
  balanced: "Balanced",
  dense: "Dense",
};

/**
 * [COPY — draft]
 *
 * Written out rather than derived from the key, because the derivations that
 * would be wrong are the ones that matter: `mono` reads as "Mono" (a colour, to
 * most people) and `grain` as "Grain" (a texture nobody names) unless someone
 * says what they mean.
 */
export const STYLE_TAGS: Record<StyleTag, string> = {
  "hover-preview": "Hover preview",
  "full-bleed-video": "Full-bleed video",
  grid: "Grid",
  "index-nav": "Index navigation",
  "horizontal-scroll": "Horizontal scroll",
  "oversized-type": "Oversized type",
  serif: "Serif type",
  mono: "Monospace type",
  grain: "Film grain",
  monochrome: "Monochrome",
  "one-colour-accent": "One accent colour",
  letterbox: "Letterboxed",
  "lightbox-stills": "Lightbox stills",
  "single-page": "One page",
  "case-studies": "Case studies",
  "credits-heavy": "Credits-heavy",
  "splash-gate": "Splash screen",
};

/**
 * [COPY — draft] — and never client-facing. See `BuildLevel` in `types.ts`.
 *
 * These words appear in the intake document only, where the reader is Taylor
 * deciding what a favourite costs to reach.
 */
export const BUILD_LEVELS: Record<BuildLevel, string> = {
  template: "Template-level",
  designer: "Designer-level",
  custom: "Custom build",
};

/**
 * A site's tags, in the order they are read: the three axes, then the styles.
 *
 * Axes first because they are the comparison a client is actually making
 * between two rows; the styles are the detail that explains a reaction after
 * the fact. One function so the row, the overlay, and any future surface
 * cannot disagree about the order.
 */
export function tagsFor(site: ExampleSite): string[] {
  return [
    GROUND_TAGS[site.axes.ground],
    MOTION_TAGS[site.axes.motion],
    DENSITY_TAGS[site.axes.density],
    ...site.styles.map((style) => STYLE_TAGS[style]),
  ];
}
