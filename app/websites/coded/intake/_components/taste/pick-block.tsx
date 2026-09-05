"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import { DocTag } from "../../../../intake/_components/document";
import { TextArea } from "../../../../intake/_components/text-field";
import { PickScale } from "./pick-scale";

/** [COPY — draft] — every string in this component. */
const COPY = {
  select: "Select",
  noteLabel: "What do you like about it?",
  noteHelp:
    "Click around — the project pages and the about page count as much as the home page. A word or a paragraph, either is fine.",
  notePlaceholder:
    "The hover previews, the way the grid breathes, the project pages more than the home page…",
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  remove: "Remove",
  removed: "Removed.",
  undo: "Undo",
  noNote: "No note yet — the why is the useful part.",
  addNote: "Add a note",
};

const UNDO_WINDOW_MS = 6000;

export type Pick = { score?: number; note?: string };

/**
 * One kept reaction: a closeness score and the note that is the actual point.
 *
 * The same block appears three times — on a gallery row, inside the See more
 * overlay (PORT-24), and on each site the client found themselves — so it is
 * written once and the differences ride in props. Two questions asked three
 * times in three slightly different ways is how a form starts feeling like
 * three forms.
 *
 * ## What it refuses to do
 *
 * **It never blocks a save.** Save is enabled with no score and no note,
 * because nothing on this form refuses a save (D-INT-4). The one nudge is a dim
 * line in the saved state asking for the note once, and it is dim rather than
 * gold on purpose: a missing note is not a mistake.
 *
 * **Escape does not reach it.** There is no key handler here, so a stray
 * Escape inside the note does nothing — it cannot discard a half-typed
 * sentence. The overlay above it stops propagation for the same reason.
 *
 * ## Autosave
 *
 * Save flushes. Typing does not: the note commits on blur like every other
 * field on this form, so backing out of the step mid-sentence costs at most the
 * keystrokes since the last blur, and pressing Save is never the only thing
 * standing between a client and their words.
 */
