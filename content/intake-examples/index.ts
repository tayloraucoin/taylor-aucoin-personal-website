import type { ExampleSet } from "./types";

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
 * The taste gallery's shape and vocabulary. **The sites themselves are rows.**
 *
 * Until PORT-30 this module held six typed set files and an `examplesFor` map
 * over them, and curating a gallery meant editing a file, committing, and
 * deploying — which is why all six stayed empty and every client met the absent
 * state. The sites now live in `example_sites`, edited at
 * `/admin/intake/examples`, and read through `loadExampleSet` in
 * `server/services/example-sites.ts`.
 *
 * What stayed here is what should never have been data: `types.ts` owns the
 * contract, and `taxonomy.ts` owns the words for every value in it. The step,
 * the overlay, the intake document, and the verifier all read those, and each
 * map is `Record<Union, …>` so a value with no words fails the build rather
 * than rendering as a raw key.
 *
 * The folder keeps its name. It is mildly wrong now — this is a contract, not
 * content — and renaming it churns fifteen import sites for no behavioural
 * gain (M-PORT-46).
 */

/**
 * A gallery that is not being shown, which is a real answer and not a gap.
 *
 * Two callers, for two different reasons, and both are deliberate:
 *
 * - **The durable track**, which has no gallery at all. `renderIntakeMarkdown`
 *   and its siblings take the set as a **required** parameter with no default,
 *   so a durable caller passes this explicitly. That reads as a statement — the
 *   durable track has no gallery — where a default would read as an oversight,
 *   and it is why the compiler can enumerate every call site (M-PORT-41).
 * - **Anywhere a set could not be loaded.** An unpublished pack, a pack whose
 *   switch is off, and a failed query all produce this, and the taste step
 *   renders the same honest line for all three: no gallery, no picks list, no
 *   empty grid (D-PORT-12).
 */
export const EMPTY_EXAMPLE_SET: ExampleSet = { curated: false, sites: [] };
