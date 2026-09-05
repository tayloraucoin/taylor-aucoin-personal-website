import { unzipSync } from "fflate";
import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { intakeFiles } from "@/db/schema";
import {
  byteCeilingFor,
  extensionOf,
  hostOf,
  parseLinks,
  sourceKindOf,
  type SourceKind,
} from "@/lib/intake/source-kinds";
import { getClient, MODEL } from "./extract";
import { requireEngagement } from "./engagement";
import { downloadUpload, writeSourceObject } from "./submission";

/**
 * Reading a file a client attached, so the ingestion run can use its words
 * (PORT-21).
 *
 * ## What leaves our infrastructure, and what does not
 *
 * **Only PDFs and images do.** A DOCX and a PPTX are zip archives of XML and
 * are unzipped and read here, on our own machine, with no network call at all;
 * a text file is decoded. That is not an optimisation, it is the smaller
 * disclosure: most of what clients attach is a deck or a one-pager, and the
 * ones that can be read without sending them anywhere should be.
 *
 * **When a file does leave, it leaves alone.** The request carries the bytes
 * and the instruction. No name, no email, no token, no engagement id, no other
 * answer — the same rule `extract.ts` holds, and deliberately narrower than
 * `voice-transcription.ts`'s, which sends a client's name because spelling
 * proper nouns needs it. Nothing here needs it: the job is to copy words that
 * are already on the page.
 *
 * ## The weaker guarantee, named
 *
 * The ingestion run verifies that every quote it keeps appears in the source
 * text. For a paste, that text is the client's own typing. For a file read
 * here, it is a model's transcription — so a sentence invented at this stage
 * would be verified against itself at the next one. Four things push back and
 * none of them makes a transcription as good as a paste: the instruction
 * forbids composition, the eval grades it against a fixture whose true text is
 * known, the rendering is shown to the client to correct before the run, and
 * every value resting on one is marked as read rather than said.
 *
 * ## Nothing here is logged
 *
 * Not the bytes, not the text, not the filename, not the vendor's payload.
 * A client's deck is their unpublished material and half of what this reads
 * has a confidentiality expectation attached to it.
 *
 * The model is pinned by the track, not chosen here.
 */

/** Which uploads this may ever run against. */
export const READABLE_FIELD_KEYS = ["ingest_documents"] as const;

/**
 * How many times one file may be sent.
 *
 * Per file rather than per engagement, and for the reason M-PORT-30 gives:
 * retry is a per-file action. Three rather than the voice note's five because
 * a document that fails twice is almost always a document this cannot read
 * rather than a vendor having a bad afternoon, and the honest outcome for that
 * is "stored, Taylor reads it" rather than a fourth attempt.
 * `[PROVISIONAL — the number, not the mechanism]`
 */
export const MAX_READ_ATTEMPTS = 3;

/**
 * Where a transcription is cut off, if the model reaches its output ceiling.
 *
 * A rendering that stops mid-document must not read as a whole one. The line
 * is part of the stored text so the client sees it in the box and Taylor sees
 * it in the record; it is inert to the quote validator, which only ever asks
 * whether a proposed quote appears in the text.
 */
export const TRUNCATION_MARKER =
  "\n\n[cut off here — the rest of this file is stored for Taylor]";

export type ReadingFailure =
  | "not_found"
  | "not_uploaded"
  | "unsupported"
  | "too_large"
  | "rate_limited"
  | "empty"
  | "failed";

