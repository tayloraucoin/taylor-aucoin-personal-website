import type { ReviewAnswer, ReviewAnswers } from "@/lib/types/review";

/**
 * A question's free-text note travels as its own `text` item with id
 * `<question id>.note`, straight after the answer (contract §4a). The email
 * and the admin page both want the two read as one entry.
 */
const NOTE_SUFFIX = ".note";

export type ReviewAnswerEntry = {
  id: string;
  label: string;
  /** Null when only a note was left for the question. */
  answer: ReviewAnswer | null;
  /** The reviewer's own words on it, when there were any. */
  note: string | null;
};

export type ReviewAnswerSection = {
  title: string;
  entries: ReviewAnswerEntry[];
};

/**
 * The answers as sections of entries, in the order the form asked them,
 * each note folded into the answer it belongs to. A note whose question was
 * left unanswered stands as its own entry under the note's label. Pure, so
 * a plain-text email and a React page can share it.
 */
export function groupReviewAnswers(
  answers: ReviewAnswers | null | undefined,
): ReviewAnswerSection[] {
  const sections: ReviewAnswerSection[] = [];

  for (const item of answers?.items ?? []) {
    let section = sections.at(-1);
    if (!section || section.title !== item.section) {
      section = { title: item.section, entries: [] };
      sections.push(section);
    }

    if (item.kind === "text" && item.id.endsWith(NOTE_SUFFIX)) {
      const base = item.id.slice(0, -NOTE_SUFFIX.length);
      const previous = section.entries.at(-1);
      if (previous && previous.id === base && previous.note === null) {
        previous.note = item.value;
        continue;
      }
      section.entries.push({
        id: base,
        label: item.label,
        answer: null,
        note: item.value,
      });
      continue;
    }

    section.entries.push({
      id: item.id,
      label: item.label,
      answer: item,
      note: null,
    });
  }

  return sections;
}

/** One decimal, always: "6.0", not "6". */
export function tenths(n: number): string {
  return n.toFixed(1);
}

/** "−2.6", "+0.9" or "no change": a scale's movement from its intake answer. */
export function scaleChange(value: number, baseline: number): string {
  const delta = value - baseline;
  if (Math.abs(delta) < 0.05) return "no change";
  return `${delta > 0 ? "+" : "−"}${tenths(Math.abs(delta))}`;
}
