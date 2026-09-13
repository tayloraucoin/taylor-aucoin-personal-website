"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_UPLOAD_BYTES } from "@/lib/validators/intake";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { uploadIntakeFile } from "../_lib/upload-file";
import { DocHint, DocTag } from "./document";

type Item = {
  key: string;
  name: string;
  previewUrl: string | null;
  progress: number;
  status: "uploading" | "done" | "failed" | "too_large";
  file?: File;
};

export type ExistingFile = {
  id: string;
  originalName: string | null;
  uploadedAt: Date | null;
};

/**
 * Sends a file straight to storage and reports honestly while it does.
 *
 * A native `<input type="file">` behind a styled label — never a custom
 * drag-and-drop surface. On a phone that input is the camera roll, the camera,
 * and the files app all at once; a bespoke drop zone is a desktop idea that
 * breaks on exactly the device this form is filled on.
 *
 * Thumbnails render from the local file the instant it is chosen, before any
 * byte leaves the device. It is the only visually rewarding moment in twenty
 * minutes of questions and it has to feel immediate.
 *
 * Progress comes from `XMLHttpRequest` rather than `fetch`, which cannot
 * report upload progress. On a five-minute voice memo over rural LTE, a
 * progress line is the difference between waiting and giving up.
 *
 * Nothing is ever rejected for its format. Size is the only refusal, and it
 * arrives as a sentence rather than an error state.
 */
