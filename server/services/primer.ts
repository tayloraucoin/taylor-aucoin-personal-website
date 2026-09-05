import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  PRIMER_FIELDS,
  type PrimerField,
} from "@/lib/intake/showcase-primer-fields";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import { getClient, MAX_BLOB_CHARS, MODEL } from "./extract";

/**
 * The business primer: one document in, a set of reviewable suggestions out.
 *
 * A client empties their drawer into a box on step 1 — an old About page, a
 * capability deck, an email where they explained the business well — and the
 * questionnaire ahead of them arrives partly **proposed**. Not answered.
 *
 * This is the second AI touchpoint on the track and the wider-blast-radius one.
 * PORT-6's extractor proposes list entries a client visibly edits on the screen
 * in front of them; this proposes answers spread across nine steps a client may
 * never scroll back to. Everything below is arranged around one failure:
 *
 * **A plausible sentence about a real business that nobody said, surviving
 * into a live website.**
 *
 * The defences, in order of how much they actually carry:
 *
 * 1. **Nothing here writes an answer.** Proposals are returned, stored as
 *    proposals, and become answers only when the client meets one in place and
 *    their own autosave commits it (D-PORT-3, at field granularity).
 * 2. **Every proposal carries the sentence that supports it, and the quote is
 *    checked against the document here** — not trusted from the model. A
 *    proposal whose quote is not in the document is discarded before it is
 *    persisted or rendered. That is a validator, not a prompt's good intentions.
 * 3. **Critical fields are quote-or-nothing.** Anything touching money, dates,
 *    headcount, credentials, legal status, or claims about results is critical
 *    by definition; the three-field non-critical allowlist is the one licensed
 *    inference and it is enumerated in `showcase-primer-fields.ts`, never
 *    decided by the model.
 * 4. **Refusal is a first-class output.** "This document does not answer that"
 *    has to be as easy to return as a proposal, and the golden set contains
 *    cases where the correct answer is almost nothing.
 *
 * The blob reaches Anthropic and nowhere else. No name, no email, no token, no
 * id travels with it, and it never appears in a log line, an error message, or
 * a returned payload it does not belong in.
 */

/** Refused for a stated reason. Each becomes its own calm line on the surface. */
export class PrimerUnavailableError extends Error {
  readonly reason: "empty" | "too_large" | "rate_limited" | "failed";

  constructor(reason: PrimerUnavailableError["reason"]) {
    super(`Primer unavailable: ${reason}`);
    this.name = "PrimerUnavailableError";
    this.reason = reason;
  }
}

/**
 * What the model returns.
 *
 * `quote` is required in the shape and may be empty; emptiness is what makes a
 * proposal invalid unless `assumed` is true and the field is on the allowlist.
 * Making it optional would let a silent omission read as a deliberate one.
 */
const modelOutput = z.object({
  proposals: z.array(
    z.object({
      fieldKey: z.string(),
      value: z.string(),
      quote: z.string(),
      assumed: z.boolean(),
    }),
  ),
});

/**
 * The instruction.
 *
 * Deliberately extractive, and it says what the job is **not** in the first
 * line, because "fill in the questionnaire" is the reading that produces
 * confident invention and it is the obvious reading of everything else here.
 */
/**
 * The instruction, for one field inventory.
 *
 * Takes the inventory rather than reading `PRIMER_FIELDS` itself since
 * PORT-18: the ingestion run shows the model a kind-scoped subset, so a
 * portfolio's run never lists a venture's `stage`. The primer's own callers
 * pass the whole list, and the words are unchanged.
 */
function instruction(fields: readonly PrimerField[]): string {
  const inventory = fields.map(
    (field) =>
      `- ${field.key}${field.critical ? "" : "  [may be assumed]"}: ${field.description}`,
  ).join("\n");

  return [
    "You are reading ONE document about ONE business and reporting which",
    "questions from a list it already contains an answer for.",
    "",
    "This is not 'fill in the questionnaire'. It is closer to highlighting:",
    "find the sentences that answer a question, and report them.",
    "",
    "Rules, in order of importance:",
    "",
    "1. EVERY proposal must be supported by text in the document, and you must",
    "   return that supporting sentence VERBATIM in `quote`. Copy it exactly,",
    "   character for character, from the document. A proposal whose quote is",
    "   not found in the document is discarded, so an approximated quote is a",
    "   wasted proposal.",
    "2. NEVER infer a number, a date, a duration, a headcount, a price, a",
    "   credential, a legal status, or a claim about results. If the document",
    "   does not state it, there is no proposal. These are the fields where a",
    "   confident guess does real damage.",
    "3. Fields marked [may be assumed] below — and ONLY those — may carry a",
    "   reasonable reading the document supports without stating. Set",
    "   `assumed: true` and leave `quote` empty for those. Every other field",
    "   is quote-or-nothing.",
    "4. `value` is written in the client's own words wherever the document",
    "   gives them. Do not improve their phrasing or add adjectives.",
    "5. RETURNING ALMOST NOTHING IS OFTEN CORRECT. A thin document answers few",
    "   questions. A document about a different business answers none about",
    "   this one. A CV answers almost nothing here — professional background is",
    "   asked properly two steps later and is not your job.",
    "6. One proposal per field at most. Never propose the same field twice.",
    "",
    "The fields:",
    "",
    inventory,
  ].join("\n");
}