export function PickBlock({
  idPrefix,
  pick,
  onSave,
  onRemove,
  onCancel,
  openInitially = false,
  onOpened,
  actions,
  removable = true,
}: {
  idPrefix: string;
  /** The saved reaction, or null when nothing has been kept yet. */
  pick: Pick | null;
  onSave: (next: Pick) => void;
  onRemove?: () => void;
  /** Called after Cancel, so a parent can drop an entry that was never filled. */
  onCancel?: () => void;
  /** Opens straight into the composer — a reference row, or an Edit from the picks list. */
  openInitially?: boolean;
  onOpened?: () => void;
  /** Rendered beside Select while idle. The overlay's trigger lands here (PORT-24). */
  actions?: ReactNode;
  /** Reference entries are removed by their own entry control, not by this one. */
  removable?: boolean;
}) {
  const document = useIsDocument();
  const [composing, setComposing] = useState(openInitially);
  const [score, setScore] = useState<number | undefined>(pick?.score);
  const [note, setNote] = useState(pick?.note ?? "");
  const [removed, setRemoved] = useState<Pick | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteId = `${idPrefix}-note`;

  /**
   * A draft the client has changed but not yet saved.
   *
   * Set on every edit while composing, cleared by Save and by Cancel. It exists
   * for the one case a person cannot recover from: the block unmounting while
   * they are mid-sentence — paging in the overlay, closing it, or collapsing
   * the group the row sits in. On this form answers are never lost, so an
   * unmount commits what they typed rather than discarding it.
   *
   * Cancel is the deliberate discard, and it clears this first — a client who
   * asked to throw the draft away gets that.
   */
  const pending = useRef<Pick | null>(null);
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current) saveRef.current(pending.current);
    };
  }, []);

  // An Edit pressed from the picks list opens this block where it sits.
  useEffect(() => {
    if (!openInitially) return;
    setComposing(true);
    setScore(pick?.score);
    setNote(pick?.note ?? "");
    onOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openInitially]);

  /** The draft as it stands, in the shape the answers document holds. */
  function draft(nextScore = score, nextNote = note): Pick {
    return {
      ...(nextScore === undefined ? {} : { score: nextScore }),
      ...(nextNote.trim() ? { note: nextNote.trim() } : {}),
    };
  }

  /** Records an unsaved edit, so an unmount can commit it. */
  function touch(nextScore: number | undefined, nextNote: string) {
    pending.current = draft(nextScore, nextNote);
  }

  function save() {
    pending.current = null;
    onSave(draft());
    setComposing(false);
  }

  function cancel() {
    pending.current = null;
    setScore(pick?.score);
    setNote(pick?.note ?? "");
    setComposing(false);
    onCancel?.();
  }

  function remove() {
    if (!onRemove) return;
    setRemoved(pick ?? {});
    onRemove();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRemoved(null), UNDO_WINDOW_MS);
  }

  /**
   * The document reads every state at once, because a reviewer cannot press
   * anything and a state behind a click is a question missing from the review
   * (ADM-2). The interface renders one state at a time, as it should.
   */
  if (document) {
    return (
      <div className="mt-5">
        <DocTag>Select · opens a scale and a note; saved, it shows both with Edit and Remove</DocTag>
        <PickScale idPrefix={idPrefix} value={undefined} onChange={() => {}} />
        <div className="mt-4">
          <p
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
          >
            {COPY.noteLabel}
          </p>
          <TextArea
            id={noteId}
            value=""
            onChange={() => {}}
            placeholder={COPY.notePlaceholder}
          />
          <p className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {COPY.noteHelp}
          </p>
        </div>
      </div>
    );
  }

  if (composing) {
    return (
      <div className="mt-5">
        <PickScale
          idPrefix={idPrefix}
          value={score}
          onChange={(next) => {
            setScore(next);
            touch(next, note);
          }}
        />

        <div className="mt-7">
          <label
            htmlFor={noteId}
            className="block font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
          >
            {COPY.noteLabel}
          </label>
          <div className="mt-2.5">
            <TextArea
              id={noteId}
              helpId={`${noteId}-help`}
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                touch(score, event.target.value);
              }}
              placeholder={COPY.notePlaceholder}
            />
          </div>
          <p
            id={`${noteId}-help`}
            className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
          >
            {COPY.noteHelp}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <GhostButton type="button" onClick={save}>
            {COPY.save}
          </GhostButton>
          <button
            type="button"
            onClick={cancel}
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {COPY.cancel}
          </button>
        </div>
      </div>
    );
  }

  if (pick) {
    return (
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            Picked ·{" "}
            <span className="text-(--color-c2)">
              {pick.score === undefined ? "—" : pick.score} / 7
            </span>
          </p>

          <span className="flex shrink-0 flex-wrap items-center gap-3">
            <BlockLink onClick={() => setComposing(true)}>
              {COPY.edit}
            </BlockLink>
            {removable && onRemove ? (
              <BlockLink onClick={remove}>{COPY.remove}</BlockLink>
            ) : null}
            {/* Picking a site is not a reason to stop being able to look at
                it — and the picks list sends people back to this row precisely
                to reconsider a score, which is a thing you do while looking. */}
            {actions}
          </span>
        </div>

        {pick.note?.trim() ? (
          <p className="mt-2.5 line-clamp-2 font-body text-[16px] font-light leading-[1.6] text-(--color-ink)">
            {pick.note}
          </p>
        ) : (
          <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {COPY.noNote}{" "}
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="underline underline-offset-2 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
            >
              {COPY.addNote}
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5">
      {removed ? (
        <p
          aria-live="polite"
          className="mb-3 font-body text-[13.5px] font-light text-(--color-c2)"
        >
          {COPY.removed}{" "}
          <button
            type="button"
            onClick={() => {
              onSave(removed);
              setScore(removed.score);
              setNote(removed.note ?? "");
              setRemoved(null);
            }}
            className="underline underline-offset-2 hover:text-(--color-c3)"
          >
            {COPY.undo}
          </button>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <GhostButton type="button" onClick={() => setComposing(true)}>
          {COPY.select}
        </GhostButton>
        {actions}
      </div>
    </div>
  );
}

/** Edit and Remove: real buttons with words, never icons. */
function BlockLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
    >
      {children}
    </button>
  );
}