export class DocumentReadingError extends Error {
  constructor(readonly reason: ReadingFailure) {
    super(`Document reading unavailable: ${reason}`);
    this.name = "DocumentReadingError";
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   The instruction
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Deliberately dull, and the dullness is the safety property.
 *
 * The failure this stage can have is not a bad transcription — a client reads
 * those and fixes them — it is a *fluent* one: a sentence that was never on
 * the page, transcribed confidently, which the next stage then verifies
 * against this stage's own output. So the instruction says copy, says what to
 * do with what it cannot read, and forbids the three things a helpful model
 * does with a messy page: tidy it, summarise it, and fill a gap.
 */
const TRANSCRIBE_INSTRUCTION = [
  "You are transcribing a document so a person can read its text. You are not",
  "summarising it, describing it, or explaining it.",
  "",
  "Rules, in order of importance:",
  "",
  "1. COPY the words that are there, exactly as they are there. Do not correct",
  "   spelling, do not fix grammar, do not tidy phrasing, do not translate.",
  "2. NEVER write a sentence that is not on the page. If a passage is cut off,",
  "   blurred, handwritten, or otherwise unreadable, write [unreadable] and",
  "   move on. An incomplete transcription is correct; an invented one is the",
  "   worst thing you can produce here.",
  "3. Keep the reading order a person would use. Two columns are read left",
  "   column then right column, not interleaved.",
  "4. Start each page or slide with a line of the form --- page 1 --- so a",
  "   reader can find their way back to the original.",
  "5. Include headers, footers, captions, table cells, and labels. Write a",
  "   table's cells one per line rather than trying to draw the table.",
  "6. Where an image carries meaning, write one short line describing it in",
  "   square brackets — [photo of a stone farmhouse]. Do not describe",
  "   decoration, and do not speculate about what an image implies.",
  "7. Output the transcription and nothing else. No preamble, no closing",
  "   remark, no note about what you did.",
].join("\n");

/* ────────────────────────────────────────────────────────────────────────────
   Local readers — no network, no model
   ──────────────────────────────────────────────────────────────────────────── */

const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    if (body.startsWith("#")) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body] ?? whole;
  });
}

/**
 * The text of one Office XML part, in reading order.
 *
 * Both formats put their words in one kind of leaf — `w:t` in a Word document,
 * `a:t` in a slide — inside paragraphs. Tabs and line breaks are their own
 * empty elements *between* those leaves, so they are rewritten as leaves
 * before anything is matched; that is what keeps a flattened table's cells
 * apart instead of running two of them into one word.
 *
 * Text outside those leaves is deliberately not collected. A Word file also
 * carries field codes, revision metadata, and comment anchors, and a
 * strip-every-tag approach would read them as prose.
 */
function officeText(xml: string, leaf: "w:t" | "a:t", paragraph: string): string {
  const prepared = xml
    .replace(/<w:tab\s*\/>/g, `<${leaf}>\t</${leaf}>`)
    .replace(/<w:br\s*\/>/g, `<${leaf}>\n</${leaf}>`)
    .replace(/<a:br\s*\/>/g, `<${leaf}>\n</${leaf}>`);

  const runs = new RegExp(`<${leaf}(?:\\s[^>]*)?>([\\s\\S]*?)</${leaf}>`, "g");

  return prepared
    .split(new RegExp(`</${paragraph}>`))
    .map((block) =>
      [...block.matchAll(runs)].map((match) => decodeEntities(match[1]!)).join(""),
    )
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "")
    .join("\n");
}

/**
 * A `.docx` or a `.pptx`, unzipped and read. Never leaves this machine.
 *
 * Exported for the eval, which builds structurally real OOXML and asserts the
 * text comes back exactly — including the ampersand, the tab-separated row,
 * and the slide ordering trap. Pure: no database, no network, no model.
 */
export function readOffice(bytes: Uint8Array, extension: string): string {
  const files = unzipSync(bytes);
  const decoder = new TextDecoder();

  if (extension === "docx") {
    const part = files["word/document.xml"];
    if (!part) throw new DocumentReadingError("failed");
    return officeText(decoder.decode(part), "w:t", "w:p");
  }

  // Slides are numbered, and `slide10` sorts before `slide2` as a string —
  // which would hand the run a deck in the wrong order and never say so.
  //
  // The number is carried through to the marker rather than replaced by the
  // position in this list. A deck whose slide 7 was deleted still has a slide
  // 10, and labelling it "slide 9" would point the client and Taylor at the
  // wrong page of the file they are both holding.
  const slides = Object.keys(files)
    .map((name) => ({
      name,
      number: Number(/^ppt\/slides\/slide(\d+)\.xml$/.exec(name)?.[1] ?? NaN),
    }))
    .filter((slide) => Number.isFinite(slide.number))
    .sort((a, b) => a.number - b.number);

  if (slides.length === 0) throw new DocumentReadingError("failed");

  return slides
    .map(({ name, number }) => {
      const text = officeText(decoder.decode(files[name]!), "a:t", "a:p");
      return `--- slide ${number} ---\n${text}`;
    })
    .join("\n\n");
}

