import { showcaseKinds } from "@/lib/intake/tracks";
import { flavourForKind } from "@/lib/intake/tracks";
import type { ExamplePack } from "@/lib/intake/example-packs";

/**
 * A pack's label, and who lands on it.
 *
 * `entity` means nothing to a person reading it at eleven at night, so every
 * screen that names a pack also names the client kinds that reach it — and
 * **derives that line from the kind registry rather than typing it here**. Same
 * law as D-ADM-6: no second home for a fact the code already holds. If a kind's
 * mapping changes in `tracks.ts`, this line changes with it or it is a bug.
 */
const LABELS: Record<ExamplePack, string> = {
  film: "Film",
  generic: "Generic",
  practice: "Practice",
  entity: "Entity",
  venture: "Venture",
  service: "Service",
};

export function packLabel(pack: ExamplePack): string {
  return LABELS[pack];
}

/** Which client kinds resolve to this pack, in their own words. */
export function packAudience(pack: ExamplePack): string {
  const kinds = showcaseKinds().filter(
    (entry) => flavourForKind(entry.key, undefined) === pack,
  );

  // The film pack is only ever reached by a portfolio that named film as its
  // one discipline, which no kind alone resolves to — so it is named directly
  // rather than left blank.
  if (pack === "film") {
    return "Your creative work — a portfolio, when film is the only discipline";
  }
  if (kinds.length === 0) return "Reached by a discipline, not by a kind";

  return kinds.map((entry) => entry.label).join(" · ");
}
