import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { applyTierEnv } from "./_env";

applyTierEnv();

/**
 * Seeds the film taste gallery from the research libraries, with its media.
 *
 *   yarn seed:examples --media "/Users/taylor/Desktop/example sites"
 *   yarn seed:examples --media "…" --publish
 *   yarn seed:examples --media "…" --dry
 *
 * ## Idempotent, because it will be run more than once
 *
 * Every step asks "is this already true" before doing anything:
 *
 * - **A site whose slug exists** has its fields updated, not a second row made.
 * - **A capture already in storage** is skipped by name. Supabase has no
 *   directories — a path is one flat key and the dashboard's folders are the
 *   console splitting keys on slashes — so there is nothing to create and
 *   nothing to check for. `storedCaptureNames` lists the prefix; an unwritten
 *   prefix simply lists empty. That is the whole of the "does the sub-dir
 *   exist" question: it does not, it never did, and writing a key brings it
 *   into being.
 * - **A capture row already pointing at that path** is left alone.
 *
 * So dropping more screenshots into the folder and re-running only does the new
 * ones.
 *
 * ## PNG in, JPEG out
 *
 * The captures arrive as ~3 MB PNGs — 228 MB across 73 sites — which is a lot
 * of bytes for a client on a phone to pull down a gallery of. They are
 * converted with `sips`, which ships with macOS, so this costs no dependency.
 * Quality 82 is what `capture:example` shoots at.
 *
 * **Publishing is opt-in** (`--publish`), and the pack switch stays off
 * regardless: nothing this script does can put a gallery in front of a client.
 * That is D-PORT-21, and a seed script is exactly the kind of thing it exists
 * to stop.
 */

