import type { ShowcaseFlavour } from "./showcase-copy";

/**
 * What the site is for — the one answer the coded cartridge reads.
 *
 * Before PORT-11 the start form asked two questions about this and the system
 * read neither: a multi-select "What kind of site is this?" that nothing
 * consumed, and a discipline list that only chose between two copy packs. A
 * consultant, a venture, and a filmmaker all got the same words
 * (`CODED-INTAKE-CATEGORY-AUDIT.md` B2).
 *
 * Now there is one single-select answer and everything downstream branches on
 * it: which copy pack, which field groups exist, what shape step 4 takes, and
 * which example-site set the taste step loads.
 *
 * **Single-select is the point.** The exactly-one rule that made the old
 * flavour resolver useless was the right rule attached to the wrong question: a
 * person can have several disciplines, but a site has one job that leads. One
 * answer is what lets every downstream string be certain (D-PORT-8).
 *
 * Nothing imports this file except `tracks.ts`.
 */

export const SHOWCASE_KIND_KEYS = [
  "portfolio",
  "practice",
  "studio",
  "venture",
  "business",
  "other",
] as const;

export type ShowcaseKind = (typeof SHOWCASE_KIND_KEYS)[number];

/**
 * A field group that exists on some kinds and not others.
 *
 * Groups are **present or absent, never revealed**: the kind is fixed before
 * step 1 renders, so there is no moment at which one appears under the client's
 * hands and nothing needs an eased reveal. The §6.5 reveal law still governs
 * conditionals *inside* a group.
 */
export type ShowcaseGroup = "roster" | "ask" | "claims" | "documents" | "stage";

/**
 * Which array a kind's step 4 fills, and therefore which entry card it renders.
 *
 * Four keys, never one polymorphic array (M-PORT-23): a kind change must not be
 * able to re-read a project as a service, and a key that stops rendering keeps
 * its value for the intake document to print (D-PORT-11).
 *
 * It lived as a `Record<ShowcaseKind, …>` inside `step-work.tsx` until ADM-4.
 * A per-kind fact belongs to the kind, in one home, or the admin overview that
 * reports "who is asked this" computes it from a component's private opinion
 * (M-ADM-7).
 */
export type ShowcaseWorkShape =
  "projects" | "offerings" | "pieces" | "services";

/**
 * An optional question that some kinds are asked and others are not.
 *
 * Like `ShowcaseGroup`, these are **present or absent, never revealed** — the
 * kind is fixed before a step renders, so nothing appears under the client's
 * hands. Unlike a group, each of these is a single question rather than a
 * cluster, which is why they are flags on the entry rather than group keys.
 *
 * `name` and `disciplines` are the start form's two; `roles`, `portrait`, and
 * `video` are the questionnaire's. All five are read through `kindAsks`.
 */
export type ShowcaseKindQuestion =
  "roles" | "portrait" | "video" | "name" | "disciplines";

/**
 * The sentinel for the one kind whose pack is not fixed.
 *
 * A portfolio's pack is chosen by the discipline answer, exactly as it was
 * before this file existed. Every other kind names its pack outright.
 */
const BY_DISCIPLINE = "byDiscipline" as const;

