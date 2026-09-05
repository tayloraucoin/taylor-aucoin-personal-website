import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import {
  claimRun,
  ExtractionUnavailableError,
  getClient,
  MODEL,
} from "./extract";
import { readStepAnswers } from "./submission";

/**
 * "Predict with AI" — proposing how a client wants to come across, from what
 * they have already said.
 *
 * Step 6 asks the question in three words or one sentence, and it is the
 * hardest question on the form to answer cold. By the time someone reaches it
 * they have written five steps' worth of material that answers it implicitly:
 * who the site is for, what they want that person to do, what they are not,
 * the three words the site should feel like. This reads that back to them
 * (Taylor, 2026-09-03).
 *
 * ## What leaves our infrastructure, and what does not
 *
 * Unlike the extractor — which sends an anonymous blob and nothing else — this
 * necessarily sends a client's own answers about themselves, because those
 * answers *are* the question. So the boundary is drawn at the fields instead:
 * `SOURCES` is an allow-list, and the contact columns, the domain, the
 * accounts, every upload, and every add-on answer are absent from it by
 * construction rather than by omission. A field added to a step is not added
 * here unless someone adds it here.
 *
 * `displayName` is deliberately included: a suggestion that cannot say the
 * person's name has to write around it, and the bio they pasted two questions
 * earlier almost certainly contains it anyway.
 *
 * ## Nothing here is an answer
 *
 * Two suggestions come back and neither is written anywhere. The client reads
 * them and presses one, and it reaches the document through their own next
 * autosave — the same seen-first law the extractor and the primer follow.
 *
 * The run is claimed against the same per-engagement counter every other AI
 * touchpoint on this track shares, so a leaked link spends one bounded budget
 * whichever button it presses.
 */

/**
 * Which answers the prediction may read, per step.
 *
 * An allow-list, and the reason it is one is above. Ordered the way a person
 * would explain themselves, because that is the order the model reads them in.
 */
const SOURCES: Readonly<Record<string, readonly string[]>> = {
  about: [
    "displayName",
    "whatYouDo",
    "howLong",
    "basedIn",
    "stage",
    "stageDetail",
    "lookingFor",
  ],
  audience: [
    "whoMattersMost",
    "whatShouldTheyDo",
    "whyPickYou",
    "whatYouAreNot",
    "afterOneVisit",
    "wantMoreOf",
    "stopAttracting",
  ],
  taste: ["wordOne", "wordTwo", "wordThree", "neverFeelLike", "brainDump"],
  words: ["currentBio", "neverSay"],
};

/**
 * How many of those fields must hold something before the button does anything.
 *
 * Not a gate for its own sake: a prediction built from two answers is a
 * prediction built from nothing, and it will read as one. Four is roughly the
 * point where the suggestions stop being generic — which is also the point
 * where a client has done enough of the form for the question to be worth
 * asking. `[PROVISIONAL — the number, not the mechanism]`
 */
export const COME_ACROSS_MINIMUM = 4;

const suggestionSchema = z.object({
  /** Exactly three, lowercase, no punctuation. */
  words: z.array(z.string()).length(3),
  /** One sentence, in the client's own register. */
  sentence: z.string(),
});

export type ComeAcrossSuggestion = z.infer<typeof suggestionSchema>;

/**
 * The material, as labelled lines. Empty answers are absent, never blank.
 *
 * Labels rather than raw keys, because `whatYouAreNot` reads as a typo and
 * "What they are not" reads as a fact — and the model's job here is to
 * understand a person, not to parse a schema.
 */
