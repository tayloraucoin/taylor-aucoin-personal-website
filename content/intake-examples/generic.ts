import type { ExampleSet } from "./types";

/**
 * The taste gallery for the **generic** pack — a portfolio that is not film — photography, design, illustration, music.
 *
 * ## Not curated yet
 *
 * `curated: false` and no sites, which is a real state rather than a gap: the
 * taste step renders *without* a gallery until Taylor has chosen these, and
 * says so in one honest line (D-PORT-12). It does not render an empty grid, and
 * it never renders a placeholder — the set this replaced was six invented sites
 * whose own header forbade showing them to a client, and they shipped in the
 * gallery for a week regardless.
 *
 * Flipping this on is content work, not code work: add the sites, set
 * `curated: true`. Nothing in the step reads anything but `ExampleSet`.
 *
 * ## What to choose
 *
 * **12–24 sites**, spread deliberately across the axes rather than gathered at
 * the end of one. The picks only triangulate a style vector if the set
 * actually spans one — twenty beautiful dark sites teach us nothing except
 * that the client likes what we already showed them.
 *
 * Spread them across the six groups in `taxonomy.ts` as well as across the
 * three axes (`dark`/`light`/`warm` · `still`/`quiet`/`alive` ·
 * `sparse`/`balanced`/`dense`). A group with no sites in this pack simply does
 * not render, so an empty group is a choice rather than a gap — but a set that
 * fills only two groups is a set that has already decided for the client.
 *
 * **Every field on `ExampleSite` is required**, and three of them are yours to
 * judge rather than to read off the page: `group`, `axes`, and `styles` (at
 * most three, from the closed list). `build` is what it would take to reach
 * this site's level and **never reaches a client** — it is there so a favourite
 * tells you what the build costs. `embed` stays `false` until you have opened
 * the site inside the overlay and watched it render; most hosts refuse to be
 * framed and nothing in the app can detect that (D-PORT-17). `checkedOn` is the
 * day you last confirmed the link is live — personal sites go dark often, and a
 * picked site with a stale check is flagged in the intake document.
 *
 * This set carries every non-film portfolio, so it has the widest job of the
 * six. Spread it across disciplines as well as across the visual axes.
 *
 * **Captures:** the first is the site's opening view at the MacBook Pro 14"
 * aspect — **1512 × 982**, shot at 2× (3024 × 1964) — then two or three more
 * scrolling, which the overlay pages through. The first capture's aspect is
 * checked by `yarn verify:tracks`; it matches the box the overlay's live frame
 * uses, so a capture and a frame are never different shapes. Real intrinsic
 * pixel dimensions are required and are not optional — see `types.ts` for why
 * (this repo has shipped that bug once). `yarn capture:example` shoots one at
 * the right size and prints the entry, once that tooling lands (PORT-27).
 */
export const GENERIC_EXAMPLES: ExampleSet = {
  curated: false,
  sites: [],
};
