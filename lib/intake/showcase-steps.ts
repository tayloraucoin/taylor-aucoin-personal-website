import type { IntakeStep, ShowcaseStepKey } from "@/lib/types/intake";

/**
 * The showcase track's registry: nine steps, and the copy that flexes.
 *
 * Every string here is `docs/websites/portfolio-intake-questions-v2.md`,
 * verbatim. It is approved client-facing copy and it does not get improved,
 * shortened, or re-punctuated in passing.
 *
 * Nothing imports this file except `lib/intake/tracks.ts` — the same law the
 * durable registry lives under.
 */

/**
 * What kind of work the portfolio holds, asked on the start form.
 *
 * The stored value is the key; the label is what the client reads. One home for
 * both, so the form, the flavour resolver, and the intake document cannot
 * disagree about what "film" means.
 */
export const SHOWCASE_DISCIPLINES = [
  { key: "film", label: "Film or video" },
  { key: "photography", label: "Photography" },
  { key: "design", label: "Design" },
  { key: "illustration", label: "Illustration or fine art" },
  { key: "music", label: "Music or performance" },
] as const;

export type ShowcaseDisciplineKey =
  (typeof SHOWCASE_DISCIPLINES)[number]["key"];

/**
 * A shipped copy pack. Film first; generic is the permanent floor.
 *
 * Photography and art variants are sketched in the v2 doc but are not written,
 * so they are not here. A discipline without a pack gets generic — never a
 * half-flavoured sentence, never an empty slot (D-PORT-5).
 */
export type ShowcaseFlavour = "film" | "generic";

/** Which disciplines have a pack. Everything absent resolves to generic. */
const DISCIPLINE_FLAVOURS: Partial<
  Record<ShowcaseDisciplineKey, ShowcaseFlavour>
> = {
  film: "film",
};

/**
 * The copy that genuinely differs between packs.
 *
 * Only strings whose film and generic forms are different live here. Where the
 * v2 doc's base string already serves both — the dark/light help, for instance,
 * whose only variant is a photography one that has not been written — the
 * string stays with its step and there is nothing to resolve.
 */
export type ShowcaseCopyPack = {
  /** Opens step 4's intro; the rest of the paragraph is shared. */
  workIntroLead: string;
  /**
   * The v2 doc italicises one word here — "Which piece is *the* reel?" — and
   * this is stored as plain text because a field label is a string, not
   * markup. The words are verbatim; only the emphasis is absent. Logged in
   * `DEVIATIONS.md` so it can be restored deliberately rather than discovered.
   */
  reelLabel: string;
  reelHelp: string;
  accountsHelp: string;
};

export const SHOWCASE_COPY: Record<ShowcaseFlavour, ShowcaseCopyPack> = {
  film: {
    workIntroLead:
      "Now the work itself — the films, videos, and projects the last step's career produced.",
    reelLabel: "Which piece is the reel?",
    reelHelp:
      "The one video a stranger should see first. If you don't have a current reel, say so — the site can lead with your best piece instead, and we'll note the reel needs a refresh.",
    accountsHelp: "IMDb especially, if you have a page — people in film check it.",
  },
  generic: {
    workIntroLead:
      "Now the work itself — the pieces the last step's career produced.",
    reelLabel: "Which piece leads?",
    reelHelp: "The one thing a stranger should see first.",
    accountsHelp: "Wherever your work already lives — people will look.",
  },
};

/**
 * The half of step 4's intro that does not flex.
 *
 * The v2 doc gives the flavour variants as a replacement for the opening
 * sentence only, with the rest elided; splitting the paragraph here is what
 * lets both halves stay verbatim instead of being restated per pack.
 */
const WORK_INTRO_TAIL =
  "Add as many as you want; there's no cap. Don't aim for polished — aim for honest, and lead with what you'd show first.";

/**
 * The registry, resolved for one copy pack.
 *
 * A function rather than a constant because exactly one intro flexes. Callers
 * that only need titles and numbers — the resume list, the progress bar, the
 * reminder sweep — take the generic form, which is correct for them and is the
 * honest default everywhere else.
 *
 * No step carries `emphasis: "ink"`. The durable track grants it to the one
 * step that stops a false claim reaching a live site; nothing in the approved
 * showcase copy asks for the same treatment, and inventing one would be a
 * design decision this file has no authority to make.
 */
export function showcaseSteps(
  flavour: ShowcaseFlavour = "generic",
): readonly IntakeStep<ShowcaseStepKey>[] {
  return [
    { key: "about", number: 1, title: "About you" },
    {
      key: "audience",
      number: 2,
      title: "Who this site is for",
      intro:
        "A portfolio isn't for you — it's for the person deciding whether to work with you. This step is about who that is.",
    },
    {
      key: "experience",
      number: 3,
      title: "Experience and proof",
      intro:
        "Think of this as the LinkedIn layer: positions, memberships, ongoing roles — the timeline your career sits on. The individual films and projects that timeline produced come in the next step. This one is where you've worked, taught, founded, and belonged.",
    },
    {
      key: "work",
      number: 4,
      title: "The work",
      intro: `${SHOWCASE_COPY[flavour].workIntroLead} ${WORK_INTRO_TAIL}`,
    },
    {
      key: "taste",
      number: 5,
      title: "Taste",
      intro:
        "This is how we skip the part where a designer shows you three drafts you don't like. Below are real portfolio sites from across the whole spectrum. Go with your gut — the pattern in your reactions is what we're after.",
    },
    {
      key: "words",
      number: 6,
      title: "Your words",
      intro:
        "Most portfolio bios read like a stranger wrote them in a hurry. This step is how we make the site sound like you.",
    },
    {
      key: "media",
      number: 7,
      title: "Media",
      intro:
        "Project images live with their projects back in step 4. This step is everything else — and original files beat compressed copies every time.",
    },
    {
      key: "site",
      number: 8,
      title: "The site itself",
      intro:
        "The shape of the thing — what pages exist and what each one is for. Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged. Project detail pages don't count — they come with the work section.",
    },
    { key: "access", number: 9, title: "Accounts and access" },
  ] as const;
}

/**
 * Which copy pack an engagement's answers earn.
 *
 * Exactly one discipline checked, and that discipline has a pack: use it.
 * Anything else — none, several, or one we have not written for — is generic.
 * A client who does film *and* photography gets copy that assumes neither,
 * which is the only honest option when the packs disagree (D-PORT-5).
 */
export function flavourFromDisciplines(
  disciplines: readonly string[] | undefined,
): ShowcaseFlavour {
  if (!disciplines || disciplines.length !== 1) return "generic";

  const only = disciplines[0] as ShowcaseDisciplineKey;
  return DISCIPLINE_FLAVOURS[only] ?? "generic";
}
