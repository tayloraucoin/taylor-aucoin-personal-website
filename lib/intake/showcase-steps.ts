import type { IntakeStep, ShowcaseStepKey } from "@/lib/types/intake";
import { resolvePack, type ShowcaseFlavour } from "./showcase-copy";

/**
 * Re-exported so the components that already type a `flavour` prop keep their
 * import path. The type and the packs themselves live in `showcase-copy.ts`
 * (M-PORT-22); this file owns step identity and nothing else.
 */
export type { ShowcaseFlavour } from "./showcase-copy";

/**
 * The showcase track's registry: ten steps, and the copy that flexes.
 *
 * Ten since PORT-18 (2026-09-03): the ingestion step leads. Its title and
 * intro come from the pack like step 4's do, and every count downstream is
 * `stepCountFor`, never a literal.
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
 *
 * **Keys are storage and never change.** The first five are the v2 doc's list
 * and every engagement answered before 2026-09-03 stores one of them; a
 * renamed key would orphan that answer. Widened that day at Taylor's request
 * ("modelling, DJing, performing arts, musician, photography — including but
 * not limited to"). The `music` label narrowed at the same time, because
 * "Music or performance" overlapped both new performance rows; its key stays.
 *
 * **Only `film` has a copy pack**, and that is not an oversight to fix by
 * adding keys to `DISCIPLINE_FLAVOURS`. A discipline earns a pack when someone
 * writes one; every other discipline reads generic, which is the honest floor
 * (D-PORT-5). Nothing here feeds the taste gallery either — `examplesFor` is
 * keyed by pack, so a DJ and a ceramicist both meet the generic set until a
 * set of their own is curated.
 *
 * The labels on the six new rows and the narrowed `music` label are
 * `[COPY — pending Taylor]`; the other five are v2, verbatim.
 */
export const SHOWCASE_DISCIPLINES = [
  { key: "film", label: "Film or video" }, // (v2)
  { key: "photography", label: "Photography" }, // (v2)
  { key: "design", label: "Design" }, // (v2)
  { key: "illustration", label: "Illustration or fine art" }, // (v2)
  // [COPY — pending Taylor] — was "Music or performance" (v2); see above.
  { key: "music", label: "Music — playing, producing, composing" },
  // [COPY — pending Taylor] — every row below.
  { key: "dj", label: "DJing" },
  { key: "performing", label: "Performing arts — dance, theatre, flow" },
  { key: "modelling", label: "Modelling" },
  { key: "fashion", label: "Fashion, styling, or makeup" },
  { key: "craft", label: "Craft — ceramics, textiles, woodwork" },
  { key: "writing", label: "Writing" },
] as const;

export type ShowcaseDisciplineKey =
  (typeof SHOWCASE_DISCIPLINES)[number]["key"];

/**
 * Which disciplines have a pack of their own. Everything absent is generic.
 *
 * This map only ever answers a *portfolio* engagement's question. Every other
 * kind names its pack outright in `showcase-kinds.ts` and never consults a
 * discipline (D-PORT-8).
 */
const DISCIPLINE_FLAVOURS: Partial<
  Record<ShowcaseDisciplineKey, ShowcaseFlavour>
> = {
  film: "film",
};

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
  const pack = resolvePack(flavour);

  return [
    {
      key: "ingest",
      number: 1,
      title: pack.ingestion.title,
      intro: pack.ingestion.intro,
    },
    { key: "about", number: 2, title: "About you" },
    {
      key: "audience",
      number: 3,
      title: "Who this site is for",
      intro: pack.audienceIntro,
    },
    {
      key: "experience",
      number: 4,
      title: "Experience and proof",
      intro:
        "Think of this as the LinkedIn layer: positions, memberships, ongoing roles — the timeline your career sits on. The individual films and projects that timeline produced come in the next step. This one is where you've worked, taught, founded, and belonged.",
    },
    {
      key: "work",
      number: 5,
      title: pack.workTitle,
      intro: `${pack.workIntroLead} ${pack.workIntroTail}`,
    },
    {
      key: "taste",
      number: 6,
      title: "Taste",
      intro:
        "This is how we skip the part where a designer shows you three drafts you don't like. Below are real sites from across the whole spectrum. Go with your gut — the pattern in your reactions is what we're after.",
    },
    {
      key: "words",
      number: 7,
      title: "Your words",
      intro:
        "Most bios read like a stranger wrote them in a hurry. This step is how we make the site sound like you.",
    },
    {
      key: "media",
      number: 8,
      title: "Media",
      intro:
        "Project images live with their projects back in step 4. This step is everything else — and original files beat compressed copies every time.",
    },
    {
      key: "site",
      number: 9,
      title: "The site itself",
      intro:
        "The shape of the thing — what pages exist and what each one is for. Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged. Project detail pages don't count — they come with the work section.",
    },
    { key: "access", number: 10, title: "Accounts and access" },
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

/**
 * The subject a third-person example uses before we know the client's name.
 *
 * They/them, and therefore the plain verb — "They make…", never "They makes…".
 * That is why the pack stores `personVerb` and `personVerbThird` separately.
 */
const UNNAMED_SUBJECT = "They";

/** One option on step 6's person-voice question. */
export type PersonVoiceOption = { value: string; label: string };

/**
 * Step 6's person-voice options, written with this client's own name.
 *
 * The third option used to name one client, shipped to every client, on a track
 * sold to consultants and ventures as well as filmmakers. The name is now the
 * one on step 1 and the verb is the copy pack's, so no client reads another
 * client's name and no non-film client reads a film verb (D-PORT-14).
 *
 * A blank name is the ordinary case, not an edge one: step 6 comes five steps
 * after step 1 and every field on this form is optional. It renders the pronoun
 * rather than an empty quotation, which is what an interpolation that assumed a
 * name would leave behind.
 */
export function personVoiceOptions(
  flavour: ShowcaseFlavour,
  displayName?: string,
): readonly PersonVoiceOption[] {
  const pack = resolvePack(flavour);
  const name = displayName?.trim();

  return [
    {
      value: "first",
      label: `First — "${pack.personSubject} ${pack.personVerb}…"`,
    },
    {
      value: "third",
      label: name
        ? `Third — "${name} ${pack.personVerbThird}…"`
        : `Third — "${UNNAMED_SUBJECT} ${pack.personVerb}…"`,
    },
    { value: "unsure", label: "Not sure — you pick" },
  ];
}
