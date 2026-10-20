"use client";

import type { ReactNode } from "react";

/**
 * The summary row a filled entry collapses to, and the link that reopens it.
 *
 * Collapsing is **presentation and nothing else** (M-PORT-15). The answers
 * document is byte-identical whether every card is open or shut, the state is
 * never persisted, and autosave neither knows nor cares. What it buys is a
 * client with thirty entries seeing thirty rows instead of thirty forms.
 *
 * Extracted at PORT-14, when the fourth and fifth entry shapes arrived and the
 * behaviour needed to be identical across all of them. `ProjectEntryCard`
 * predates it and keeps its own copy for now, so the portfolio path stays
 * byte-for-byte what it was.
 */
export function EntrySummary({
  index,
  title,
  detail,
  badge,
  onOpen,
}: {
  index: number;
  title: string;
  /** The one dim field beside the title — year, format, status, price. */
  detail?: string;
  badge?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={false}
      className="flex min-h-12 w-full items-baseline gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 text-left transition-colors duration-(--dur-fast) hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
    >
      <span className="text-meta text-(--color-dim) tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 grow text-[16px] text-(--color-ink) sm:text-(length:--text-body)">
        {title}
        {detail ? (
          <span className="text-(--color-dim)"> · {detail}</span>
        ) : null}
      </span>
      {badge ? (
        <span className="shrink-0 text-meta text-(--color-dim)">{badge}</span>
      ) : null}
    </button>
  );
}

/** The link back to the summary row, shown at the top of an open entry. */
export function CollapseLink({ onCollapse }: { onCollapse: () => void }) {
  return (
    <button
      type="button"
      onClick={onCollapse}
      aria-expanded
      className="inline-flex min-h-11 items-center text-meta text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
    >
      Collapse
    </button>
  );
}

/** A labelled row inside an entry card. */
export function EntryRow({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-[15px] font-medium leading-[1.4] text-(--color-ink)"
      >
        {label}
      </label>
      {help ? (
        <p
          id={`${id}-help`}
          className="mt-1 text-meta leading-[1.55] text-(--color-dim)"
        >
          {help}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