/**
 * A text file, decoded. A file that is not valid UTF-8 reads as mojibake
 * rather than throwing, which is the same thing a person opening it sees.
 */
export function readPlainText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes);
}

/* ────────────────────────────────────────────────────────────────────────────
   The model reader — PDFs and images
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Sends one file's bytes and returns what it says.
 *
 * Streamed, because a sixty-page deck's transcription is tens of thousands of
 * output tokens and a non-streaming request that size is a timeout waiting to
 * happen. Exported so the eval can grade the transcription against a fixture
 * whose true text is known, without a database or an engagement — the same
 * split `sortDocument` and `proposeFromDocument` have, for the same reason.
 */
export async function transcribeBytes(
  bytes: Uint8Array,
  kind: "pdf" | "image",
  mimeType: string,
): Promise<{ text: string; truncated: boolean }> {
  const data = Buffer.from(bytes).toString("base64");

  const block =
    kind === "pdf"
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data,
          },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mimeType as
              | "image/png"
              | "image/jpeg"
              | "image/webp"
              | "image/gif",
            data,
          },
        };

  const message = await getClient()
    .messages.stream({
      model: MODEL,
      max_tokens: 32000,
      system: TRANSCRIBE_INSTRUCTION,
      messages: [
        {
          role: "user",
          content: [
            block,
            { type: "text", text: "Write out everything in this file." },
          ],
        },
      ],
    })
    .finalMessage();

  const text = message.content
    .filter((part): part is { type: "text"; text: string; citations: never } =>
      part.type === "text",
    )
    .map((part) => part.text)
    .join("")
    .trim();

  return { text, truncated: message.stop_reason === "max_tokens" };
}

/* ────────────────────────────────────────────────────────────────────────────
   The seam
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Claims one attempt against a file, atomically.
 *
 * The cap is the UPDATE's own predicate rather than a read followed by a
 * write, so two presses cannot both pass a check that was true when they read
 * it — the shape `claimRun` and `claimAttempt` already use (M-INT-15). Marking
 * the row `pending` in the same statement is what makes a reload mid-read show
 * "reading" rather than offering a second one.
 */
async function claimRead(fileId: string): Promise<boolean> {
  const [row] = await getDb()
    .update(intakeFiles)
    .set({
      transcriptAttempts: sql`${intakeFiles.transcriptAttempts} + 1`,
      transcriptStatus: "pending",
    })
    .where(
      and(
        eq(intakeFiles.id, fileId),
        lt(intakeFiles.transcriptAttempts, MAX_READ_ATTEMPTS),
      ),
    )
    .returning({ id: intakeFiles.id });

  return Boolean(row);
}

/** Records an outcome that is not a reading. Never spends the bytes. */
async function markStatus(fileId: string, status: string): Promise<void> {
  await getDb()
    .update(intakeFiles)
    .set({ transcriptStatus: status })
    .where(eq(intakeFiles.id, fileId));
}

/**
 * Reads one uploaded file and writes what it says onto its own row.
 *
 * Runs on upload rather than at the moment the client presses the button, so a
 * sixty-page deck's minute of transcription is spent while they are still
 * pasting rather than inside the run's own timeout — and so they can read and
 * correct the rendering before it is used.
 *
 * **Nothing here touches the file's own facts.** `storage_path` and
 * `uploaded_at` are the upload path's and are only read. Every failure below
 * leaves a complete, stored, linked file behind, which is exactly what the
 * step delivered before this existed.
 */
