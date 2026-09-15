"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { MAX_UPLOAD_BYTES } from "@/lib/validators/intake";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import {
  removeIntakeFile,
  reorderIntakeFiles,
  uploadIntakeFile,
} from "../_lib/upload-file";
import { DocHint, DocTag } from "./document";

const UNDO_WINDOW_MS = 6000;

/**
 * One tile. A file already on the server arrives as `done` with its row id;
 * one chosen in this session starts `uploading` and earns its id on confirm.
 * `removing` is the six seconds between Remove and the delete actually
 * happening — the tile stays, says so, and offers Undo.
 */
type Tile = {
  key: string;
  fileId: string | null;
  name: string;
  previewUrl: string | null;
  progress: number;
  status: "uploading" | "done" | "failed" | "too_large" | "removing";
  file?: File;
  /** The status to return to if the removal is undone. */
  before?: Tile["status"];
};

export type ExistingFile = {
  id: string;
  originalName: string | null;
  uploadedAt: Date | null;
  /**
   * A short-lived signed link to the image itself, when the caller asked for
   * one and the file is an image. Absent on the durable track, which renders
   * the filename chip it always has.
   */
  previewUrl?: string | null;
};

function tileFrom(file: ExistingFile): Tile {
  return {
    key: file.id,
    fileId: file.id,
    name: file.originalName ?? "File",
    previewUrl: file.previewUrl ?? null,
    progress: 100,
    status: "done",
  };
}

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
 *
 * **Every tile can be removed, and a multi-file drop can be put in order**
 * (PORT-35). Until then an upload was permanent from the moment it landed —
 * the wrong logo, a blurry still, a duplicate — with no way back but asking
 * Taylor. Removal is the same quiet link with six seconds of undo the
 * repeatable block uses; the delete does not happen until the window closes.
 * Order is a grip handle plus Earlier / Later, and it is written to the row
 * (`intake_files.position`) so the intake document presents the stills the
 * way the client arranged them. Both tracks get both: a durable client with
 * the wrong photo is exactly as stuck as a showcase one.
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
  onRemoved,
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
  /**
   * Told the row id once a removal has actually happened on the server —
   * after the undo window, not at the click. For a surface that shows the
   * same file somewhere else (the recorder's transcript, the ingest step's
   * source list) and has to let it go too.
   */
  onRemoved?: (fileId: string) => void;
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
  const reduceMotion = useReducedMotion();
  const dndId = useId();

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
  const [tiles, setTiles] = useState<Tile[]>(() => existing.map(tileFrom));
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // A server render that arrives later (a refresh) can know files this list
  // does not — another tab's upload. They join at the end; nothing here is
  // reordered or dropped on the server's say-so.
  useEffect(() => {
    setTiles((current) => {
      const known = new Set(current.map((t) => t.fileId).filter(Boolean));
      const fresh = existing.filter((f) => !known.has(f.id)).map(tileFrom);
      return fresh.length > 0 ? [...current, ...fresh] : current;
    });
  }, [existing]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
    };
  }, []);

  // Object URLs are a leak if they outlive their tile.
  useEffect(() => {
    return () => {
      for (const tile of tiles) {
        if (tile.file && tile.previewUrl) URL.revokeObjectURL(tile.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function patch(key: string, changes: Partial<Tile>) {
    setTiles((current) =>
      current.map((tile) => (tile.key === key ? { ...tile, ...changes } : tile)),
    );
  }

  /**
   * The issue → PUT → confirm ladder moved to `../_lib/upload-file.ts` at
   * PORT-20 so the voice recorder could climb the same one rather than grow a
   * second. Behaviour here is unchanged, including that a failed confirm is
   * not surfaced — see the note on `confirmed` in that module.
   */
  async function send(tile: Tile) {
    const file = tile.file;
    if (!file) return;

    try {
      const { fileId } = await uploadIntakeFile(
        { token, stepKey, fieldKey, entryKey },
        file,
        file.name,
        (progress) => patch(tile.key, { progress }),
      );

      patch(tile.key, { status: "done", progress: 100, fileId });
      onUploaded?.(fileId);
    } catch {
      patch(tile.key, { status: "failed" });
    }
  }

  function choose(files: FileList | null) {
    if (!files) return;

    const next: Tile[] = Array.from(files).map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      fileId: null,
      name: file.name,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      progress: 0,
      status: file.size > MAX_UPLOAD_BYTES ? "too_large" : "uploading",
      file,
    }));

    setTiles((current) => [...current, ...next]);

    for (const tile of next) {
      if (tile.status === "uploading") void send(tile);
    }
  }

  /* ── Remove, with undo ─────────────────────────────────────────────────── */

  function dropTile(key: string) {
    setTiles((current) => current.filter((tile) => tile.key !== key));
  }

  /**
   * Remove is a promise the tile keeps for six seconds before acting on it.
   * A file that never reached the server just goes; one that did stays on
   * screen, marked, until the window closes and the delete is sent.
   */
  function remove(tile: Tile) {
    if (!tile.fileId) {
      dropTile(tile.key);
      setAnnouncement("Removed.");
      return;
    }

    patch(tile.key, { status: "removing", before: tile.status });
    setAnnouncement("Removed. Undo is available for a few seconds.");

    const timer = setTimeout(() => {
      timers.current.delete(tile.key);
      const fileId = tile.fileId!;
      void removeIntakeFile(token, fileId).then(
        () => {
          dropTile(tile.key);
          onRemoved?.(fileId);
        },
        () => {
          // [COPY — pending Taylor]
          patch(tile.key, { status: tile.status });
          setAnnouncement("That file didn't remove — try again.");
        },
      );
    }, UNDO_WINDOW_MS);
    timers.current.set(tile.key, timer);
  }

  function undo(tile: Tile) {
    const timer = timers.current.get(tile.key);
    if (timer) clearTimeout(timer);
    timers.current.delete(tile.key);
    patch(tile.key, { status: tile.before ?? "done", before: undefined });
    setAnnouncement("Kept.");
  }

  /* ── Order ─────────────────────────────────────────────────────────────── */

  const sortable = multiple && !preview;

  /** Writes the order of everything that has a row. Optimistic; a failure says so. */
  function commitOrder(next: Tile[]) {
    const ids = next.map((t) => t.fileId).filter((id): id is string => Boolean(id));
    void reorderIntakeFiles({ token, fieldKey, entryKey }, ids).catch(() => {
      // [COPY — pending Taylor]
      setAnnouncement("That order didn't save — try moving it again.");
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= tiles.length || from === to) return;
    const next = arrayMove(tiles, from, to);
    setTiles(next);
    setAnnouncement(`Moved to position ${to + 1} of ${next.length}.`);
    commitOrder(next);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = tiles.findIndex((t) => t.key === active.id);
    const to = tiles.findIndex((t) => t.key === over.id);
    if (from >= 0 && to >= 0) move(from, to);
  }

  const inFlight = tiles.filter((t) => t.status === "uploading").length;

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

  const list = (
    <ul className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
      {tiles.map((tile, index) => (
        <FileTile
          key={tile.key}
          tile={tile}
          index={index}
          count={tiles.length}
          sortable={sortable && tile.status === "done"}
          reduceMotion={Boolean(reduceMotion)}
          onRetry={() => {
            patch(tile.key, { status: "uploading", progress: 0 });
            void send(tile);
          }}
          onRemove={() => remove(tile)}
          onUndo={() => undo(tile)}
          onMove={(to) => move(index, to)}
        />
      ))}
    </ul>
  );

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
          : announcement}
      </p>

      {tiles.length > 0 ? (
        sortable ? (
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={{
              screenReaderInstructions: {
                draggable:
                  "To pick up an image, press Space. Use the arrow keys to move it, Space again to drop it, Escape to cancel.",
              },
            }}
          >
            <SortableContext
              items={tiles.map((t) => t.key)}
              strategy={rectSortingStrategy}
            >
              {list}
            </SortableContext>
          </DndContext>
        ) : (
          list
        )
      ) : null}
    </div>
  );
}

