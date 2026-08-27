import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Which website product an engagement — or a catalogue row — belongs to.
 *
 * `durable` is the original track: Metro Vancouver service businesses, sold at
 * `/websites`. `showcase` is the bespoke portfolio-site track for creatives.
 * The internal name avoids "portfolio" on purpose; in this repo that word
 * already means tayloraucoin.com itself. See TECHNICAL-DECISIONS M-PORT-1.
 *
 * Its own file because two tables use it. The convention puts an enum beside
 * the single table that owns it (`product_kind` lives with `products`); an enum
 * shared by `engagements` and `products` has no such owner, and importing one
 * table's module for a type the other needs is a dependency that means nothing.
 *
 * Every column built on it is `notNull` with a `durable` default, so every row
 * that existed before this enum did is correctly labelled by construction
 * rather than by a backfill someone has to remember to run.
 */
export const intakeTrackEnum = pgEnum("intake_track", ["durable", "showcase"]);
