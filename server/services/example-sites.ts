import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  exampleCaptures,
  examplePacks,
  exampleSitePacks,
  exampleSites,
} from "@/db/schema";
import {
  EMPTY_EXAMPLE_SET,
  type ExampleSet,
  type ExampleSite,
} from "@/content/intake-examples";
import { GROUP_ORDER } from "@/content/intake-examples/taxonomy";
import {
  captureNotes,
  publishBlockers,
} from "@/lib/intake/example-site-rules";
import { galleryFlavourOf, hostOf } from "@/lib/intake/taste-picks";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";
import {
  EXAMPLE_PACKS,
  type DraftCapture,
  type ExamplePack,
  type ExampleSiteDraft,
  type ExampleSiteStatus,
  type PackCoverage,
  type PackSummary,
  type NewExampleSiteInput,
  type PasteResult,
} from "@/lib/intake/example-packs";
import { captureUrlFor, deleteCapture, isVideo } from "./example-captures";

/* ────────────────────────────────────────────────────────────────────────────
   The taste gallery's one home.
   
   Two audiences with two shapes, and the difference between them is the whole
   safety property of this file:
   
   - **A client** gets `ExampleSet` — the content contract, unchanged since
     PORT-22 — built only from published rows in a pack whose switch is on, and
     validated on the way out.
   - **Taylor** gets `ExampleSiteDraft`, which is the row: nullable judgements,
     the storage paths, the blockers, and everything the client never sees.
   
   Nothing converts a draft into an `ExampleSite`. `publishedSet` is the only
   function that mints one, and it refuses any row `publishBlockers` complains
   about — so a half-tagged draft cannot reach a gallery structurally, rather
   than because a query remembered to filter (M-PORT-42).
   ──────────────────────────────────────────────────────────────────────────── */

export type {
  DraftCapture,
  NewExampleSiteInput,
  ExamplePack,
  ExampleSiteDraft,
  ExampleSiteStatus,
  PackCoverage,
  PackSummary,
  PasteResult,
} from "@/lib/intake/example-packs";
export { EXAMPLE_PACKS } from "@/lib/intake/example-packs";

/* ── The client's read ───────────────────────────────────────────────────── */

/**
 * The gallery a client meets, for one pack.
 *
 * **Loaded once at the entry rail and passed down** — never called from inside
 * the document renderer or the step. Every consumer below the rail is
 * synchronous and stays that way: `output.ts` reached the gallery four times in
 * one render, and `verify:tracks` calls `renderIntakeMarkdown` with no database
 * at all (M-PORT-41).
 *
 * `curated` is true only when the pack's switch is on **and** published sites
 * came back. Everything else — switch off, nothing published, a query that
 * failed — returns the empty set, so the taste step renders the same honest
 * line for all of them: no gallery, no picks list, no empty grid (D-PORT-12).
 */
export async function loadExampleSet(pack: ShowcaseFlavour): Promise<ExampleSet> {
  try {
    return await readExampleSet(pack);
  } catch (error) {
    /**
     * A gallery that cannot be read is a gallery that is not being shown.
     *
     * The failure contract for this rail: the taste step is one of ten in a
     * questionnaire someone is part-way through, and a database hiccup must not
     * take the step down with it. The client meets the same honest line an
     * unpublished pack produces and goes on answering the brain dump, the three
     * words, and their own references — which is most of the step's signal. A
     * client who cannot proceed is a client who abandons (D-INT-4), and that
     * law outranks showing a gallery.
     *
     * Logged at error, not swallowed: this is invisible to the client by
     * design and must never be invisible to Taylor.
     */
    console.error(`could not load the ${pack} taste gallery`, error);
    return EMPTY_EXAMPLE_SET;
  }
}

/** The read itself. Throws; `loadExampleSet` owns what that means. */
async function readExampleSet(pack: ShowcaseFlavour): Promise<ExampleSet> {
  const db = getDb();

  const [state] = await db
    .select()
    .from(examplePacks)
    .where(eq(examplePacks.pack, pack as ExamplePack))
    .limit(1);

  // A missing row means off. The table is fail-closed by construction, so a
  // fresh database or a restored backup cannot show a client anything
  // (M-PORT-43).
  if (!state?.shownToClients) return EMPTY_EXAMPLE_SET;

  const rows = await db
    .select({ site: exampleSites })
    .from(exampleSites)
    .innerJoin(
      exampleSitePacks,
      and(
        eq(exampleSitePacks.exampleSiteId, exampleSites.id),
        eq(exampleSitePacks.pack, pack as ExamplePack),
      ),
    )
    .where(eq(exampleSites.status, "published"))
    .orderBy(asc(exampleSites.createdAt), asc(exampleSites.id));

  if (rows.length === 0) return EMPTY_EXAMPLE_SET;

  const captures = await capturesFor(rows.map((row) => row.site.id));
  const sites = publishedSet(
    rows.map((row) => row.site),
    captures,
  );

  return sites.length > 0 ? { curated: true, sites } : EMPTY_EXAMPLE_SET;
}

