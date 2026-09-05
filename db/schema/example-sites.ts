import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { examplePackEnum } from "./example-pack";

/**
 * Where a site is in Taylor's curation, and what a client may see.
 *
 * `draft` is the working state — visible in `/admin/intake/examples`, invisible
 * everywhere else. `published` is fit to meet a client. `archived` has left the
 * gallery and **still resolves a stored pick**, which is why there is no delete
 * anywhere on the admin surface: `taste.picks[].siteKey` is a client's answer,
 * and removing the row it names is the one action that can silently change what
 * that answer meant (D-PORT-11, D-PORT-23).
 *
 * Used by one table, so it lives beside it (drizzle conventions §3).
 */
export const exampleSiteStatusEnum = pgEnum("example_site_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * One candidate site for the taste gallery.
 *
 * Before PORT-30 these were six TypeScript modules under
 * `content/intake-examples/`, every one of them empty, and curating a set meant
 * editing a file and deploying. The shape is unchanged — `types.ts` still owns
 * `ExampleSite` and `taxonomy.ts` still owns the words — only the storage moved.
 *
 * ## The nullable columns are the point
 *
 * A draft minted from a pasted URL has a `url` and nothing else. So everything
 * a draft legitimately lacks is nullable, and the columns a row cannot exist
 * without are not: **the database models the draft, `ExampleSite` models the
 * published site, and the publish gate is the transition between them.** The
 * service only ever builds an `ExampleSite` from a published row, where the
 * gate has already guaranteed every field is present, and validates on the way
 * out — a row that somehow is not whole is dropped and reported rather than
 * rendered half-broken, which is the same posture D-PORT-12 takes.
 *
 * `style_group` rather than `group`: `group` is a reserved word, and a column
 * named for one makes every hand-written query afterwards carry quotes. The
 * Drizzle field keeps the contract's name.
 *
 * `checked_on` is a real `date` rather than the contract's ISO string, so "the
 * date does not parse" is impossible at rest instead of merely checked. The
 * service formats it back to `YYYY-MM-DD`.
 *
 * **No `position`.** Ordering within a pack is deferred, and it would belong on
 * `example_site_packs` if it lands, since a site in two packs may want a
 * different place in each. A column added before its shape is known is
 * scaffolding. Order is `created_at, id` until a ticket says otherwise.
 *
 * **No unique constraint on `url`.** Two rows may legitimately share a host —
 * a Format subdomain's project page is not its home page, and `hostOf` keeps
 * the path for exactly that reason — so host-uniqueness would be wrong, and
 * full-URL uniqueness is defeated by a trailing slash. The paste box normalises
 * and *reports* a likely duplicate instead, which is help rather than a wall.
 */
export const exampleSites = pgTable(
  "example_sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /**
     * Roughly what it would take to reach this site's level.
     *
     * **Never rendered to a client** (D-PORT-15). It prints in the intake
     * document beside a pick, so a favourite tells Taylor what the build costs.
     */
    build: text("build"),

    /** The day the link was last confirmed live. Stale picks are flagged. */
    checkedOn: date("checked_on"),

    density: text("density"),

    /**
     * Whether the site renders inside the overlay's frame.
     *
     * **A curation-time fact and it cannot be anything else** (D-PORT-17).
     * `load` fires on a blocked frame in Chromium, so nothing in the app can
     * tell "refused" from "empty"; headers are a hint in one direction only.
     * Taylor opens it in the frame check and records what he saw. Default
     * false, which is the honest answer for a site nobody has looked at.
     */
    embed: boolean("embed").notNull().default(false),

    /**
     * When this row was first published — and therefore when its slug froze.
     *
     * A client's picks are stored against the slug, so renaming a published
     * site orphans someone's shortlist. The service refuses the rename past
     * this timestamp and the editor renders the field read-only (M-PORT-44).
     */
    firstPublishedAt: timestamp("first_published_at", { withTimezone: true }),

    ground: text("ground"),
    motion: text("motion"),
    name: text("name"),

    /** Their occupation, in their words: "Cinematographer · commercials". */
    role: text("role"),

    /** Stable, human-readable, and what `taste.picks[].siteKey` holds. */
    slug: text("slug").notNull(),

    status: exampleSiteStatusEnum("status").notNull().default("draft"),

    /** The accordion. `style_group` because `group` is reserved. */
    group: text("style_group"),

    styles: text("styles").array().notNull().default(sql`'{}'::text[]`),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    url: text("url").notNull(),
  },
  (table) => [
    uniqueIndex("example_sites_slug_idx").on(table.slug),
    index("example_sites_status_idx").on(table.status),

    /**
     * PORT-22's three-tag ceiling, at the strongest layer available.
     *
     * A rule about *how many*, not about *which*, so it survives every edit to
     * the style vocabulary — which is exactly why the ceiling belongs in the
     * database and the vocabulary does not (M-PORT-42).
     */
    check(
      "example_sites_styles_max_three",
      sql`coalesce(array_length(${table.styles}, 1), 0) <= 3`,
    ),
  ],
);

