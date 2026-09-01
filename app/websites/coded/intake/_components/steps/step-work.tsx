"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import type { ProjectEntry } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import type { ExistingFile } from "../../../../intake/_components/file-drop";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExtractionBlock } from "../extraction-block";
import { ProjectEntryCard } from "../project-entry";

const ORGANIZATION = [
  { value: "role", label: "By role — directing, camera, editing" },
  { value: "type", label: "By type — films, commercials, music videos" },
  { value: "grid", label: "One curated grid, no filters" },
  { value: "audience", label: "By who it's for" },
  { value: "trust", label: "You decide — I trust the design" },
  { value: "other", label: "Something else" },
] as const;

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
}

function asProjects(value: unknown): ProjectEntry[] {
  return Array.isArray(value) ? (value as ProjectEntry[]) : [];
}

/**
 * True when an entry holds anything at all.
 *
 * The repeatable block always renders one empty card as an invitation, and
 * that card is not an answer. Dropping the empties before appending extracted
 * projects stops a blank row wedging itself between two real ones.
 */
function hasContent(entry: ProjectEntry): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

/**
 * Step 4 — The work.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 4,
 * verbatim, with the reel question flexed by copy pack.
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
  projectFiles,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  /** Every delivered project image, to be grouped by the entry it belongs to. */
  projectFiles: readonly (ExistingFile & { entryKey: string | null })[];
}) {
  const form = useStepAutosave({ token, stepKey: "work", initial });
  useReportSaveState(form.state, form.retry);

  const pack = copyPackFor(flavour);
  const projects = asProjects(form.values.projects);

  const filesFor = (entryKey: string) =>
    projectFiles.filter((file) => file.entryKey === entryKey);

  return (
    <>
      <ExtractionBlock
        token={token}
        mode="projects"
        intro="Same trick as the last step — paste your filmography, credit list, IMDb page, or the projects off your old site, and hit the button."
        afterLine="Projects appear below, filled in as far as the blob allowed. Add links and images to the ones that matter."
        value={
          typeof form.values.fastWay === "string" ? form.values.fastWay : ""
        }
        onChange={(next) => form.setValue("fastWay", next)}
        onBlur={form.flush}
        // Appends. A second run never touches a project already on screen —
        // including one the client has just corrected.
        onEntries={(incoming) =>
          form.setValue("projects", [
            ...projects.filter(hasContent),
            ...(incoming as unknown as ProjectEntry[]),
          ])
        }
      />

      <Field id="f-projects" label="Your projects">
        <RepeatableBlock<ProjectEntry>
          items={projects}
          onChange={(next) => form.setValue("projects", next)}
          emptyItem={() => ({ entryKey: mintEntryKey() })}
          addLabel="Add another project"
          renderItem={(item, index, update) => (
            <ProjectEntryCard
              index={index}
              entry={item}
              token={token}
              files={filesFor(item.entryKey)}
              onChange={update}
              onBlur={form.flush}
            />
          )}
        />
      </Field>

      <TextAnswer
        form={form}
        name="reel"
        label={pack.reelLabel}
        help={pack.reelHelp}
      />

      <LongAnswer
        form={form}
        name="topFive"
        label="If you could only show five"
        help="Which five, in what order? This tells us more than any rating."
      />

      <ChoiceAnswer
        form={form}
        name="organization"
        label="How should the work be organized?"
        options={ORGANIZATION}
        multiple
      />

      {/* Paired with the "Something else" option above rather than standing
          open. A permanently visible "Anything else?" under a list of concrete
          choices reads as a second, vaguer question; asked only when someone
          has said the list did not cover them, it reads as a follow-up. */}
      {asList(form.values.organization).includes("other") ? (
        <TextAnswer
          form={form}
          name="organizationOther"
          label="Tell us how"
        />
      ) : null}

      <LongAnswer
        form={form}
        name="sayMore"
        label="Say more about that"
        help="How you imagine someone moving through the work. Checked more than one above? This box is where you think out loud — we'll read it carefully."
      />
    </>
  );
}