/**
 * Rows to contract, dropping anything that is not whole.
 *
 * A published row should always pass — the publish gate ran the same check
 * before it got here. If one somehow does not, because a database write went
 * around the admin, it is **dropped and reported** rather than rendered with a
 * missing tag or a broken capture. The worst case is a site absent from a
 * gallery, which is a state this step already handles honestly; a site rendered
 * half-broken is one it does not.
 */
function publishedSet(
  rows: (typeof exampleSites.$inferSelect)[],
  captures: Map<string, DraftCapture[]>,
): ExampleSite[] {
  const sites: ExampleSite[] = [];

  for (const row of rows) {
    const shots = captures.get(row.id) ?? [];
    const blockers = publishBlockers({ ...row, captures: shots, packs: ["x"] });

    if (blockers.length > 0) {
      console.warn(
        `example site ${row.slug} is published but incomplete, so it is not being shown: ${blockers.join("; ")}`,
      );
      continue;
    }

    sites.push({
      key: row.slug,
      name: row.name!,
      url: row.url,
      role: row.role!,
      group: row.group as ExampleSite["group"],
      axes: {
        ground: row.ground as ExampleSite["axes"]["ground"],
        motion: row.motion as ExampleSite["axes"]["motion"],
        density: row.density as ExampleSite["axes"]["density"],
      },
      styles: row.styles as ExampleSite["styles"],
      build: row.build as ExampleSite["build"],
      embed: row.embed,
      checkedOn: row.checkedOn!,
      captures: shots.map((shot) => ({
        src: shot.src,
        width: shot.width,
        height: shot.height,
        alt: shot.alt,
      })),
    });
  }

  // Group order is the client's reading order and it belongs to the taxonomy,
  // not to a query: the genre default first, the extreme last (D-PORT-15).
  return sites.sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
  );
}

async function capturesFor(
  siteIds: string[],
): Promise<Map<string, DraftCapture[]>> {
  if (siteIds.length === 0) return new Map();

  const rows = await getDb()
    .select()
    .from(exampleCaptures)
    .where(inArray(exampleCaptures.exampleSiteId, siteIds))
    .orderBy(asc(exampleCaptures.position));

  const bySite = new Map<string, DraftCapture[]>();
  for (const row of rows) {
    const list = bySite.get(row.exampleSiteId) ?? [];
    list.push({
      id: row.id,
      position: row.position,
      storagePath: row.storagePath,
      src: captureUrlFor(row.storagePath),
      mimeType: row.mimeType,
      isVideo: isVideo(row.mimeType),
      width: row.width,
      height: row.height,
      alt: row.alt,
    });
    bySite.set(row.exampleSiteId, list);
  }

  return bySite;
}

/**
 * The gallery an engagement's answers belong to — including "none".
 *
 * **Use this, not `loadExampleSet`, anywhere an engagement is in hand.** The
 * completion action, the intake document, and the done screen are all shared by
 * both tracks, and the durable track has no gallery. Resolving the track here
 * means no call site has to remember which one it is holding.
 *
 * This exists because it nearly went wrong. `completeIntake` lives under
 * `app/websites/intake/` — the durable tree — and is called by *both* done
 * screens through `CompleteOnArrival`. Passing the empty set there because of
 * where the file sits would have printed every coded client's picks as "no
 * longer in the gallery" in the document Taylor builds from, silently, on a
 * surface whose supreme law is that answers are never lost. The compiler
 * surfaced the call site because the parameter is required (M-PORT-41); this
 * function is what stops the next person having to notice.
 */
export async function galleryForEngagement(engagement: {
  track: string;
  answers: unknown;
}): Promise<ExampleSet> {
  if (engagement.track !== "showcase") return EMPTY_EXAMPLE_SET;
  return loadExampleSet(galleryFlavourOf(engagement.answers));
}

