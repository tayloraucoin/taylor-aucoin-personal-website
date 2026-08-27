import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { and, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import { requireEnv } from "@/lib/env";

/**
 * "Sort this for me" — turning a client's pasted career into editable entries.
 *
 * This is the only place in this codebase where a client's own words leave our
 * infrastructure, so the rules are narrow and worth stating plainly:
 *
 * **The request carries the blob and nothing else about the engagement.** No
 * name, no email, no token, no id. Anthropic receives a wall of text with no
 * idea whose it is, because there is no reason for them to know and every
 * reason for us not to send it.
 *
 * **Nothing here writes to the answers document.** The entries are returned to
 * the browser, rendered as ordinary editable blocks, and committed only by the
 * client's own next autosave — which by construction cannot happen until they
 * have been on screen in front of them (D-PORT-3). A service that wrote them
 * directly would be faster and would make "nothing saves as fact until you've
 * seen it" a lie.
 *
 * **The blob is never logged.** Not in errors, not in warnings, not in a
 * failure payload. It is a client's unpublished CV.
 *
 * The model is pinned by the handoff, not chosen here. Changing it is a
 * decision with a record, not a preference.
 */

const MODEL = "claude-sonnet-5";

/**
 * How many times one engagement may run this.
 *
 * Generous for a real intake — a client who re-pastes a dozen times is using
 * the feature, not abusing it — and low enough to bound what a leaked link can
 * spend. Cost per run is a fraction of a cent, so this caps abuse rather than
 * budget. `[PROVISIONAL — the number, not the mechanism]`
 */
const MAX_RUNS = 25;

/**
 * Roughly 25,000 words. Long enough for a full CV plus an IMDb page pasted
 * together, short enough that no single request is pathological.
 */
const MAX_BLOB_CHARS = 100_000;

export type ExtractionMode = "experience" | "projects";

/** What the model is asked to return, and the only shape that survives it. */
const experienceEntry = z.object({
  what: z.string(),
  where: z.string(),
  when: z.string(),
  about: z.string(),
  category: z.string(),
});

const projectEntry = z.object({
  title: z.string(),
  year: z.string(),
  role: z.string(),
  kind: z.string(),
  forWhom: z.string(),
  story: z.string(),
  credits: z.string(),
  awards: z.string(),
});

const experienceResult = z.object({ entries: z.array(experienceEntry) });
const projectsResult = z.object({ entries: z.array(projectEntry) });

export type ExtractedEntry = Record<string, string>;

/**
 * Extraction refused for a stated reason. The surface turns each into its own
 * calm line; none of them is an error page, and none of them costs the paste.
 */
export class ExtractionUnavailableError extends Error {
  readonly reason: "rate_limited" | "empty" | "failed";

  constructor(reason: "rate_limited" | "empty" | "failed") {
    super(`Extraction unavailable: ${reason}`);
    this.name = "ExtractionUnavailableError";
    this.reason = reason;
  }
}

/**
 * The instruction, per mode.
 *
 * Deliberately extractive and deliberately dull. The worst failure this
 * feature can have is not a bad parse — the client sees and fixes those — it
 * is a plausible invention: a festival that never selected them, a role they
 * never had, sitting in a field they skim past because it looks right. So the
 * prompt says omit rather than guess, in the one place a law cannot.
 */
function instructionFor(mode: ExtractionMode): string {
  const shared = [
    "You are sorting one person's own career notes into structured entries.",
    "",
    "Rules:",
    "- Use ONLY what the text states. Never infer, embellish, or complete a",
    "  half-finished thought. If the text does not say something, leave that",
    "  field as an empty string.",
    "- Never invent a date, an employer, a client, an award, or a credit.",
    "- Preserve the person's own wording wherever a field is free text. Do not",
    "  rewrite their voice, improve their phrasing, or add adjectives.",
    "- If the text contains nothing that fits, return an empty list. An empty",
    "  list is a correct answer.",
  ];

  const perMode =
    mode === "experience"
      ? [
          "",
          "Extract POSITIONS AND ONGOING ROLES — jobs, teaching posts, things",
          "they founded, memberships, programs they run. This is the career",
          "timeline, not the individual works it produced.",
          "Do NOT extract individual films, projects, or pieces.",
        ]
      : [
          "",
          "Extract INDIVIDUAL WORKS — films, videos, projects, commissions.",
          "Each entry is one piece of work.",
          "Do NOT extract jobs, teaching posts, or memberships.",
        ];

  return [...shared, ...perMode].join("\n");
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  return client;
}

/**
 * Claims one run against the cap, atomically.
 *
 * The guard lives in the UPDATE's own predicate rather than in a read followed
 * by a write, for the same reason deposit fulfillment does (M-INT-15): two
 * concurrent presses can both pass a read-then-write, and neither can pass
 * this. "No row returned" *is* the over-cap signal.
 */
async function claimRun(engagementId: string): Promise<boolean> {
  const [row] = await getDb()
    .update(engagements)
    .set({ extractionRuns: sql`${engagements.extractionRuns} + 1` })
    .where(
      and(
        eq(engagements.id, engagementId),
        lt(engagements.extractionRuns, MAX_RUNS),
      ),
    )
    .returning({ id: engagements.id });

  return Boolean(row);
}

/**
 * Sorts a blob into entries. Returns them; stores nothing.
 *
 * Takes an engagement id rather than an engagement, because the id is all it
 * needs — and a function that cannot see a client's name cannot accidentally
 * send it.
 */
export async function extractEntries(
  engagementId: string,
  mode: ExtractionMode,
  blob: string,
): Promise<ExtractedEntry[]> {
  const text = blob.trim();
  if (!text) throw new ExtractionUnavailableError("empty");

  if (!(await claimRun(engagementId))) {
    throw new ExtractionUnavailableError("rate_limited");
  }

  const schema = mode === "experience" ? experienceResult : projectsResult;

  let parsed;
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: instructionFor(mode),
      messages: [
        {
          role: "user",
          // The blob, alone. Nothing identifying it travels with it.
          content: text.slice(0, MAX_BLOB_CHARS),
        },
      ],
      output_config: { format: zodOutputFormat(schema) },
    });

    parsed = response.parsed_output;
  } catch (error) {
    // The message, never the payload: what went wrong is worth recording,
    // what the client pasted is not.
    console.error(
      `[extract] ${mode} request failed:`,
      error instanceof Error ? error.message : "unknown error",
    );
    throw new ExtractionUnavailableError("failed");
  }

  if (!parsed) throw new ExtractionUnavailableError("failed");

  // Degrade per entry, never per run — the same law autosave follows when one
  // field arrives malformed. A blob that yields nine good entries and one
  // broken one is nine entries, not a failure.
  const kept = parsed.entries.filter((entry) =>
    Object.values(entry).some((value) => value.trim() !== ""),
  );

  if (kept.length === 0) throw new ExtractionUnavailableError("empty");

  return kept;
}
