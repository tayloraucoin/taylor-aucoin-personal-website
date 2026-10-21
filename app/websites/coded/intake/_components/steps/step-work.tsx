"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import {
  entryRichness,
  mergeIncomingEntries,
  standardListActions,
} from "@/lib/intake/entry-merge";
import type { ShowcaseKind, VentureType } from "@/lib/intake/showcase-kinds";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor, workShapeFor } from "@/lib/intake/tracks";
import type {
  AskEntry,
  OfferingEntry,
  PieceEntry,
  ProjectEntry,
  ServiceEntry,
} from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import type { ExistingFile } from "../../../../intake/_components/file-drop";
import { InkCluster } from "../../../../intake/_components/ink-cluster";
import { MachineFilledEntry } from "../../../../intake/_components/machine-filled";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { Reveal } from "../../../../intake/_components/reveal";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { AskEntryCard } from "../ask-entry";
import { ExtractionBlock } from "../extraction-block";
import { fills, ForKinds, ForKindsStub, hasGroup } from "../for-kinds";
import { OfferingEntryCard } from "../offer-entry";
import { PieceEntryCard } from "../piece-entry";
import { DEFAULT_RIGHTS, ProjectEntryCard } from "../project-entry";
import { ServiceEntryCard } from "../service-entry";
import { TopFive } from "../top-five";

function asProjects(value: unknown): ProjectEntry[] {
  return Array.isArray(value) ? (value as ProjectEntry[]) : [];
}

function asEntries<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Step 4 — The work.
 *
 * Every string is `docs/_legacy/websites/portfolio-intake-questions-v2.md` § Step 4,
 * verbatim, except the two PORT-19 retired: the reel question is gone (a
 * project's primary video and step 9's home block replace it) and the five are
 * ticked from the rows instead of typed into a box.
 *
 * The heaviest screen in the system: unlimited projects, eleven fields each,
 * plus an image drop — on one scrollable screen, because nine steps is a
 * promise and no step sub-paginates (D-INT-5). What makes that survivable is
 * that titled entries collapse to a summary row; see `ProjectEntryCard`.
 *
 * **There is no cap and there never will be one** — not on projects, not on
 * images. A filmmaker with forty pieces is exactly the client this track is
 * for, and a limit would tell them their catalogue is a problem.
 */
