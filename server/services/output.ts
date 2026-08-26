import { formatMoney } from "@/lib/intake/money";
import { fieldKeysFor, labelFor, stepsFor } from "@/lib/intake/tracks";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { INCLUDED_PAGES as SHOWCASE_INCLUDED_PAGES } from "@/lib/validators/showcase-intake";
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
  /** Set when the file belongs to one repeatable entry — a project's stills. */
  entryKey?: string | null;
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

function renderValue(track: IntakeTrackKey, value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const parts = value.map((entry) => {
      if (entry && typeof entry === "object") {
        const pairs = Object.entries(entry as Record<string, unknown>)
          .filter(([, v]) => !isEmpty(v))
          .map(([k, v]) => `${labelFor(track, k)}: ${String(v)}`);
        return pairs.length > 0 ? pairs.join(" · ") : null;
      }
      return String(entry);
    });

    const kept = parts.filter((p): p is string => p !== null);
    return kept.length > 1
      ? `\n${kept.map((p) => `  - ${p}`).join("\n")}`
      : (kept[0] ?? "");
  }

  return String(value);
}

/**
 * Conditions that have each put a false claim on a live site before.
 *
 * Durable only. Every condition below is written in that track's field
 * vocabulary, and a flag that reads the wrong track's answers would be worse
 * than no flag: it would be silently absent on the engagements it was meant to
 * protect. The showcase track's flags — rights-restricted projects, kind words
 * without permission to publish, thin taste signal — arrive with PORT-8.
 */
