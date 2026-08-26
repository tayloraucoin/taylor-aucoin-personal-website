"use client";

import { useState } from "react";
import type { ProjectEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { Field } from "../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../intake/_components/file-drop";
import { TextArea, TextField } from "../../../intake/_components/text-field";

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
 * An entry collapses once it has a title, because a titled entry is one the
 * client has identified and can recognise in a summary row. An untitled one
 * stays open — collapsing it would produce a row that says nothing.
 *
 * A failed upload keeps its card open regardless. Hiding a failure behind a
 * summary row would be the collapse costing someone a file, which is the one
 * thing it must never do.
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

  const set = (patch: Partial<ProjectEntry>) => onChange({ ...entry, ...patch });

  if (titled && !open) {
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
          {entry.title}
          {entry.year ? (
            <span className="text-(--color-dim)"> · {entry.year}</span>
          ) : null}
          {entry.role ? (
            <span className="text-(--color-dim)"> · {entry.role}</span>
          ) : null}
        </span>
        {files.length > 0 ? (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            {files.length} image{files.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {titled ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-expanded
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          Collapse
        </button>
      ) : null}

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

      <Row id={`f-p-watchUrl-${index}`} label="Where to watch">
        <TextField
          id={`f-p-watchUrl-${index}`}
          mode="url"
          value={entry.watchUrl ?? ""}
          onChange={(e) => set({ watchUrl: e.target.value })}
          onBlur={onBlur}
          placeholder="Vimeo or YouTube link"
        />
      </Row>

      {/* The one apparent password on this surface, and it is not a credential:
          a Vimeo share password protects one URL and grants nothing else. It is
          a plain text input on purpose — `type="password"` would invite a
          password manager to offer something that IS a credential, which is
          exactly the confusion the no-passwords law exists to prevent. */}
      <Row
        id={`f-p-linkPassword-${index}`}
        label="Password, if the link has one"
        help="Share passwords only — the kind Vimeo puts on a private link. Never an account password; we don't take those."
      >
        <TextField
          id={`f-p-linkPassword-${index}`}
          value={entry.linkPassword ?? ""}
          onChange={(e) => set({ linkPassword: e.target.value })}
          onBlur={onBlur}
          autoComplete="off"
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
