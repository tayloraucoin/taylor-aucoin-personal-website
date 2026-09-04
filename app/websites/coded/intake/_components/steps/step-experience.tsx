"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import type {
  ExperienceEntry,
  PersonEntry,
  PersonProof,
} from "@/lib/validators/showcase-intake";
import { LongAnswer } from "../../../../intake/_components/answer-inputs";
import {
  CheckAnswer,
  CheckRow,
} from "../../../../intake/_components/check-answer";
import { Field } from "../../../../intake/_components/field";
import { MachineFilledEntry } from "../../../../intake/_components/machine-filled";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { TextArea, TextField } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExtractionBlock } from "../extraction-block";
import { PersonProofCard } from "../person-proof";

/**
 * The help line under an experience block, verbatim from the v2 doc § Step 3.
 *
 * A module constant now rather than a literal at the one call site, because
 * there are two call sites: a roster kind renders this block once per person
 * and once more for the organisation itself, and the same sentence typed twice
 * is the same sentence that ends up saying two different things.
 */
const EXPERIENCE_HELP = `Positions, ongoing roles, things you founded, programs you run. "Feature this" marks the ones that should be impossible to miss.`;

function asEntries(value: unknown): ExperienceEntry[] {
  return Array.isArray(value) ? (value as ExperienceEntry[]) : [];
}

function asProof(value: unknown): Record<string, PersonProof> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, PersonProof>)
    : {};
}

/**
 * The roster person an entry belongs to, or undefined for the thing itself.
 *
 * An empty string and an absent key mean the same thing and must sort into the
 * same bucket, or an entry saved before the field existed would render in a
 * group of its own that nobody can see.
 */
function ownerOf(entry: ExperienceEntry): string | undefined {
  const key = entry.personKey?.trim();
  return key ? key : undefined;
}

/**
 * True when an entry holds anything at all.
 *
 * The repeatable block always renders one empty card as an invitation, and
 * that card is not an answer. Dropping the empties before appending extracted
 * entries stops a blank row wedging itself between two real ones.
 */
function hasContent(entry: ExperienceEntry): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

/**
 * One list of positions, for one owner.
 *
 * Extracted from the step so a roster kind can render it per person without
 * the entry's five placeholders and its "Feature this" label existing more
 * than once — the same reason `HowToReach` came out of step 8.
 *
 * `idPrefix` is load-bearing rather than tidy: element ids must be unique in a
 * document, and before this the fields were keyed on the entry's index alone.
 * Two people each with a first entry both produced `f-exp-what-0`, which
 * points every one of those labels at the first person's input — the exact
 * bug `FileDrop` already carries a note about.
 */
