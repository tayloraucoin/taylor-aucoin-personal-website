import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Which taste gallery a site may appear in.
 *
 * The same six keys as `ShowcaseFlavour` in `lib/intake/showcase-copy.ts`: the
 * copy pack a client's answers earn is also the set of example sites they
 * meet, resolved once by `galleryFlavourOf` so the step, the intake document,
 * and the AI search cannot disagree about which gallery someone saw.
 *
 * Its own file because two tables use it — `example_site_packs` (the join) and
 * `example_packs` (the per-pack switch). Same reasoning as `intake_track`: an
 * enum with no single owning table has no table module to live in, and
 * importing one table's module for a type the other needs is a dependency that
 * means nothing.
 *
 * **An enum here and `text` for the taxonomy** (M-PORT-42). The database gets
 * an enum for a value it must reason about — this one drives the join, the
 * switch, and every `where` clause on the read path. `group`, `ground`,
 * `motion`, `density`, `build`, and the style tags are only ever stored and
 * handed back, so they stay `text` owned by the unions in
 * `content/intake-examples/types.ts`, and Taylor can add a style tag without a
 * migration.
 */
export const examplePackEnum = pgEnum("example_pack", [
  "film",
  "generic",
  "practice",
  "entity",
  "venture",
  "service",
]);
