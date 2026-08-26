"use client";

import { examplesFor } from "@/content/intake-examples";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import type { TasteFavourite } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { TextField } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExampleCard } from "../example-card";
import { FavouritesRank } from "../favourites-rank";

const DARK_OR_LIGHT = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "either", label: "Could go either way" },
] as const;

const STILLNESS = [
  { value: "still", label: "Dead still — nothing moves" },
  { value: "quiet", label: "Quiet — small, settled movement" },
  { value: "alive", label: "Alive — motion is part of the personality" },
] as const;

const DENSITY = [
  { value: "sparse", label: "Almost nothing — one thing at a time" },
  { value: "balanced", label: "Balanced" },
  { value: "rich", label: "Rich — I like density" },
] as const;

function asFavourites(value: unknown): TasteFavourite[] {
  return Array.isArray(value) ? (value as TasteFavourite[]) : [];
}

function asNotes(value: unknown): Record<string, string> {
  return value && typeof value === "object"
    ? (value as Record<string, string>)
    : {};
}

/**
 * Step 5 — Taste.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 5,
 * verbatim.
 *
 * This step treats the client as a peer with reactions worth trusting, not a
 * respondent to be surveyed — which is why there is no rating anywhere on it.
 * A five-star average of someone's taste is a number nobody can design from;
 * what a designer can use is which handful they kept, in what order, and why.
 *
 * The ranked list is **absent** until the first favourite exists, rather than
 * present and empty. An empty state that says "no favourites yet" is a form
 * telling someone they have not done something.
 *
 * Zero favourites is a legitimate way to finish this step. The notes, the
 * preference answers, and the brain dump all carry signal on their own, and
 * the done screen's skipped list covers the rest.
 */
export function StepTaste({
  token,
  initial,
  flavour,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  files: { inspiration: readonly ExistingFile[] };
}) {
  const form = useStepAutosave({ token, stepKey: "taste", initial });
  useReportSaveState(form.state, form.retry);

  const sites = examplesFor(flavour);
  const favourites = asFavourites(form.values.favourites);
  const notes = asNotes(form.values.notes);

  const favouriteFor = (key: string) =>
    favourites.find((f) => f.siteKey === key);

  /** A card's note lives with the favourite once ranked, in `notes` before. */
  const noteFor = (key: string) => favouriteFor(key)?.note ?? notes[key] ?? "";

  const setNote = (key: string, next: string) => {
    if (favouriteFor(key)) {
      form.setValue("favourites", (previous: unknown) =>
        asFavourites(previous).map((f) =>
          f.siteKey === key ? { ...f, note: next } : f,
        ),
      );
      return;
    }
    form.setValue("notes", (previous: unknown) => ({
      ...asNotes(previous),
      [key]: next,
    }));
  };

  /**
   * Favourite or unfavourite, computed from the freshest list rather than the
   * one this render closed over — two toggles in the same tick would otherwise
   * both start from the same array and the second would discard the first.
   *
   * Unfavouriting keeps the note. "This one, but not the type" is a real
   * instruction whether or not the site made the shortlist.
   */
  const toggle = (key: string) => {
    const existing = favouriteFor(key);
    const wasFavourite = Boolean(existing);
    // The note travels with the site in both directions, so neither move
    // costs the client something they wrote.
    const carried = wasFavourite ? existing?.note : notes[key];

    form.setValue("favourites", (previous: unknown) => {
      const list = asFavourites(previous);
      return wasFavourite
        ? list.filter((f) => f.siteKey !== key)
        : [...list, { siteKey: key, ...(carried ? { note: carried } : {}) }];
    });

    form.setValue("notes", (previous: unknown) => {
      const map = { ...asNotes(previous) };
      // The note lives in exactly one place at a time: on the favourite while
      // it is ranked, in this map while it is not.
      if (wasFavourite) {
        if (carried) map[key] = carried;
      } else {
        delete map[key];
      }
      return map;
    });

    form.flush();
  };

  return (
    <>
      <ul className="mb-10 grid gap-4 sm:grid-cols-2">
        {sites.map((site, index) => (
          <ExampleCard
            key={site.key}
            site={site}
            favourited={Boolean(favouriteFor(site.key))}
            note={noteFor(site.key)}
            onToggle={() => toggle(site.key)}
            onNote={(next) => setNote(site.key, next)}
            onBlur={form.flush}
            priority={index < 2}
          />
        ))}
      </ul>

      {favourites.length > 0 ? (
        <section className="mb-10 border-t border-(--color-faint) pt-7">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
            Your favourites
          </h2>

          <FavouritesRank
            favourites={favourites}
            siteFor={(key) => sites.find((s) => s.key === key)}
            onChange={(next) => form.setValue("favourites", next)}
            onBlur={form.flush}
          />
        </section>
      ) : null}

      <ChoiceAnswer
        form={form}
        name="darkOrLight"
        label="Dark or light?"
        // The v2 doc's only variant here is a photography/art one that has not
        // been written, so both packs read the base string. When that variant
        // exists it joins the copy pack rather than branching here.
        help="Most film sites run dark so the footage glows. Yours doesn't have to."
        options={DARK_OR_LIGHT}
      />

      <ChoiceAnswer
        form={form}
        name="stillness"
        label="How still should it be?"
        options={STILLNESS}
      />

      <ChoiceAnswer
        form={form}
        name="density"
        label="How much on screen at once?"
        options={DENSITY}
      />

      {/* Three boxes, not one comma-separated field — the spec's own shape, and
          three answers rather than one list is what it gets you.

          Each input carries its own accessible name. The group label above
          them names the question; without a per-box name a screen reader
          announces three identical unlabelled fields. */}
      <Field
        id="f-wordOne"
        label="Three words the site should feel like"
        help="One per box."
      >
        <div className="space-y-2.5">
          {(
            [
              ["wordOne", "First word"],
              ["wordTwo", "Second word"],
              ["wordThree", "Third word"],
            ] as const
          ).map(([name, aria]) => (
            <TextField
              key={name}
              id={`f-${name}`}
              aria-label={aria}
              helpId="f-wordOne-help"
              value={typeof form.values[name] === "string" ? (form.values[name] as string) : ""}
              onChange={(event) => form.setValue(name, event.target.value)}
              onBlur={form.flush}
            />
          ))}
        </div>
      </Field>

      <TextAnswer
        form={form}
        name="neverFeelLike"
        label="And one thing it must never feel like"
      />

      <Field
        id="f-inspiration"
        label="Anything else that's caught your eye"
        help="Screenshots you've saved, posters, album covers, a photo of a book jacket — anything whose look you'd steal."
      >
        <FileDrop
          token={token}
          stepKey="taste"
          fieldKey="inspiration"
          label="Add images"
          multiple
          existing={files.inspiration}
        />
      </Field>

      <LongAnswer
        form={form}
        name="linksWorthALook"
        label="Links worth a look"
        help="Sites, videos, profiles, Pinterest boards — paste anything you'd want us to see, from any field."
      />

      <LongAnswer
        form={form}
        name="brainDump"
        label="The brain dump"
        help={`Everything about look and feel that the questions above didn't catch. Half-formed is fine — "I like when the type is huge" is a real instruction.`}
      />

      <LongAnswer
        form={form}
        name="closeTab"
        label="Anything that makes you close a tab instantly?"
        help="Pet hates. Autoplay music, tiny grey text, whatever it is."
      />
    </>
  );
}