/* ── Taylor's reads ──────────────────────────────────────────────────────── */

/** The landing screen: six packs, whether each is live, and how full it is. */
export async function loadPackSummaries(): Promise<PackSummary[]> {
  const db = getDb();

  const [states, rows] = await Promise.all([
    db.select().from(examplePacks),
    db
      .select({ pack: exampleSitePacks.pack, group: exampleSites.group })
      .from(exampleSitePacks)
      .innerJoin(exampleSites, eq(exampleSites.id, exampleSitePacks.exampleSiteId))
      .where(eq(exampleSites.status, "published")),
  ]);

  const shown = new Map(states.map((state) => [state.pack, state.shownToClients]));

  return EXAMPLE_PACKS.map((pack) => {
    const mine = rows.filter((row) => row.pack === pack);
    const groups = new Set(mine.map((row) => row.group).filter(Boolean));
    const shownToClients = shown.get(pack) ?? false;

    return {
      pack,
      shownToClients,
      publishedCount: mine.length,
      groupsFilled: groups.size,
      state: !shownToClients
        ? mine.length === 0
          ? ("nothing-published" as const)
          : ("switch-off" as const)
        : mine.length === 0
          ? ("nothing-published" as const)
          : ("shown" as const),
    };
  });
}

/**
 * One pack's rows, or the whole library when `pack` is "all".
 *
 * Returns every status. The screen sections them — drafts first, because drafts
 * are the work — and the section label carries the status, so no row needs a
 * badge repeating it (UX scope §3.2).
 */
export async function loadExampleSites(
  pack: ExamplePack | "all",
): Promise<ExampleSiteDraft[]> {
  const db = getDb();

  const rows =
    pack === "all"
      ? await db
          .select()
          .from(exampleSites)
          .orderBy(asc(exampleSites.createdAt), asc(exampleSites.id))
      : (
          await db
            .select({ site: exampleSites })
            .from(exampleSites)
            .innerJoin(
              exampleSitePacks,
              and(
                eq(exampleSitePacks.exampleSiteId, exampleSites.id),
                eq(exampleSitePacks.pack, pack),
              ),
            )
            .orderBy(asc(exampleSites.createdAt), asc(exampleSites.id))
        ).map((row) => row.site);

  return hydrate(rows);
}

export async function loadExampleSite(
  slug: string,
): Promise<ExampleSiteDraft | null> {
  const [row] = await getDb()
    .select()
    .from(exampleSites)
    .where(eq(exampleSites.slug, slug))
    .limit(1);

  if (!row) return null;
  const [draft] = await hydrate([row]);
  return draft ?? null;
}

/** The next draft with nothing tagged, for the editor's "Save and next". */
export async function nextDraftSlug(afterSlug: string): Promise<string | null> {
  const drafts = await getDb()
    .select({ slug: exampleSites.slug })
    .from(exampleSites)
    .where(eq(exampleSites.status, "draft"))
    .orderBy(asc(exampleSites.createdAt), asc(exampleSites.id));

  const index = drafts.findIndex((draft) => draft.slug === afterSlug);
  const rest = index === -1 ? drafts : drafts.slice(index + 1);

  return rest[0]?.slug ?? drafts.find((d) => d.slug !== afterSlug)?.slug ?? null;
}

/** What the coverage strip counts. Derived, never stored. */
export function coverageOf(sites: ExampleSiteDraft[]): PackCoverage {
  const published = sites.filter((site) => site.status === "published");
  const tally = (pick: (site: ExampleSiteDraft) => string | null) => {
    const out: Record<string, number> = {};
    for (const site of published) {
      const value = pick(site);
      if (value) out[value] = (out[value] ?? 0) + 1;
    }
    return out;
  };

  const groups = tally((site) => site.group);

  return {
    groups: GROUP_ORDER.map((key) => ({ key, count: groups[key] ?? 0 })),
    ground: tally((site) => site.ground),
    motion: tally((site) => site.motion),
    density: tally((site) => site.density),
  };
}

