/**
 * What a file dropped on the ingestion step is, and whether we can read it
 * (PORT-21).
 *
 * One table, read by three places that must agree: the service that reads a
 * file, the card that tells a client what happened to it, and the intake
 * document that lists what Taylor still has to open himself. A second copy of
 * this mapping would let the screen promise a reading the service never makes.
 *
 * **Nothing here rejects an upload.** Size is the only thing that may refuse a
 * file and that rule is the upload path's, unchanged (README non-negotiable).
 * This decides only whether a file can be *read into text*, which is a
 * different question with a different answer: a Keynote is a perfectly good
 * thing to send Taylor and an impossible thing to parse.
 */

export type SourceKind =
  /** Sent to the model as a document block, page by page. */
  | "pdf"
  /** Sent to the model as an image block. */
  | "image"
  /** Unzipped and read locally — no model, no network. */
  | "office"
  /** Decoded as text, as-is. */
  | "text"
  /** Stored for Taylor and never read. */
  | "unsupported";

/**
 * The per-request ceiling for a file we send to the model.
 *
 * The API's limit is 32 MB for the whole request and base64 inflates bytes by
 * about a third, so 20 MB of file is the largest thing that comfortably fits
 * with its instruction. A file over it is not refused — it is stored, and the
 * card says Taylor reads that one.
 */
export const MAX_MODEL_FILE_BYTES = 20 * 1024 * 1024;

/**
 * The same, for an image block, which has a much lower ceiling of its own.
 */
export const MAX_MODEL_IMAGE_BYTES = 5 * 1024 * 1024;

/** Extensions we can turn into text, by the route each one takes. */
const BY_EXTENSION: Readonly<Record<string, SourceKind>> = {
  pdf: "pdf",

  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  gif: "image",

  docx: "office",
  pptx: "office",

  txt: "text",
  md: "text",
  markdown: "text",
  csv: "text",
  tsv: "text",
  rtf: "text",
  json: "text",
};

/**
 * MIME types worth trusting when the filename has no useful extension.
 *
 * Deliberately short. A browser's MIME guess is unreliable enough that the
 * extension leads and this only fills a gap — a file named `deck` with a
 * `application/pdf` type is a PDF, and nothing here can promote a type the
 * extension already said was unsupported.
 */
const BY_MIME: Readonly<Record<string, SourceKind>> = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "office",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "office",
  "text/plain": "text",
  "text/markdown": "text",
  "text/csv": "text",
};

/** The extension, lowercased, without its dot. Empty when there is none. */
export function extensionOf(filename: string | null): string {
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(filename ?? "");
  return match ? match[1]!.toLowerCase() : "";
}

/**
 * How this file will be read, if at all.
 *
 * Extension first, MIME second. An unrecognised pair is `unsupported`, which
 * is an honest outcome rather than a failure: a Keynote, a Pages file, a video,
 * a zip, and a scanned-to-`.heic` photo of a contract all land there and all
 * of them are still stored, still linked in the intake document, and still
 * read by Taylor.
 */
export function sourceKindOf(
  filename: string | null,
  mimeType: string | null,
): SourceKind {
  const byExtension = BY_EXTENSION[extensionOf(filename)];
  if (byExtension) return byExtension;

  const byMime = mimeType ? BY_MIME[mimeType.split(";")[0]!.trim()] : undefined;
  return byMime ?? "unsupported";
}

/** Whether a kind's route sends the file's bytes out of our infrastructure. */
export function leavesInfrastructure(kind: SourceKind): boolean {
  return kind === "pdf" || kind === "image";
}

/** The ceiling that applies to one kind, or null where none does. */
export function byteCeilingFor(kind: SourceKind): number | null {
  if (kind === "pdf") return MAX_MODEL_FILE_BYTES;
  if (kind === "image") return MAX_MODEL_IMAGE_BYTES;
  return null;
}

/**
 * The status vocabulary a source row carries, widened from PORT-20's.
 *
 * `null` still means never attempted. `pending`, `done`, and `failed` are the
 * voice note's and mean the same things here. The two new ones are outcomes
 * only a document can have, and neither is a failure of anything: the file is
 * fine, it is stored, and it is simply not something a machine can read.
 */
export type SourceStatus =
  | "pending"
  | "done"
  | "failed"
  | "unsupported"
  | "too_large";


/* ────────────────────────────────────────────────────────────────────────────
   Links (PORT-21)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * How many pages one run will fetch.
 *
 * Ten is enough for an old site, a couple of interviews, a festival page, and
 * a profile — which is what clients actually list — and it bounds both the
 * cost and the time of a run that a leaked link could trigger.
 * `[PROVISIONAL — the number, not the mechanism]`
 */
export const MAX_LINKS = 10;

/**
 * Why one line of the links box was not fetched.
 *
 * `private` covers everything that is not a public page on the open web:
 * localhost, an IP literal, a single-label host, and the reserved suffixes.
 * The fetch itself happens on Anthropic's infrastructure rather than ours, so
 * this is not our SSRF boundary — but a client typing an internal address has
 * made a mistake either way, and telling them beats silently fetching nothing.
 */
export type LinkRejection = "scheme" | "private" | "malformed" | "over_limit";

export type ParsedLinks = {
  urls: string[];
  rejected: Array<{ line: string; reason: LinkRejection }>;
};

const PRIVATE_HOSTS = /^(localhost|.*\.local|.*\.internal|.*\.home\.arpa)$/i;
const IP_LITERAL = /^(\d{1,3}\.){3}\d{1,3}$|^\[?[0-9a-f:]+\]?$/i;

/**
 * The links box, one URL per line, turned into a list worth fetching.
 *
 * Deliberately strict and deliberately quiet about it: a line that is not a
 * public http(s) page is reported back rather than dropped, so a client who
 * pasted a file path or an intranet address is told instead of wondering why
 * their page never appeared.
 *
 * Pure, so the eval can assert the refusals without a network.
 */
export function parseLinks(raw: string | undefined | null): ParsedLinks {
  const urls: string[] = [];
  const rejected: ParsedLinks["rejected"] = [];
  const seen = new Set<string>();

  for (const line of (raw ?? "").split(/[\n,]/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (urls.length >= MAX_LINKS) {
      rejected.push({ line: trimmed, reason: "over_limit" });
      continue;
    }

    // A bare host is the commonest way someone writes a link, and refusing it
    // over a missing scheme would be pedantry rather than safety.
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    let parsed: URL;
    try {
      parsed = new URL(candidate);
    } catch {
      rejected.push({ line: trimmed, reason: "malformed" });
      continue;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      rejected.push({ line: trimmed, reason: "scheme" });
      continue;
    }

    const host = parsed.hostname;
    if (
      PRIVATE_HOSTS.test(host) ||
      IP_LITERAL.test(host) ||
      !host.includes(".")
    ) {
      rejected.push({ line: trimmed, reason: "private" });
      continue;
    }

    const normalised = parsed.toString();
    if (seen.has(normalised)) continue;
    seen.add(normalised);
    urls.push(normalised);
  }

  return { urls, rejected };
}

/** The host one fetch is allowed to reach. Never a wildcard, never a list. */
export function hostOf(url: string): string {
  return new URL(url).hostname;
}
