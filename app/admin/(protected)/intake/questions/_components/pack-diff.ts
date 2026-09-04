import { copyPackFor, showcaseFlavours } from "@/lib/intake/tracks";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";

/**
 * What one copy pack says differently from the generic floor.
 *
 * **Derived, never transcribed.** Both sides come from `copyPackFor` on the
 * `tracks.ts` seam — the same resolver every step component reads — so this
 * cannot drift from the words a client meets, and Taylor's human-hand pass
 * still edits exactly one file (`lib/intake/showcase-copy.ts`).
 *
 * This is the other half of "unique for certain types". `ForKinds` answers
 * *which kinds are asked a question*; this answers *which kinds are asked it in
 * different words* — the case the overview cannot show inline, because the
 * overview renders one pack's strings and there are six packs.
 *
 * Slot paths are dotted (`wantMoreOf.label`, `ask.number.help`) and are the
 * property names in the pack type, so a path here is a grep target in the file
 * the copy pass edits.
 */

/** One slot whose words differ between a pack and the generic floor. */
export type PackDifference = {
  /** Dotted path into the pack, e.g. `rosterLead.help`. */
  path: string;
  /** The generic pack's words. `null` where the slot has no generic floor. */
  generic: string | null;
  /** This pack's words. */
  pack: string;
};

/** Every difference between one pack and generic, in pack-declaration order. */
export type PackDiff = {
  flavour: ShowcaseFlavour;
  differences: readonly PackDifference[];
};

/**
 * A choice list renders as its labels, joined.
 *
 * The values are stable keys and never change between packs — `verify:tracks`
 * asserts that — so printing them would add noise without adding a difference.
 */
function asText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const labels = value
      .map((item) =>
        item && typeof item === "object" && "label" in item
          ? String((item as { label: unknown }).label)
          : null,
      )
      .filter((label): label is string => label !== null);
    return labels.length > 0 ? labels.join(" · ") : null;
  }
  return null;
}

/**
 * Walks two packs together and records every leaf that differs.
 *
 * Recursive because the pack has nested shapes (`ask.number.label`,
 * `claims.signOff.help`), and a diff that stopped at the top level would report
 * "ask changed" for a pack that reworded one help line.
 */
function walk(
  generic: unknown,
  pack: unknown,
  path: string,
  out: PackDifference[],
): void {
  const packText = asText(pack);
  const genericText = asText(generic);

  if (packText !== null || genericText !== null) {
    if (packText !== null && packText !== genericText) {
      out.push({ path, generic: genericText, pack: packText });
    }
    return;
  }

  if (pack && typeof pack === "object" && !Array.isArray(pack)) {
    for (const key of Object.keys(pack)) {
      walk(
        (generic as Record<string, unknown> | undefined)?.[key],
        (pack as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key,
        out,
      );
    }
  }
}

/** One pack against the floor. Empty for `generic` itself, by definition. */
export function diffPack(flavour: ShowcaseFlavour): PackDiff {
  const generic = copyPackFor("generic") as unknown as Record<string, unknown>;
  const pack = copyPackFor(flavour) as unknown as Record<string, unknown>;

  const differences: PackDifference[] = [];
  if (flavour !== "generic") walk(generic, pack, "", differences);

  return { flavour, differences };
}

/** Every non-generic pack, for the all-kinds overview. */
export function diffEveryPack(): readonly PackDiff[] {
  return showcaseFlavours
    .filter((flavour) => flavour !== "generic")
    .map(diffPack);
}