const ACTION =
  "font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-(--color-dim)";

/**
 * One tile: the picture (or the extension), the name, the state, and what
 * can be done about it. The grip sits on the picture so the caption stays
 * three short rows; Earlier / Later are the keyboard floor for the order,
 * the same law the repeatable block's Move up / Move down follow.
 */
function FileTile({
  tile,
  index,
  count,
  sortable,
  reduceMotion,
  onRetry,
  onRemove,
  onUndo,
  onMove,
}: {
  tile: Tile;
  index: number;
  count: number;
  sortable: boolean;
  reduceMotion: boolean;
  onRetry: () => void;
  onRemove: () => void;
  onUndo: () => void;
  onMove: (to: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.key, disabled: !sortable });

  const removing = tile.status === "removing";

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: reduceMotion ? undefined : transition,
        zIndex: isDragging ? 1 : undefined,
        position: "relative",
      }}
      className={`overflow-hidden rounded-(--radius) border border-(--color-faint) bg-(--color-card) ${
        isDragging ? "opacity-60" : ""
      } ${removing ? "opacity-50" : ""}`}
    >
      <div className="relative">
        {tile.previewUrl ? (
          // A signed link into the private bucket for a server file, an object
          // URL for a local one; never an optimizer URL — `remotePatterns`
          // covers the public route only, on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tile.previewUrl} alt="" className="h-20 w-full object-cover" />
        ) : (
          <p className="flex h-20 items-center justify-center truncate px-2 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
            {tile.name.split(".").pop()}
          </p>
        )}

        {sortable ? (
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={`Drag to reorder image ${index + 1}`}
            className="absolute top-1 left-1 flex size-9 touch-none cursor-grab items-center justify-center rounded-full border border-white/25 bg-[rgb(6_11_30/.62)] text-white backdrop-blur-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="p-2">
        <p className="truncate font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
          {tile.name}
        </p>

        {tile.status === "uploading" ? (
          <div className="mt-1.5 h-px w-full bg-(--color-faint)">
            <div
              className="h-px bg-(--color-c2) transition-[width] duration-(--dur-fast)"
              style={{ width: `${tile.progress}%` }}
            />
          </div>
        ) : null}

        {tile.status === "done" ? (
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-c2)">
            Sent
          </p>
        ) : null}

        {tile.status === "failed" ? (
          <button type="button" onClick={onRetry} className={`mt-1 ${ACTION} text-(--color-c2)`}>
            Didn&apos;t make it — tap to retry
          </button>
        ) : null}

        {tile.status === "too_large" ? (
          <p className="mt-1 font-mono text-[9px] uppercase leading-[1.5] tracking-[.14em] text-(--color-c2)">
            Too big — text this one to Taylor instead
          </p>
        ) : null}

        {removing ? (
          // [COPY — pending Taylor]
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-c2)">
            Removed.{" "}
            <button type="button" onClick={onUndo} className={`${ACTION} text-(--color-c2)`}>
              Undo
            </button>
          </p>
        ) : (
          <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
            {sortable ? (
              <>
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} earlier`}
                  disabled={index === 0}
                  onClick={() => onMove(index - 1)}
                  className={ACTION}
                >
                  Earlier
                </button>
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} later`}
                  disabled={index === count - 1}
                  onClick={() => onMove(index + 1)}
                  className={ACTION}
                >
                  Later
                </button>
              </>
            ) : null}
            <button
              type="button"
              aria-label={`Remove ${tile.name}`}
              disabled={tile.status === "uploading"}
              onClick={onRemove}
              className={ACTION}
            >
              Remove
            </button>
          </p>
        )}
      </div>
    </li>
  );
}
