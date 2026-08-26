"use client";

import { useState } from "react";
import type { ExampleSite } from "@/content/intake-examples";
import type { TasteFavourite } from "@/lib/validators/showcase-intake";
import { TextArea } from "../../../intake/_components/text-field";

/**
 * The ranked shortlist. Order is the rank; there is no position field.
 *
 * **Move up and Move down are the floor, not the fallback.** They are always
 * rendered — never revealed on hover, because a phone has no hover and a
 * keyboard user has no pointer. Dragging is the enhancement layered on top; if
 * it fails, breaks, or is unavailable, nothing is lost, because the buttons
 * were the real control the whole time (D-PORT-4).
 *
 * Every reorder announces its result politely: a client who cannot see the list
 * reflow still learns where the row went.
 *
 * Reduced motion is handled by not animating at all. There is no transition on
 * position here — a list that reorders instantly is correct for everyone, and
 * a lift-and-settle would be the one motion on this surface that had to be
 * suppressed rather than designed.
 *
 * A site that has left the gallery still renders, by its stored key, with a
 * dim marker. Silently dropping someone's ranked favourite because the
 * curation changed would edit their answers without telling them.
 */
export function FavouritesRank({
  favourites,
  siteFor,
  onChange,
  onBlur,
}: {
  favourites: readonly TasteFavourite[];
  siteFor: (key: string) => ExampleSite | undefined;
  onChange: (next: TasteFavourite[]) => void;
  onBlur: () => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  const [dragging, setDragging] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= favourites.length) return;

    const next = [...favourites];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row!);
    onChange(next);

    const name = siteFor(row!.siteKey)?.name ?? "That site";
    setAnnouncement(`${name} moved to position ${to + 1} of ${next.length}.`);
  };

  const remove = (index: number) => {
    const row = favourites[index]!;
    const name = siteFor(row.siteKey)?.name ?? "That site";
    onChange(favourites.filter((_, i) => i !== index));
    setAnnouncement(`${name} removed from your favourites.`);
  };

  return (
    <div>
      <p className="max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        Drag your favourites into order, best first. Then tell us why — the why
        is worth more than the order.
      </p>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <ol className="mt-5 space-y-3">
        {favourites.map((favourite, index) => {
          const site = siteFor(favourite.siteKey);

          return (
            <li
              key={favourite.siteKey}
              draggable
              onDragStart={() => setDragging(index)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragging !== null && dragging !== index) move(dragging, index);
                setDragging(null);
              }}
              className={`rounded-(--radius) border bg-(--color-card) p-4 ${
                dragging === index
                  ? "border-[rgb(232_185_97/.55)]"
                  : "border-(--color-faint)"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 grow font-body text-[16px] font-light text-(--color-ink)">
                  {site?.name ?? favourite.siteKey}
                  {site ? null : (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                      no longer in the gallery
                    </span>
                  )}
                </span>

                <span className="flex shrink-0 items-center gap-1">
                  <RankButton
                    label={`Move ${site?.name ?? "this site"} up`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    Move up
                  </RankButton>
                  <RankButton
                    label={`Move ${site?.name ?? "this site"} down`}
                    disabled={index === favourites.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    Move down
                  </RankButton>
                  <RankButton
                    label={`Remove ${site?.name ?? "this site"} from favourites`}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </RankButton>
                </span>
              </div>

              {/* The note stays open for editing here — the why is the point,
                  and hiding it behind a tap would make it the optional half. */}
              <div className="mt-3">
                <TextArea
                  id={`rank-note-${favourite.siteKey}`}
                  rows={2}
                  value={favourite.note ?? ""}
                  onChange={(event) => {
                    const next = [...favourites];
                    next[index] = { ...favourite, note: event.target.value };
                    onChange(next);
                  }}
                  onBlur={onBlur}
                  placeholder="Why this one?"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A reorder control. Always rendered, never hover-revealed. */
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
      className="min-h-11 rounded-(--radius) px-2.5 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim) transition-colors hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
    >
      {children}
    </button>
  );
}
