import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { and, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import {
  experienceEntrySchema,
  offeringEntrySchema,
  personEntrySchema,
  pieceEntrySchema,
  projectEntrySchema,
  serviceEntrySchema,
} from "@/lib/validators/showcase-intake";

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

export const MODEL = "claude-sonnet-5";

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
export const MAX_BLOB_CHARS = 100_000;

/**
 * The modes, named for the answer array each one fills (M-PORT-24).
 *
 * One mode per array key means the output shape has exactly one authority — the
 * entry schema the form already validates against — so a field added to an
 * entry is a field the extractor can fill, and a field removed cannot linger
 * here pointing at nothing.
 *
 * **There is no `asks` mode and there will not be one.** Which mechanism an ask
 * uses, where it lands, and whether to show it are decisions a client makes,
 * not facts a document states. An extractor proposing "a form on the site" is
 * inventing, and this feature's whole discipline is that it does not.
 */
export const EXTRACTION_MODES = [
  "experience",
  "projects",
  "people",
  "offerings",
  "pieces",
  "services",
] as const;

export type ExtractionMode = (typeof EXTRACTION_MODES)[number];

/**
 * What the model is asked to return, derived from the form's own entry schemas.
 *
 * Every field becomes a plain string — including the enum ones, which the
 * prompt is told to leave blank unless the text states them plainly. Typing
 * `status` as its enum would force the model to pick one of three, and "the
 * deck did not say" is the answer that matters most on exactly that field.
 *
 * **Two keys are dropped, and both are machinery rather than answers.**
 * `entryKey` is minted by the client on receipt (M-PORT-14). `personKey` says
 * which roster person an experience entry belongs to *by their entry key*, and
 * a model shown the field fills it with a name — which matches no person, so
 * the entry silently stops being grouped under anybody. Found by the ingestion
 * eval on 2026-09-03, printing `personKey="Mira Castellane"` on every entry of
 * a one-sheet with no roster at all. Which person an entry belongs to is
 * decided by the block a client typed it into, and never by a document.
 *
 * **Non-string fields are dropped too, and the reason is answer loss.** Asking
 * for a string on a key the form validates as something else produces a value
 * the entry schema then refuses — and because one bad key fails the whole
 * array, every sorted entry is discarded with it. Two keys did this: `feature`
 * on an experience entry (a boolean) and `videos` on a project (an array).
 * The model returned `""` for both, `saveStepAnswers` dropped `experience` and
 * `projects` entirely, and nothing said so. Found against a real intake on
 * 2026-09-05.
 *
 * Both are also the right things to omit on their own merits: "Feature this"
 * and which video leads are a client's choices, not facts a document states.
 * A watch link found in the text still lands — `watchUrl` is a string field and
 * `videosOf` reads an entry carrying one as a single video.
 */
const NOT_ANSWERS = new Set(["entryKey", "personKey"]);

/**
 * Whether a form field is one this extractor may ask the model to fill.
 *
 * The output shape derives from the form's own entry schemas, so a field added
 * there arrives here automatically — including one typed as a boolean, an
 * array, or an object. Those cannot be answered with a string, so they are not
 * asked for at all rather than asked for wrongly.
 */
function isStringField(field: z.ZodTypeAny): boolean {
  const inner = field instanceof z.ZodOptional ? field.unwrap() : field;
  return inner instanceof z.ZodString;
}

function resultFor(shape: z.ZodObject<Record<string, z.ZodTypeAny>>) {
  const fields = Object.fromEntries(
    Object.entries(shape.shape)
      .filter(([key, field]) => !NOT_ANSWERS.has(key) && isStringField(field))
      .map(([key]) => [key, z.string()]),
  );
  return z.object({ entries: z.array(z.object(fields)) });
}

const RESULTS: Record<ExtractionMode, ReturnType<typeof resultFor>> = {
  experience: resultFor(experienceEntrySchema),
  projects: resultFor(projectEntrySchema),
  people: resultFor(personEntrySchema),
  offerings: resultFor(offeringEntrySchema),
  pieces: resultFor(pieceEntrySchema),
  services: resultFor(serviceEntrySchema),
};

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
/**
 * What each mode is looking for, and what it must not reach for.
 *
 * Every one of these ends by naming the shape it is NOT, because the commonest
 * real failure is a client pasting the wrong thing into the right box — a CV
 * into the people box, a team page into the services box — and the honest
 * output for that is almost nothing.
 */
const PER_MODE: Record<ExtractionMode, readonly string[]> = {
  experience: [
    "Extract POSITIONS AND ONGOING ROLES — jobs, teaching posts, things",
    "they founded, memberships, programs they run. This is the career",
    "timeline, not the individual works it produced.",
    "`category` is copied only when the text groups entries under a heading",
    "or names one; otherwise leave it empty. 'Position' is not a category the",
    "text stated.",
    "Do NOT extract individual films, projects, or pieces.",
  ],
  projects: [
    "Extract INDIVIDUAL WORKS — films, videos, projects, commissions.",
    "Each entry is one piece of work.",
    "Do NOT extract jobs, teaching posts, or memberships.",
  ],
  people: [
    "Extract PEOPLE — the named individuals on a team, with the role each",
    "one holds. One entry per person.",
    "`name` is their name. `role` is their title or what they do.",
    "`line` is one short sentence about them, copied from the text; leave it",
    "empty if the text says nothing about them beyond their title.",
    "Do NOT extract jobs one person held over time — that is a career",
    "history, not a team. If the text is one person's CV, return at most",
    "that one person.",
  ],
  offerings: [
    "Extract WHAT THIS PRACTICE OFFERS — engagements, sessions, programmes,",
    "talks, books. One entry per offer.",
    "`price` is copied EXACTLY as written or left empty. Never round it,",
    "never convert a currency, never add 'from'.",
    "`pricePosture` must be left EMPTY. Whether a price belongs on the site",
    "is the client's decision and the text does not state it.",
    "Do NOT extract the people who deliver the work.",
  ],
  pieces: [
    "Extract WHAT IS BEING BUILT — a property, a phase, a programme, a",
    "product. One entry per piece.",
    "`status` may ONLY be 'planned', 'underway', or 'done', and ONLY when",
    "the text says so plainly. 'We took possession and work has begun' is",
    "underway. 'We intend to' and 'we are creating' are NOT statements of",
    "status — leave it empty. A planned thing described as existing is the",
    "worst error you can make here.",
    "Do NOT extract the people building it.",
  ],
  services: [
    "Extract SERVICES SOLD — the things a customer can buy. One entry per",
    "service.",
    "`price` and `duration` are copied EXACTLY as written or left empty.",
    "Do NOT extract the people who provide them, and do not extract a team",
    "page as though each person were a service.",
  ],
};

function instructionFor(mode: ExtractionMode): string {
  const shared = [
    "You are sorting one person's own career notes into structured entries.",
    "",
    "Rules:",
    "- Use ONLY what the text states. Never infer, embellish, or complete a",
    "  half-finished thought. If the text does not say something, leave that",
    "  field as an empty string.",
    "- Never invent a date, an employer, a client, an award, or a credit.",
    "- COPY, do not compose. Every word you put in a field must already appear",
    "  in the text, in that form. Do not inflect a word into another word",
    "  ('founded' does not become 'founder'; 'creating' does not become",
    "  'creation'). Do not join two separate phrases into one value. Do not add",
    "  a parenthetical, a clarification, or a unit the text does not use.",
    "- Preserve the person's own wording wherever a field is free text. Do not",
    "  rewrite their voice, improve their phrasing, or add adjectives.",
    "- If the closest thing the text offers is not an exact fit for a field,",
    "  leave that field empty. A blank field is a question the client answers",
    "  in two seconds; a plausible wrong one is a thing they skim past.",
    "- If the text contains nothing that fits, return an empty list. An empty",
    "  list is a correct answer.",
    "- A title or name for something the text never names is composed. When",
    "  the text describes a thing without naming it, use the exact phrase the",
    "  text uses for it ('the main house', 'a retreat programme'), even if it",
    "  reads like a fragment. Never reorder words into a title.",
    "- A label, a type, or a category the text does not state is composed.",
    "  Leave such a field empty rather than classifying the entry yourself.",
    "- A date or period field takes ONLY the time expression the text uses —",
    "  '2019-now', 'March', 'by autumn', '2027'. Never assemble one out of a",
    "  sentence that also says what happened, and never join two separate time",
    "  references into one value. If the sentence mixes a date with a status,",
    "  copy the date alone and leave the status to its own field.",
  ];

  return [...shared, "", ...PER_MODE[mode]].join("\n");
}

let client: Anthropic | null = null;

/** One pinned client for every AI touchpoint on this track. */
export function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  return client;
}

