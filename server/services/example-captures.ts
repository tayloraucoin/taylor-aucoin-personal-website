import "server-only";

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";
import {
  CAPTURE_BUCKET as BUCKET,
  CAPTURE_PREFIX as PREFIX,
  capturePathFor,
  captureUrlFor,
} from "@/lib/intake/example-media";
import { intrinsicSizeOf } from "@/lib/media/intrinsic-size";

/* ────────────────────────────────────────────────────────────────────────────
   Taste-gallery captures: the bytes, and nothing else.
   
   Separate from `example-sites.ts` because this seam talks to Supabase Storage
   and that one talks to Postgres — the same split `submission.ts` already draws
   for a client's uploads, and the reason the row's lifecycle stays legible when
   an upload fails halfway.
   ──────────────────────────────────────────────────────────────────────────── */


/** Generous for a 3024 × 1964 JPEG at quality 82, which lands near 1 MB. */
export const MAX_CAPTURE_BYTES = 10 * 1024 * 1024;

/**
 * Video gets more room. A ten-second screen recording of a site scrolling is
 * routinely bigger than any screenshot, and refusing it would make the format
 * useless for the one thing it is here to do.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/**
 * What may be uploaded.
 *
 * Stills, animated GIFs, and video. A GIF of a site's hover state and a screen
 * recording of its scroll are the same job — showing what a `motion: alive`
 * site actually does — and a still cannot do that job at all.
 *
 * AVIF is absent on purpose: its dimensions live in an `ispe` box nested in the
 * ISO-BMFF `meta` tree, which is a decoder's worth of work for a format nothing
 * here emits. `next/image` still *serves* AVIF; it is only not an input.
 */
const ACCEPTED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

export const ACCEPTED_CAPTURE_TYPES = [...ACCEPTED.keys()];

/** Video is stored and rendered; it is just not measured from its bytes. */
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

export class CaptureRejected extends Error {}

let storage: ReturnType<typeof createClient> | null = null;

function getStorage() {
  storage ??= createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
  return storage;
}

export { capturePathFor, captureUrlFor };

export type StoredCapture = {
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
};

/**
 * Writes one capture and returns what the row needs to know about it.
 *
 * **The path is never reused.** A random segment rides on every filename, so
 * replacing a capture always produces a new URL — a reused path would be served
 * stale from the CDN, and that failure reads as "the upload didn't work" while
 * looking exactly like it did.
 *
 * Dimensions are measured from the bytes rather than taken from anywhere: the
 * columns are `not null` because `next/image` renders an unconstrained capture
 * at a fraction of its size with nothing in the console, and a number a caller
 * supplied is a number a caller can get wrong.
 */
export async function storeCapture(input: {
  slug: string;
  position: number;
  bytes: Uint8Array;
  mimeType: string;
  /**
   * For video only: what the browser measured after loading the file's
   * metadata.
   *
   * MP4 hides its dimensions in a `tkhd` box and WebM's EBML is worse — real
   * decoders for a number that is a layout hint. The browser has already
   * decoded the file to show a preview, so it knows; taking its answer costs
   * nothing and its worst failure is a box at the wrong size, not a security
   * boundary. Ignored for images, which are measured from their own bytes.
   */
  reportedSize?: { width: number; height: number };
}): Promise<StoredCapture> {
  const extension = ACCEPTED.get(input.mimeType);
  if (!extension) {
    throw new CaptureRejected(
      "That file type can't be used. JPEG, PNG, WebP, GIF, MP4, or WebM.",
    );
  }

  const video = isVideo(input.mimeType);
  const cap = video ? MAX_VIDEO_BYTES : MAX_CAPTURE_BYTES;
  if (input.bytes.byteLength > cap) {
    throw new CaptureRejected(
      `That file is over ${Math.round(cap / 1024 / 1024)} MB.`,
    );
  }

  // Measured before the write, so a file we cannot size is never stored — an
  // object with no row is litter nobody goes looking for.
  const size = video
    ? sane(input.reportedSize)
    : intrinsicSizeOf(input.bytes);

  if (!size) {
    throw new CaptureRejected(
      video
        ? "That video's dimensions couldn't be read by the browser. Try re-encoding it, or use a GIF."
        : "That file's dimensions couldn't be read. It may not be the image type it claims to be.",
    );
  }

  const storagePath = `${PREFIX}/${input.slug}/${input.position}-${randomBytes(4).toString("hex")}.${extension}`;

  const { error } = await getStorage()
    .storage.from(BUCKET)
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (error) {
    throw new CaptureRejected(`The upload failed: ${error.message}`);
  }

  return {
    storagePath,
    mimeType: input.mimeType,
    width: size.width,
    height: size.height,
  };
}