/**
 * Which sets a site may appear in.
 *
 * Many-to-many on purpose (D-PORT-22): one great site often suits both the film
 * set and the generic one, and a row duplicated per pack is a row that has to
 * be re-tagged, re-captured, and re-checked in six places. Duplication is how a
 * catalogue rots.
 */
export const exampleSitePacks = pgTable(
  "example_site_packs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    pack: examplePackEnum("pack").notNull(),

    exampleSiteId: uuid("example_site_id")
      .notNull()
      .references(() => exampleSites.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("example_site_packs_site_pack_idx").on(
      table.exampleSiteId,
      table.pack,
    ),
    index("example_site_packs_pack_idx").on(table.pack),
  ],
);

/**
 * A screenshot of the site, and the pixels it really is.
 *
 * `width` and `height` are **not null**, which makes PORT-7's dimensions law a
 * property of the database rather than a promise in TypeScript. This repo has
 * shipped the bug they prevent once: `next/image` with an unconstrained width
 * renders a capture at a fraction of its size, silently, with nothing in the
 * console. A capture with no dimensions cannot be stored, so it cannot be
 * rendered wrong.
 *
 * `position` is 1-based. Position 1 is the hero — the one a client sees on the
 * row — and the rest scroll inside the overlay. The hero is expected at the
 * MacBook Pro 14" aspect (1512 × 982) because that is the box the row renders
 * it in, but a wrong shape **warns rather than blocks**: a GIF of a site's
 * hover state or a screen recording of its motion is exactly the media a
 * `motion: alive` tag is about, and neither of those is 1512 × 982.
 */
export const exampleCaptures = pgTable(
  "example_captures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /**
     * What the capture shows, for someone who cannot see it.
     *
     * Authored for position 1, which describes a design and deserves words;
     * derived positionally for the rest ("Matias Boucard, view 2 of 3"), which
     * is the correct answer for a scroll strip of the same site and better than
     * three near-identical hand-written sentences (D-PORT-28).
     */
    alt: text("alt").notNull().default(""),

    height: integer("height").notNull(),

    /**
     * What this actually is — `image/jpeg`, `image/gif`, `video/mp4`, and so on.
     *
     * Stored rather than derived from the extension, because the renderer
     * branches on it: a still goes through `next/image`, an animated GIF has to
     * bypass optimisation to keep moving, and a video is a `<video>` element.
     * Guessing from a filename is how a GIF ends up rendered as a frozen frame.
     */
    mimeType: text("mime_type").notNull().default("image/jpeg"),

    position: integer("position").notNull(),
    storagePath: text("storage_path").notNull(),
    width: integer("width").notNull(),

    exampleSiteId: uuid("example_site_id")
      .notNull()
      .references(() => exampleSites.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("example_captures_site_position_idx").on(
      table.exampleSiteId,
      table.position,
    ),
  ],
);

/**
 * The per-pack switch: may clients meet this gallery at all.
 *
 * Separate from per-site publish, and that separation is the whole point
 * (D-PORT-21). "At least one published site counts as curated" means publishing
 * the first site puts a **one-site gallery** in front of a client, on a step
 * whose curation guidance asks for 12–24 spread across the groups. Two
 * judgements, two moments, neither able to trigger the other.
 *
 * `pack` is the primary key rather than a uuid: this is a fixed enumeration of
 * at most six rows, not an entity stream.
 *
 * **A missing row means off.** There is no seed and none is needed — the table
 * is fail-closed by construction, so a fresh database, a restored backup, or a
 * migration run out of order cannot show a client anything. The admin lists the
 * six packs from the TypeScript union, not from this table, so a pack with no
 * row still renders with its honest "Not shown" state (M-PORT-43).
 */
export const examplePacks = pgTable("example_packs", {
  pack: examplePackEnum("pack").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  shownToClients: boolean("shown_to_clients").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const exampleSitesRelations = relations(exampleSites, ({ many }) => ({
  captures: many(exampleCaptures),
  packs: many(exampleSitePacks),
}));

export const exampleSitePacksRelations = relations(
  exampleSitePacks,
  ({ one }) => ({
    site: one(exampleSites, {
      fields: [exampleSitePacks.exampleSiteId],
      references: [exampleSites.id],
    }),
  }),
);

export const exampleCapturesRelations = relations(
  exampleCaptures,
  ({ one }) => ({
    site: one(exampleSites, {
      fields: [exampleCaptures.exampleSiteId],
      references: [exampleSites.id],
    }),
  }),
);
