"use server";

import { revalidatePath } from "next/cache";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import type { NewExampleSiteInput } from "@/lib/intake/example-packs";
import {
  attachCapture,
  createDraftsFromUrls,
  createExampleSite,
  promoteCapture,
  type ExamplePack,
  type ExampleSiteStatus,
  ExampleSiteRejected,
  loadExampleSite,
  nextDraftSlug,
  type PasteResult,
  removeCapture,
  saveExampleSite,
  setCaptureAlt,
  setExampleSiteStatus,
  setPackShown,
} from "@/server/services/example-sites";
import {
  CaptureRejected,
  fetchCaptureBytes,
  storeCapture,
} from "@/server/services/example-captures";

/**
 * Every write on the example-sites surface.
 *
 * Thin by construction: authorise, validate, call the service, revalidate,
 * return. Nothing here decides anything — the publish gate, the slug freeze,
 * and the pack switch all live in `example-sites.ts`, so a second entry rail
 * could never reach a different answer.
 *
 * Failures come back as a message rather than a thrown error, because every one
 * of them is an ordinary state of unfinished work — a URL that will not parse,
 * a capture at the wrong aspect, a row that is not ready. None of them is the
 * user's mistake and none should look like a crash.
 */

type Result<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; message: string };

function failed(error: unknown): { ok: false; message: string } {
  if (error instanceof ExampleSiteRejected || error instanceof CaptureRejected) {
    return { ok: false, message: error.message };
  }
  console.error("example sites action failed", error);
  return { ok: false, message: "That didn't save. Try again." };
}

/**
 * The whole surface, because everything on it derives from the same rows.
 *
 * Publishing one site changes its row, the pack's coverage counts, the pack
 * summary on the overview, and whether the gallery preview has anything in it.
 * Revalidating the tree is one call and cannot miss one of those.
 */
function revalidateAll(): void {
  revalidatePath(adminRoutes.intakeExamples, "layout");
}

export async function addDraftsAction(
  raw: string,
): Promise<Result<PasteResult>> {
  await requireAdmin();
  try {
    const data = await createDraftsFromUrls(raw);
    revalidateAll();
    return { ok: true, data };
  } catch (error) {
    return failed(error);
  }
}

/** The ordinary create: everything the site knows, in one submit. */
export async function createSiteAction(
  input: NewExampleSiteInput,
): Promise<Result<string>> {
  await requireAdmin();
  try {
    const slug = await createExampleSite(input);
    revalidateAll();
    return { ok: true, data: slug };
  } catch (error) {
    return failed(error);
  }
}

export async function promoteCaptureAction(input: {
  slug: string;
  captureId: string;
}): Promise<Result> {
  await requireAdmin();
  try {
    await promoteCapture(input.captureId);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function saveSiteAction(input: {
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
}): Promise<Result> {
  await requireAdmin();
  try {
    await saveExampleSite(input);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

/**
 * Where the next untagged draft is, so the editor can go straight there.
 *
 * The whole affordance for a hundred-and-ten-site job: after tagging a site the
 * next act is always the next draft, and this makes it one button instead of
 * two navigations.
 */
export async function nextDraftAction(
  afterSlug: string,
): Promise<Result<string | null>> {
  await requireAdmin();
  try {
    return { ok: true, data: await nextDraftSlug(afterSlug) };
  } catch (error) {
    return failed(error);
  }
}

export async function setStatusAction(
  slug: string,
  status: ExampleSiteStatus,
): Promise<Result> {
  await requireAdmin();
  try {
    await setExampleSiteStatus(slug, status);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

/**
 * The same status change, applied to a selection.
 *
 * Loops `setExampleSiteStatus` rather than reaching for a single `UPDATE … IN
 * (…)`, because the publish gate is per row: a site that is not ready must be
 * refused by name, and a set-based write would either skip that check or fail
 * the whole batch on one incomplete row. Seventy-three round trips on a
 * founder-operated screen is a second, and the alternative is a second entry
 * rail that could reach a different answer than the per-row one.
 *
 * **Partial success is the expected outcome, not an error.** Publishing a
 * selection where four sites are still missing a capture should publish the
 * rest and say which four were left, so the report carries counts and the
 * refusals by name. Nothing is rolled back: each row that went through is a row
 * that was ready.
 */
export async function setStatusBulkAction(
  slugs: string[],
  status: ExampleSiteStatus,
): Promise<Result<{ changed: number; refused: { slug: string; why: string }[] }>> {
  await requireAdmin();

  const refused: { slug: string; why: string }[] = [];
  let changed = 0;

  for (const slug of slugs) {
    try {
      await setExampleSiteStatus(slug, status);
      changed += 1;
    } catch (error) {
      const why =
        error instanceof ExampleSiteRejected || error instanceof CaptureRejected
          ? error.message
          : "That one didn't save.";
      if (!(error instanceof ExampleSiteRejected)) {
        console.error(`bulk ${status} failed for ${slug}`, error);
      }
      refused.push({ slug, why });
    }
  }

  // Once, at the end. Revalidating per row would rebuild the tree seventy-three
  // times for one press.
  revalidateAll();

  return { ok: true, data: { changed, refused } };
}

export async function setPackShownAction(
  pack: ExamplePack,
  shown: boolean,
): Promise<Result> {
  await requireAdmin();
  try {
    await setPackShown(pack, shown);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

/**
 * A capture from the machine in front of Taylor.
 *
 * `FormData` rather than a base64 string: a 3024px JPEG through a server
 * action's JSON payload is megabytes of encoded text, and the multipart body is
 * what the platform already does well.
 */
export async function uploadCaptureAction(form: FormData): Promise<Result> {
  await requireAdmin();

  const slug = String(form.get("slug") ?? "");
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "No file was chosen." };
  }

  // Video only: the browser has already decoded the file to preview it, so it
  // knows the dimensions that MP4 and WebM bury behind a decoder's worth of
  // parsing. Absent for images, which are measured from their own bytes.
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  const reportedSize =
    width > 0 && height > 0 ? { width, height } : undefined;

  try {
    const site = await loadExampleSite(slug);
    if (!site) return { ok: false, message: "That site no longer exists." };

    const stored = await storeCapture({
      slug,
      position: site.captures.length + 1,
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: file.type,
      reportedSize,
    });

    await attachCapture({ slug, ...stored });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

/** A capture that already lives somewhere. Copied here, never referenced. */
export async function captureFromUrlAction(input: {
  slug: string;
  url: string;
}): Promise<Result> {
  await requireAdmin();

  try {
    const site = await loadExampleSite(input.slug);
    if (!site) return { ok: false, message: "That site no longer exists." };

    const { bytes, mimeType } = await fetchCaptureBytes(input.url);
    const stored = await storeCapture({
      slug: input.slug,
      position: site.captures.length + 1,
      bytes,
      mimeType,
    });

    await attachCapture({ slug: input.slug, ...stored });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function setCaptureAltAction(input: {
  slug: string;
  captureId: string;
  alt: string;
}): Promise<Result> {
  await requireAdmin();
  try {
    await setCaptureAlt(input.captureId, input.alt);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function removeCaptureAction(input: {
  slug: string;
  captureId: string;
}): Promise<Result> {
  await requireAdmin();
  try {
    await removeCapture(input.captureId);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}