export function collectFlags(engagement: Engagement): string[] {
  if (engagement.track === "showcase") return showcaseFlags(engagement);
  if (engagement.track !== "durable") return [];

  const flags: string[] = [];
  const business = readStepAnswers("durable", engagement.answers, "business");
  const operations = readStepAnswers(
    "durable",
    engagement.answers,
    "operations",
  );
  const reviews = readStepAnswers("durable", engagement.answers, "reviews");
  const access = readStepAnswers("durable", engagement.answers, "access");

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
    flags.push(
      "No reviews yet — remove the testimonial section rather than filling it.",
    );
  } else if (reviews.publishPermission !== true) {
    flags.push(
      "Reviews supplied without explicit permission to publish — confirm before using.",
    );
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

/**
 * The coded track's flags. Each one traces to a way this build could go wrong.
 *
 * Deliberately few. A document that flags nine things every time is a document
 * whose flags get skimmed, and the whole value of this block is that Taylor
 * reads it.
 */
function showcaseFlags(engagement: Engagement): string[] {
  const flags: string[] = [];
  const read = (key: string) =>
    readStepAnswers("showcase", engagement.answers, key as never);

  const experience = read("experience");
  const work = read("work");
  const taste = read("taste");
  const access = read("access");
  const site = read("site");

  // The fabricated-testimonial class. A platform once auto-generated eleven
  // fake customers for a real business; nothing goes on a site as a quote
  // without a named, real, consenting source.
  const kindWords =
    typeof experience.kindWords === "string" ? experience.kindWords.trim() : "";
  if (kindWords && experience.publishPermission !== true) {
    flags.push(
      "Kind words supplied without permission to publish — confirm before any of it goes on the site.",
    );
  }

  // Rights. Studio and client work comes with strings, and the client told us
  // which pieces have them — per project, so the list is actionable.
  const projects = Array.isArray(work.projects)
    ? (work.projects as Array<Record<string, unknown>>)
    : [];

  const restricted = projects.filter(
    (p) => p.rights === "rules" || p.rights === "unsure",
  );
  if (restricted.length > 0) {
    const titles = restricted
      .map((p) => (typeof p.title === "string" && p.title.trim()) || "untitled")
      .join(", ");
    flags.push(
      `Rights not cleared on ${restricted.length} project(s) — ${titles}. Ask before publishing any of them.`,
    );
  }

  // Nothing to lead with. The site's whole job is putting one thing first.
  const placements = projects.map((p) => p.placement);
  if (
    projects.length > 0 &&
    !placements.includes("front") &&
    !(typeof work.reel === "string" && work.reel.trim())
  ) {
    flags.push(
      "No reel named and nothing marked front and centre — the site has nothing to lead with. Settle this on the call.",
    );
  }

  // The breakage risk, same class as the durable track's.
  if (access.emailAtDomain === "yes") {
    flags.push(
      "Email is live on that domain — plan the DNS cutover so it keeps working.",
    );
  } else if (access.emailAtDomain === "unsure") {
    flags.push(
      "Unsure whether email runs on that domain — confirm before touching DNS.",
    );
  }

  // Thin taste signal means the first look is a guess. Better to know now.
  const favourites = Array.isArray(taste.favourites)
    ? taste.favourites.length
    : 0;
  const brainDump =
    typeof taste.brainDump === "string" ? taste.brainDump.trim() : "";
  if (favourites === 0 && !brainDump) {
    flags.push(
      "No favourites and no brain dump — there is little to design the first look from. Cover taste on the call.",
    );
  }

  // Scope, stated as a fact rather than a charge. Nothing here bills anyone.
  const pages = Array.isArray(site.pages) ? (site.pages as string[]) : [];
  if (pages.length > SHOWCASE_INCLUDED_PAGES) {
    flags.push(
      `${pages.length} pages chosen; ${SHOWCASE_INCLUDED_PAGES} are included — confirm the extras with them before anything is charged.`,
    );
  }

  return flags;
}

/**
 * One heading per project, with its own images beneath it.
 *
 * The rights answer renders as a plain line rather than a code, because the
 * person reading this has to act on it. The share password renders labelled as
 * a share password — it is what lets Taylor watch a private link, and calling
 * it anything vaguer would invite the exact confusion the no-passwords law
 * exists to prevent.
 */
function renderProjects(
  lines: string[],
  stored: Record<string, unknown>,
  files: readonly IntakeFileLink[],
): void {
  const projects = Array.isArray(stored.projects)
    ? (stored.projects as Array<Record<string, unknown>>)
    : [];

  if (projects.length === 0) return;

  const RIGHTS: Record<string, string> = {
    public: "Public — safe to show",
    rules: "Has rules — ASK BEFORE PUBLISHING",
    unsure: "Not sure — CHECK BEFORE PUBLISHING",
  };

  const PLACEMENT: Record<string, string> = {
    front: "Front and centre",
    archive: "In the archive",
    off: "Leave it off for now",
  };

  const FIELDS: Array<[string, string]> = [
    ["role", "Their role"],
    ["kind", "Kind"],
    ["forWhom", "For"],
    ["watchUrl", "Watch"],
    ["linkPassword", "Share password for that link"],
    ["story", "Story"],
    ["credits", "Credits"],
    ["awards", "Awards or selections"],
  ];

  projects.forEach((project, index) => {
    const title =
      typeof project.title === "string" && project.title.trim()
        ? project.title.trim()
        : `Untitled project ${index + 1}`;
    const year =
      typeof project.year === "string" && project.year.trim()
        ? ` (${project.year.trim()})`
        : "";

    lines.push("", `### ${title}${year}`);

    for (const [key, label] of FIELDS) {
      if (!isEmpty(project[key])) lines.push(`- ${label}: ${project[key]}`);
    }

    if (typeof project.rights === "string" && RIGHTS[project.rights]) {
      lines.push(`- Rights: ${RIGHTS[project.rights]}`);
    }
    if (typeof project.placement === "string" && PLACEMENT[project.placement]) {
      lines.push(`- Where it belongs: ${PLACEMENT[project.placement]}`);
    }

    const own = files.filter(
      (file) => file.entryKey && file.entryKey === project.entryKey,
    );
    for (const file of own) lines.push(`- Image — ${fileLine(file)}`);
  });

  lines.push("");
}

/** Every known field with no answer, grouped by the step that asked it. */
export function collectUnanswered(
  engagement: Engagement,
): Array<{ step: string; labels: string[] }> {
  return stepsFor(engagement.track).map((step) => {
    const stored = readStepAnswers(
      engagement.track,
      engagement.answers,
      step.key,
    );
    const labels = fieldKeysFor(engagement.track, step.key)
      .filter((key) => isEmpty(stored[key]))
      .map((key) => labelFor(engagement.track, key));

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

  // Computed before the steps because project images render inside the work
  // section, under the project they belong to, rather than in the file list.
  const delivered = files.filter((file) => file.uploadedAt !== null);

  for (const step of stepsFor(engagement.track)) {
    const stored = readStepAnswers(
      engagement.track,
      engagement.answers,
      step.key,
    );
    const answered = Object.entries(stored).filter(([, v]) => !isEmpty(v));

    if (answered.length === 0) continue;

    // Projects get a section per project rather than one dumped array. This
    // document is the thing Taylor builds from — a filmmaker's forty pieces
    // rendered as `name: x · year: y` on one line is technically complete and
    // unreadable, which for a deliverable is the same as wrong.
    if (engagement.track === "showcase" && step.key === "work") {
      lines.push("", `## ${step.title}`);
      renderProjects(lines, stored, delivered);

      for (const [key, value] of answered) {
        if (key === "projects") continue;
        const rendered = renderValue(engagement.track, value);
        const label = labelFor(engagement.track, key);
        lines.push(
          rendered.startsWith("\n")
            ? `**${label}:**${rendered}`
            : `**${label}:** ${rendered}`,
        );
      }
      continue;
    }

    lines.push("", `## ${step.title}`);
    for (const [key, value] of answered) {
      const rendered = renderValue(engagement.track, value);
      const label = labelFor(engagement.track, key);
      lines.push(
        rendered.startsWith("\n")
          ? `**${label}:**${rendered}`
          : `**${label}:** ${rendered}`,
      );
    }
  }

  const voice = delivered.filter((file) => file.fieldKey === VOICE_FIELD);
  // Project images already appear under their own project; listing them again
  // here would double a forty-project catalogue's file section for no gain.
  const others = delivered.filter(
    (file) => file.fieldKey !== VOICE_FIELD && !file.entryKey,
  );

  // The voice note gets its own heading because it is the one file with a job
  // to do — it goes to transcription and feeds the brand voice.
  if (voice.length > 0) {
    lines.push("", "## Voice note (transcribe this)");
    for (const file of voice) lines.push(`- ${fileLine(file)}`);
  }

  if (others.length > 0) {
    lines.push("", "## Files");
    for (const file of others) {
      lines.push(
        `- ${labelFor(engagement.track, file.fieldKey)} — ${fileLine(file)}`,
      );
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
