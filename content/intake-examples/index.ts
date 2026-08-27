import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { FILM_EXAMPLES } from "./film";
import type { ExampleSite } from "./types";

export type { ExampleCapture, ExampleSite } from "./types";

/**
 * The gallery a client sees, chosen by their copy pack.
 *
 * Film is the set that ships first (handoff decision 5); generic borrows it
 * until Taylor curates a second one, because a gallery of six is still a
 * gallery and an empty step is not. When a generic set exists, it lands beside
 * `film.ts` and this map gains one line.
 *
 * ⚠ Both are the STUB set today. See `film.ts`.
 */
const SETS: Record<ShowcaseFlavour, readonly ExampleSite[]> = {
  film: FILM_EXAMPLES,
  generic: FILM_EXAMPLES,
};

export function examplesFor(flavour: ShowcaseFlavour): readonly ExampleSite[] {
  return SETS[flavour];
}

/** Looks a site up by the key a client's favourites are stored under. */
export function exampleByKey(
  flavour: ShowcaseFlavour,
  key: string,
): ExampleSite | undefined {
  return SETS[flavour].find((site) => site.key === key);
}
