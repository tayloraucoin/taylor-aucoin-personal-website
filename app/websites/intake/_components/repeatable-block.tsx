"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GhostButton } from "@/components/ui/GradientButton";
import { useIsDocument } from "@/components/intake/preview-mode";
import { DocTag } from "./document";

const UNDO_WINDOW_MS = 6000;

/**
 * A list of the same block repeated — services, add-ons, staff.
 *
 * Removal is a quiet text link with six seconds of undo rather than a confirm
 * dialog. On a form this forgiving, a modal asking "are you sure?" about a
 * half-typed service line is friction for a mistake that costs nothing; the
 * undo covers the fat-thumb case without stopping anyone.
 *
 * Indices are the site's gold mono row-index idiom, which is what makes a
 * stack of identical cards scannable.
 */
export function RepeatableBlock<T>({
  items,
  onChange,
  emptyItem,
  addLabel,
  renderItem,
}: {
  items: readonly T[];
  onChange: (next: T[]) => void;
  emptyItem: () => T;
  addLabel: string;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
}) {
  const [removed, setRemoved] = useState<{ item: T; index: number } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const document = useIsDocument();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Always show at least one block: an empty list reads as a broken screen
  // rather than an invitation.
  const blocks = items.length > 0 ? items : [emptyItem()];

  /**
   * One entry, and the fact that there can be any number of them.
   *
   * The index chrome, the remove link, and the add button are all machinery for
   * *managing* a list; none of them is a question, and printing the same entry
   * shape three times would say nothing the add label does not. The add label
   * itself is client copy and carries the shape's name ("Add another project"),
   * which is why it rides in the tag rather than being dropped.
   *
   * `update` is a no-op here: a document has no state to change.
   */
  if (document) {
    return (
      <div>
        <DocTag>Repeatable · &ldquo;{addLabel}&rdquo;</DocTag>
        <div className="mt-3 border-l border-(--color-faint) pl-5">
          {renderItem(blocks[0]!, 0, () => {})}
        </div>
      </div>
    );
  }

  function update(index: number, next: T) {
    const copy = [...blocks];
    copy[index] = next;
    onChange(copy);
  }

  function remove(index: number) {
    setRemoved({ item: blocks[index]!, index });
    onChange(blocks.filter((_, i) => i !== index));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRemoved(null), UNDO_WINDOW_MS);
  }

  function undo() {
    if (!removed) return;
    const copy = [...blocks];
    copy.splice(removed.index, 0, removed.item);
    onChange(copy);
    setRemoved(null);
  }

  return (
    <div>
      {blocks.map((item, index) => (
        <div
          key={index}
          className="mb-4 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
              {String(index + 1).padStart(2, "0")}
            </span>

            {blocks.length > 1 ? (
              <button
                type="button"
                onClick={() => remove(index)}
                className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c2)"
              >
                Remove
              </button>
            ) : null}
          </div>

          {renderItem(item, index, (next) => update(index, next))}
        </div>
      ))}

      {removed ? (
        <p
          aria-live="polite"
          className="mb-4 font-body text-[13.5px] font-light text-(--color-c2)"
        >
          Removed.{" "}
          <button
            type="button"
            onClick={undo}
            className="underline underline-offset-2 hover:text-(--color-c3)"
          >
            Undo
          </button>
        </p>
      ) : null}

      <GhostButton onClick={() => onChange([...blocks, emptyItem()])}>
        {addLabel}
      </GhostButton>
    </div>
  );
}