function ExperienceEntries({
  idPrefix,
  label,
  help,
  pack,
  items,
  onChange,
  onBlur,
}: {
  idPrefix: string;
  label: string;
  help: string;
  pack: ReturnType<typeof copyPackFor>;
  items: readonly ExperienceEntry[];
  onChange: (next: readonly ExperienceEntry[]) => void;
  onBlur: () => void;
}) {
  return (
    <Field id={`f-experience-${idPrefix}`} label={label} help={help}>
      <RepeatableBlock<ExperienceEntry>
        items={items as ExperienceEntry[]}
        onChange={onChange}
        emptyItem={() => ({ entryKey: mintEntryKey() })}
        addLabel="Add another"
        renderItem={(item, index, update) => (
          <>
            {/* Once per entry, above the fields, because the run writes a
                whole entry at once and that is what the client reads. */}
            <MachineFilledEntry entryKey={item.entryKey} entry={item} />
            <div className="space-y-3">
            <TextField
              id={`f-exp-what-${idPrefix}-${index}`}
              value={item.what ?? ""}
              onChange={(e) => update({ ...item, what: e.target.value })}
              onBlur={onBlur}
              placeholder={pack.experienceWhatPlaceholder}
            />
            <TextField
              id={`f-exp-where-${idPrefix}-${index}`}
              value={item.where ?? ""}
              onChange={(e) => update({ ...item, where: e.target.value })}
              onBlur={onBlur}
              placeholder={pack.experienceWherePlaceholder}
            />
            <TextField
              id={`f-exp-when-${idPrefix}-${index}`}
              value={item.when ?? ""}
              onChange={(e) => update({ ...item, when: e.target.value })}
              onBlur={onBlur}
              placeholder="2019–now"
            />
            <TextArea
              id={`f-exp-about-${idPrefix}-${index}`}
              value={item.about ?? ""}
              onChange={(e) => update({ ...item, about: e.target.value })}
              onBlur={onBlur}
              placeholder="A sentence or two — or leave it and we'll ask"
            />
            <TextField
              id={`f-exp-category-${idPrefix}-${index}`}
              value={item.category ?? ""}
              onChange={(e) => update({ ...item, category: e.target.value })}
              onBlur={onBlur}
              placeholder={pack.experienceCategoryPlaceholder}
            />

            <CheckRow
              bare
              checked={item.feature === true}
              onChange={(next) => {
                update({ ...item, feature: next });
                onBlur();
              }}
            >
              Feature this
            </CheckRow>
            </div>
          </>
        )}
      />
    </Field>
  );
}

/**
 * Step 3 — Experience and proof.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 3,
 * verbatim.
 *
 * This is the LinkedIn layer: positions, memberships, ongoing roles. The films
 * and projects those produced are step 4's, and the step intro says so — the
 * distinction is the one thing clients get wrong here, so both steps name it
 * explicitly rather than relying on the titles.
 *
 * "Feature this" is a checkbox with words, not a star. A star means whatever
 * the person looking at it assumes; the label says what it does.
 *
 * **Where there is a roster, this step is per person.** A studio, a venture, or
 * a business named its people on step 1, and one shared timeline credited the
 * organisation for whatever the best entry on it was. Each person now gets
 * their own positions, their own awards and press, and their own links — and
 * the organisation keeps a record of its own beneath them (Taylor,
 * 2026-09-03). A portfolio or a practice has one subject and one list, exactly
 * as before.
 *
 * The grouping lives in a `personKey` on each entry rather than in a nested
 * array per person, so the extractor, the intake document, and every existing
 * answer still see one flat list of positions. An entry whose key no longer
 * matches anybody simply stops being grouped; nothing is deleted.
 */
