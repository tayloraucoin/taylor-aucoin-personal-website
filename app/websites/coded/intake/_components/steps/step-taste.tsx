"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExampleGroup, ExampleSet } from "@/content/intake-examples";
import { GROUP_ORDER } from "@/content/intake-examples/taxonomy";
import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { picksOf, TASTE_PICKS_ASKED } from "@/lib/intake/taste-picks";
import { copyPackFor } from "@/lib/intake/tracks";
import type {
  TastePick,
  TasteReference,
} from "@/lib/validators/showcase-intake";
import {
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { TextField } from "../../../../intake/_components/text-field";
import {
  useReportFooterNote,
  useReportSaveState,
} from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExampleRow } from "../taste/example-row";
import { GalleryOverlay } from "../taste/gallery-overlay";
import { MotionNotice } from "../taste/motion-notice";
import type { Pick } from "../taste/pick-block";
import { ReferenceList } from "../taste/reference-list";
import { StyleSearch } from "../taste/style-search";
import { TasteGroup } from "../taste/taste-group";
import { YourPicks } from "../taste/your-picks";

/** How long the met-the-ask line holds the footer before it hands the slot back. */
const MET_LINGER_MS = 6000;

/**
 * Step 6 — Taste.
 *
 * The step the whole deliverable's design signal comes from, rebuilt around one
 * idea: **the picks are the brief.** Asked "dark or light?" a client answers
 * honestly and it tells us nothing; shown twenty sites they react in seconds,
 * and the pattern in those reactions — with a sentence attached to each — is
 * what a first look can actually be built from.
 *
 * So five questions retired (D-PORT-20) and their signal is now carried by
 * tags on the things people react to. What is left is the gallery, the three
 * words, the sites they found themselves, their images, and the brain dump.
 *
 * ## What this step will not do
 *
 * **Continue is never disabled, at any count.** Five is an ask, stated once
 * above the picks list and counted honestly in the footer — never a gate
 * (D-INT-4, held by Taylor on 2026-09-03 against his own "required for submit"
 * phrasing, with the abandonment cost stated). No meter, no colour that
 * escalates, no "great progress".
 *
 * **Nothing here out-dresses Continue.** No ring, no gradient, no lift on any
 * row, scale, or button. The gallery is the instrument, not the exhibit.
 */
/**
 * What a client reads when the gallery for their kind of build is not being
 * shown — an absence, never an empty grid (D-PORT-12).
 *
 * Exported because `/admin/intake/examples` quotes it verbatim beside the pack
 * switch, so the consequence of leaving a set unpublished is shown to Taylor in
 * the client's own words rather than described in the admin's. **One home**: it
 * is read there, never transcribed, so Taylor's human-hand copy pass changes
 * both at once (D-ADM-6's law, applied to a string that now has two readers).
 *
 * [COPY — pending Taylor]
 */
export const TASTE_ABSENT_LINE =
  "The example sites for this kind of build are still being chosen. Skip that part for now; everything below still counts, and we'll look at sites together on the call.";

