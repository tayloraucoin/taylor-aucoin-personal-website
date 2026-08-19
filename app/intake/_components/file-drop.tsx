"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_UPLOAD_BYTES } from "@/lib/validators/intake";

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
  label,
  accept,
  multiple = false,
  existing = [],
}: {
  token: string;
  stepKey: string;
  fieldKey: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  existing?: readonly ExistingFile[];
}) {
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
      current.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    );
  }

  async function send(item: Item) {
    const file = item.file;
    if (!file) return;

    try {
      const issued = await fetch("/api/intake/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          stepKey,
          fieldKey,
          filename: file.name,
          mimeType: file.type || undefined,
          sizeBytes: file.size,
        }),
      });

      if (!issued.ok) {
        patch(item.key, { status: "failed" });
        return;
      }

      const { fileId, uploadUrl } = (await issued.json()) as {
        fileId: string;
        uploadUrl: string;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            patch(item.key, {
              progress: Math.round((event.loaded / event.total) * 100),
            });
          }
        });
        xhr.addEventListener("load", () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(String(xhr.status))),
        );
        xhr.addEventListener("error", () => reject(new Error("network")));
        xhr.send(file);
      });

      await fetch("/api/intake/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, confirm: fileId }),
      });

      patch(item.key, { status: "done", progress: 100 });
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

  return (
    <div>
      <input
        ref={inputRef}
        id={`file-${fieldKey}`}
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
        htmlFor={`file-${fieldKey}`}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-(--radius) border border-dashed border-(--color-faint) bg-(--color-card) px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) hover:border-[rgb(232_185_97/.42)] hover:text-(--color-c2)"
      >
        {label}
      </label>

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
