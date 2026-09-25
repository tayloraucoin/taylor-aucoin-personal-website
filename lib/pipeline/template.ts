import type { IntakeAnswers } from "@/lib/types/intake";
import type { PipelineValues } from "@/lib/types/pipeline";

/**
 * The one home for `{{name}}` in the engagement pipeline (M-PIPE-2).
 *
 * Pure, and outside `server/` on purpose: the engagement checklist renders
 * prompts with it on the server, the send dialog previews a letter with it in
 * the browser, and the send service refuses a letter with it. Three consumers,
 * one grammar — nothing else in the codebase parses `{{`.
 *
 * A name is a letter followed by letters and digits, optionally padded with
 * spaces inside the braces (`{{ reviewCode }}` is `reviewCode`). Anything else
 * between braces is literal text and is left exactly as written.
 */

const NAME = "[a-zA-Z][a-zA-Z0-9]*";

/** Matches one placeholder; group 1 is the name. Global — reset before reuse. */
export const NAME_PATTERN = new RegExp(`\\{\\{\\s*(${NAME})\\s*\\}\\}`, "g");

/** A bare variable name, for validating the names a send posts. */
export const BARE_NAME = new RegExp(`^${NAME}$`);

/**
 * Anything in double braces, name or not. The send refuses a letter with any
 * of these left in it (M-PIPE-2): `{{ review code }}` is not a name, and it
 * must not reach a client either.
 */
const ANY_BRACES = /\{\{[^{}]*\}\}/g;

/** Every double-braced stretch still in the text, distinct, in order. */
export function findLeftoverPlaceholders(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(ANY_BRACES)) {
    if (!found.includes(match[0])) found.push(match[0]);
  }
  return found;
}

/**
 * Names that fill themselves from the engagement, in the order the editor
 * lists them. A value Taylor saved under the same name wins (M-PIPE-2).
 */
export const RECORD_NAMES = [
  "firstName",
  "contactName",
  "businessName",
  "contactEmail",
  "domain",
  "registrar",
] as const;

export type RecordName = (typeof RECORD_NAMES)[number];

export type TemplateValues = Readonly<Record<string, string | undefined>>;

export function isRecordName(name: string): name is RecordName {
  return (RECORD_NAMES as readonly string[]).includes(name);
}

/** Every distinct name in the templates, in order of first appearance. */
export function findTemplateNames(
  ...templates: readonly (string | null | undefined)[]
): string[] {
  const names: string[] = [];
  for (const template of templates) {
    if (!template) continue;
    for (const match of template.matchAll(NAME_PATTERN)) {
      const name = match[1]!;
      if (!names.includes(name)) names.push(name);
    }
  }
  return names;
}

/**
 * Fills every name that has a non-blank value; leaves the rest as written and
 * reports them. A blank value is unresolved, never an empty string in the
 * output — "Hi ," is the failure this exists to prevent.
 */
export function renderPipelineTemplate(
  template: string,
  values: TemplateValues,
): { text: string; unresolved: string[] } {
  const unresolved: string[] = [];
  const text = template.replace(NAME_PATTERN, (whole, name: string) => {
    const value = values[name];
    if (value !== undefined && value.trim() !== "") return value;
    if (!unresolved.includes(name)) unresolved.push(name);
    return whole;
  });
  return { text, unresolved };
}

/** The facts on an engagement that record names read. */
export type TemplateRecord = {
  contactName: string;
  businessName: string;
  contactEmail: string;
  answers: IntakeAnswers;
};

function answerText(answers: IntakeAnswers, key: string): string | undefined {
  const value = answers.access?.[key];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

/**
 * Record values first, then everything Taylor saved on top. Blank intake
 * answers resolve to nothing, so a template asks rather than printing a gap.
 */
export function resolveTemplateValues(
  record: TemplateRecord,
  saved: PipelineValues,
): Record<string, string | undefined> {
  const contactName = record.contactName.trim();
  const fromRecord: Record<RecordName, string | undefined> = {
    firstName: contactName.split(/\s+/)[0] || undefined,
    contactName: contactName || undefined,
    businessName: record.businessName.trim() || undefined,
    contactEmail: record.contactEmail.trim() || undefined,
    domain: answerText(record.answers, "domainName"),
    registrar: answerText(record.answers, "registrar"),
  };

  const merged: Record<string, string | undefined> = { ...fromRecord };
  for (const [name, value] of Object.entries(saved)) {
    if (typeof value === "string" && value.trim() !== "") merged[name] = value;
  }
  return merged;
}

/**
 * Which typed values a successful send remembers (M-PIPE-2). Pure, so the
 * rule is provable without a database.
 *
 * - A blank value is never remembered.
 * - A record name equal to the record's own value is not an override; it is
 *   *cleared*, so an earlier correction stops winning.
 * - Everything else is kept.
 */
export function valuesToRemember(
  typed: PipelineValues,
  fromRecord: Record<string, string | undefined>,
): { kept: PipelineValues; cleared: string[] } {
  const kept: PipelineValues = {};
  const cleared: string[] = [];
  for (const [name, value] of Object.entries(typed)) {
    if (value.trim() === "") continue;
    if (isRecordName(name) && fromRecord[name] === value) {
      cleared.push(name);
      continue;
    }
    kept[name] = value;
  }
  return { kept, cleared };
}