export function StepTaste({
  token,
  initial,
  flavour,
  gallery,
  files,
  purchasedExtras = [],
  motion,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  /** This pack's example sites, and whether they are fit to show (D-PORT-12). */
  gallery: ExampleSet;
  files: { inspiration: readonly ExistingFile[] };
  /**
   * What this engagement paid for on the pay screen, in the extras vocabulary.
   *
   * Empty in a preview, which buys nothing — the review surface reaches these
   * blocks through document mode instead, where `Reveal` renders every branch
   * under a line naming what opens it.
   */
  purchasedExtras?: readonly string[];
  /**
   * What the motion add-on costs and what Stripe just sent them back with.
   *
   * Resolved by the page rather than here: a price comes from the live
   * catalogue and a return flag from the URL, and neither is a thing a client
   * component should be trusted to work out for itself.
   */
  motion: {
    priceCents: number | null;
    currency: string;
    returned?: "added" | "canceled";
  };
}) {
  const form = useStepAutosave({ token, stepKey: "taste", initial });
  useReportSaveState(form.state, form.retry);

  const pack = copyPackFor(flavour);
  /**
   * An uncurated set is an absence, not an empty grid (D-PORT-12) — and it is
   * memoised because the `[]` it falls back to is a fresh array every render,
   * which would rebuild the grouping and the order map on every keystroke.
   */
  const sites = useMemo(
    () => (gallery.curated ? gallery.sites : []),
    [gallery],
  );
  const picks = picksOf(form.values);

  const [openGroups, setOpenGroups] = useState<ReadonlySet<ExampleGroup>>(
    new Set(),
  );
  /** The site the picks list sent them back to, if any. Presentation only. */
  const [editing, setEditing] = useState<string | null>(null);

  /** Gallery order, groups with nothing in them absent rather than empty. */
  const groups = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        sites: sites.filter((site) => site.group === group),
      })).filter((entry) => entry.sites.length > 0),
    [sites],
  );

  /**
   * The whole gallery in one list, group order preserved.
   *
   * The overlay pages across every site rather than within a group, so a client
   * can flip through everything in one sitting; the eyebrow names the group so
   * they always know where they are. This is also the order `orderOf` sorts
   * picks into, so the picks list, the gallery, and the overlay all agree.
   */
  const flat = useMemo(() => groups.flatMap((entry) => entry.sites), [groups]);

  /** Which site the overlay is showing, if it is open. Presentation only. */
  const [viewing, setViewing] = useState<number | null>(null);

  const orderOf = useMemo(() => {
    const index = new Map(sites.map((site, i) => [site.key, i]));
    return (key: string) => index.get(key) ?? Number.MAX_SAFE_INTEGER;
  }, [sites]);

  const pickFor = (key: string) => picks.find((p) => p.siteKey === key) ?? null;

  /**
   * Writes one pick, keeping the list in gallery order.
   *
   * Through the updater form, because two rows saved in the same tick would
   * otherwise both compute from the array this render closed over and the
   * second would discard the first (M-PORT-17 — the bug this exact surface
   * shipped once).
   *
   * The base is `picksOf`, not the raw stored value, so the first edit a client
   * makes on a pre-2026-09-03 engagement materialises their whole legacy
   * favourites list into `picks` rather than replacing it with one entry. That
   * is the only moment the derivation is ever written, and the client's own
   * action is what writes it.
   */
  const savePick = (siteKey: string, next: Pick) => {
    form.setValue("picks", (previous: unknown) => {
      const base = Array.isArray(previous)
        ? (previous as TastePick[])
        : picksOf(form.values);

      return [
        ...base.filter((p) => p.siteKey !== siteKey),
        { siteKey, ...next },
      ]
        .slice()
        .sort((a, b) => orderOf(a.siteKey) - orderOf(b.siteKey));
    });
    form.flush();
  };

  const removePick = (siteKey: string) => {
    form.setValue("picks", (previous: unknown) => {
      const base = Array.isArray(previous)
        ? (previous as TastePick[])
        : picksOf(form.values);
      return base.filter((p) => p.siteKey !== siteKey);
    });
    form.flush();
  };

  const editPick = (siteKey: string) => {
    const site = sites.find((s) => s.key === siteKey);
    if (site) setOpenGroups((current) => new Set(current).add(site.group));
    setEditing(siteKey);
  };

  /**
   * The count, in the footer's own slot rather than a second bar.
   *
   * A bar above the footer would spend a fifth of a 375px viewport on chrome to
   * say one number. This says the same number in the space the next-step line
   * was using, and hands the slot back once the ask is met — the count exists
   * to answer "where am I", and once the answer is "done" it stops asking.
   */
  const met = picks.length >= TASTE_PICKS_ASKED;
  const [lingering, setLingering] = useState(false);

  useEffect(() => {
    if (!met) return;
    setLingering(true);
    const timer = setTimeout(() => setLingering(false), MET_LINGER_MS);
    return () => clearTimeout(timer);
  }, [met]);

  useReportFooterNote(
    sites.length === 0 || (met && !lingering) ? null : (
      <p
        // Announced once, when the ask is met. Announcing every increment would
        // make a screen reader count out loud through a whole gallery.
        aria-live={met ? "polite" : "off"}
        className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
      >
        Picked ·{" "}
        <span className="text-(--color-c2)">
          {/* Clamped, so the met state reads "5 of 5" rather than "6 of 5" —
              a count that overshoots its own denominator reads as broken, and
              this line's whole job is to be a plain fact. */}
          {Math.min(picks.length, TASTE_PICKS_ASKED)} of {TASTE_PICKS_ASKED}
        </span>
      </p>
    ),
  );

  const references = Array.isArray(form.values.references)
    ? (form.values.references as TasteReference[])
    : [];

  /**
   * Presses a search result into the client's own list.
   *
   * Through the updater form for the same reason every array write on this step
   * is (M-PORT-17), and marked `source: "search"` so the intake document can
   * say where a link came from. This is the only thing the search writes, and
   * the client's own press is what writes it.
   */
  const addReference = (url: string) => {
    form.setValue("references", (previous: unknown) => {
      const base = Array.isArray(previous)
        ? (previous as TasteReference[])
        : [];
      if (base.some((entry) => entry.url?.trim() === url)) return base;
      return [...base, { entryKey: mintEntryKey(), url, source: "search" }];
    });
    form.flush();
  };

  return (
    <>
      {sites.length === 0 ? (
        <p className="mb-10 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-dim)">
          {TASTE_ABSENT_LINE}
        </p>
      ) : (
        <div className="mb-10">
          {groups.map(({ group, sites: rows }) => (
            <TasteGroup
              key={group}
              group={group}
              count={rows.length}
              picked={rows.filter((site) => pickFor(site.key)).length}
              open={openGroups.has(group)}
              onToggle={() =>
                setOpenGroups((current) => {
                  const next = new Set(current);
                  if (next.has(group)) next.delete(group);
                  else next.add(group);
                  return next;
                })
              }
            >
              {rows.map((site, index) => (
                <ExampleRow
                  key={site.key}
                  site={site}
                  pick={pickFor(site.key)}
                  onSave={(next) => savePick(site.key, next)}
                  onRemove={() => removePick(site.key)}
                  priority={index === 0}
                  autoEdit={editing === site.key}
                  onEdited={() => setEditing(null)}
                  onSeeMore={() =>
                    setViewing(flat.findIndex((s) => s.key === site.key))
                  }
                />
              ))}
            </TasteGroup>
          ))}
        </div>
      )}

      {viewing !== null ? (
        <GalleryOverlay
          sites={flat}
          index={viewing}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
          pickFor={pickFor}
          onSave={savePick}
          onRemove={removePick}
        />
      ) : null}

      {/* Absent until the first pick, never an empty list telling someone they
          have not done something yet (PORT-7's law, kept). */}
      {sites.length > 0 && picks.length > 0 ? (
        <YourPicks
          picks={picks}
          siteFor={(key) => sites.find((site) => site.key === key)}
          onEdit={editPick}
        />
      ) : null}

      {/* Three boxes, not one comma-separated field — the v2 doc's own shape,
          and three answers rather than one list is what it gets you.

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
              value={
                typeof form.values[name] === "string"
                  ? (form.values[name] as string)
                  : ""
              }
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

      {/* Moved from the media step, where it sat among the logo and the file
          drops and read as an asset question (Taylor, 2026-09-04). It belongs
          with the words above it, and ahead of the style search below, which
          reads this cluster. */}
      <TextAnswer
        form={form}
        name="coloursYouLike"
        label="Colours you're drawn to"
      />

      <StyleSearch
        token={token}
        brief={
          typeof form.values.styleBrief === "string"
            ? (form.values.styleBrief as string)
            : ""
        }
        onBrief={(next) => form.setValue("styleBrief", next)}
        onBlur={form.flush}
        onAdd={addReference}
      />

      <section className="mt-12 border-t border-(--color-faint) pt-7">
        <h2 className="mb-6 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
          Everything else
        </h2>

        <Field
          id="f-references"
          label="Sites you've found"
          // [COPY — pending Taylor] — says plainly that none is a fine answer,
          // because the list no longer opens a card to imply otherwise.
          help="Only if you've got some. No need to go hunting. One link each, and the same two questions we asked about ours."
        >
          <ReferenceList
            references={references}
            onChange={(next) => form.setValue("references", next)}
            onBlur={form.flush}
          />
        </Field>

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
          name="brainDump"
          label="The brain dump"
          // [COPY — draft] — absorbs the retired close-a-tab question's clause.
          help="Tell us as much as you can about what you're picturing — the home page, and then everything past it: how a project page should feel, what the about page should do, what happens when someone lands on a phone. If you've said it above, say it again here in your own words; if something makes you close a tab instantly, this is where that goes. Half-formed is fine."
        />
      </section>

      {/* The one commercial moment, last so a price never colours a reaction. */}
      <MotionNotice
        token={token}
        form={form}
        extras={purchasedExtras}
        block={pack.upsells.animations}
        priceCents={motion.priceCents}
        currency={motion.currency}
        returned={motion.returned}
      />
    </>
  );
}