/**
 * A browser-reported size, or nothing.
 *
 * Bounded rather than trusted: the number decides a layout box, and a zero or a
 * six-figure value would break one. Anything outside the range is treated as
 * absent, which surfaces as a message rather than as a broken row.
 */
function sane(
  size: { width: number; height: number } | undefined,
): { width: number; height: number } | null {
  if (!size) return null;
  const ok = (n: number) => Number.isFinite(n) && n > 0 && n <= 20_000;
  return ok(size.width) && ok(size.height) ? size : null;
}

/**
 * Fetches an image by URL so it can be stored like any other capture.
 *
 * **The bytes are copied, never referenced.** Three reasons, and the third is
 * the one that decides it: `next/image` pointed at arbitrary hosts is an open
 * image proxy; the dimensions have to be read from the bytes anyway, so the
 * fetch happens either way; and a capture hosted alongside the site it depicts
 * goes dark exactly when that site does — which is the failure `checkedOn`
 * exists to warn about. The point of a capture is that it outlives the site.
 *
 * Hardening, for an admin-only path behind `requireAdmin`, stated so the next
 * person knows what it does and does not address: https only; `redirect:
 * "error"`, which kills the redirect-into-a-private-range class outright rather
 * than trying to validate each hop; a size cap enforced on the way in; a
 * content type checked against the decoded header as well as the claimed one,
 * since a `Content-Type` is a claim; and a short timeout.
 */
export async function fetchCaptureBytes(rawUrl: string): Promise<{
  bytes: Uint8Array;
  mimeType: string;
}> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new CaptureRejected("That doesn't look like a URL.");
  }

  if (url.protocol !== "https:") {
    throw new CaptureRejected("The image URL has to start with https.");
  }

  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
    headers: { accept: ACCEPTED_CAPTURE_TYPES.join(", ") },
  }).catch(() => {
    throw new CaptureRejected(
      "That URL couldn't be fetched. If it redirects, paste the address it ends up at.",
    );
  });

  if (!response.ok) {
    throw new CaptureRejected(`That URL returned ${response.status}.`);
  }

  const claimed = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  // Images and GIFs by URL; video has to be uploaded. A remote video means
  // range requests and a size we only learn after committing to the download,
  // and the browser is right there to measure a local one.
  if (!ACCEPTED.has(claimed) || isVideo(claimed)) {
    throw new CaptureRejected(
      `That URL served ${claimed || "an unknown type"}. It needs to be a JPEG, PNG, WebP, or GIF — upload video from your machine instead.`,
    );
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_CAPTURE_BYTES) {
    throw new CaptureRejected("That image is over 10 MB.");
  }

  const bytes = new Uint8Array(buffer);

  // The header is the arbiter, not the claim: `storeCapture` measures the same
  // bytes, so a file whose header disagrees with its Content-Type is refused
  // there rather than stored under a type it is not.
  if (!intrinsicSizeOf(bytes)) {
    throw new CaptureRejected(
      "That URL served something that isn't a readable image.",
    );
  }

  return { bytes, mimeType: claimed };
}

/**
 * Removes a capture's object.
 *
 * Called in the same operation as the row delete. A failure here is logged and
 * swallowed: a leaked object costs bytes, and a row that survives its own
 * delete because storage was briefly unreachable costs a person their
 * afternoon.
 */
export async function deleteCapture(storagePath: string): Promise<void> {
  const { error } = await getStorage().storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.warn(`example capture object not removed: ${error.message}`);
  }
}