async function hydrate(
  rows: (typeof exampleSites.$inferSelect)[],
): Promise<ExampleSiteDraft[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const [captures, packRows] = await Promise.all([
    capturesFor(ids),
    getDb()
      .select()
      .from(exampleSitePacks)
      .where(inArray(exampleSitePacks.exampleSiteId, ids)),
  ]);

  return rows.map((row) => {
    const packs = packRows
      .filter((pack) => pack.exampleSiteId === row.id)
      .map((pack) => pack.pack);
    const shots = captures.get(row.id) ?? [];

    return {
      id: row.id,
      slug: row.slug,
      slugLocked: row.firstPublishedAt !== null,
      status: row.status,
      name: row.name ?? "",
      role: row.role ?? "",
      url: row.url,
      host: hostOf(row.url),
      group: row.group,
      ground: row.ground,
      motion: row.motion,
      density: row.density,
      build: row.build,
      styles: row.styles,
      embed: row.embed,
      checkedOn: row.checkedOn ?? "",
      packs,
      captures: shots,
      blockers: publishBlockers({ ...row, packs, captures: shots }),
      notes: captureNotes(shots),
      createdAt: row.createdAt,
    };
  });
}

/* ── Taylor's writes ─────────────────────────────────────────────────────── */

export class ExampleSiteRejected extends Error {}

/**
 * Turns pasted URLs into draft rows.
 *
 * The bulk-creation problem is the one that actually blocks a hundred and ten
 * sites; bulk *editing* is not, because tagging is a judgement made one site at
 * a time. So this is the only bulk write on the surface.
 *
 * **A URL already in the library never creates a second row.** Comparison is on
 * a normalised form — scheme and `www.` and a trailing slash removed — because
 * the fastest way to accumulate a hundred duplicates is a paste box that only
 * matches exact strings. It reports rather than constrains: two rows may
 * legitimately share a host, so a unique index would be wrong (M-PORT-42).
 */
export async function createDraftsFromUrls(raw: string): Promise<PasteResult> {
  const db = getDb();
  const result: PasteResult = { created: [], duplicates: [], failed: [] };

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return result;

  const existing = await db
    .select({ slug: exampleSites.slug, url: exampleSites.url })
    .from(exampleSites);

  const byNormalised = new Map(
    existing.map((row) => [normalise(row.url), row.slug]),
  );
  const takenSlugs = new Set(existing.map((row) => row.slug));

  for (const line of lines) {
    let url: URL;
    try {
      url = new URL(line.startsWith("http") ? line : `https://${line}`);
    } catch {
      result.failed.push({ line, reason: "that isn't a URL" });
      continue;
    }

    const key = normalise(url.toString());
    const duplicate = byNormalised.get(key);
    if (duplicate) {
      result.duplicates.push({ host: hostOf(url.toString()), slug: duplicate });
      continue;
    }

    const slug = uniqueSlug(slugFor(url), takenSlugs);
    takenSlugs.add(slug);
    byNormalised.set(key, slug);

    await db.insert(exampleSites).values({ slug, url: url.toString() });
    result.created.push({ slug, host: hostOf(url.toString()) });
  }

  return result;
}

/**
 * Creates one site with everything it knows about itself, in one write.
 *
 * The ordinary way to add a site, and for a long time the missing one: the
 * first cut of this surface could only mint a row from a bare URL, so adding a
 * site properly meant pasting a link, finding the row it made, opening a second
 * page, and filling it in there. That is a bulk-intake queue wearing a CRUD
 * surface's clothes. `createDraftsFromUrls` still exists beside this, for the
 * hundred-and-ten-link case it was actually good at.
 *
 * Returns the slug so the caller can attach media to the row it just made and
 * then open it — one submit from the person's side.
 */
export async function createExampleSite(
  input: NewExampleSiteInput,
): Promise<string> {
  const db = getDb();

  const trimmed = input.url.trim();
  if (!trimmed) throw new ExampleSiteRejected("A link is needed to start.");

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new ExampleSiteRejected("That link doesn't look like a URL.");
  }

  if (input.styles.length > 3) {
    throw new ExampleSiteRejected("Three style tags at most.");
  }

  const existing = await db
    .select({ slug: exampleSites.slug, url: exampleSites.url })
    .from(exampleSites);

  const duplicate = existing.find(
    (row) => normalise(row.url) === normalise(url.toString()),
  );
  if (duplicate) {
    throw new ExampleSiteRejected(
      `${hostOf(url.toString())} is already in the library, as "${duplicate.slug}".`,
    );
  }

  const slug = uniqueSlug(
    slugFrom(input.name) || slugFor(url),
    new Set(existing.map((row) => row.slug)),
  );

  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(exampleSites)
      .values({
        slug,
        url: url.toString(),
        name: blankToNull(input.name),
        role: blankToNull(input.role),
        group: input.group,
        ground: input.ground,
        motion: input.motion,
        density: input.density,
        build: input.build,
        styles: input.styles,
        embed: input.embed,
        checkedOn: blankToNull(input.checkedOn),
      })
      .returning({ id: exampleSites.id });

    if (input.packs.length > 0) {
      await tx
        .insert(exampleSitePacks)
        .values(input.packs.map((pack) => ({ exampleSiteId: row.id, pack })));
    }
  });

  return slug;
}

