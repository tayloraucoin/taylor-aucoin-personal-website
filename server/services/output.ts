import { INTAKE_STEPS } from "@/lib/intake/steps";
import { labelFor } from "@/lib/intake/answer-labels";
import { formatMoney } from "@/lib/intake/money";
import type { IntakeStepKey } from "@/lib/types/intake";
import { STEP_SCHEMAS } from "@/lib/validators/intake";
import type { Engagement } from "./engagement";
import { readStepAnswers } from "./submission";

/**
 * The intake document — the artifact this entire system exists to produce.
 *
 * Written to be pasted straight into Claude, which is why it is plain markdown
 * with stable headings rather than a table dump. Two rules from the build spec
 * §6 are load-bearing and both are about honesty:
 *
 * A blank field is never rendered as an empty heading. Everything unanswered
 * collects into one explicit "Not answered" section, so the reader can tell
 * "they said no" from "nobody asked" — which is the distinction that keeps a
 * guess from becoming a claim on a live site.
 *
 * Known-risk conditions are flagged at the top rather than left to be noticed.
 * Every flag here traces to a real failure on a real build.
 *
 * The function is pure: it takes an engagement, files whose links have already
 * been resolved, and a timestamp. That is what makes it verifiable without a
 * network, a bucket, or a clock.
 */

export type IntakeFileLink = {
  fieldKey: string;
  originalName: string | null;
  sizeBytes: number | null;
  uploadedAt: Date | null;
  url: string | null;
};

const VOICE_FIELD = "voice_note";

/**
 * Dates render in Pacific time, not UTC.
 *
 * A document generated at 9pm in Vancouver would otherwise be stamped with
 * tomorrow's date, which is exactly the sort of small wrongness that makes a
 * reader distrust the rest of the page.
 */
function day(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function renderValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const parts = value.map((entry) => {
      if (entry && typeof entry === "object") {
        const pairs = Object.entries(entry as Record<string, unknown>)
          .filter(([, v]) => !isEmpty(v))
          .map(([k, v]) => `${labelFor(k)}: ${String(v)}`);
        return pairs.length > 0 ? pairs.join(" · ") : null;
      }
      return String(entry);
    });

    const kept = parts.filter((p): p is string => p !== null);
    return kept.length > 1 ? `\n${kept.map((p) => `  - ${p}`).join("\n")}` : (kept[0] ?? "");
  }

  return String(value);
}

/** Conditions that have each put a false claim on a live site before. */
export function collectFlags(engagement: Engagement): string[] {
  const flags: string[] = [];
  const business = readStepAnswers(engagement.answers, "business");
  const operations = readStepAnswers(engagement.answers, "operations");
  const reviews = readStepAnswers(engagement.answers, "reviews");
  const access = readStepAnswers(engagement.answers, "access");

  const names = [business.businessName, business.legalName, business.logoName]
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter(Boolean);

  if (new Set(names).size > 1) {
    flags.push(
      `Names differ (${names.join(" / ")}) — reconcile before Google Business Profile setup.`,
    );
  }

  const provides = Array.isArray(operations.customerProvides)
    ? (operations.customerProvides as string[])
    : [];

  if (provides.includes("nothing")) {
    flags.push(
      'Customer provides "nothing" — verify on the call before the site claims they bring everything.',
    );
  }

  const sources = Array.isArray(reviews.reviewSources)
    ? (reviews.reviewSources as string[])
    : [];

  if (sources.length === 0 || sources.includes("none")) {
    flags.push("No reviews yet — remove the testimonial section rather than filling it.");
  } else if (reviews.publishPermission !== true) {
    flags.push("Reviews supplied without explicit permission to publish — confirm before using.");
  }

  if (access.ownsDomain !== "yes") {
    flags.push("No domain owned — registration is part of the build.");
  }

  if (access.emailAtDomain === "yes") {
    flags.push(
      "Email is live on that domain — plan the DNS cutover so it keeps working.",
    );
  } else if (access.emailAtDomain === "unsure") {
    flags.push(
      "Unsure whether email runs on that domain — confirm before touching DNS.",
    );
  }

  if (business.insured !== "yes") {
    flags.push(
      'Insurance not confirmed — the site may not say "insured" until it is.',
    );
  }

  return flags;
}

