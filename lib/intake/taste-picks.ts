import type { ExampleSet, ExampleSite } from "@/content/intake-examples";
import { flavourFor, galleryFlavourFor } from "@/lib/intake/tracks";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";
import type {
  TasteFavourite,
  TastePick,
} from "@/lib/validators/showcase-intake";

/**
 * Everything about a client's taste answers that more than one surface needs.
 *
 * Three callers read `picksOf`: the taste step, the intake document, and the
 * document's flags. Each has to agree about what someone's picks *are* —
 * including for an engagement answered before 2026-09-03, whose `favourites`
 * array has to keep reading as picks everywhere, or the client's answer changes
 * depending on which screen is looking at it.
 */

/**
 * Which gallery an engagement's picks were made from.
 *
 * Pack first, then a studio's discipline refinement — exactly the resolution
 * the step itself uses, so anything reading a stored `siteKey` back looks it up
 * in the set the client was actually looking at. Resolving it any other way
 * lets the intake document report "no longer in the gallery" about a site still
 * on their screen.
 *
 * Reads the raw answers document rather than an engagement, so nothing that
 * calls it is ever handed a contact column.
 */
export function galleryFlavourOf(answers: unknown): ShowcaseFlavour {
  const about = (answers as { about?: { disciplines?: unknown } } | null)?.about;
  const disciplines = Array.isArray(about?.disciplines)
    ? (about.disciplines as string[])
    : undefined;

  return galleryFlavourFor(
    flavourFor("showcase", answers as never),
    disciplines,
  );
}

/**
 * How many picks the step asks for.
 *
 * **An ask, not a gate** (D-PORT-16, ruled by Taylor 2026-09-03). Continue is
 * never disabled at any count — D-INT-4 is the older and stronger law, and a
 * client who cannot proceed is a client who abandons. The number is stated once
 * on the step, counted honestly in the footer, and reported in the intake
 * document when it falls short, so the shortfall is a fact Taylor knows before
 * the call rather than a wall the client hit at midnight.
 *
 * One home so the step's copy, the footer counter, and the document's flag
 * cannot disagree about what was asked.
 */
export const TASTE_PICKS_ASKED = 5;

/**
 * How old a site's `checkedOn` may be before the document says so.
 *
 * Both research libraries warn that personal sites go dark or get rebuilt
 * frequently, and the failure this prevents is opening a client's favourite on
 * a call and finding a parked domain. Ninety days is a judgement, not a
 * measurement `[PROVISIONAL]`.
 */
export const STALE_CHECK_DAYS = 90;

/**
 * A client's picks, including the ones a legacy `favourites` array stands for.
 *
 * **Derived, never written.** Nothing here saves the derivation back into the
 * answers document — an engagement keeps its `favourites` until the client
 * edits a pick, at which point the step writes a real `picks` array and the
 * legacy key goes quiet. A derivation that saved itself would rewrite answers
 * nobody asked us to touch. Same law as `videosOf` (PORT-19, M-PORT-35).
 *
 * ## Presence, not length — and this is where it differs from `videosOf`
 *
 * `videosOf` falls back when the stored array is *empty*, because a project
 * with no videos and a legacy link is a project whose link has not been
 * migrated yet. Picks are the opposite: `picks: []` is what the document holds
 * after a client picks one site and then removes it, and falling back on length
 * would resurrect the favourites they had already moved past. So the test is
 * whether the key is there at all. An empty array is an answer — "none" — and
 * it is honoured.
 *
 * A favourite carries its note across unchanged. It never carries a score,
 * because nobody was ever asked for one; the document prints "no score", which
 * is true.
 */
export function picksOf(taste: Record<string, unknown>): TastePick[] {
  if (Array.isArray(taste.picks)) return taste.picks as TastePick[];

  const legacy = Array.isArray(taste.favourites)
    ? (taste.favourites as TasteFavourite[])
    : [];

  return legacy.map((favourite) => ({
    siteKey: favourite.siteKey,
    ...(favourite.note ? { note: favourite.note } : {}),
  }));
}

/**
 * A link as a person reads it: no scheme, no `www.`, no trailing slash.
 *
 * The row shows this as the link's text, so what a client reads is where they
 * are going. **The path is kept**, because for some sites it is the honest
 * address of the thing being shown — a Format subdomain's project page is not
 * the same reference as its home page, and truncating to the bare host would
 * point a client at something we did not choose.
 *
 * Parsed with `URL` rather than a regular expression, for the same reason
 * `embedUrl` is: a query string, a port, or a trailing slash should not decide
 * whether a link is readable. Anything `URL` cannot parse comes back trimmed
 * and unchanged rather than blank — a client typed it, and showing it back to
 * them beats showing them nothing.
 */
export function hostOf(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "";

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return value;
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = `${url.pathname}${url.search}`.replace(/\/$/, "");

  return `${host}${path}`;
}

/**
 * Looks a site up by the key a client's picks are stored under.
 *
 * Takes the set rather than fetching one, and that is the whole point: the
 * intake document resolves a pick for every entry in a client's shortlist, and
 * a lookup that queried would turn one document render into a dozen round
 * trips — while making `renderIntakeMarkdown` async, which would break
 * `yarn verify:tracks`, the oracle that runs with no database at all
 * (M-PORT-41). The rail loads the set once; this reads it.
 *
 * Replaces `exampleByKey(flavour, key)`, which could reach into a module-level
 * map because the sets were files. They are rows now.
 *
 * Undefined is an ordinary answer, not an error: a pick whose site has since
 * been archived keeps its place in the answers document and renders by its
 * stored key with a marker, rather than vanishing (D-PORT-11).
 */
export function siteByKey(
  set: ExampleSet,
  key: string,
): ExampleSite | undefined {
  return set.sites.find((site) => site.key === key);
}