/**
 * Claims one run against the cap, atomically.
 *
 * Shared with the business primer (PORT-10): one counter per engagement across
 * every AI touchpoint on this track, not one per feature. A leaked link spends
 * the same bounded budget whichever button it presses.
 *
 * The guard lives in the UPDATE's own predicate rather than in a read followed
 * by a write, for the same reason deposit fulfillment does (M-INT-15): two
 * concurrent presses can both pass a read-then-write, and neither can pass
 * this. "No row returned" *is* the over-cap signal.
 */
export async function claimRun(engagementId: string): Promise<boolean> {
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
  // A blank paste costs no run: refusing is cheaper than counting.
  if (!blob.trim()) throw new ExtractionUnavailableError("empty");

  if (!(await claimRun(engagementId))) {
    throw new ExtractionUnavailableError("rate_limited");
  }

  return sortDocument(mode, blob);
}

/**
 * The sort itself: one blob in, entries out. No database, no run counter.
 *
 * Split from `extractEntries` so the golden set can grade the part being
 * graded — the prompts and the per-entry degradation — without a real
 * engagement to spend a budget against. Ten fixtures would otherwise burn ten
 * of some client's twenty-five runs, and the eval would need a seeded row
 * before it could tell you anything about a prompt.
 *
 * **This is not a bypass.** The cap is a property of an engagement, not of the
 * model call, and nothing client-reachable imports this: the action calls
 * `extractEntries` and only that. The one other caller is the eval.
 */
export async function sortDocument(
  mode: ExtractionMode,
  blob: string,
): Promise<ExtractedEntry[]> {
  const text = blob.trim();
  if (!text) throw new ExtractionUnavailableError("empty");

  const schema = RESULTS[mode];
  const startedAt = Date.now();

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

  console.info(
    `[extract] ${mode} returned ${parsed.entries.length}, kept ${kept.length}, in ${Date.now() - startedAt}ms`,
  );

  if (kept.length === 0) throw new ExtractionUnavailableError("empty");

  return kept;
}
