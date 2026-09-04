import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { ENTITY_EXAMPLES } from "./entity";
import { FILM_EXAMPLES } from "./film";
import { GENERIC_EXAMPLES } from "./generic";
import { PRACTICE_EXAMPLES } from "./practice";
import { SERVICE_EXAMPLES } from "./service";
import type { ExampleSet, ExampleSite } from "./types";
import { VENTURE_EXAMPLES } from "./venture";

export type {
  BuildLevel,
  DensityTag,
  ExampleCapture,
  ExampleGroup,
  ExampleSet,
  ExampleSite,
  GroundTag,
  MotionTag,
  StyleTag,
} from "./types";

/**
 * The gallery a client sees, one set per copy pack.
 *
 * Before PORT-16 there was one set — six invented sites whose own file header
 * said "nothing here may ship to a client" — and both packs pointed at it, so
 * every client who reached step 5 reached placeholder art
 * (`CODED-INTAKE-CATEGORY-AUDIT.md` B1). Now each pack has its own file, each
 * file carries its own curation contract, and none of them is curated yet.
 *
 * **An uncurated set is an absence, not an empty grid.** The taste step renders
 * without the gallery and without the picks list, says so in one line, and
 * collects everything else on the step — the preference questions, the three
 * words, the inspiration uploads, the links, the brain dump. That is still most
 * of the step's signal, and it is honest, which placeholder art was not.
 *
 * Curating one is a content edit: fill its `sites`, set `curated: true`.
 */
const SETS: Record<ShowcaseFlavour, ExampleSet> = {
  film: FILM_EXAMPLES,
  generic: GENERIC_EXAMPLES,
  practice: PRACTICE_EXAMPLES,
  entity: ENTITY_EXAMPLES,
  venture: VENTURE_EXAMPLES,
  service: SERVICE_EXAMPLES,
};

/**
 * One pack's set. Never undefined, and never a set from another pack.
 *
 * The caller passes a *gallery* flavour, which is the copy pack for every kind
 * but a studio — a studio reads entity copy while its gallery may follow its
 * discipline. `galleryFlavourFor` in `lib/intake/tracks.ts` makes that choice;
 * this module is a map and holds no opinion about kinds.
 */
export function examplesFor(flavour: ShowcaseFlavour): ExampleSet {
  return SETS[flavour];
}

/**
 * Looks a site up by the key a client's picks are stored under.
 *
 * Undefined is an ordinary answer, not an error: a pick whose set has since
 * changed keeps its place in the answers document and renders by its stored
 * key with a marker, rather than vanishing (D-PORT-11 at the gallery).
 */
export function exampleByKey(
  flavour: ShowcaseFlavour,
  key: string,
): ExampleSite | undefined {
  return SETS[flavour].sites.find((site) => site.key === key);
}