export async function readUploadedFile(
  token: string,
  fileId: string,
): Promise<{ text: string; kind: SourceKind }> {
  const engagement = await requireEngagement(token);

  const [file] = await getDb()
    .select({
      id: intakeFiles.id,
      fieldKey: intakeFiles.fieldKey,
      mimeType: intakeFiles.mimeType,
      originalName: intakeFiles.originalName,
      sizeBytes: intakeFiles.sizeBytes,
      storagePath: intakeFiles.storagePath,
      uploadedAt: intakeFiles.uploadedAt,
    })
    .from(intakeFiles)
    .where(
      and(
        eq(intakeFiles.id, fileId),
        // Scoped to the engagement the token resolves to, so one client's
        // token can never read another client's documents.
        eq(intakeFiles.engagementId, engagement.id),
      ),
    )
    .limit(1);

  if (!file) throw new DocumentReadingError("not_found");

  if (
    !READABLE_FIELD_KEYS.includes(
      file.fieldKey as (typeof READABLE_FIELD_KEYS)[number],
    )
  ) {
    throw new DocumentReadingError("not_found");
  }

  // Reserved but never delivered: no bytes to read, and not a spent attempt.
  if (!file.uploadedAt) throw new DocumentReadingError("not_uploaded");

  const kind = sourceKindOf(file.originalName, file.mimeType);

  // Both of these are settled facts about the file rather than failures, so
  // they are recorded once and never retried. The client is told plainly and
  // the file stays in the intake document either way.
  if (kind === "unsupported") {
    await markStatus(fileId, "unsupported");
    throw new DocumentReadingError("unsupported");
  }

  const ceiling = byteCeilingFor(kind);
  if (ceiling !== null && file.sizeBytes !== null && file.sizeBytes > ceiling) {
    await markStatus(fileId, "too_large");
    throw new DocumentReadingError("too_large");
  }

  if (!(await claimRead(fileId))) {
    throw new DocumentReadingError("rate_limited");
  }

  let bytes: Uint8Array;
  try {
    bytes = await downloadUpload(file.storagePath);
  } catch {
    await markStatus(fileId, "failed");
    throw new DocumentReadingError("failed");
  }

  let text: string;
  let truncated = false;

  try {
    if (kind === "office") {
      text = readOffice(bytes, extensionOf(file.originalName));
    } else if (kind === "text") {
      text = readPlainText(bytes);
    } else {
      const result = await transcribeBytes(
        bytes,
        kind,
        file.mimeType ?? "image/png",
      );
      text = result.text;
      truncated = result.truncated;
    }
  } catch (error) {
    await markStatus(fileId, "failed");

    // What went wrong, never what was in it. No filename, no bytes, no text.
    console.error(
      "[read] could not read an uploaded file:",
      error instanceof Error ? error.message : "unknown error",
    );
    throw new DocumentReadingError("failed");
  }

  const trimmed = text.trim();

  // An empty reading is not a reading. A blank page, an image of a wall, a
  // deck whose text is all outlines — all of them land here, and "we could not
  // read this one, Taylor will" is the honest thing to show for each.
  if (!trimmed) {
    await markStatus(fileId, "failed");
    throw new DocumentReadingError("empty");
  }

  const stored = truncated ? trimmed + TRUNCATION_MARKER : trimmed;

  await getDb()
    .update(intakeFiles)
    .set({
      transcribedAt: new Date(),
      transcript: stored,
      transcriptModel: kind === "office" || kind === "text" ? kind : MODEL,
      transcriptStatus: "done",
    })
    .where(eq(intakeFiles.id, fileId));

  return { text: stored, kind };
}

/* ────────────────────────────────────────────────────────────────────────────
   Links (PORT-21)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * The field key every fetched page is stored under. A source like any other.
 */
export const LINK_FIELD_KEY = "ingest_links";

/**
 * How much of one page we keep.
 *
 * A long article is worth reading; a forum thread with four hundred replies is
 * not, and neither is a page whose navigation outweighs its content. The tool
 * enforces this on its side, so nothing oversized ever reaches us.
 */