const QUALITY = 82;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      media: { type: "string" },
      publish: { type: "boolean" },
      dry: { type: "boolean" },
    },
  });

  const mediaDir = values.media?.trim();
  if (!mediaDir || !existsSync(mediaDir)) {
    throw new Error(`Missing or unreadable --media "<folder of screenshots>"`);
  }

  const { FILM_SEED_SITES } = await import("./seed/film-example-sites");
  const { getDb } = await import("@/db/client");
  const { exampleCaptures, exampleSitePacks, exampleSites } = await import(
    "@/db/schema"
  );
  const { and, eq } = await import("drizzle-orm");
  // Its own storage client rather than the app service's: that module is
  // `server-only` — correctly, it holds the service-role key — and this runs
  // outside Next. The one thing that must not be duplicated is the key a
  // capture is written to, and that comes from `example-media.ts`, which both
  // read.
  const { createClient } = await import("@supabase/supabase-js");
  const { requireEnv } = await import("@/lib/env");
  const { intrinsicSizeOf } = await import("@/lib/media/intrinsic-size");
  const { CAPTURE_BUCKET, CAPTURE_PREFIX, capturePathFor } = await import(
    "@/lib/intake/example-media"
  );

  const storage = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  ).storage.from(CAPTURE_BUCKET);

  /**
   * What is already stored for one site.
   *
   * **There are no directories in Supabase storage.** A path is one flat key,
   * and the folders the dashboard draws are the console splitting keys on
   * slashes. An unwritten prefix lists empty rather than erroring, so the
   * question is never "does the sub-directory exist" — it is "has this exact
   * key been written". Nothing is created; writing the key is what makes the
   * folder appear.
   */
  const storedNamesFor = async (slug: string): Promise<Set<string>> => {
    const { data } = await storage.list(`${CAPTURE_PREFIX}/${slug}`, {
      limit: 200,
    });
    return new Set((data ?? []).map((object) => object.name));
  };

  const db = getDb();
  const scratch = mkdtempSync(path.join(tmpdir(), "example-seed-"));

  let created = 0;
  let updated = 0;
  let uploaded = 0;
  let skipped = 0;

  for (const seed of FILM_SEED_SITES) {
    const source = path.join(mediaDir, seed.screenshot);
    if (!existsSync(source)) {
      console.warn(`skip  ${seed.slug} — no screenshot at ${seed.screenshot}`);
      continue;
    }

    const fields = {
      name: seed.name,
      url: seed.url,
      role: seed.role,
      group: seed.group,
      ground: seed.ground,
      motion: seed.motion,
      density: seed.density,
      styles: seed.styles,
      build: seed.build,
      // The screenshot is itself the confirmation the link was live that day.
      checkedOn: "2026-09-04",
      updatedAt: new Date(),
    };

    if (values.dry) {
      console.log(`dry   ${seed.slug} · ${seed.group} · ${seed.ground}/${seed.motion}/${seed.density}`);
      continue;
    }

    // ── The row ──────────────────────────────────────────────────────────
    const [existing] = await db
      .select({ id: exampleSites.id })
      .from(exampleSites)
      .where(eq(exampleSites.slug, seed.slug))
      .limit(1);

    let siteId: string;

    if (existing) {
      await db
        .update(exampleSites)
        .set(fields)
        .where(eq(exampleSites.id, existing.id));
      siteId = existing.id;
      updated += 1;
    } else {
      const [row] = await db
        .insert(exampleSites)
        .values({ slug: seed.slug, ...fields })
        .returning({ id: exampleSites.id });
      siteId = row.id;
      created += 1;
    }

    // ── The pack ─────────────────────────────────────────────────────────
    const [inPack] = await db
      .select({ id: exampleSitePacks.id })
      .from(exampleSitePacks)
      .where(
        and(
          eq(exampleSitePacks.exampleSiteId, siteId),
          eq(exampleSitePacks.pack, "film"),
        ),
      )
      .limit(1);

    if (!inPack) {
      await db
        .insert(exampleSitePacks)
        .values({ exampleSiteId: siteId, pack: "film" });
    }

    // ── The capture ──────────────────────────────────────────────────────
    const filename = "hero-1.jpg";
    const storagePath = capturePathFor(seed.slug, filename);

    const alreadyStored = await storedNamesFor(seed.slug);
    const [existingCapture] = await db
      .select({ id: exampleCaptures.id })
      .from(exampleCaptures)
      .where(
        and(
          eq(exampleCaptures.exampleSiteId, siteId),
          eq(exampleCaptures.storagePath, storagePath),
        ),
      )
      .limit(1);

    if (alreadyStored.has(filename) && existingCapture) {
      // Alt can still have been edited in the research since the last run.
      await db
        .update(exampleCaptures)
        .set({ alt: seed.alt })
        .where(eq(exampleCaptures.id, existingCapture.id));
      skipped += 1;
    } else {
      const jpeg = path.join(scratch, `${seed.slug}.jpg`);
      execFileSync("sips", [
        "-s", "format", "jpeg",
        "-s", "formatOptions", String(QUALITY),
        source, "--out", jpeg,
      ], { stdio: "ignore" });

      const bytes = new Uint8Array(readFileSync(jpeg));
      const size = intrinsicSizeOf(bytes);
      if (!size) throw new Error(`Could not read ${seed.slug}'s converted size`);

      const { error } = await storage.upload(storagePath, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (error) throw new Error(`${seed.slug}: ${error.message}`);

      const stored = {
        storagePath,
        mimeType: "image/jpeg",
        width: size.width,
        height: size.height,
      };

      if (existingCapture) {
        await db
          .update(exampleCaptures)
          .set({ ...stored, alt: seed.alt })
          .where(eq(exampleCaptures.id, existingCapture.id));
      } else {
        await db.insert(exampleCaptures).values({
          exampleSiteId: siteId,
          position: 1,
          alt: seed.alt,
          ...stored,
        });
      }
      uploaded += 1;
    }

    // ── Publishing, only if asked ────────────────────────────────────────
    if (values.publish) {
      const { setExampleSiteStatus } = await import(
        "@/server/services/example-sites"
      );
      try {
        await setExampleSiteStatus(seed.slug, "published");
      } catch (error) {
        console.warn(
          `note  ${seed.slug} not published — ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    console.log(`ok    ${seed.slug}`);
  }

  console.log(
    `\n${created} created · ${updated} updated · ${uploaded} captures uploaded · ${skipped} captures already there`,
  );
  if (!values.publish) {
    console.log(
      "note  everything is a draft. Re-run with --publish, or publish from /admin/intake/examples.",
    );
  }
  console.log(
    "note  the film pack's switch is untouched. No client sees any of this until you turn it on.",
  );
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