/** Normalised for the quote check: case, whitespace, and smart punctuation. */
function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keeps only the proposals that survive the contract.
 *
 * Exported so the eval can grade this half without spending a model run, and
 * so its rules are readable in one place rather than inferred from a prompt.
 *
 * Dropped, in this order: an unknown field key; a duplicate; an empty value; an
 * assumption on a critical field; a missing quote on a critical field; a quote
 * that is not in the document.
 */
export function keepValidProposals(
  document: string,
  raw: Array<{
    fieldKey: string;
    value: string;
    quote: string;
    assumed: boolean;
  }>,
  /**
   * The fields a proposal may name. Defaults to the whole primer inventory;
   * the ingestion run passes its kind-scoped subset, so a key the model
   * returned for a question this kind is never asked is dropped here rather
   * than trusted because it exists on some other kind's questionnaire.
   */
  fields: readonly PrimerField[] = PRIMER_FIELDS,
): PrimerProposal[] {
  const haystack = norm(document);
  const seen = new Set<string>();
  const kept: PrimerProposal[] = [];
  const allowed = new Map(fields.map((field) => [field.key, field]));

  for (const item of raw) {
    const field = allowed.get(item.fieldKey) ?? undefined;
    if (!field) continue;
    if (seen.has(field.key)) continue;

    const value = item.value?.trim() ?? "";
    if (!value) continue;

    const quote = item.quote?.trim() ?? "";

    // The one licensed inference, and only where it is licensed.
    if (item.assumed) {
      if (field.critical) continue;
      seen.add(field.key);
      kept.push({
        fieldKey: field.key,
        stepKey: field.stepKey,
        value,
        quote: null,
        assumed: true,
      });
      continue;
    }

    // Quote-or-nothing, checked against the document rather than trusted.
    if (!quote) continue;
    if (!haystack.includes(norm(quote))) continue;

    seen.add(field.key);
    kept.push({
      fieldKey: field.key,
      stepKey: field.stepKey,
      value,
      quote,
      assumed: false,
    });
  }

  return kept;
}

/**
 * One document in, validated proposals out. No database, no run counter.
 *
 * Split from `readBusinessPrimer` so the golden set can grade the part that is
 * actually being graded — the prompt and the validator — without a real
 * engagement to spend a budget against. Eleven fixtures would otherwise burn
 * eleven of some client's twenty-five runs.
 *
 * **This is not a bypass.** The run cap is a property of an engagement, not of
 * the model call, and nothing client-reachable imports this: the action calls
 * `readBusinessPrimer` and only that. The one other caller is the eval.
 */
export async function proposeFromDocument(
  document: string,
  fields: readonly PrimerField[] = PRIMER_FIELDS,
): Promise<PrimerProposal[]> {
  const text = document.trim();
  if (!text) throw new PrimerUnavailableError("empty");

  // Refused rather than truncated. A truncated document produces confident
  // answers about the half the model saw, which is worse than no answers.
  if (text.length > MAX_BLOB_CHARS) {
    throw new PrimerUnavailableError("too_large");
  }

  let parsed;
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: instruction(fields),
      messages: [{ role: "user", content: text }],
      output_config: { format: zodOutputFormat(modelOutput) },
    });
    parsed = response.parsed_output;
  } catch (error) {
    // The message, never the payload.
    console.error(
      "[primer] request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    throw new PrimerUnavailableError("failed");
  }

  if (!parsed) throw new PrimerUnavailableError("failed");

  return keepValidProposals(text, parsed.proposals, fields);
}

/*
 * `readBusinessPrimer` — the counted wrapper that claimed a run before
 * calling the model — was deleted on 2026-09-03 when PORT-18's ingestion step
 * replaced the step-2 paste box that was its only caller. `proposeFromDocument`
 * remains: the ingestion run calls it with a kind-scoped inventory, and the
 * golden set grades it. The run budget is claimed by `runIngestion` now, once
 * per press rather than once per stage.
 */