type KindEntry = {
  key: ShowcaseKind;
  /** What the client reads on the start form. */
  label: string;
  pack: ShowcaseFlavour | typeof BY_DISCIPLINE;
  groups: readonly ShowcaseGroup[];
  /** Whether the start form asks "What's the work?" — portfolio and studio. */
  asksDisciplines: boolean;
  /**
   * Whether the subject has a name of its own, distinct from the contact's.
   * Everything but a portfolio does; a filmmaker's practice is themselves
   * (M-PORT-3), which is the assumption this flag exists to stop generalising.
   */
  asksName: boolean;

  /**
   * Whether step 1 asks for a list of roles and which one leads.
   *
   * Roles belong to a person's practice, not to an organisation's About page —
   * an organisation's people are its roster instead.
   */
  asksRoles: boolean;
  /**
   * Whether step 7 asks for a photo of the person, rather than of the place.
   *
   * A roster kind collected headshots per person on step 1, so asking again for
   * "a photo of you" would be the D-INT-8 failure; what those kinds actually
   * lack is a picture of the place.
   */
  asksPortrait: boolean;
  /**
   * Whether a kind's site is built on a back catalogue of video.
   *
   * It named one question until PORT-19 — "where does your video live?", which
   * a portfolio and a studio were asked instead of the tools checklist. That
   * question is gone: the client pastes video links on every project card and
   * on Media, and their domains say where the video lives, so asking was
   * making someone type the same fact twice (Taylor, 2026-09-03).
   *
   * The flag stays, and it is still exactly one branch: the kinds it is false
   * of are the ones asked which tools they run, read as `not(asks("video"))`.
   * The tools question matters for an organisation — a founder's personal
   * Instagram is a different asset from the company's — and is noise for a
   * filmmaker, which is the distinction this flag has always drawn.
   */
  asksVideo: boolean;
  /** Which array step 4 fills. `showsReel` is derived from it, never stored. */
  work: ShowcaseWorkShape;
};

/**
 * The kinds, in the order the start form shows them.
 *
 * Portfolio leads because it is the track's origin and its largest cohort;
 * "Something else" is last because it is the honest floor rather than a
 * category. A kind whose label reads as a category the client does not
 * recognise is a kind that gets skipped, so each names the thing rather than
 * the segment.
 *
 * `[COPY — pending Taylor]` on every label and on the group help.
 */
export const SHOWCASE_KINDS: readonly KindEntry[] = [
  {
    key: "portfolio",
    label: "Your creative work — a portfolio",
    pack: BY_DISCIPLINE,
    groups: [],
    asksDisciplines: true,
    asksName: false,
    asksRoles: true,
    asksPortrait: true,
    asksVideo: true,
    work: "projects",
  },
  {
    key: "practice",
    label: "Your practice — consulting, coaching, speaking, writing",
    pack: "practice",
    groups: ["ask", "claims"],
    asksDisciplines: false,
    asksName: true,
    asksRoles: true,
    asksPortrait: true,
    asksVideo: false,
    work: "offerings",
  },
  {
    key: "studio",
    label: "A studio or team's work",
    pack: "entity",
    groups: ["roster", "ask", "claims", "documents"],
    asksDisciplines: true,
    asksName: true,
    asksRoles: false,
    asksPortrait: false,
    asksVideo: true,
    work: "projects",
  },
  {
    key: "venture",
    label:
      "A venture or project — raising money, finding members, launching something",
    pack: "venture",
    groups: ["roster", "ask", "claims", "documents", "stage"],
    asksDisciplines: false,
    asksName: true,
    asksRoles: false,
    asksPortrait: false,
    asksVideo: false,
    work: "pieces",
  },
  {
    key: "business",
    label: "A business that sells services",
    pack: "service",
    groups: ["roster", "ask", "claims"],
    asksDisciplines: false,
    asksName: true,
    asksRoles: false,
    asksPortrait: false,
    asksVideo: false,
    work: "services",
  },
  {
    key: "other",
    label: "Something else",
    // The kinds scope's table said `generic`, which is the portfolio pack —
    // and this kind carries a roster and a documents drop, so it would have
    // asked an organisation for "Your projects" and offered it "A reel page".
    // `entity` is the neutral organisation pack and is the coherent pairing
    // for the groups the scope itself assigned. See DEVIATIONS.
    pack: "entity",
    groups: ["roster", "ask", "claims", "documents"],
    asksDisciplines: false,
    asksName: true,
    asksRoles: false,
    asksPortrait: false,
    asksVideo: false,
    work: "services",
  },
];

const BY_KEY = new Map(SHOWCASE_KINDS.map((entry) => [entry.key, entry]));

/** The default for an engagement that has never answered the question. */
const DEFAULT_KIND: ShowcaseKind = "portfolio";