export type SaveExampleSiteInput = {
  slug: string;
  name: string;
  role: string;
  url: string;
  group: string | null;
  ground: string | null;
  motion: string | null;
  density: string | null;
  build: string | null;
  styles: string[];
  embed: boolean;
  checkedOn: string;
  packs: ExamplePack[];
};

/**
 * Writes the judgements, and the pack membership with them.
 *
 * The slug is not an input. It is a client's stored answer, it is fixed once
 * the row has ever been published, and the one way to be sure a rename cannot
 * happen by accident is for this function to have no way to perform one
 * (M-PORT-44).
 *
 * Pack membership is replaced wholesale rather than diffed. Six possible rows
 * per site makes the diff the more expensive thing to get right, and a
 * delete-then-insert inside one transaction has no intermediate state anyone
 * can observe.
 */
export async function saveExampleSite(
  input: SaveExampleSiteInput,
): Promise<void> {
  const db = getDb();

  const [row] = await db
    .select({ id: exampleSites.id })
    .from(exampleSites)
    .where(eq(exampleSites.slug, input.slug))
    .limit(1);

  if (!row) throw new ExampleSiteRejected("That site no longer exists.");

  if (input.styles.length > 3) {
    throw new ExampleSiteRejected("Three style tags at most.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(exampleSites)
      .set({
        name: blankToNull(input.name),
        role: blankToNull(input.role),
        url: input.url.trim(),
        group: input.group,
        ground: input.ground,
        motion: input.motion,
        density: input.density,
        build: input.build,
        styles: input.styles,
        embed: input.embed,
        checkedOn: blankToNull(input.checkedOn),
        updatedAt: new Date(),
      })
      .where(eq(exampleSites.id, row.id));

    await tx
      .delete(exampleSitePacks)
      .where(eq(exampleSitePacks.exampleSiteId, row.id));

    if (input.packs.length > 0) {
      await tx.insert(exampleSitePacks).values(
        input.packs.map((pack) => ({ exampleSiteId: row.id, pack })),
      );
    }
  });
}

/**
 * Moves a row between draft, published, and archived.
 *
 * **Publishing runs the gate again**, on the row as stored rather than as the
 * form last described it. The control in front of Taylor is the cheap early
 * check; this is the one that actually decides, because a form's idea of a row
 * can be stale and a client's screen cannot.
 *
 * `firstPublishedAt` is written once and never cleared. Unpublishing does not
 * unfreeze the slug: a client may already have picked this site, and their
 * answer does not become editable again because the site left the gallery.
 *
 * Restoring an archived row returns it to **draft**, never straight to
 * published. A site taken out and put back gets looked at again.
 */
export async function setExampleSiteStatus(
  slug: string,
  status: ExampleSiteStatus,
): Promise<void> {
  const site = await loadExampleSite(slug);
  if (!site) throw new ExampleSiteRejected("That site no longer exists.");

  if (status === "published" && site.blockers.length > 0) {
    throw new ExampleSiteRejected(
      `Not yet — ${site.blockers.join(", and ")}.`,
    );
  }

  await getDb()
    .update(exampleSites)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === "published" && !site.slugLocked
        ? { firstPublishedAt: new Date() }
        : {}),
    })
    .where(eq(exampleSites.slug, slug));
}

/**
 * The per-pack switch — the only control that can put a gallery in front of a
 * client (D-PORT-21).
 *
 * Upserts, because a pack with no row is the off state and there is no seed.
 */
export async function setPackShown(
  pack: ExamplePack,
  shownToClients: boolean,
): Promise<void> {
  await getDb()
    .insert(examplePacks)
    .values({ pack, shownToClients })
    .onConflictDoUpdate({
      target: examplePacks.pack,
      set: { shownToClients, updatedAt: new Date() },
    });
}

