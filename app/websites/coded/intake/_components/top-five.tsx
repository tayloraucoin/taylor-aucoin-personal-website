"use client";

import { useState } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import type { ProjectEntry } from "@/lib/validators/showcase-intake";
import {
  CARD_CLASS,
  SELECTED_CLASS,
  UNSELECTED_CLASS,
} from "../../../intake/_components/choice-group";
import { DocHint, DocTag } from "../../../intake/_components/document";

const LIMIT = 5;

/**
 * "If you could only show five" — picked from the rows, not typed into a box.
 *
 * It was a textarea until PORT-19, which asked someone who had just described
 * thirty projects to name five of them again from memory, in prose, and then
 * asked us to match those names back to entries. Everybody involved was doing
 * the other one's job.
 *
 * **The order is the rank.** There is no position field to disagree with the
 * array, the same law the taste favourites live under. Ticking appends;
 * Move up and Move down are always rendered, never revealed on hover, because
 * a phone has no hover and a keyboard user has no pointer (D-PORT-4).
 *
 * **The sixth tick is refused out loud.** A cap that silently ignored a tap
 * would read as a broken checkbox; the line says the number and stays until
 * something changes. Nothing else on this form refuses input, and this one is
 * a cap the question itself states — "only five" is the question.
 *
 * A pick whose project has since been removed keeps its place, marked. Quietly
 * dropping it would be editing an answer because something else changed.
 */
export function TopFive({
  projects,
  picks,
  onChange,
  onBlur,
}: {
  projects: readonly ProjectEntry[];
  picks: readonly string[];
  onChange: (next: string[]) => void;
  onBlur: () => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  const [refused, setRefused] = useState(false);
  const document = useIsDocument();

  const titleFor = (key: string, index?: number) => {
    const project = projects.find((p) => p.entryKey === key);
    if (!project) return null;
    return (
      project.title?.trim() ||
      `Untitled project ${(index ?? projects.indexOf(project)) + 1}`
    );
  };

  const commit = (next: string[]) => {
    onChange(next);
    onBlur();
  };

  const toggle = (key: string) => {
    if (picks.includes(key)) {
      setRefused(false);
      commit(picks.filter((pick) => pick !== key));
      return;
    }

    if (picks.length >= LIMIT) {
      setRefused(true);
      return;
    }

    setRefused(false);
    commit([...picks, key]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= picks.length) return;

    const next = [...picks];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row!);
    commit(next);

    setAnnouncement(
      `${titleFor(row!) ?? "That project"} moved to position ${to + 1} of ${next.length}.`,
    );
  };

  /**
   * A review reading of a control whose options are the client's own projects.
   *
   * There are none to print — the rows come from an answer given four steps
   * earlier, which a review surface holds nothing of. So the tag says what the
   * control is and the hint says where its rows come from, which is the fact a
   * reviewer needs and the only one this screen can honestly supply.
   */
  if (document) {
    return (
      <>
        <DocTag>Pick up to {LIMIT} · rows are their own projects</DocTag>
        <DocHint>
          Every project from the block above, tickable. The order they tick is
          the rank, and Move up / Move down reorder it. A sixth tick is refused
          with a line rather than ignored.
        </DocHint>
      </>
    );
  }

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-col gap-2">
        {projects.map((project, index) => {
          const key = project.entryKey;
          const rank = picks.indexOf(key);
          const picked = rank >= 0;

          return (
            <label
              key={key}
              className={`${CARD_CLASS} cursor-pointer ${
                picked ? SELECTED_CLASS : UNSELECTED_CLASS
              }`}
            >
              <input
                type="checkbox"
                checked={picked}
                onChange={() => toggle(key)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mr-3 w-6 shrink-0 font-mono text-[10px] tracking-[.18em] ${
                  picked ? "text-(--color-c2)" : "text-(--color-faint)"
                }`}
              >
                {picked ? String(rank + 1).padStart(2, "0") : "—"}
              </span>
              <span className="min-w-0 grow">
                {project.title?.trim() || `Untitled project ${index + 1}`}
                {project.year ? (
                  <span className="text-(--color-dim)"> · {project.year}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {/* Stays until something changes, rather than fading: the client tapped
          a sixth row and nothing happened, and that needs an explanation for
          as long as it is true. Gold, like every other note on this form — the
          palette has no red and nothing here is the client's mistake. */}
      {refused ? (
        <p
          aria-live="polite"
          className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          That&apos;s {LIMIT} already — untick one to make room. The limit is
          the question, not a rule: five is what makes the answer useful.
        </p>
      ) : null}

      {picks.length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            In order, best first
          </p>

          <ol className="mt-3 space-y-2">
            {picks.map((key, index) => {
              const title = titleFor(key);

              return (
                <li
                  key={key}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-2 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3"
                >
                  <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 grow font-body text-[16px] font-light text-(--color-ink)">
                    {title ?? "That project"}
                    {title ? null : (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                        no longer in your list
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    <RankButton
                      label={`Move ${title ?? "this project"} up`}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      Move up
                    </RankButton>
                    <RankButton
                      label={`Move ${title ?? "this project"} down`}
                      disabled={index === picks.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      Move down
                    </RankButton>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function RankButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-(--radius) px-2 py-1 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-(--color-dim)"
    >
      {children}
    </button>
  );
}