export function StepWork({
  token,
  initial,
  flavour,
  kind,
  ventureType,
  projectFiles,
  pieceFiles,
  openEntries = false,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  /** The venture sub-type, or null; see `ventureTypeOf` (VEN). */
  ventureType: VentureType | null;
  /** Every delivered project image, to be grouped by the entry it belongs to. */
  projectFiles: readonly (ExistingFile & { entryKey: string | null })[];
  /** The same, for a venture's pieces. */
  pieceFiles: readonly (ExistingFile & { entryKey: string | null })[];
  /**
   * Harness only: draw each ask card open, so a capture, which cannot
   * click, shows a chosen card's rows (VEN-3 `ask-invest-card`).
   */
  openEntries?: boolean;
}) {
  const form = useStepAutosave({ token, stepKey: "work", initial });
  useReportSaveState(form.state, form.retry);

  const pack = copyPackFor(flavour, ventureType);
  // Which array this kind fills — four keys, never one polymorphic array
  // (M-PORT-23). The map lived here until ADM-4; it is a fact about the kind,
  // so it lives on the kind (M-ADM-7).
  const entryKey = workShapeFor(kind);
  const projects = asProjects(form.values.projects);

  const filesFor = (entryKey: string) =>
    projectFiles.filter((file) => file.entryKey === entryKey);

  const pieceFilesFor = (key: string) =>
    pieceFiles.filter((file) => file.entryKey === key);

  /**
   * Whole-list actions for the ⋮ (PORT-34). The weight makes a copy with
   * images always win Remove duplicates: stills are keyed to the entry, and
   * the entry that holds them is the one to keep however sparse its fields.
   */
  const withFiles =
    (files: (key: string) => readonly unknown[]) =>
    (entry: { entryKey: string }) =>
      1000 * files(entry.entryKey).length;
  const projectActions = standardListActions<ProjectEntry>({
    weight: (entry) => withFiles(filesFor)(entry) + entryRichness(entry),
  });
  const pieceActions = standardListActions<PieceEntry>({
    weight: (entry) => withFiles(pieceFilesFor)(entry) + entryRichness(entry),
  });

  return (
    <>
      {/* The mode follows the kind, and so does the array it fills. Between
          PORT-14 and PORT-17 this ran as "projects" for every kind, which
          quietly stored a venture's extraction under a key its step does not
          render — see DEVIATIONS. */}
      <ExtractionBlock
        token={token}
        mode={entryKey}
        intro={pack.workPasteIntro}
        afterLine="They appear below, filled in as far as the blob allowed. Fix anything we got wrong — nothing saves as fact until you've seen it."
        value={
          typeof form.values.fastWay === "string" ? form.values.fastWay : ""
        }
        onChange={(next) => form.setValue("fastWay", next)}
        onBlur={form.flush}
        // Appends, newest first, minus anything already on the list. A second
        // run never touches an entry already on screen — including one the
        // client has just corrected — and no longer doubles it either.
        onEntries={(incoming) => {
          const { kept, added } = mergeIncomingEntries(
            asEntries<Record<string, unknown>>(form.values[entryKey]),
            incoming.map((entry) => ({
              // Public is the answer for most work and the one a client would
              // otherwise tick a dozen times; the two careful answers stay one
              // click away. Their own value always wins.
              ...(entryKey === "projects" ? { rights: DEFAULT_RIGHTS } : {}),
              ...entry,
            })),
          );
          form.setValue(entryKey, [...kept, ...added]);
        }}
      />

      <ForKinds kind={kind} ventureType={ventureType} test={fills("projects")}>
        <Field id="f-projects" label={pack.workBlockLabel}>
          <RepeatableBlock<ProjectEntry>
            items={projects}
            onChange={(next) => form.setValue("projects", next)}
            reorderable
            keyOf={(entry) => entry.entryKey}
            draggable
            actions={projectActions}
            menuLabel="Actions for your projects"
            emptyItem={() => ({
              entryKey: mintEntryKey(),
              rights: DEFAULT_RIGHTS,
            })}
            addLabel={pack.workAddLabel}
            renderItem={(item, index, update) => (
              <>
                <MachineFilledEntry entryKey={item.entryKey} entry={item} />
                <ProjectEntryCard
                index={index}
                entry={item}
                token={token}
                files={filesFor(item.entryKey)}
                onChange={update}
                onBlur={form.flush}
              />
              </>
            )}
          />
        </Field>
      </ForKinds>

      {/* The three kind-shaped shapes. Each is its own array key, so a kind
          change never re-reads one shape as another (M-PORT-23). */}
      <ForKinds kind={kind} ventureType={ventureType} test={fills("offerings")}>
        <Field id="f-offerings" label={pack.workBlockLabel}>
          <RepeatableBlock<OfferingEntry>
            items={asEntries<OfferingEntry>(form.values.offerings)}
            onChange={(next) => form.setValue("offerings", next)}
            reorderable
            keyOf={(entry) => entry.entryKey}
            draggable
            actions={standardListActions<OfferingEntry>()}
            menuLabel="Actions for this list"
            emptyItem={() => ({ entryKey: mintEntryKey() })}
            addLabel={pack.workAddLabel}
            renderItem={(item, index, update) => (
              <>
                <MachineFilledEntry entryKey={item.entryKey} entry={item} />
                <OfferingEntryCard
                index={index}
                entry={item}
                onChange={update}
                onBlur={form.flush}
              />
              </>
            )}
          />
        </Field>
      </ForKinds>

      <ForKinds kind={kind} ventureType={ventureType} test={fills("pieces")}>
        <Field id="f-pieces" label={pack.workBlockLabel}>
          <RepeatableBlock<PieceEntry>
            items={asEntries<PieceEntry>(form.values.pieces)}
            onChange={(next) => form.setValue("pieces", next)}
            reorderable
            keyOf={(entry) => entry.entryKey}
            draggable
            actions={pieceActions}
            menuLabel="Actions for this list"
            emptyItem={() => ({ entryKey: mintEntryKey() })}
            addLabel={pack.workAddLabel}
            renderItem={(item, index, update) => (
              <>
                <MachineFilledEntry entryKey={item.entryKey} entry={item} />
                <PieceEntryCard
                index={index}
                entry={item}
                token={token}
                files={pieceFilesFor(item.entryKey)}
                kind={kind}
                ventureType={ventureType}
                kindPlaceholder={pack.pieceKindPlaceholder}
                funded={pack.placeVenture?.funded}
                fundedTest={hasGroup("place")}
                onChange={update}
                onBlur={form.flush}
              />
              </>
            )}
          />
        </Field>
      </ForKinds>

      {/* A place venture's size and permits, after the pieces (VEN-2). */}
      {pack.placeVenture ? (
        <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("place")}>
          <>
            <LongAnswer
              form={form}
              name="placeSize"
              label={pack.placeVenture.placeSize.label}
              help={pack.placeVenture.placeSize.help}
            />
            <LongAnswer
              form={form}
              name="permits"
              label={pack.placeVenture.permits.label}
              help={pack.placeVenture.permits.help}
            />
          </>
        </ForKinds>
      ) : (
        <ForKindsStub
          ventureType={ventureType}
          test={hasGroup("place")}
          note="Asked on each piece and after the pieces: whether the piece is funded, size and capacity, and permits. The words are the place overlay's; see kind=venture&subtype=place."
        />
      )}

      <ForKinds kind={kind} ventureType={ventureType} test={fills("services")}>
        <Field id="f-services" label={pack.workBlockLabel}>
          <RepeatableBlock<ServiceEntry>
            items={asEntries<ServiceEntry>(form.values.services)}
            onChange={(next) => form.setValue("services", next)}
            reorderable
            keyOf={(entry) => entry.entryKey}
            draggable
            actions={standardListActions<ServiceEntry>()}
            menuLabel="Actions for this list"
            emptyItem={() => ({ entryKey: mintEntryKey() })}
            addLabel={pack.workAddLabel}
            renderItem={(item, index, update) => (
              <>
                <MachineFilledEntry entryKey={item.entryKey} entry={item} />
                <ServiceEntryCard
                  index={index}
                  entry={item}
                  onChange={update}
                  onBlur={form.flush}
                />
              </>
            )}
          />
        </Field>
      </ForKinds>

      {/* What the site is asking people to do — the gap the audit named (B4).
          Never for a portfolio: its ask is "hire me" and step 8 carries it. */}
      <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("ask")}>
        <Field
          id="f-asks"
          label={pack.ask.blockLabel}
          help={pack.ask.blockHelp}
        >
          <RepeatableBlock<AskEntry>
            items={asEntries<AskEntry>(form.values.asks)}
            onChange={(next) => form.setValue("asks", next)}
            reorderable
            keyOf={(entry) => entry.entryKey}
            draggable
            actions={standardListActions<AskEntry>()}
            menuLabel="Actions for this list"
            emptyItem={() => ({ entryKey: mintEntryKey() })}
            addLabel={pack.ask.addLabel}
            renderItem={(item, index, update) => (
              <AskEntryCard
                index={index}
                entry={item}
                pack={pack}
                kind={kind}
                ventureType={ventureType}
                investTest={hasGroup("raise")}
                initialOpen={openEntries}
                onChange={update}
                onBlur={form.flush}
              />
            )}
          />
        </Field>
      </ForKinds>

      {/* How people apply to a place, under the asks and before the event
          section (VEN-2, D-VEN-12; cut first if the epic runs over). One
          labelled group, its help read with it. No reveal: "Skip this if
          nobody applies" is the whole condition. */}
      {pack.placeVenture ? (
        <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("place")}>
          <div
            role="group"
            aria-labelledby="applying-heading"
            aria-describedby="applying-help"
            className="mb-7 border-t border-(--color-faint) pt-7"
          >
            <h3
              id="applying-heading"
              className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)"
            >
              {pack.placeVenture.apply.label}
            </h3>
            <p
              id="applying-help"
              className="mt-1.5 mb-6 text-meta leading-[1.55] text-(--color-dim)"
            >
              {pack.placeVenture.apply.help}
            </p>
            <LongAnswer
              form={form}
              name="applyWho"
              label={pack.placeVenture.apply.who.label}
            />
            <LongAnswer
              form={form}
              name="applyAfter"
              label={pack.placeVenture.apply.after.label}
              help={pack.placeVenture.apply.after.help}
            />
            <LongAnswer
              form={form}
              name="applyFee"
              label={pack.placeVenture.apply.fee.label}
              help={pack.placeVenture.apply.fee.help}
            />
            <LongAnswer
              form={form}
              name="applyQuestions"
              label={pack.placeVenture.apply.questions.label}
              help={pack.placeVenture.apply.questions.help}
            />
          </div>
        </ForKinds>
      ) : (
        <ForKindsStub
          ventureType={ventureType}
          test={hasGroup("place")}
          note="Asked under the asks: Applying, four questions on who can apply, what happens next, any fee, and the current application questions. The words are the place overlay's."
        />
      )}

      {/* The track's one ink treatment (D-PORT-10). The three claims
          questions, and for a venture the investor ask between them (VEN-3,
          D-VEN-5, `investor-ask.md`): counsel's words, collected, never
          drafted. Rows in the surface's order, each asked by the registry. */}
      <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("claims")}>
        <InkCluster mono={pack.claims.mono} intro={pack.claims.intro}>
          <TextAnswer
            form={form}
            name="signOff"
            label={pack.claims.signOff.label}
            help={pack.claims.signOff.help}
          />
          {pack.raise ? (
            <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("raise")}>
              <LongAnswer
                form={form}
                name="issuerEntity"
                label={pack.raise.issuerEntity.label}
                help={pack.raise.issuerEntity.help}
              />
            </ForKinds>
          ) : (
            <ForKindsStub
              ventureType={ventureType}
              test={hasGroup("raise")}
              note="Asked here: the legal entity investors pay into. The words are the venture pack's."
            />
          )}
          {pack.placeVenture ? (
            <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("place")}>
              <>
                <LongAnswer
                  form={form}
                  name="investorReceives"
                  label={pack.placeVenture.investorReceives.label}
                  help={pack.placeVenture.investorReceives.help}
                />
                <ChoiceAnswer
                  form={form}
                  name="coOwnerDiffers"
                  label={pack.placeVenture.coOwnerDiffers.label}
                  options={pack.placeVenture.coOwnerDiffers.options}
                />
                <Reveal
                  values={form.values}
                  dependsOn={{ field: "coOwnerDiffers", equals: "different" }}
                >
                  <LongAnswer
                    form={form}
                    name="coOwnerLines"
                    label={pack.placeVenture.coOwnerLines.label}
                  />
                </Reveal>
              </>
            </ForKinds>
          ) : (
            <ForKindsStub
              ventureType={ventureType}
              test={hasGroup("place")}
              note="Asked here: what an investor receives, whether a co-owner differs, and if so the two lines. The words are the place overlay's."
            />
          )}
          {pack.raise ? (
            <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("raise")}>
              <LongAnswer
                form={form}
                name="jurisdictions"
                label={pack.raise.jurisdictions.label}
                help={pack.raise.jurisdictions.help}
              />
            </ForKinds>
          ) : null}
          <LongAnswer
            form={form}
            name="cantSay"
            label={pack.claims.cantSay.label}
            help={pack.claims.cantSay.help}
          />
          {pack.raise ? (
            <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("raise")}>
              <>
                {/* Nothing preselected; unanswered is built as "No"
                    (D-VEN-10). */}
                <ChoiceAnswer
                  form={form}
                  name="returnWording"
                  label={pack.raise.returnWording.label}
                  help={pack.raise.returnWording.help}
                  options={pack.raise.returnWording.options}
                />
                <Reveal
                  values={form.values}
                  dependsOn={{ field: "returnWording", equals: "approved" }}
                >
                  <LongAnswer
                    form={form}
                    name="returnWordingQuote"
                    label={pack.raise.returnWordingQuote.label}
                    help={pack.raise.returnWordingQuote.help}
                  />
                </Reveal>
              </>
            </ForKinds>
          ) : (
            <ForKindsStub
              ventureType={ventureType}
              test={hasGroup("raise")}
              note="Asked here: where people may invest from, whether the site may mention returns, and if so the approved wording."
            />
          )}
          {pack.placeVenture ? (
            <ForKinds kind={kind} ventureType={ventureType} test={hasGroup("place")}>
              <LongAnswer
                form={form}
                name="perks"
                label={pack.placeVenture.perks.label}
                help={pack.placeVenture.perks.help}
              />
            </ForKinds>
          ) : null}
          <LongAnswer
            form={form}
            name="requiredWording"
            label={pack.claims.requiredWording.label}
            help={pack.claims.requiredWording.help}
          />
        </InkCluster>
      </ForKinds>

      {/* The reel question used to sit here and was retired at PORT-19: a
          project's primary video answers "which one first" inside the project
          it belongs to, and step 9's home block answers it for the site. Both
          are better places to ask than a free-text field five steps from the
          catalogue it refers to.

          The five stopped being a paragraph at the same time — the rows are
          right there, so they are what gets ticked. [COPY — pending Taylor] */}
      <ForKinds kind={kind} ventureType={ventureType} test={fills("projects")}>
        <Field
          id="f-topFivePicks"
          label="If you could only show five"
          help="Tick five, in the order you'd show them. This tells us more than any rating."
        >
          <TopFive
            projects={projects}
            picks={
              Array.isArray(form.values.topFivePicks)
                ? (form.values.topFivePicks as string[])
                : []
            }
            onChange={(next) => form.setValue("topFivePicks", next)}
            onBlur={form.flush}
          />
        </Field>
      </ForKinds>

      <ChoiceAnswer
        form={form}
        name="organization"
        label="How should the work be organized?"
        options={pack.organizationOptions}
        multiple
      />

      {/* Paired with the "Something else" option above rather than standing
          open. A permanently visible "Anything else?" under a list of concrete
          choices reads as a second, vaguer question; asked only when someone
          has said the list did not cover them, it reads as a follow-up. */}
      <Reveal
        values={form.values}
        dependsOn={{ field: "organization", includes: "other" }}
      >
        <TextAnswer form={form} name="organizationOther" label="Tell us how" />
      </Reveal>

      <LongAnswer
        form={form}
        name="sayMore"
        label="Say more about that"
        help="How you imagine someone moving through the work. Checked more than one above? This box is where you think out loud — we'll read it carefully."
      />
    </>
  );
}
