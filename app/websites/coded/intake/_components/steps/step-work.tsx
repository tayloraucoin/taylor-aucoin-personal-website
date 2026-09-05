"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
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
import { fills, ForKinds, hasGroup } from "../for-kinds";
import { OfferingEntryCard } from "../offer-entry";
import { PieceEntryCard } from "../piece-entry";
import { ProjectEntryCard } from "../project-entry";
import { ServiceEntryCard } from "../service-entry";
import { TopFive } from "../top-five";

function asProjects(value: unknown): ProjectEntry[] {
  return Array.isArray(value) ? (value as ProjectEntry[]) : [];
}

function asEntries<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * True when an entry holds anything at all.
 *
 * The repeatable block always renders one empty card as an invitation, and
 * that card is not an answer. Dropping the empties before appending extracted
 * projects stops a blank row wedging itself between two real ones.
 */
function hasContent(entry: Record<string, unknown>): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

/**
 * Step 4 — The work.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 4,
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
  projectFiles,
  pieceFiles,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  /** Every delivered project image, to be grouped by the entry it belongs to. */
  projectFiles: readonly (ExistingFile & { entryKey: string | null })[];
  /** The same, for a venture's pieces. */
  pieceFiles: readonly (ExistingFile & { entryKey: string | null })[];
}) {
  const form = useStepAutosave({ token, stepKey: "work", initial });
  useReportSaveState(form.state, form.retry);

  const pack = copyPackFor(flavour);
  // Which array this kind fills — four keys, never one polymorphic array
  // (M-PORT-23). The map lived here until ADM-4; it is a fact about the kind,
  // so it lives on the kind (M-ADM-7).
  const entryKey = workShapeFor(kind);
  const projects = asProjects(form.values.projects);

  const filesFor = (entryKey: string) =>
    projectFiles.filter((file) => file.entryKey === entryKey);

  const pieceFilesFor = (key: string) =>
    pieceFiles.filter((file) => file.entryKey === key);

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
        // Appends. A second run never touches an entry already on screen —
        // including one the client has just corrected.
        onEntries={(incoming) =>
          form.setValue(entryKey, [
            ...asEntries<Record<string, unknown>>(form.values[entryKey]).filter(
              hasContent,
            ),
            ...incoming.map((entry) => ({
              ...entry,
              entryKey: mintEntryKey(),
            })),
          ])
        }
      />

      <ForKinds kind={kind} test={fills("projects")}>
        <Field id="f-projects" label={pack.workBlockLabel}>
          <RepeatableBlock<ProjectEntry>
            items={projects}
            onChange={(next) => form.setValue("projects", next)}
            emptyItem={() => ({ entryKey: mintEntryKey() })}
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
      <ForKinds kind={kind} test={fills("offerings")}>
        <Field id="f-offerings" label={pack.workBlockLabel}>
          <RepeatableBlock<OfferingEntry>
            items={asEntries<OfferingEntry>(form.values.offerings)}
            onChange={(next) => form.setValue("offerings", next)}
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

      <ForKinds kind={kind} test={fills("pieces")}>
        <Field id="f-pieces" label={pack.workBlockLabel}>
          <RepeatableBlock<PieceEntry>
            items={asEntries<PieceEntry>(form.values.pieces)}
            onChange={(next) => form.setValue("pieces", next)}
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
                onChange={update}
                onBlur={form.flush}
              />
              </>
            )}
          />
        </Field>
      </ForKinds>

      <ForKinds kind={kind} test={fills("services")}>
        <Field id="f-services" label={pack.workBlockLabel}>
          <RepeatableBlock<ServiceEntry>
            items={asEntries<ServiceEntry>(form.values.services)}
            onChange={(next) => form.setValue("services", next)}
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
      <ForKinds kind={kind} test={hasGroup("ask")}>
        <Field
          id="f-asks"
          label={pack.ask.blockLabel}
          help={pack.ask.blockHelp}
        >
          <RepeatableBlock<AskEntry>
            items={asEntries<AskEntry>(form.values.asks)}
            onChange={(next) => form.setValue("asks", next)}
            emptyItem={() => ({ entryKey: mintEntryKey() })}
            addLabel={pack.ask.addLabel}
            renderItem={(item, index, update) => (
              <AskEntryCard
                index={index}
                entry={item}
                pack={pack}
                onChange={update}
                onBlur={form.flush}
              />
            )}
          />
        </Field>
      </ForKinds>

      {/* The track's one ink treatment (D-PORT-10). Three questions, and "not
          sure" is a fine answer to all three. */}
      <ForKinds kind={kind} test={hasGroup("claims")}>
        <InkCluster mono={pack.claims.mono} intro={pack.claims.intro}>
          <TextAnswer
            form={form}
            name="signOff"
            label={pack.claims.signOff.label}
            help={pack.claims.signOff.help}
          />
          <LongAnswer
            form={form}
            name="cantSay"
            label={pack.claims.cantSay.label}
            help={pack.claims.cantSay.help}
          />
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
      <ForKinds kind={kind} test={fills("projects")}>
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
