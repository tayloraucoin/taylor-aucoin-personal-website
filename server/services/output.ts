import {
  readIngestionRecord,
  stillMachineFilled,
} from "@/lib/intake/ingestion-record";
import { formatMoney } from "@/lib/intake/money";
import {
  MEDIA_VIDEO_OWNER,
  videoLabel,
  videoRef,
  videosOf,
} from "@/lib/intake/project-videos";
import {
  hostOf,
  picksOf,
  siteByKey,
  STALE_CHECK_DAYS,
  TASTE_PICKS_ASKED,
} from "@/lib/intake/taste-picks";
import { RETIRED_TASTE_KEYS } from "@/lib/intake/showcase-answer-labels";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { fieldKeysFor, labelFor, stepsFor } from "@/lib/intake/tracks";
import type { ExampleSet } from "@/content/intake-examples";
import { BUILD_LEVELS, EXAMPLE_GROUPS } from "@/content/intake-examples/taxonomy";
import type { AnyIntakeStepKey, IntakeTrackKey } from "@/lib/types/intake";
import {
  INCLUDED_PAGES as SHOWCASE_INCLUDED_PAGES,
  type ProjectEntry,
  type ProjectVideo,
  type TasteReference,
} from "@/lib/validators/showcase-intake";
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
  /** The row id. Step 9's home shortlist stores these, so the document has to
      be able to turn one back into a filename. */
  id: string;
  fieldKey: string;
  /** Set when the file belongs to one repeatable entry — a project's stills. */
  entryKey?: string | null;
  originalName: string | null;
  sizeBytes: number | null;
  uploadedAt: Date | null;
  url: string | null;
  /**
   * The file, written out. A voice note transcribed (PORT-20), or a document
   * or fetched page read (PORT-21).
   *
   * Absent on every other file, and absent on one whose reading never ran or
   * never succeeded — which is a complete, shippable state and prints exactly
   * as it always did: the file is stored, linked, and Taylor opens it.
   */
  transcript?: string | null;
  /**
   * Null on a transcript no person has read. The document says so rather than
   * presenting a machine's guess at a festival name as fact (D-PORT-3).
   */
  transcriptEditedAt?: Date | null;
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
export function collectFlags(
  engagement: Engagement,
  asOf: Date,
  gallery: ExampleSet,
): string[] {
  if (engagement.track === "showcase") {
    return showcaseFlags(engagement, asOf, gallery);
  }
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
function showcaseFlags(
  engagement: Engagement,
  asOf: Date,
  gallery: ExampleSet,
): string[] {
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

  /**
   * Nothing to lead with. The site's whole job is putting one thing first.
   *
   * Read from three answers since PORT-19, because the reel question that used
   * to carry this is gone: a project marked front and centre, a video marked
   * lead-with, or anything shortlisted for the home page. Any one of them is
   * an answer to "what goes first"; none of them is a site with no opening
   * move, and that is worth a line on the call.
   */
  const placements = projects.map((p) => p.placement);
  const anyPrimaryVideo = projects.some((project) =>
    videosOf(project as ProjectEntry).some((video) => video.primary === true),
  );
  const shortlisted =
    (Array.isArray(site.homeVideos) && site.homeVideos.length > 0) ||
    (Array.isArray(site.homeMedia) && site.homeMedia.length > 0) ||
    (typeof site.homeBrainDump === "string" &&
      site.homeBrainDump.trim() !== "");

  if (
    projects.length > 0 &&
    !placements.includes("front") &&
    !anyPrimaryVideo &&
    !shortlisted
  ) {
    flags.push(
      "Nothing marked front and centre, no lead video, and nothing shortlisted for the home page — the site has nothing to lead with. Settle this on the call.",
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
  const picks = picksOf(taste);
  const brainDump =
    typeof taste.brainDump === "string" ? taste.brainDump.trim() : "";
  if (picks.length === 0 && !brainDump) {
    flags.push(
      "No example sites picked and no brain dump — there is little to design the first look from. Cover taste on the call.",
    );
  }

  /**
   * The shortfall against the number the step asks for.
   *
   * Silent unless there was something to pick from. An uncurated set means the
   * client was shown no gallery at all, and flagging them for not picking from
   * a screen we never rendered would blame a client for our content work.
   *
   * Silent at zero too, because the line above already covers that case and
   * says something more useful about it.
   */
  const hadAGallery = gallery.curated && gallery.sites.length > 0;

  if (hadAGallery && picks.length > 0 && picks.length < TASTE_PICKS_ASKED) {
    flags.push(
      `Only ${picks.length} example ${picks.length === 1 ? "site" : "sites"} picked — ${TASTE_PICKS_ASKED} were asked for. Their notes carry more of the first look than usual.`,
    );
  }

  /**
   * A picked site whose link we have not confirmed lately.
   *
   * Both research libraries warn that personal sites go dark or get rebuilt
   * often, and the failure this prevents is opening a client's favourite on the
   * call and finding a parked domain. Names the sites, because the action is to
   * open them.
   */
  const staleAfter = STALE_CHECK_DAYS * 24 * 60 * 60 * 1000;
  const stale = picks
    .map((pick) => siteByKey(gallery, pick.siteKey))
    .filter((site) => site !== undefined)
    .filter((site) => {
      const checked = Date.parse(site.checkedOn);
      return Number.isFinite(checked) && asOf.getTime() - checked > staleAfter;
    })
    .map((site) => site.name);

  if (stale.length > 0) {
    flags.push(
      `Picked sites not link-checked in ${STALE_CHECK_DAYS}+ days — ${stale.join(", ")}. Open them before the call.`,
    );
  }

  // The claims cluster (D-PORT-10, audit B5). Three flags, each silent unless
  // its own trigger is present — the value of this block is that Taylor reads
  // it, and a document that flags nine things every time is one he skims.
  const str = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const signOff = str(work.signOff);
  if (
    signOff &&
    signOff.toLowerCase() !== engagement.contactName.trim().toLowerCase()
  ) {
    flags.push(
      `Sign-off is ${signOff}, not the contact — route the first look to them too.`,
    );
  }

  if (str(work.cantSay)) {
    flags.push(
      "There are things they can't say — read the claims section before writing a word.",
    );
  }

  if (str(work.requiredWording)) {
    flags.push("Required wording supplied — it must appear exactly as pasted.");
  }

  // An ask marked "not yet" is a thing that must not go on the site at launch.
  const asks = Array.isArray(work.asks)
    ? (work.asks as Array<Record<string, unknown>>)
    : [];
  const notYet = asks.filter((ask) => ask.visibility === "notYet");
  if (notYet.length > 0) {
    flags.push(
      `${notYet.length} ask(s) marked "not yet" — do not publish those until they say otherwise.`,
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
/**
 * One entry array, rendered as a section per entry rather than a dumped list.
 *
 * Generalised from `renderProjects` at PORT-14, when three more shapes and the
 * ask block arrived. The reason is unchanged and it is the reason the document
 * exists: a filmmaker's forty pieces rendered as `title: x · year: y` on one
 * line is technically complete and unreadable, which for a deliverable is the
 * same as wrong.
 *
 * `fields` is the order Taylor reads them in, not the schema's order. Anything
 * absent is skipped; anything present is labelled.
 */
function renderEntryArray(
  lines: string[],
  entries: Array<Record<string, unknown>>,
  options: {
    heading: (entry: Record<string, unknown>, index: number) => string;
    fields: Array<[string, string]>;
    enums?: Record<string, Record<string, string>>;
    files?: readonly IntakeFileLink[];
    fileLabel?: string;
  },
): void {
  for (const [index, entry] of entries.entries()) {
    lines.push("", `### ${options.heading(entry, index)}`);

    for (const [key, label] of options.fields) {
      const value = entry[key];
      if (isEmpty(value)) continue;

      const enumMap = options.enums?.[key];
      const rendered =
        enumMap && typeof value === "string" && enumMap[value]
          ? enumMap[value]
          : value;
      lines.push(`- ${label}: ${rendered}`);
    }

    const own = (options.files ?? []).filter(
      (file) => file.entryKey && file.entryKey === entry.entryKey,
    );
    for (const file of own) {
      lines.push(`- ${options.fileLabel ?? "Image"} — ${fileLine(file)}`);
    }
  }

  if (entries.length > 0) lines.push("");
}

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

    /**
     * Every video, with the one to lead with marked.
     *
     * `videosOf` reads a pre-PORT-19 project's single `watchUrl` as one video,
     * so a document generated for an engagement answered before the change
     * says exactly what it said before. The share password prints labelled as
     * a share password — it is what lets Taylor watch a private link, and
     * calling it anything vaguer would invite the exact confusion the
     * no-passwords law exists to prevent.
     */
    for (const video of videosOf(project as ProjectEntry)) {
      if (isEmpty(video.url) && isEmpty(video.what)) continue;

      const parts = [
        video.primary ? "**LEAD WITH THIS**" : null,
        video.what?.trim() || null,
        video.url?.trim() || null,
      ].filter(Boolean);

      lines.push(`- Watch: ${parts.join(" — ")}`);
      if (!isEmpty(video.password)) {
        lines.push(`  - Share password for that link: ${video.password}`);
      }
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

/**
 * The step-4 keys that get their own sections above, so the flat loop skips
 * them. A key here and not rendered by `renderWorkEntries` would vanish.
 */
const WORK_SECTIONED = new Set([
  "projects",
  "offerings",
  "pieces",
  "services",
  "asks",
]);

/**
 * The three kind-shaped entry arrays and the ask block.
 *
 * A venture's step 4 prints what it is building and then what it is asking
 * people to do — the two things the category audit found captured nowhere
 * (B4). The claims cluster prints through the ordinary flat loop, because
 * three text answers do not need sections.
 */
function renderWorkEntries(
  lines: string[],
  stored: Record<string, unknown>,
  files: readonly IntakeFileLink[],
): void {
  const arr = (key: string) =>
    Array.isArray(stored[key])
      ? (stored[key] as Array<Record<string, unknown>>)
      : [];

  const titled = (
    entry: Record<string, unknown>,
    index: number,
    noun: string,
  ) =>
    typeof entry.title === "string" && entry.title.trim()
      ? entry.title.trim()
      : `Untitled ${noun} ${index + 1}`;

  const PLACEMENT: Record<string, string> = {
    front: "Front and centre",
    archive: "In the archive",
    off: "Leave it off for now",
  };

  renderEntryArray(lines, arr("offerings"), {
    heading: (e, i) => titled(e, i, "offer"),
    fields: [
      ["format", "Format"],
      ["forWhom", "For"],
      ["scope", "Scope"],
      ["pricePosture", "Price on the site"],
      ["price", "Price"],
      ["link", "Link"],
      ["story", "Story"],
      ["placement", "Where it belongs"],
    ],
    enums: {
      pricePosture: {
        site: "Show it",
        request: "On request",
        hide: "Do not show it",
      },
      placement: PLACEMENT,
    },
  });

  renderEntryArray(lines, arr("pieces"), {
    heading: (e, i) => titled(e, i, "piece"),
    fields: [
      ["kind", "Kind"],
      ["status", "Status"],
      ["when", "When"],
      ["story", "Story"],
      ["placement", "Where it belongs"],
    ],
    enums: {
      // Blank means the client did not say, and that is the answer. Nothing
      // here may present a planned thing as though it exists.
      status: { planned: "PLANNED", underway: "Underway", done: "Done" },
      placement: PLACEMENT,
    },
    files,
    fileLabel: "Image",
  });

  renderEntryArray(lines, arr("services"), {
    heading: (e, i) => titled(e, i, "service"),
    fields: [
      ["price", "Price"],
      ["included", "What's included"],
      ["duration", "How long it takes"],
      ["takesLonger", "What makes it take longer"],
      ["placement", "Where it belongs"],
    ],
    enums: { placement: PLACEMENT },
  });

  const asks = arr("asks");
  if (asks.length > 0) {
    const ASK: Record<string, string> = {
      invest: "Invest",
      donate: "Donate",
      apply: "Apply or join",
      book: "Book",
      buy: "Buy",
      subscribe: "Subscribe",
      contact: "Get in touch",
      other: "Something else",
    };

    renderEntryArray(lines, asks, {
      heading: (e, i) =>
        `Ask ${i + 1} — ${
          typeof e.ask === "string" && ASK[e.ask] ? ASK[e.ask] : "unspecified"
        }`,
      fields: [
        ["forWhom", "Who it's for"],
        ["getWhat", "What they get"],
        ["number", "The number"],
        ["mechanism", "How it happens"],
        ["destination", "Where it lands"],
        ["visibility", "Shown on the site"],
      ],
      enums: {
        mechanism: {
          form: "A form on the site",
          request: "Request a document",
          call: "Book a call",
          link: "A link elsewhere",
          email: "Email",
        },
        visibility: {
          front: "Front and centre",
          request: "Behind a request",
          notYet: "NOT YET — do not publish this ask",
        },
      },
    });
  }
}

/**
 * Values the ingestion run wrote that the client never touched.
 *
 * The other half of M-PORT-33's bargain. The run writes answers, which means
 * this document can contain sentences the client has not read — so it says
 * which ones, grouped by step, and Taylor reads them knowing that. A value the
 * client edited is theirs and does not appear here; an entry they deleted
 * appears nowhere at all.
 *
 * Empty for every engagement that never ran the step, which is every durable
 * engagement and every coded one before PORT-18.
 */
export function collectUnconfirmed(
  engagement: Engagement,
): Array<{ step: string; labels: string[] }> {
  const record = readIngestionRecord(engagement.answers);
  if (!record || record.fields.length === 0) return [];

  const byStep = new Map<string, string[]>();

  for (const field of record.fields) {
    const stored = readStepAnswers(
      engagement.track,
      engagement.answers,
      field.stepKey as never,
    );
    if (!stillMachineFilled(field, stored)) continue;

    const step = stepsFor(engagement.track).find((s) => s.key === field.stepKey);
    const title = step?.title ?? field.stepKey;
    const label = labelFor(engagement.track, field.fieldKey);
    byStep.set(title, [...(byStep.get(title) ?? []), label]);
  }

  return [...byStep].map(([step, labels]) => ({ step, labels }));
}

/** Every known field with no answer, grouped by the step that asked it. */
export function collectUnanswered(
  engagement: Engagement,
): Array<{ step: string; labels: string[] }> {
  return stepsFor(engagement.track)
    .map((step) => {
      const stored = readStepAnswers(
        engagement.track,
        engagement.answers,
        step.key,
      );
      const labels = fieldKeysFor(engagement.track, step.key)
        .filter((key) => isEmpty(stored[key]))
        /**
         * A retired question is not an unanswered one.
         *
         * This list becomes "we'll cover these on the call" on the done screen,
         * and without this filter every coded client would be told we still
         * need to discuss "How still it should be" and their "Favourite example
         * sites, best first" — questions the step stopped asking on
         * 2026-09-03. The keys stay in the schema so stored answers survive
         * (M-PORT-35); they must not stay in the agenda.
         *
         * Scoped to the step that retired them, so a durable key of the same
         * name is untouched.
         */
        .filter(
          (key) =>
            !(
              engagement.track === "showcase" &&
              step.key === "taste" &&
              RETIRED_TASTE_KEYS.has(key)
            ),
        )
        .map((key) => labelFor(engagement.track, key));

      return { step: step.title, labels };
    })
    .filter((group) => group.labels.length > 0);
}

/**
 * Every step, with how much of it is filled in.
 *
 * The review page's whole content. Counts rather than values on purpose: a
 * client returning months later wants to see where their answers are, and a
 * page that reprinted all of them would be a worse version of each step —
 * longer, not editable, and a second place for the same words to drift.
 *
 * Shares `collectUnanswered`'s two rules so the two screens can never disagree
 * about what counts as a question: a retired key is not an unanswered one, and
 * a step's fields are its schema's keys.
 */
export function answerTally(
  engagement: Engagement,
  flavour?: ShowcaseFlavour,
): Array<{
  key: AnyIntakeStepKey;
  number: number;
  title: string;
  answered: number;
  total: number;
}> {
  return stepsFor(engagement.track, flavour).map((step) => {
    const stored = readStepAnswers(
      engagement.track,
      engagement.answers,
      step.key,
    );

    const keys = fieldKeysFor(engagement.track, step.key).filter(
      (key) =>
        !(
          engagement.track === "showcase" &&
          step.key === "taste" &&
          RETIRED_TASTE_KEYS.has(key)
        ),
    );

    return {
      key: step.key,
      number: step.number,
      title: step.title,
      answered: keys.filter((key) => !isEmpty(stored[key])).length,
      total: keys.length,
    };
  });
}

/**
 * The taste step's shortfall against the number it asks for, or null.
 *
 * Kept apart from `collectUnanswered` because the two say different things.
 * That list is about *empty* fields — questions nobody touched. This is a
 * non-empty answer measured against a stated ask, and folding it in would mean
 * either calling a client's three picks "unanswered" or losing the ask
 * entirely.
 *
 * Silent when no set was curated: a client shown no gallery cannot fall short
 * of picking from it, and saying otherwise would blame them for our content
 * work. Silent when the ask is met.
 */
export function tasteShortfall(
  engagement: Engagement,
  gallery: ExampleSet,
): string | null {
  if (engagement.track !== "showcase") return null;
  if (!gallery.curated || gallery.sites.length === 0) return null;

  const taste = readStepAnswers(
    engagement.track,
    engagement.answers,
    "taste" as never,
  );
  const picked = picksOf(taste).length;
  if (picked >= TASTE_PICKS_ASKED) return null;

  // [COPY — draft]
  return `Example sites: ${picked} picked (we asked for ${TASTE_PICKS_ASKED})`;
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
/**
 * Answers that store a key, rendered as the thing the key points at.
 *
 * Three of them, all added at PORT-19: the five picked projects, and step 9's
 * two shortlists. Each stores an id — a project's entry key, a file's row id,
 * a video ref — because that is the only value that survives a title being
 * edited or a row being reordered. In the document those ids are noise, so
 * they are resolved to titles, filenames, and the line the client wrote about
 * the video.
 *
 * **Resolved here, not stored resolved.** Writing titles into the answers
 * would mean a project renamed on step 5 silently disagreeing with a shortlist
 * on step 9, which is the whole reason these are keys.
 *
 * A key that resolves to nothing prints as a marked line rather than
 * disappearing. The client ticked something; a document that drops the tick
 * because the thing behind it was deleted is a document that quietly edits an
 * answer.
 */
/** `5/7`, or the honest absence. A pick with no score was never scored. */
function scoreText(score: number | undefined): string {
  return typeof score === "number" ? `${score}/7` : "no score";
}

function quoted(note: string | undefined): string | null {
  const value = note?.trim();
  return value ? `"${value}"` : null;
}

/**
 * One pick, as a line Taylor can read without opening the content file.
 *
 * Carries what changes a design decision: how close it is, why, which archetype
 * it belongs to, where it sits on the three axes, and what it would take to
 * reach — `build` prints here and nowhere a client can see (D-PORT-15).
 *
 * A pick whose site has left the set prints by its stored key with a marker.
 * Dropping it would be the document quietly editing an answer: the client
 * picked something, and our curation changing afterwards is our business, not a
 * reason to lose their reaction.
 */
function tastePickLine(
  gallery: ExampleSet,
  pick: { siteKey: string; score?: number; note?: string },
): string {
  const site = siteByKey(gallery, pick.siteKey);

  if (!site) {
    return [
      pick.siteKey,
      scoreText(pick.score),
      quoted(pick.note),
      "no longer in the gallery",
    ]
      .filter(Boolean)
      .join(" — ");
  }

  const head = [
    `${site.name} (${hostOf(site.url)})`,
    scoreText(pick.score),
    quoted(pick.note),
  ]
    .filter(Boolean)
    .join(" — ");

  const tail = [
    EXAMPLE_GROUPS[site.group].title,
    site.axes.ground,
    site.axes.motion,
    site.axes.density,
    BUILD_LEVELS[site.build],
  ].join(" · ");

  return `${head} · ${tail}`;
}

/** One site they found themselves. No tags — we have not looked at it. */
function tasteReferenceLine(reference: TasteReference): string {
  const line = [
    hostOf(reference.url) || "no link",
    scoreText(reference.score),
    quoted(reference.note),
  ]
    .filter(Boolean)
    .join(" — ");

  return reference.source === "search"
    ? `${line} (found by the style search)`
    : line;
}

function resolveShowcaseKeys(
  engagement: Engagement,
  stepKey: string,
  stored: Record<string, unknown>,
  files: readonly IntakeFileLink[],
  gallery: ExampleSet,
): Record<string, unknown> {
  const strings = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];

  const work = () =>
    readStepAnswers(engagement.track, engagement.answers, "work");

  const projectsOf = (stepAnswers: Record<string, unknown>): ProjectEntry[] =>
    Array.isArray(stepAnswers.projects)
      ? (stepAnswers.projects as ProjectEntry[])
      : [];

  if (stepKey === "work") {
    const picks = strings(stored.topFivePicks);
    if (picks.length === 0) return stored;

    const projects = projectsOf(stored);

    return {
      ...stored,
      topFivePicks: picks.map((key, index) => {
        const project = projects.find((p) => p.entryKey === key);
        const title = project
          ? project.title?.trim() ||
            `Untitled project ${projects.indexOf(project) + 1}`
          : "a project they have since removed";
        return `${index + 1}. ${title}`;
      }),
    };
  }

  /**
   * Taste stores keys and shapes; the document needs names and sentences.
   *
   * `picksOf` folds a pre-2026-09-03 `favourites` array in here, which is why
   * `favourites` is dropped from the resolved object afterwards — printing both
   * would show one reaction twice under two labels. The stored answer is
   * untouched; this is a read.
   *
   * `notes` — PORT-7's map of what a client wrote about a site they did *not*
   * favourite — is rendered as lines for the same reason. Left alone it reaches
   * `renderValue` as a plain object and prints `[object Object]`, which is how
   * it would have shipped for any engagement that used the old gallery.
   */
  if (stepKey === "taste") {
    const next = { ...stored };

    const picks = picksOf(stored);
    if (picks.length > 0) {
      next.picks = picks.map((pick) => tastePickLine(gallery, pick));
    }
    delete next.favourites;

    const references = Array.isArray(stored.references)
      ? (stored.references as TasteReference[])
      : [];
    if (references.length > 0) {
      next.references = references.map(tasteReferenceLine);
    }

    const notes =
      stored.notes && typeof stored.notes === "object"
        ? (stored.notes as Record<string, string>)
        : {};
    const noteLines = Object.entries(notes)
      .filter(([, note]) => note?.trim())
      .map(([key, note]) => {
        const site = siteByKey(gallery, key);
        return `${site?.name ?? key} — "${note.trim()}"`;
      });
    if (noteLines.length > 0) next.notes = noteLines;
    else delete next.notes;

    return next;
  }

  if (stepKey !== "site") return stored;

  const media = readStepAnswers(engagement.track, engagement.answers, "media");
  const next = { ...stored };

  const chosenVideos = strings(stored.homeVideos);
  if (chosenVideos.length > 0) {
    const byRef = new Map<string, { video: ProjectVideo; source: string }>();

    projectsOf(work()).forEach((project, index) => {
      const source = project.title?.trim() || `Untitled project ${index + 1}`;
      for (const video of videosOf(project)) {
        byRef.set(videoRef(project.entryKey, video.entryKey), {
          video,
          source,
        });
      }
    });

    for (const video of Array.isArray(media.videos)
      ? (media.videos as ProjectVideo[])
      : []) {
      byRef.set(videoRef(MEDIA_VIDEO_OWNER, video.entryKey), {
        video,
        source: "Media",
      });
    }

    next.homeVideos = chosenVideos.map((ref) => {
      const found = byRef.get(ref);
      if (!found) return "A video they have since removed";
      const url = found.video.url?.trim();
      return `${videoLabel(found.video)} (${found.source})${url ? ` — ${url}` : ""}`;
    });
  }

  const chosenFiles = strings(stored.homeMedia);
  if (chosenFiles.length > 0) {
    next.homeMedia = chosenFiles.map((id) => {
      const file = files.find((row) => row.id === id);
      if (!file) return "A file they have since removed";
      return `${file.originalName ?? "Unnamed file"} (${labelFor(engagement.track, file.fieldKey)})`;
    });
  }

  return next;
}

function termsLine(engagement: Engagement): string | null {
  if (!engagement.termsAcceptedAt || !engagement.termsVersion) return null;

  return `Terms: version ${engagement.termsVersion} accepted ${day(engagement.termsAcceptedAt)} by deposit payment`;
}

export function renderIntakeMarkdown(input: {
  engagement: Engagement;
  files: readonly IntakeFileLink[];
  generatedAt: Date;
  /**
   * The gallery this engagement's picks were made from.
   *
   * **Required, with no default** (M-PORT-41). A default is how a caller
   * silently renders the absent state and nobody notices the gallery never
   * loaded — which is D-PORT-12's failure mode with a new mechanism. The
   * durable track passes `EMPTY_EXAMPLE_SET`, which reads as the statement it
   * is: that track has no gallery.
   */
  gallery: ExampleSet;
}): string {
  const { engagement, files, generatedAt, gallery } = input;
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

  const flags = collectFlags(engagement, generatedAt, gallery);
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
    const resolved =
      engagement.track === "showcase"
        ? resolveShowcaseKeys(engagement, step.key, stored, delivered, gallery)
        : stored;
    const answered = Object.entries(resolved).filter(([, v]) => !isEmpty(v));

    if (answered.length === 0) continue;

    // Projects get a section per project rather than one dumped array. This
    // document is the thing Taylor builds from — a filmmaker's forty pieces
    // rendered as `name: x · year: y` on one line is technically complete and
    // unreadable, which for a deliverable is the same as wrong.
    if (engagement.track === "showcase" && step.key === "work") {
      lines.push("", `## ${step.title}`);
      renderProjects(lines, stored, delivered);
      renderWorkEntries(lines, stored, delivered);

      for (const [key, value] of answered) {
        if (WORK_SECTIONED.has(key)) continue;
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

  /**
   * The voice note gets its own heading because it is the one file with a job
   * to do — it feeds the brand voice.
   *
   * Where a transcript exists it *is* the section, with the audio beside it,
   * because reading is faster than listening and the audio is still one click
   * away when a sentence sounds wrong. Where one does not — no key configured,
   * a vendor that kept failing, a durable-track engagement that has no
   * recorder at all — the old heading and the bare file line print exactly as
   * they always did. That is the degradation this feature is allowed to have:
   * back to hand transcription, which is where we started.
   *
   * An unedited transcript is marked. Taylor needs to know whether he is
   * reading the client's words or a machine's best guess at them, and the
   * difference is usually a proper noun.
   */
  const transcribed = voice.filter((file) => file.transcript?.trim());

  if (transcribed.length > 0) {
    lines.push("", "## Voice note");

    for (const file of transcribed) {
      lines.push("", fileLine(file));
      if (!file.transcriptEditedAt) {
        lines.push("", "_Machine transcript — not reviewed by the client._");
      }
      lines.push("", file.transcript!.trim());
    }
  }

  const untranscribed = voice.filter((file) => !file.transcript?.trim());

  if (untranscribed.length > 0) {
    lines.push("", "## Voice note (transcribe this)");
    for (const file of untranscribed) lines.push(`- ${fileLine(file)}`);
  }

  if (others.length > 0) {
    lines.push("", "## Files");
    for (const file of others) {
      lines.push(
        `- ${labelFor(engagement.track, file.fieldKey)} — ${fileLine(file)}`,
      );
    }
  }

  // Before "Not answered", because the two are the same kind of caution — one
  // says nobody answered, the other says nobody confirmed — and this is the
  // one that can put a sentence on a page.
  const unconfirmed = collectUnconfirmed(engagement);
  if (unconfirmed.length > 0) {
    const record = readIngestionRecord(engagement.answers);
    lines.push("", "## Filled in from what they sent, and not yet confirmed");
    lines.push(
      `These values were written from the client's own material by the ingestion step${
        record?.ranAt ? ` on ${day(new Date(record.ranAt))}` : ""
      } and have not been edited since. Each one is quoted from something they sent; none of them is a sentence they wrote here.`,
    );
    for (const group of unconfirmed) {
      lines.push(`**${group.step}:** ${group.labels.join(" · ")}`);
    }
    if (record && record.failed.length > 0) {
      lines.push(
        `_Part of that run did not complete (${record.failed.join(", ")}), so those sections were filled in by hand or not at all._`,
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
