"use client";

import { useState } from "react";
import type { PieceEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import {
  FileDrop,
  type ExistingFile,
} from "../../../intake/_components/file-drop";
import { TextArea, TextField } from "../../../intake/_components/text-field";
import { CollapseLink, EntryRow, EntrySummary } from "./entry-collapse";

/**
 * What a venture is building, one piece at a time: the property, a phase, a
 * programme, a product.
 *
 * **`status` is the field that makes this shape honest.** A venture's step 4
 * mixes what exists with what is planned, and a site that cannot tell the two
 * apart is the failure this entry exists to prevent — it is the difference
 * between a description and a claim. It stays blank unless the client says, and
 * PORT-17's extractor is forbidden from inferring it from a deck (M-PORT-24).
 *
 * Images sit inside the entry, entry-keyed, on the same upload path a project's
 * stills use (M-PORT-14) — renders, drone shots, and site photography are what
 * a venture has instead of a back catalogue.
 */
const STATUS = [
  { value: "planned", label: "Planned" },
  { value: "underway", label: "Underway" },
  { value: "done", label: "Done" },
] as const;

const PLACEMENT = [
  { value: "front", label: "Front and centre" },
  { value: "archive", label: "In the archive" },
  { value: "off", label: "Leave it off for now" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  underway: "Underway",
  done: "Done",
};

export function PieceEntryCard({
  index,
  entry,
  token,
  files,
  onChange,
  onBlur,
}: {
  index: number;
  entry: PieceEntry;
  token: string;
  files: readonly ExistingFile[];
  onChange: (next: PieceEntry) => void;
  onBlur: () => void;
}) {
  const titled = Boolean(entry.title?.trim());
  const [open, setOpen] = useState(!titled);

  const set = (patch: Partial<PieceEntry>) => onChange({ ...entry, ...patch });

  if (titled && !open) {
    return (
      <EntrySummary
        index={index}
        title={entry.title!}
        detail={entry.status ? STATUS_LABEL[entry.status] : undefined}
        badge={
          files.length > 0
            ? `${files.length} image${files.length === 1 ? "" : "s"}`
            : undefined
        }
        onOpen={() => setOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {titled ? <CollapseLink onCollapse={() => setOpen(false)} /> : null}

      <EntryRow id={`f-piece-title-${index}`} label="What it is">
        <TextField
          id={`f-piece-title-${index}`}
          value={entry.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-piece-kind-${index}`} label="What kind of thing it is">
        <TextField
          id={`f-piece-kind-${index}`}
          value={entry.kind ?? ""}
          onChange={(e) => set({ kind: e.target.value })}
          onBlur={onBlur}
          placeholder="The property, a phase, a programme, a product…"
        />
      </EntryRow>

      <EntryRow
        id={`f-piece-status-${index}`}
        label="Where it stands"
        help="Leave it blank if it isn't settled. We would rather ask than describe something planned as though it exists."
      >
        <ChoiceGroup
          legend="Where it stands"
          name={`piece-status-${index}`}
          options={STATUS}
          value={entry.status ? [entry.status] : []}
          onChange={(next) => set({ status: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-piece-when-${index}`} label="When">
        <TextField
          id={`f-piece-when-${index}`}
          value={entry.when ?? ""}
          onChange={(e) => set({ when: e.target.value })}
          onBlur={onBlur}
          placeholder="2026, or spring, or once the raise closes"
        />
      </EntryRow>

      <EntryRow
        id={`f-piece-images-${index}`}
        label="Images for this"
        help="Photos, renders, drone shots, a site plan — whatever shows it."
      >
        <FileDrop
          token={token}
          stepKey="work"
          fieldKey="piece_images"
          entryKey={entry.entryKey}
          label="Add images"
          multiple
          existing={files}
        />
      </EntryRow>

      <EntryRow
        id={`f-piece-story-${index}`}
        label="The story, in a sentence or two"
      >
        <TextArea
          id={`f-piece-story-${index}`}
          value={entry.story ?? ""}
          onChange={(e) => set({ story: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-piece-placement-${index}`} label="Where it belongs">
        <ChoiceGroup
          legend="Where it belongs"
          name={`piece-placement-${index}`}
          options={PLACEMENT}
          value={entry.placement ? [entry.placement] : []}
          onChange={(next) => set({ placement: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>
    </div>
  );
}