/** Every known field with no answer, grouped by the step that asked it. */
export function collectUnanswered(
  engagement: Engagement,
): Array<{ step: string; labels: string[] }> {
  return INTAKE_STEPS.map((step) => {
    const stored = readStepAnswers(engagement.answers, step.key);
    const shape = STEP_SCHEMAS[step.key as IntakeStepKey];
    const keys = Object.keys((shape as { shape: Record<string, unknown> }).shape);

    const labels = keys
      .filter((key) => isEmpty(stored[key]))
      .map((key) => labelFor(key));

    return { step: step.title, labels };
  }).filter((group) => group.labels.length > 0);
}

function depositLine(engagement: Engagement): string {
  if (!engagement.depositRequired) return "Deposit: waived";

  if (engagement.paidAt && engagement.depositAmountCents !== null) {
    return `Deposit: ${formatMoney(engagement.depositAmountCents, engagement.currency)} paid ${day(engagement.paidAt)} via Stripe`;
  }

  return "Deposit: NOT PAID";
}

/**
 * The acceptance receipt, in the one document Taylor keeps per engagement.
 * Null when unpaid (acceptance is by deposit payment, terms §2) and for
 * waived-deposit engagements, which have no acceptance event — a gap worth
 * seeing in the document rather than papering over.
 */
function termsLine(engagement: Engagement): string | null {
  if (!engagement.termsAcceptedAt || !engagement.termsVersion) return null;

  return `Terms: version ${engagement.termsVersion} accepted ${day(engagement.termsAcceptedAt)} by deposit payment`;
}

export function renderIntakeMarkdown(input: {
  engagement: Engagement;
  files: readonly IntakeFileLink[];
  generatedAt: Date;
}): string {
  const { engagement, files, generatedAt } = input;
  const lines: string[] = [];

  lines.push(`# Intake — ${engagement.businessName}`);
  lines.push(
    `Generated ${day(generatedAt)} · ${engagement.contactName} · ${engagement.contactPhone ?? "no phone"} · ${engagement.contactEmail}`,
  );
  lines.push(depositLine(engagement));
  const terms = termsLine(engagement);
  if (terms) lines.push(terms);
  lines.push(
    engagement.completedAt
      ? `Submitted ${day(engagement.completedAt)}`
      : "Not yet submitted — this is a partial document",
  );

  const flags = collectFlags(engagement);
  if (flags.length > 0) {
    lines.push("", "## Flags");
    for (const flag of flags) lines.push(`- **${flag}**`);
  }

  for (const step of INTAKE_STEPS) {
    const stored = readStepAnswers(engagement.answers, step.key);
    const answered = Object.entries(stored).filter(([, v]) => !isEmpty(v));

    if (answered.length === 0) continue;

    lines.push("", `## ${step.title}`);
    for (const [key, value] of answered) {
      const rendered = renderValue(value);
      lines.push(
        rendered.startsWith("\n")
          ? `**${labelFor(key)}:**${rendered}`
          : `**${labelFor(key)}:** ${rendered}`,
      );
    }
  }

  const delivered = files.filter((file) => file.uploadedAt !== null);
  const voice = delivered.filter((file) => file.fieldKey === VOICE_FIELD);
  const others = delivered.filter((file) => file.fieldKey !== VOICE_FIELD);

  // The voice note gets its own heading because it is the one file with a job
  // to do — it goes to transcription and feeds the brand voice.
  if (voice.length > 0) {
    lines.push("", "## Voice note (transcribe this)");
    for (const file of voice) lines.push(`- ${fileLine(file)}`);
  }

  if (others.length > 0) {
    lines.push("", "## Files");
    for (const file of others) {
      lines.push(`- ${labelFor(file.fieldKey)} — ${fileLine(file)}`);
    }
  }

  const unanswered = collectUnanswered(engagement);
  if (unanswered.length > 0) {
    lines.push("", "## Not answered");
    for (const group of unanswered) {
      lines.push(`**${group.step}:** ${group.labels.join(" · ")}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function fileLine(file: IntakeFileLink): string {
  const name = file.originalName ?? "file";
  return file.url
    ? `[${name}](${file.url})`
    : `${name} — link unavailable, re-run render-intake`;
}
