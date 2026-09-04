"use client";

import { useState } from "react";
import { GhostButton } from "@/components/ui/GradientButton";
import { videosOf } from "@/lib/intake/project-videos";
import type { ProjectEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { Field } from "../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../intake/_components/file-drop";
import { TextArea, TextField } from "../../../intake/_components/text-field";
import { VideoList } from "./video-list";

const RIGHTS = [
  { value: "public", label: "Yes — it's public" },
  { value: "rules", label: "Yes, but there are rules — ask me" },
  { value: "unsure", label: "Not sure — check with me" },
] as const;

const PLACEMENT = [
  { value: "front", label: "Front and centre" },
  { value: "archive", label: "In the archive" },
  { value: "off", label: "Leave it off for now" },
] as const;

/**
 * One project: eleven fields and its own image drop.
 *
 * **Collapsing is presentation and nothing else** (D-PORT-6). A filmmaker with
 * thirty projects cannot navigate thirty open cards, but the answers document
 * is byte-identical whether every card is open or shut, the collapse state is
 * never persisted, and autosave neither knows nor cares. Nothing here can lose
 * an answer by being closed.
 *
 * An entry **opens** untitled and shuts once it has a title, because a titled
 * entry is one the client can recognise in a summary row. Since PORT-19 an
 * untitled one can be shut too, deliberately, from the foot of the box — the
 * row reads "Untitled project", which is worse than a title and better than a
 * form somebody has finished with.
 *
 * A failed upload keeps its card open regardless. Hiding a failure behind a
 * summary row would be the collapse costing someone a file, which is the one
 * thing it must never do.
 *
 * ## Save and close
 *
 * PORT-19 added a control at the foot of the box, because the Collapse link at
 * the top is twelve fields away by the time anyone has finished filling one in.
 * It is **not a submit**: it flushes the same autosave every field on this form
 * flushes on blur, and then collapses. Nothing reaches the database because of
 * it that would not have reached it anyway, and nothing is validated, refused,
 * or locked. It exists so a client with thirty projects can shut the one they
 * just finished from where their eyes already are.
 *
 * The Collapse link at the top does the same two things, and is the same
 * control at the other end of the box — one behaviour, two places to reach it,
 * rather than a "collapse" and a "save" a client would have to tell apart.
 */
export function ProjectEntryCard({
  index,
  entry,
  token,
  files,
  onChange,
  onBlur,
}: {
  index: number;
  entry: ProjectEntry;
  token: string;
  files: readonly ExistingFile[];
  onChange: (next: ProjectEntry) => void;
  onBlur: () => void;
}) {
  const titled = Boolean(entry.title?.trim());
  const [open, setOpen] = useState(!titled);

  const set = (patch: Partial<ProjectEntry>) =>
    onChange({ ...entry, ...patch });

  /**
   * Flush, then shut. The order matters only in that it is the honest one:
   * the save is already in flight before the box disappears.
   */
  const saveAndClose = () => {
    onBlur();
    setOpen(false);
  };

  // Reads a legacy `watchUrl` as one video, so the count on the summary row and
  // the rows inside the box can never disagree about what this project holds.
  const videos = videosOf(entry);

  const summary = [
    files.length > 0
      ? `${files.length} image${files.length === 1 ? "" : "s"}`
      : null,
    videos.length > 0
      ? `${videos.length} video${videos.length === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="flex min-h-12 w-full items-baseline gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 text-left transition-colors duration-(--dur-fast) hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 grow font-body text-[16px] font-light text-(--color-ink)">
          {entry.title?.trim() || "Untitled project"}
          {entry.year ? (
            <span className="text-(--color-dim)"> · {entry.year}</span>
          ) : null}
          {entry.role ? (
            <span className="text-(--color-dim)"> · {entry.role}</span>
          ) : null}
        </span>
        {summary ? (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            {summary}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={saveAndClose}
        aria-expanded
        className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        Collapse
      </button>

      <Row id={`f-p-title-${index}`} label="Title">
        <TextField
          id={`f-p-title-${index}`}
          value={entry.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          onBlur={onBlur}
        />
      </Row>

      <Row id={`f-p-year-${index}`} label="Year">
        <TextField
          id={`f-p-year-${index}`}
          value={entry.year ?? ""}
          onChange={(e) => set({ year: e.target.value })}
          onBlur={onBlur}
        />
      </Row>

      <Row id={`f-p-role-${index}`} label="Your role on it">
        <TextField
          id={`f-p-role-${index}`}
          value={entry.role ?? ""}
          onChange={(e) => set({ role: e.target.value })}
          onBlur={onBlur}
          placeholder="Director · or: Camera op / editor"
        />
      </Row>

      <Row id={`f-p-kind-${index}`} label="What kind of thing it is">
        <TextField
          id={`f-p-kind-${index}`}
          value={entry.kind ?? ""}
          onChange={(e) => set({ kind: e.target.value })}
          onBlur={onBlur}
          placeholder="Short film, commercial, music video, EPK…"
        />
      </Row>

      <Row id={`f-p-forWhom-${index}`} label="Who it was for">
        <TextField
          id={`f-p-forWhom-${index}`}
          value={entry.forWhom ?? ""}
          onChange={(e) => set({ forWhom: e.target.value })}
          onBlur={onBlur}
          placeholder="Client, production company, network — if any"
        />
      </Row>

      {/* One link was never enough: the film, the trailer, the BTS cut, the
          Q&A. Writing through `videos` retires this entry's legacy `watchUrl`
          — `videosOf` seeded the list from it, so the first edit carries it
          forward rather than dropping it (PORT-19).

          The share password moved onto the link it protects. It is still not a
          credential — a Vimeo share password protects one URL and grants
          nothing else — and it is still a plain text input, because
          `type="password"` would invite a password manager to offer something
          that IS a credential. */}
      <Row
        id={`f-p-videos-${index}`}
        label="Where to watch it"
        help="Every version worth seeing — the film, the trailer, a cutdown. Tell us what each one is, and tick the one to lead with."
      >
        <VideoList
          idPrefix={`f-p-video-${index}`}
          videos={videos}
          onChange={(next) => set({ videos: next })}
          onBlur={onBlur}
          withPrimary
          addLabel="Add another video"
        />
      </Row>

      <Row
        id={`f-p-images-${index}`}
        label="Images for this project"
        help="Stills, frames, the poster — a few is ideal, more is fine."
      >
        <FileDrop
          token={token}
          stepKey="work"
          fieldKey="project_images"
          entryKey={entry.entryKey}
          label="Add images"
          multiple
          existing={files}
        />
      </Row>

      <Row
        id={`f-p-story-${index}`}
        label="The story, in a sentence or two"
        help="What it is, and anything worth knowing — it was shot in a night, the budget was $500, Aubrey Plaza is in it."
      >
        <TextArea
          id={`f-p-story-${index}`}
          value={entry.story ?? ""}
          onChange={(e) => set({ story: e.target.value })}
          onBlur={onBlur}
        />
      </Row>

      <Row
        id={`f-p-credits-${index}`}
        label="Credits worth listing"
        help="The collaborators who should be named."
      >
        <TextArea
          id={`f-p-credits-${index}`}
          value={entry.credits ?? ""}
          onChange={(e) => set({ credits: e.target.value })}
          onBlur={onBlur}
        />
      </Row>

      <Row id={`f-p-awards-${index}`} label="Awards or selections for this one">
        <TextArea
          id={`f-p-awards-${index}`}
          value={entry.awards ?? ""}
          onChange={(e) => set({ awards: e.target.value })}
          onBlur={onBlur}
        />
      </Row>

      <Row
        id={`f-p-rights-${index}`}
        label="Are you allowed to show it?"
        help="Studio and client work sometimes comes with strings. We'd rather ask than get you in trouble."
      >
        <ChoiceGroup
          legend="Are you allowed to show it?"
          name={`rights-${index}`}
          options={RIGHTS}
          value={entry.rights ? [entry.rights] : []}
          onChange={(next) => set({ rights: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </Row>

      <Row id={`f-p-placement-${index}`} label="Where it belongs">
        <ChoiceGroup
          legend="Where it belongs"
          name={`placement-${index}`}
          options={PLACEMENT}
          value={entry.placement ? [entry.placement] : []}
          onChange={(next) => set({ placement: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </Row>

      <div className="pt-1">
        <GhostButton type="button" onClick={saveAndClose}>
          Save and close
        </GhostButton>
      </div>
    </div>
  );
}

/** A label/help/control row inside an entry card. */
function Row({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <Field id={id} label={label} help={help}>
      {children}
    </Field>
  );
}