export function FileDrop({
  token,
  stepKey,
  fieldKey,
  entryKey,
  label,
  accept,
  multiple = false,
  existing = [],
  onUploaded,
}: {
  token: string;
  stepKey: string;
  fieldKey: string;
  /**
   * Which repeatable entry these files belong to, when they belong to one.
   *
   * A project's stills are only meaningful attached to that project, and the
   * entry a client is looking at has no id until they add it — so the key is
   * minted client-side and stored in the answers document beside the entry.
   * Absent everywhere else, which is most places. See M-PORT-3.
   */
  entryKey?: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  existing?: readonly ExistingFile[];
  /**
   * Told the row id once a file has landed and been confirmed.
   *
   * Added at PORT-20 for step 7's voice-note drop, so a phone memo a client
   * uploads is written out in the same visit rather than on their next one.
   * PORT-21 is the second caller: step 1's document drop reads a deck the
   * moment its bytes land, for the same reason and on the same seam.
   *
   * Optional, and the durable track's drops pass nothing — they behave exactly
   * as they always have.
   */
  onUploaded?: (fileId: string) => void;
}) {
  /**
   * In preview there is no engagement to attach a file to, so the upload
   * endpoint would reject the token and the client would watch a drop target
   * accept a file and then fail. A control that says up front that it will not
   * work is kinder than one that discovers it afterwards (ADM-2, UX spec §6).
   *
   * The prompt copy still renders, because reading the prompts is the entire
   * point of the review surface.
   */
  const preview = useIsPreview();
  const document = useIsDocument();

  /**
   * Unique per entry, not just per field — a label finds its input by id, and
   * `getElementById` returns the first match in the document.
   *
   * Three drops are entry-keyed (`project_images`, `piece_images`, `headshot`)
   * and each renders once per repeatable entry. Without the key in the id, a
   * client with three projects had three inputs all called
   * `file-project_images`, so every "Add images" label opened the *first*
   * project's picker and the chosen stills uploaded under the first project's
   * entry key. Silent, and wrong in the answers document rather than on screen.
   *
   * Unkeyed drops keep exactly the id they had. The key is twelve characters of
   * `[a-z0-9]` from `mintEntryKey`, so it is safe in an id without escaping.
   */
  const inputId = entryKey ? `file-${fieldKey}-${entryKey}` : `file-${fieldKey}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);

  // Object URLs are a leak if they outlive their tile.
  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch(key: string, changes: Partial<Item>) {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...changes } : item,
      ),
    );
  }

  /**
   * The issue → PUT → confirm ladder moved to `../_lib/upload-file.ts` at
   * PORT-20 so the voice recorder could climb the same one rather than grow a
   * second. Behaviour here is unchanged, including that a failed confirm is
   * not surfaced — see the note on `confirmed` in that module.
   */
  async function send(item: Item) {
    const file = item.file;
    if (!file) return;

    try {
      const { fileId } = await uploadIntakeFile(
        { token, stepKey, fieldKey, entryKey },
        file,
        file.name,
        (progress) => patch(item.key, { progress }),
      );

      patch(item.key, { status: "done", progress: 100 });
      onUploaded?.(fileId);
    } catch {
      patch(item.key, { status: "failed" });
    }
  }

  function choose(files: FileList | null) {
    if (!files) return;

    const next: Item[] = Array.from(files).map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      progress: 0,
      status: file.size > MAX_UPLOAD_BYTES ? "too_large" : "uploading",
      file,
    }));

    setItems((current) => [...current, ...next]);

    for (const item of next) {
      if (item.status === "uploading") void send(item);
    }
  }

  const inFlight = items.filter((i) => i.status === "uploading").length;

  /**
   * Whether one file is wanted or many changes what the question is asking
   * for, so it rides in the tag. The drop label ("Add a photo") is real client
   * copy and belongs in a review of the copy, even though it is not the
   * question — hence a hint rather than a heading.
   */
  if (document) {
    return (
      <>
        <DocTag>{multiple ? "Upload · multiple" : "Upload"}</DocTag>
        <DocHint>{label}</DocHint>
      </>
    );
  }

  return (
    <div>
      {preview ? (
        <>
          <p className="flex min-h-12 w-full items-center justify-center rounded-(--radius) border border-dashed border-(--color-faint) bg-(--color-card) px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)/60">
            {label}
          </p>
          <p className="mt-2 text-xs text-(--color-dim)">
            Uploads are disabled in preview.
          </p>
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(event) => {
              choose(event.target.files);
              // Let the same file be chosen again after a failure.
              event.target.value = "";
            }}
            className="sr-only"
          />

          <label
            htmlFor={inputId}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-(--radius) border border-dashed border-(--color-faint) bg-(--color-card) px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) hover:border-(--color-ghost-line) hover:text-(--color-c2)"
          >
            {label}
          </label>
        </>
      )}

      {/* One announcement for a batch, not fifteen. */}
      <p aria-live="polite" className="sr-only">
        {inFlight > 0
          ? `Sending ${inFlight} file${inFlight === 1 ? "" : "s"}`
          : items.length > 0
            ? "All files sent"
            : ""}
      </p>

      {existing.length > 0 || items.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
          {existing.map((file) => (
            <li
              key={file.id}
              className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-2"
            >
              <p className="truncate font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
                {file.originalName ?? "File"}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-c2)">
                Sent
              </p>
            </li>
          ))}

          {items.map((item) => (
            <li
              key={item.key}
              className="overflow-hidden rounded-(--radius) border border-(--color-faint) bg-(--color-card)"
            >
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-20 w-full object-cover"
                />
              ) : (
                <p className="flex h-20 items-center justify-center truncate px-2 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
                  {item.name.split(".").pop()}
                </p>
              )}

              <div className="p-2">
                <p className="truncate font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
                  {item.name}
                </p>

                {item.status === "uploading" ? (
                  <div className="mt-1.5 h-px w-full bg-(--color-faint)">
                    <div
                      className="h-px bg-(--color-c2) transition-[width] duration-(--dur-fast)"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                ) : null}

                {item.status === "done" ? (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-c2)">
                    Sent
                  </p>
                ) : null}

                {item.status === "failed" ? (
                  <button
                    type="button"
                    onClick={() => {
                      patch(item.key, { status: "uploading", progress: 0 });
                      void send(item);
                    }}
                    className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-c2) underline underline-offset-2"
                  >
                    Didn&apos;t make it — tap to retry
                  </button>
                ) : null}

                {item.status === "too_large" ? (
                  <p className="mt-1 font-mono text-[9px] uppercase leading-[1.5] tracking-[.14em] text-(--color-c2)">
                    Too big — text this one to Taylor instead
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
