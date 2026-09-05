"use client";

import { useState } from "react";
import type { PersonEntry } from "@/lib/validators/showcase-intake";
import { Field } from "../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../intake/_components/file-drop";
import { TextField } from "../../../intake/_components/text-field";

/**
 * One person on the roster: four fields and their own photo.
 *
 * The same shape as `ProjectEntryCard`, for the same reasons — an entry-keyed
 * upload (M-PORT-14) and a collapse that is presentation and nothing else
 * (M-PORT-15). A founder adding three people on a phone gets three summary rows
 * rather than three open cards, and the answers document is byte-identical
 * either way.
 *
 * **The photo slot appears once the person has a name.** Not as a gate — every
 * field on this form is optional — but because a drop zone attached to a blank
 * entry has nothing to be about, and a file uploaded against an unnamed person
 * is a file nobody can place later. Clearing the name afterwards does not
 * remove the photo: it stays attached to the entry key, which is what the key
 * is for.
 */
export function PersonEntryCard({
  index,
  entry,
  token,
  files,
  linePlaceholder,
  onChange,
  onBlur,
}: {
  index: number;
  entry: PersonEntry;
  token: string;
  files: readonly ExistingFile[];
  /** From the copy pack, so Taylor's pass reaches it. */
  linePlaceholder: string;
  onChange: (next: PersonEntry) => void;
  onBlur: () => void;
}) {
  const named = Boolean(entry.name?.trim());
  const [open, setOpen] = useState(!named);

  const set = (patch: Partial<PersonEntry>) => onChange({ ...entry, ...patch });

  if (named && !open) {
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
          {entry.name}
          {entry.role ? (
            <span className="text-(--color-dim)"> · {entry.role}</span>
          ) : null}
        </span>
        {files.length > 0 ? (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            photo
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {named ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-expanded
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          Collapse
        </button>
      ) : null}

      <TextField
        id={`f-person-name-${index}`}
        aria-label="Name"
        placeholder="Name"
        value={entry.name ?? ""}
        onChange={(event) => set({ name: event.target.value })}
        onBlur={onBlur}
      />

      <TextField
        id={`f-person-role-${index}`}
        aria-label="Role or title"
        placeholder="What they do"
        value={entry.role ?? ""}
        onChange={(event) => set({ role: event.target.value })}
        onBlur={onBlur}
      />

      <TextField
        id={`f-person-line-${index}`}
        aria-label="One line about them"
        placeholder={linePlaceholder}
        value={entry.line ?? ""}
        onChange={(event) => set({ line: event.target.value })}
        onBlur={onBlur}
      />

      {named ? (
        <Field id={`f-person-photo-${index}`} label="Their photo">
          <FileDrop
            token={token}
            stepKey="about"
            fieldKey="headshot"
            entryKey={entry.entryKey}
            label="Add a photo"
            existing={files}
          />
        </Field>
      ) : null}
    </div>
  );
}
