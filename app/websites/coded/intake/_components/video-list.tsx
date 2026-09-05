"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ProjectVideo } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { RepeatableBlock } from "../../../intake/_components/repeatable-block";
import { TextField } from "../../../intake/_components/text-field";
import { EntryRow } from "./entry-collapse";

const PRIMARY_OPTION = [
  { value: "primary", label: "Yes — this is the one to lead with" },
] as const;

/**
 * A list of videos — on a project, or standing alone on the Media step.
 *
 * One `watchUrl` per project was the shape until PORT-19, and it was wrong for
 * the client this track is for: a project is the film *and* the trailer *and*
 * the behind-the-scenes cut, and every link past the first was arriving in the
 * story box as a bare URL.
 *
 * **`what` is the field that earns the rest.** The site is designed from these
 * answers; whoever places a video on the home page needs to know whether it is
 * the ninety-minute cut or a forty-second teaser, and a Vimeo id does not say.
 *
 * ## The primary tick
 *
 * At most one video per project is primary, and **the invariant lives here
 * rather than in the schema**. A guard that refused a second primary would
 * refuse the save, and nothing in this form refuses a save (D-INT-4). So
 * ticking a second unticks the first, in one write — the client sees the
 * answer they meant, and there is no state where two are ticked for a moment.
 *
 * No primary is an ordinary answer, not an omission. It says "these are
 * siblings", which is true of plenty of projects.
 */
export function VideoList({
  idPrefix,
  videos,
  onChange,
  onBlur,
  withPrimary = false,
  addLabel,
}: {
  /** Unique per list on the page — a label finds its input by id. */
  idPrefix: string;
  videos: readonly ProjectVideo[];
  onChange: (next: ProjectVideo[]) => void;
  onBlur: () => void;
  withPrimary?: boolean;
  addLabel: string;
}) {
  return (
    <RepeatableBlock<ProjectVideo>
      items={videos}
      onChange={onChange}
      emptyItem={() => ({ entryKey: mintEntryKey() })}
      addLabel={addLabel}
      renderItem={(video, index, update) => {
        const set = (patch: Partial<ProjectVideo>) =>
          update({ ...video, ...patch });

        /**
         * Ticking this one, and untucking whichever held it.
         *
         * Written through `onChange` on the whole list rather than `update` on
         * this row, because clearing the other row is the other half of the
         * same edit and two writes would let a render land between them.
         */
        const setPrimary = (next: boolean) =>
          onChange(
            videos.map((row) =>
              row.entryKey === video.entryKey
                ? { ...row, primary: next }
                : row.primary
                  ? { ...row, primary: false }
                  : row,
            ),
          );

        return (
          <div className="space-y-3">
            <EntryRow id={`${idPrefix}-url-${index}`} label="Link">
              <TextField
                id={`${idPrefix}-url-${index}`}
                mode="url"
                value={video.url ?? ""}
                onChange={(event) => set({ url: event.target.value })}
                onBlur={onBlur}
                placeholder="Vimeo or YouTube link"
              />
            </EntryRow>

            <EntryRow
              id={`${idPrefix}-what-${index}`}
              label="What it is"
              help="A few words — the film, the trailer, a two-minute teaser, the Q&A after the screening."
            >
              <TextField
                id={`${idPrefix}-what-${index}`}
                value={video.what ?? ""}
                onChange={(event) => set({ what: event.target.value })}
                onBlur={onBlur}
              />
            </EntryRow>

            {/* Not a credential, and deliberately not `type="password"` — see
                the note at `ProjectEntryCard`, where this field lived until
                PORT-19 moved it onto the link it protects. */}
            <EntryRow
              id={`${idPrefix}-password-${index}`}
              label="Password, if the link has one"
              help="Share passwords only — the kind Vimeo puts on a private link. Never an account password; we don't take those."
            >
              <TextField
                id={`${idPrefix}-password-${index}`}
                value={video.password ?? ""}
                onChange={(event) => set({ password: event.target.value })}
                onBlur={onBlur}
                autoComplete="off"
              />
            </EntryRow>

            {/* A one-option checkbox group rather than a bare input, so the
                tick wears the same tap-card every other choice on this form
                wears — and survives a thumb at arm's length. */}
            {withPrimary ? (
              <EntryRow
                id={`${idPrefix}-primary-${index}`}
                label="Lead with this one"
                help="Goes to the top of the project, highlighted. One per project, and none at all is a fine answer."
              >
                <ChoiceGroup
                  legend="Lead with this one"
                  name={`${idPrefix}-primary-${index}`}
                  options={PRIMARY_OPTION}
                  value={video.primary === true ? ["primary"] : []}
                  onChange={(next) => setPrimary(next.includes("primary"))}
                  onBlur={onBlur}
                  multiple
                />
              </EntryRow>
            ) : null}
          </div>
        );
      }}
    />
  );
}
