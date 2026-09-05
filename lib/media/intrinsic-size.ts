/**
 * An image's real pixel dimensions, read from its header.
 *
 * ## Why this exists rather than a dependency
 *
 * A taste capture's row cannot be stored without its intrinsic width and
 * height: `next/image` with an unconstrained width renders a capture at a
 * fraction of its size, silently, with nothing in the console, and this repo
 * has shipped that bug once. The columns are `not null` because of it, so
 * something has to measure every upload.
 *
 * `sharp` is present in `node_modules` only transitively, through Next —
 * depending on it is a boundary a Next upgrade can move, and making it a direct
 * dependency ships platform-native binaries into a serverless function and
 * amends the repo's "no new dependency beyond `lucide-react`" rule. Seventy
 * lines against three well-specified formats has no deployment surface at all,
 * and — unlike a native module — it runs inside `yarn verify:tracks`, which has
 * neither network nor database (M-PORT-45).
 *
 * ## What it reads, and what it deliberately does not
 *
 * JPEG, PNG, GIF, and WebP — every still and animated image the gallery takes.
 *
 * **Video is not read here and is not meant to be.** MP4 hides its dimensions
 * in a `tkhd` box inside `moov/trak` and WebM's EBML is worse; both are real
 * decoders for a number that is a layout hint. Video dimensions come from the
 * browser at upload instead (`videoWidth`/`videoHeight`, after the element has
 * loaded its metadata), which is accurate in practice and whose worst failure
 * is a box at the wrong size — see `server/services/example-captures.ts`.
 *
 * **AVIF is not read** either: its dimensions live in an `ispe` box nested in
 * the ISO-BMFF `meta` tree, which is the same class of work for a format
 * nothing here emits. `next/image` still *serves* AVIF; it is only not an
 * input.
 *
 * Returns null rather than throwing on anything it cannot read. A caller
 * turning that into a message a person can act on is the point — "we could not
 * read that image's size" beats a stack trace, and the upload is refused
 * either way.
 */
export type IntrinsicSize = { width: number; height: number };

export function intrinsicSizeOf(bytes: Uint8Array): IntrinsicSize | null {
  return (
    pngSize(bytes) ?? gifSize(bytes) ?? webpSize(bytes) ?? jpegSize(bytes)
  );
}

/**
 * `GIF87a` or `GIF89a`, then the logical screen size, little-endian.
 *
 * The simplest header of the four and the reason GIF belongs here rather than
 * in the "needs a decoder" pile: a screen recording of a site's hover state is
 * exactly the media a `motion: alive` tag is about, and it costs six bytes of
 * parsing to accept one.
 */
function gifSize(b: Uint8Array): IntrinsicSize | null {
  if (b.length < 10) return null;
  const magic = ascii(b, 0, 6);
  if (magic !== "GIF87a" && magic !== "GIF89a") return null;

  return {
    width: b[6] | (b[7] << 8),
    height: b[8] | (b[9] << 8),
  };
}

/** `\x89PNG\r\n\x1a\n`, then an `IHDR` whose first eight bytes are the size. */
function pngSize(b: Uint8Array): IntrinsicSize | null {
  if (b.length < 24) return null;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (signature.some((byte, i) => b[i] !== byte)) return null;
  if (String.fromCharCode(b[12], b[13], b[14], b[15]) !== "IHDR") return null;

  return { width: be32(b, 16), height: be32(b, 20) };
}

/**
 * RIFF container, `WEBP` fourcc, then one of three chunk layouts.
 *
 * All three store the dimensions little-endian, and two of them store them
 * minus one — a lossy WebP's 14-bit fields and a VP8X's 24-bit canvas are both
 * "size − 1", which is the detail that makes a hand-rolled reader worth
 * commenting rather than worth trusting.
 */
function webpSize(b: Uint8Array): IntrinsicSize | null {
  if (b.length < 30) return null;
  if (ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;

  const chunk = ascii(b, 12, 4);

  // Extended: a 24-bit canvas size, each stored minus one.
  if (chunk === "VP8X") {
    return {
      width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
      height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
    };
  }

  // Lossless: 14 bits each, packed across four bytes after the `\x2f` header.
  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) return null;
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  // Lossy: a keyframe start code, then two 14-bit dimensions stored as-is.
  if (chunk === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return {
      width: (b[26] | (b[27] << 8)) & 0x3fff,
      height: (b[28] | (b[29] << 8)) & 0x3fff,
    };
  }

  return null;
}

/**
 * Walk the marker segments to the frame header.
 *
 * The size is not at a fixed offset in a JPEG — EXIF, ICC profiles, and comment
 * segments all sit in front of it and vary in length. So this walks: every
 * marker but the standalone ones carries a big-endian length, and the first
 * `SOF` marker holds the height and width. `SOF4`, `SOF8`, and `SOF12` are
 * excluded because they are not frame headers (DHT, JPG, and DAC reuse the
 * `0xC*` range).
 */
function jpegSize(b: Uint8Array): IntrinsicSize | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;

  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1; // Resynchronise rather than give up: padding bytes are legal.
      continue;
    }

    const marker = b[i + 1];

    // Padding and the standalone markers carry no length to skip.
    if (marker === 0xff || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }

    const isFrameHeader =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isFrameHeader) {
      return { width: be16(b, i + 7), height: be16(b, i + 5) };
    }

    const length = be16(b, i + 2);
    if (length < 2) return null; // Malformed; walking further would not end.
    i += 2 + length;
  }

  return null;
}

function be16(b: Uint8Array, at: number): number {
  return (b[at] << 8) | b[at + 1];
}

function be32(b: Uint8Array, at: number): number {
  return (
    ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0
  );
}

function ascii(b: Uint8Array, at: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(b[at + i]);
  return out;
}
