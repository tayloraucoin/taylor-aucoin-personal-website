import {
  BUILD_LEVELS,
  DENSITY_TAGS,
  EXAMPLE_GROUPS,
  GROUND_TAGS,
  MOTION_TAGS,
  STYLE_TAGS,
} from "@/content/intake-examples/taxonomy";

/**
 * The content rules for one example site — the single home, read twice.
 *
 * ## Why two readers, deliberately
 *
 * Before PORT-30 these rules lived in `yarn verify:tracks`, walking six
 * TypeScript files. Rows have no files to walk, and the honest replacement is
 * two evaluations of one rule set rather than one of either:
 *
 * - **The publish gate** calls this on the row in front of Taylor, so the
 *   control names what is missing *before* the click and a mistake stays free
 *   to fix (D-PORT-25). This one catches Taylor.
 * - **`verify:tracks`** calls it on fixtures — a good site passes, a four-tag
 *   site and a wrong-aspect capture each fail with a named reason. It runs with
 *   no database and no network, which is the property that makes it get run,
 *   and it now tests the rule rather than the content. This one catches a row
 *   written around the admin.
 *
 * Neither is redundant and they cannot disagree, because there is one function
 * (M-PORT-47).
 *
 * ## The reasons are the copy
 *
 * Each string is a clause the gate joins with "and" under a `Not yet —` lead
 * (UX scope §11). Plain words, no field keys, nothing styled as a failure: the
 * person reading it is the person who will fix it, thirty seconds from now.
 */

/** The MacBook Pro 14" frame every opening capture is shot at. */
const CAPTURE_ASPECT = 1512 / 982;

/**
 * Tolerance on the aspect, as a ratio rather than exact pixels.
 *
 * A 3024 × 1964 retina capture and a 1512 × 982 one are the same shape, and a
 * screenshot tool that rounds a half-pixel has not broken anything. One percent
 * admits both and still catches a 16:10 or a 4:3 capture, which are the two
 * mistakes actually made.
 */
const ASPECT_TOLERANCE = 0.01;

/** At most three, so a row's tag line stays scannable at 375px (PORT-22). */
export const MAX_STYLE_TAGS = 3;

/**
 * A row as the gate and the verifier both see it.
 *
 * Loose on purpose: a draft row's columns are nullable and a complete
 * `ExampleSite` is structurally assignable to this, so one function serves
 * both readers without either needing to convert first.
 */
export type ExampleSiteCandidate = {
  name?: string | null;
  role?: string | null;
  url?: string | null;
  group?: string | null;
  ground?: string | null;
  motion?: string | null;
  density?: string | null;
  build?: string | null;
  checkedOn?: string | null;
  styles?: readonly string[] | null;
  packs?: readonly string[] | null;
  captures?:
    | readonly {
        width: number;
        height: number;
        alt?: string | null;
        mimeType?: string | null;
      }[]
    | null;
};

/**
 * Every reason this row may not be published yet, in the order they read.
 *
 * Empty means publishable. Never throws — a blocked publish is an ordinary
 * state of an unfinished row, not an error.
 */
export function publishBlockers(site: ExampleSiteCandidate): string[] {
  const reasons: string[] = [];

  if (!filled(site.name)) reasons.push("the name is blank");
  if (!filled(site.role)) reasons.push("the role is blank");
  if (!filled(site.url)) reasons.push("the link is blank");

  if (!site.group) reasons.push("the group isn't set");
  else if (!(site.group in EXAMPLE_GROUPS)) {
    reasons.push(`"${site.group}" isn't a group we have words for`);
  }

  // One clause for all three axes: a row missing two of them should read as one
  // thing to go and do, not as two lines of the same sentence.
  const axes = [
    [site.ground, GROUND_TAGS] as const,
    [site.motion, MOTION_TAGS] as const,
    [site.density, DENSITY_TAGS] as const,
  ];
  if (axes.some(([value]) => !value)) reasons.push("an axis isn't set");
  else {
    const unknown = axes.find(([value, words]) => !(value! in words));
    if (unknown) {
      reasons.push(`"${unknown[0]}" isn't an axis value we have words for`);
    }
  }

  if (!site.build) reasons.push("the build level isn't set");
  else if (!(site.build in BUILD_LEVELS)) {
    reasons.push(`"${site.build}" isn't a build level we have words for`);
  }

  const styles = site.styles ?? [];
  if (styles.length > MAX_STYLE_TAGS) {
    reasons.push(`there are ${styles.length} style tags and the most is three`);
  }
  const unknownStyle = styles.find((style) => !(style in STYLE_TAGS));
  if (unknownStyle) {
    reasons.push(`"${unknownStyle}" isn't a style tag we have words for`);
  }

  if (!filled(site.checkedOn)) reasons.push("there's no checked-on date");
  else if (!Number.isFinite(Date.parse(site.checkedOn!))) {
    reasons.push("the checked-on date doesn't parse");
  }

  if ((site.packs ?? []).length === 0) reasons.push("it isn't in any pack");

  reasons.push(...captureBlockers(site.captures ?? []));

  return reasons;
}

/**
 * What the captures are missing.
 *
 * Split out because the capture rules are the ones a person is most likely to
 * hit twice — shoot, upload, discover the shape is wrong, reshoot — and the
 * editor's capture column can name them beside the stage rather than only in
 * the gate's line at the foot of the form.
 */
export function captureBlockers(
  captures: readonly {
    width: number;
    height: number;
    alt?: string | null;
    mimeType?: string | null;
  }[],
): string[] {
  const hero = captures[0];
  if (!hero) return ["there's no media"];

  const reasons: string[] = [];

  // The row renders the hero as a still. A video first would render as a blank
  // box on a client's screen, which is the one thing that is a blocker rather
  // than a note.
  if (hero.mimeType?.startsWith("video/")) {
    reasons.push("the first item is a video — the row needs an image first");
  }

  // Only the hero's alt is authored; the rest are derived at save (D-PORT-28).
  if (!filled(hero.alt)) reasons.push("the first item has no alt text");

  return reasons;
}

/**
 * Things worth saying that are **not** reasons to refuse.
 *
 * The hero's aspect used to block publication. It no longer does: a GIF of a
 * site's hover state and a screen recording of its scroll are exactly the media
 * a `motion: alive` tag is about, and neither is 1512 × 982. The row still
 * renders in that box, so a wrong shape is worth knowing and worth seeing
 * beside the media — it is just Taylor's call, not the software's.
 */
export function captureNotes(
  captures: readonly { width: number; height: number }[],
): string[] {
  const hero = captures[0];
  if (!hero || isCaptureAspect(hero.width, hero.height)) return [];

  return [
    `The first item is ${hero.width} × ${hero.height}. The row renders it in the MacBook shape (1512 × 982), so it will be cropped.`,
  ];
}

/**
 * Whether a capture is the MacBook Pro 14" shape, at any scale.
 *
 * Exported because the editor says so beside the capture the moment it is
 * uploaded, rather than letting someone tag a whole site and meet the problem
 * at the publish control.
 */
export function isCaptureAspect(width: number, height: number): boolean {
  if (!width || !height) return false;
  return Math.abs(width / height - CAPTURE_ASPECT) < ASPECT_TOLERANCE;
}

function filled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