/**
 * Attaches a stored capture to a row.
 *
 * Position is assigned here rather than by the caller: the hero is position 1
 * and everything else follows in arrival order, so there is no way for two
 * captures to claim the same slot or for the hero to be ambiguous.
 *
 * Alt is authored for the hero and derived for the rest — a positional line is
 * the correct answer for a scroll strip of one site, and better than three
 * near-identical hand-written sentences (D-PORT-28).
 */
export async function attachCapture(input: {
  slug: string;
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
}): Promise<void> {
  const db = getDb();

  const [row] = await db
    .select({ id: exampleSites.id, name: exampleSites.name })
    .from(exampleSites)
    .where(eq(exampleSites.slug, input.slug))
    .limit(1);

  if (!row) throw new ExampleSiteRejected("That site no longer exists.");

  const existing = await db
    .select({ position: exampleCaptures.position })
    .from(exampleCaptures)
    .where(eq(exampleCaptures.exampleSiteId, row.id));

  const position = existing.length === 0
    ? 1
    : Math.max(...existing.map((shot) => shot.position)) + 1;

  await db.insert(exampleCaptures).values({
    exampleSiteId: row.id,
    position,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
    alt: position === 1 ? "" : derivedAlt(row.name ?? input.slug, position),
  });
}

export async function setCaptureAlt(
  captureId: string,
  alt: string,
): Promise<void> {
  await getDb()
    .update(exampleCaptures)
    .set({ alt: alt.trim() })
    .where(eq(exampleCaptures.id, captureId));
}

/**
 * Removes a capture, row and object together.
 *
 * The row goes first. A leaked object costs bytes; a row pointing at bytes that
 * are gone costs a broken image on a client's screen.
 */
export async function removeCapture(captureId: string): Promise<void> {
  const db = getDb();

  const [row] = await db
    .select()
    .from(exampleCaptures)
    .where(eq(exampleCaptures.id, captureId))
    .limit(1);

  if (!row) return;

  await db.delete(exampleCaptures).where(eq(exampleCaptures.id, captureId));
  await deleteCapture(row.storagePath);

  // Close the gap so the hero is always position 1. A site whose first capture
  // was removed must promote the next one rather than publish with no hero.
  const rest = await db
    .select()
    .from(exampleCaptures)
    .where(eq(exampleCaptures.exampleSiteId, row.exampleSiteId))
    .orderBy(asc(exampleCaptures.position));

  for (const [index, shot] of rest.entries()) {
    if (shot.position !== index + 1) {
      await db
        .update(exampleCaptures)
        .set({ position: index + 1 })
        .where(eq(exampleCaptures.id, shot.id));
    }
  }
}

/**
 * Makes one item the hero, keeping everything else in order behind it.
 *
 * The hero is what the client's row renders, so which item leads is a real
 * editorial decision — you shoot three scrolls and the second one is the shot.
 * Reordering the whole strip was deferred; promoting one item is the ninety
 * percent of it that matters, and it is the same rewrite either way.
 */
export async function promoteCapture(captureId: string): Promise<void> {
  const db = getDb();

  const [target] = await db
    .select()
    .from(exampleCaptures)
    .where(eq(exampleCaptures.id, captureId))
    .limit(1);

  if (!target || target.position === 1) return;

  const all = await db
    .select()
    .from(exampleCaptures)
    .where(eq(exampleCaptures.exampleSiteId, target.exampleSiteId))
    .orderBy(asc(exampleCaptures.position));

  const reordered = [
    target,
    ...all.filter((shot) => shot.id !== captureId),
  ];

  // Parked out of the way first: `(site, position)` is unique, so writing 1
  // onto the new hero while the old one still holds 1 would collide.
  await db.transaction(async (tx) => {
    for (const [index, shot] of reordered.entries()) {
      await tx
        .update(exampleCaptures)
        .set({ position: -(index + 1) })
        .where(eq(exampleCaptures.id, shot.id));
    }
    for (const [index, shot] of reordered.entries()) {
      await tx
        .update(exampleCaptures)
        .set({ position: index + 1 })
        .where(eq(exampleCaptures.id, shot.id));
    }
  });
}

function derivedAlt(name: string, position: number): string {
  return `${name}, view ${position}`;
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Scheme, `www.`, and a trailing slash removed — for duplicate detection only. */
function normalise(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

/** A readable identity from the name, when there is one. */
function slugFrom(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** A readable identity from the host, when there is no name yet. */
function slugFor(url: URL): string {
  const base = url.hostname
    .replace(/^www\./, "")
    .replace(/\.[a-z.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return base || "site";
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