/**
 * How a pre-PORT-11 engagement's retired `siteKinds` answer becomes a kind.
 *
 * A **derivation, never a backfill** (M-PORT-21). Every engagement that existed
 * before this file did was created when the coded track sold one thing, so the
 * mapping is generous in one direction only: it never invents a kind more
 * specific than what was checked, and an unanswered form is a portfolio because
 * that is what every such engagement actually was.
 *
 * Order is precedence, not preference, and it is deterministic on purpose:
 * someone who checked both "consultant" and "studio" gets one answer today and
 * the same answer tomorrow. It is deleted the day no engagement lacks a `kind`.
 */
const DERIVATION: ReadonlyArray<{
  kind: ShowcaseKind;
  from: readonly string[];
}> = [
  { kind: "practice", from: ["consultant", "speaker"] },
  { kind: "studio", from: ["studio"] },
  { kind: "other", from: ["other"] },
  { kind: "portfolio", from: ["portfolio"] },
];

function isKind(value: unknown): value is ShowcaseKind {
  return typeof value === "string" && BY_KEY.has(value as ShowcaseKind);
}

/**
 * This engagement's kind: what it answered, or what its old answer implies.
 *
 * A stored value outside the enum is treated as absent rather than thrown —
 * a questionnaire never fails a client over a value it does not recognise, and
 * the honest fallback renders the questions the engagement has always seen.
 */
export function kindFor(answers: unknown): ShowcaseKind {
  const about = (answers as { about?: Record<string, unknown> } | undefined)
    ?.about;

  if (isKind(about?.siteKind)) return about.siteKind;

  const siteKinds = Array.isArray(about?.siteKinds)
    ? (about.siteKinds as unknown[]).filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  if (siteKinds.length === 0) return DEFAULT_KIND;

  for (const rule of DERIVATION) {
    if (rule.from.some((value) => siteKinds.includes(value))) return rule.kind;
  }

  return DEFAULT_KIND;
}

/** Everything known about one kind. Never undefined for a real kind. */
export function kindEntry(kind: ShowcaseKind): KindEntry {
  return BY_KEY.get(kind)!;
}

/** Which field groups this kind's questionnaire carries. */
export function groupsFor(kind: ShowcaseKind): ReadonlySet<ShowcaseGroup> {
  return new Set(kindEntry(kind).groups);
}

/**
 * Whether this kind is asked one of the five optional questions.
 *
 * One accessor rather than five exported booleans, so a sixth question is a
 * value added to `ShowcaseKindQuestion` and a column added to the table below,
 * rather than a new export threaded through `tracks.ts`.
 *
 * Before ADM-4 the three questionnaire flags were computed inline in three step
 * components (`kind === "portfolio" || kind === "practice"`, twice, meaning two
 * different things). That is the drift a registry exists to prevent, and the
 * admin overview that reports "who is asked this" cannot read a component's
 * private opinion (M-ADM-7).
 */
export function kindAsks(
  kind: ShowcaseKind,
  question: ShowcaseKindQuestion,
): boolean {
  const entry = kindEntry(kind);

  switch (question) {
    case "roles":
      return entry.asksRoles;
    case "portrait":
      return entry.asksPortrait;
    case "video":
      return entry.asksVideo;
    case "name":
      return entry.asksName;
    case "disciplines":
      return entry.asksDisciplines;
  }
}

/**
 * Which array this kind's step 4 fills.
 *
 * `showsReel` derives from this — only a kind whose work is a back catalogue is
 * asked to pick one piece out of it — and is deliberately not a second field,
 * because two fields can disagree and a derivation cannot.
 */
export function workShapeFor(kind: ShowcaseKind): ShowcaseWorkShape {
  return kindEntry(kind).work;
}

/**
 * The pack a kind earns, given the disciplines a portfolio may have answered.
 *
 * The discipline answer reaches exactly one branch. A consultant who also
 * shoots film reads consultant copy, which is the trade single-select buys:
 * certainty about who the form is talking to (D-PORT-8).
 */
export function packForKind(
  kind: ShowcaseKind,
  fromDisciplines: () => ShowcaseFlavour,
): ShowcaseFlavour {
  const entry = kindEntry(kind);
  return entry.pack === BY_DISCIPLINE ? fromDisciplines() : entry.pack;
}