const MAX_PAGE_TOKENS = 20_000;

export type FetchedLink =
  | { url: string; ok: true; text: string }
  | { url: string; ok: false; error: string };

/**
 * Fetches one page and returns its text.
 *
 * **The request leaves Anthropic's infrastructure, not ours.** That is the
 * whole reason this uses the server-side fetch tool rather than a `fetch` call
 * in a route handler: a URL a client typed, fetched by our own server, is an
 * SSRF surface we would then have to defend — allow-lists, redirect limits,
 * DNS rebinding, the metadata endpoint. Here there is no outbound request from
 * our infrastructure at all, and `allowed_domains` is set to exactly the one
 * host the client named, so the tool cannot be talked into fetching a second
 * page by anything on the first.
 *
 * A failure is a returned value rather than a throw: a 404, a login wall, and
 * a JS-only app are all ordinary outcomes of asking for a page, and every one
 * of them should leave the other nine links unaffected.
 *
 * Exported so the eval can grade the error handling without a database.
 */
export async function fetchLink(url: string): Promise<FetchedLink> {
  let host: string;
  try {
    host = hostOf(url);
  } catch {
    return { url, ok: false, error: "malformed" };
  }

  let message;
  try {
    message = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      tools: [
        {
          type: "web_fetch_20260209",
          name: "web_fetch",
          max_uses: 1,
          // Exactly the host the client named. Not a wildcard, not a list.
          allowed_domains: [host],
          max_content_tokens: MAX_PAGE_TOKENS,
        },
      ],
      messages: [
        {
          role: "user",
          // The tool only fetches URLs already in the conversation, so the URL
          // is the message. Nothing about the client travels with it.
          content: `Fetch this page: ${url}`,
        },
      ],
    });
  } catch (error) {
    // The message, never the URL or the page.
    console.error(
      "[read] a link fetch failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { url, ok: false, error: "unavailable" };
  }

  for (const block of message.content) {
    if (block.type !== "web_fetch_tool_result") continue;

    const result = block.content;
    if (result.type !== "web_fetch_result") {
      // A server tool reports its failures as a result block, not as an
      // exception — so this is the only place a blocked, missing, or
      // unreadable page surfaces.
      return { url, ok: false, error: result.error_code };
    }

    const source = result.content.source;
    const text = source.type === "text" ? source.data.trim() : "";
    if (!text) return { url, ok: false, error: "empty" };

    return { url, ok: true, text };
  }

  // No result block at all: the model declined to call the tool, which in
  // practice means it judged the URL unfetchable.
  return { url, ok: false, error: "not_fetched" };
}

/**
 * Fetches every link a client listed and stores each as a source row.
 *
 * Fetched in parallel and stored per page, so one dead link costs one line in
 * the summary rather than the whole set. A page that fails is still recorded —
 * with its error and no text — because "we tried this one and could not read
 * it" is a thing the client and Taylor both need to see, and a silently
 * missing row would look like the link was never typed.
 */
export async function readLinks(
  engagementId: string,
  raw: string | null | undefined,
): Promise<{ fetched: number; failed: number }> {
  const { urls } = parseLinks(raw);
  if (urls.length === 0) return { fetched: 0, failed: 0 };

  const results = await Promise.all(urls.map((url) => fetchLink(url)));

  let fetched = 0;
  let failed = 0;

  for (const result of results) {
    const { fileId } = await writeSourceObject({
      engagementId,
      fieldKey: LINK_FIELD_KEY,
      name: result.url,
      text: result.ok ? result.text : "",
    });

    await getDb()
      .update(intakeFiles)
      .set(
        result.ok
          ? {
              transcribedAt: new Date(),
              transcript: result.text,
              transcriptModel: MODEL,
              transcriptStatus: "done",
            }
          : { transcriptStatus: "failed" },
      )
      .where(eq(intakeFiles.id, fileId));

    if (result.ok) fetched += 1;
    else failed += 1;
  }

  return { fetched, failed };
}