export function StepExperience({
  token,
  initial,
  flavour,
  people = [],
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  /**
   * Step 1's roster, read from the engagement's answers by the route.
   *
   * A prop rather than a second autosave hook: `saveStepAnswers` replaces a
   * step's object wholesale, so two hooks on one step key erase each other and
   * nothing here may hold a form over the roster's own step. This is
   * read-only, and the roster is edited in exactly one place.
   */
  people?: readonly PersonEntry[];
}) {
  const pack = copyPackFor(flavour);
  const form = useStepAutosave({ token, stepKey: "experience", initial });
  useReportSaveState(form.state, form.retry);

  const entries = asEntries(form.values.experience);
  const proof = asProof(form.values.personProof);

  // Unnamed roster cards are half-typed invitations, not people. Grouping
  // experience under a blank heading would be worse than not grouping it.
  const named = people.filter((person) => person.name?.trim());

  /**
   * Replaces one owner's slice of the flat array, leaving every other entry
   * exactly as it was.
   *
   * The updater form is not decoration: two groups can be edited in one React
   * tick, and a plain value computed from this render's `entries` would have
   * the second write silently discard the first — the same bug the taste
   * step's favourites had before `setValue` learned to take a function.
   */
  const replaceFor =
    (owner: string | undefined) => (next: readonly ExperienceEntry[]) =>
      form.setValue("experience", (current: unknown) => [
        ...asEntries(current).filter((entry) => ownerOf(entry) !== owner),
        ...next.map((entry) => ({ ...entry, personKey: owner })),
      ]);

  const setProof = (entryKey: string, next: PersonProof) =>
    form.setValue("personProof", (current: unknown) => ({
      ...asProof(current),
      [entryKey]: next,
    }));

  return (
    <>
      <ExtractionBlock
        token={token}
        mode="experience"
        intro={pack.experiencePasteIntro}
        afterLine="Entries appear below, filled in. Fix anything we got wrong — nothing saves as fact until you've seen it."
        value={
          typeof form.values.fastWay === "string" ? form.values.fastWay : ""
        }
        onChange={(next) => form.setValue("fastWay", next)}
        onBlur={form.flush}
        // Appends. A second run never touches an entry already on screen —
        // including one the client has just corrected.
        onEntries={(incoming) =>
          form.setValue("experience", [
            ...asEntries(form.values.experience).filter(hasContent),
            ...(incoming as unknown as ExperienceEntry[]),
          ])
        }
      />

      {/*
        One person, one background — but only where there is a roster to group
        by. A portfolio or a practice has exactly one subject, so the flat
        block below is the whole step for them and this renders nothing, which
        is the same shape the step has always had (Taylor, 2026-09-03).
      */}
      {named.length > 0 ? (
        <>
          <p className="mb-7 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            {pack.personProof.intro}
          </p>

          {named.map((person) => (
            <PersonProofCard
              key={person.entryKey}
              name={person.name!.trim()}
              role={person.role?.trim()}
              proof={proof[person.entryKey] ?? {}}
              linksLabel={pack.personProof.linksLabel}
              linksHelp={pack.personProof.linksHelp}
              awardsLabel={pack.personProof.awardsLabel}
              pressLabel={pack.personProof.pressLabel}
              onChange={(next) => setProof(person.entryKey, next)}
              onBlur={form.flush}
            >
              <ExperienceEntries
                idPrefix={person.entryKey}
                label="Their experience"
                help={EXPERIENCE_HELP}
                pack={pack}
                items={entries.filter(
                  (entry) => ownerOf(entry) === person.entryKey,
                )}
                onChange={replaceFor(person.entryKey)}
                onBlur={form.flush}
              />
            </PersonProofCard>
          ))}
        </>
      ) : null}

      <ExperienceEntries
        idPrefix="shared"
        label={
          named.length > 0 ? pack.personProof.sharedLabel : "Your experience"
        }
        help={named.length > 0 ? pack.personProof.sharedHelp : EXPERIENCE_HELP}
        pack={pack}
        items={entries.filter((entry) => ownerOf(entry) === undefined)}
        onChange={replaceFor(undefined)}
        onBlur={form.flush}
      />

      <LongAnswer
        form={form}
        name="awards"
        label={pack.awards.label}
        help={pack.awards.help}
      />

      <LongAnswer
        form={form}
        name="press"
        label="Press"
        help="Reviews, interviews, write-ups. Paste quotes or links."
      />

      <LongAnswer
        form={form}
        name="kindWords"
        label="Kind words"
        help={pack.kindWordsHelp}
      />

      {/* Unchecked by default, always. A platform once auto-generated eleven
          fabricated customers for a real business; nothing goes on a site as a
          quote without a named, real, consenting source. */}
      <CheckAnswer
        form={form}
        name="publishPermission"
        label="Can we publish those?"
      >
        Yes — these are real, and the people who said them would be fine seeing
        them on my site.
      </CheckAnswer>

      <LongAnswer
        form={form}
        name="notableNames"
        label="Notable names"
        help={`Clients, companies, or people you've worked with that carry weight — and, honestly, whether you're allowed to say so publicly. "Worked with them, can't name them" is useful to know too.${
          pack.notableNamesHelpSuffix ? ` ${pack.notableNamesHelpSuffix}` : ""
        }`}
      />
    </>
  );
}