const LABELS: Readonly<Record<string, string>> = {
  displayName: "Name",
  whatYouDo: "What they do",
  howLong: "How long",
  basedIn: "Based in",
  stage: "Stage",
  stageDetail: "Stage, in their words",
  lookingFor: "What they want out of the site",
  whoMattersMost: "Who matters most",
  whatShouldTheyDo: "What that person should do",
  whyPickYou: "Why pick them",
  whatYouAreNot: "What they are not",
  afterOneVisit: "After one visit",
  wantMoreOf: "Want more of",
  stopAttracting: "Want less of",
  wordOne: "Feel word",
  wordTwo: "Feel word",
  wordThree: "Feel word",
  neverFeelLike: "Must never feel like",
  brainDump: "Brain dump",
  currentBio: "Their current bio",
  neverSay: "Words they would never use",
};

function digest(answers: unknown): string[] {
  const lines: string[] = [];

  for (const [stepKey, fields] of Object.entries(SOURCES)) {
    const stored = readStepAnswers("showcase", answers, stepKey as never);
    for (const field of fields) {
      const value = stored[field];
      if (typeof value !== "string") continue;
      const text = value.trim();
      if (!text) continue;
      lines.push(`${LABELS[field] ?? field}: ${text}`);
    }
  }

  return lines;
}

/** How much material this engagement has for a prediction. */
export function comeAcrossMaterial(answers: unknown): number {
  return digest(answers).length;
}

const INSTRUCTION = [
  "You are helping someone answer one question about their own website:",
  "how do they want to come across?",
  "",
  "You are given the answers they have already given on the questionnaire.",
  "Read them and propose how they want to come across, two ways: three words,",
  "and one sentence.",
  "",
  "Rules:",
  "- Work only from what they said. Never introduce a quality the answers do",
  "  not support. You are naming something they have already described, not",
  "  deciding who they should be.",
  "- Use their register. If they write plainly, write plainly. If a phrase",
  "  they used says it better than yours would, use theirs.",
  "- Obey 'words they would never use' absolutely, including near-synonyms of",
  "  anything listed there.",
  "- Avoid the words every website already uses: passionate, innovative,",
  "  visionary, storyteller, authentic, curated, bespoke, elevated, journey.",
  "  If one of those is genuinely the only right word, they will say it",
  "  themselves.",
  "- The three words are single words, lowercase, no punctuation, and they",
  "  must be three different ideas rather than three shades of one.",
  "- The sentence is one sentence, first person, under twenty-five words, and",
  "  it says how they want to land on a stranger — not what they do for a",
  "  living, which they have already told us.",
].join("\n");

/**
 * Reads what they have written and proposes how they come across.
 *
 * Takes the answers document rather than an engagement, for the same reason
 * `extractEntries` takes an id: a function that is never handed a contact
 * column cannot send one.
 */
export async function predictComeAcross(
  engagementId: string,
  answers: unknown,
): Promise<ComeAcrossSuggestion> {
  const lines = digest(answers);

  // Too little to work from costs no run. Refusing is cheaper than counting,
  // and a prediction from three lines is a prediction of nothing.
  if (lines.length < COME_ACROSS_MINIMUM) {
    throw new ExtractionUnavailableError("empty");
  }

  if (!(await claimRun(engagementId))) {
    throw new ExtractionUnavailableError("rate_limited");
  }

  let parsed;
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 2000,
      system: INSTRUCTION,
      messages: [{ role: "user", content: lines.join("\n") }],
      output_config: { format: zodOutputFormat(suggestionSchema) },
    });
    parsed = response.parsed_output;
  } catch (error) {
    // The message, never the payload. These are a client's own words about
    // themselves and they do not belong in a log line.
    console.error(
      "[come-across] request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    throw new ExtractionUnavailableError("failed");
  }

  if (!parsed) throw new ExtractionUnavailableError("failed");

  const words = parsed.words.map((word) => word.trim()).filter(Boolean);
  const sentence = parsed.sentence.trim();

  // A suggestion that came back empty is not a suggestion. Better to say
  // nothing came of it than to render an empty card labelled "try this".
  if (words.length === 0 && !sentence) {
    throw new ExtractionUnavailableError("empty");
  }

  return { words, sentence };
}
