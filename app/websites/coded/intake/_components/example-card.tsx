"use client";

import Image from "next/image";
import type { ExampleSite } from "@/content/intake-examples";
import { TextArea } from "../../../intake/_components/text-field";

/**
 * One example site in the taste gallery.
 *
 * **Nothing on this card may out-dress the step's CTA.** No ring, no gradient,
 * no lift — the gallery is the instrument, not the exhibit, and a card that
 * competes with the button is the atmosphere beating the interface (site
 * invariant 2). Selection is a border and a warmed background, the same
 * grammar every other choice on this surface uses.
 *
 * The favourite control is a real button with words, not a heart or a star. An
 * icon means whatever the person looking at it assumes; "Add to favourites"
 * and "In your favourites" mean one thing each.
 *
 * Captures carry their intrinsic pixel dimensions from the content file and
 * are lazy below the fold — a twenty-four-site gallery must not pay for
 * twenty-four screenshots before the client has scrolled to the second one.
 */
export function ExampleCard({
  site,
  favourited,
  note,
  onToggle,
  onNote,
  onBlur,
  priority,
}: {
  site: ExampleSite;
  favourited: boolean;
  note: string;
  onToggle: () => void;
  onNote: (next: string) => void;
  onBlur: () => void;
  /** The first row loads eagerly; everything below it waits to be scrolled to. */
  priority?: boolean;
}) {
  const noteId = `note-${site.key}`;

  return (
    <li
      className={`overflow-hidden rounded-(--radius) border transition-colors duration-(--dur-fast) ease-(--ease-out) ${
        favourited
          ? "border-[rgb(232_185_97/.55)] bg-(--color-card-hover)"
          : "border-(--color-faint) bg-(--color-card)"
      }`}
    >
      <div className="flex gap-2 overflow-x-auto">
        {site.captures.map((capture, index) => (
          <Image
            key={capture.src}
            src={capture.src}
            alt={index === 0 ? `${site.name} — ${capture.alt}` : capture.alt}
            width={capture.width}
            height={capture.height}
            loading={priority && index === 0 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 92vw, 520px"
            className="h-auto w-full shrink-0 grow-0 basis-full"
          />
        ))}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)">
            {site.name}
          </p>

          {/* A new tab, because leaving mid-form is safe — autosave has already
              kept everything — but coming back should not cost them the page. */}
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            Visit site
          </a>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={favourited}
          className={`mt-3 flex min-h-12 w-full items-center gap-3 rounded-(--radius) border px-3.5 py-3 text-left font-body text-[16px] font-light leading-[1.4] transition-colors duration-(--dur-fast) ease-(--ease-out) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
            favourited
              ? "border-[rgb(232_185_97/.55)] bg-(--color-card-hover) text-(--color-ink)"
              : "border-(--color-faint) bg-(--color-card) text-(--color-body) hover:border-[rgb(232_185_97/.28)] hover:bg-(--color-card-hover)"
          }`}
        >
          <span
            aria-hidden
            className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) ${
              favourited ? "bg-(--color-c2)" : "bg-(--color-faint)"
            }`}
          />
          {favourited ? "In your favourites" : "Add to favourites"}
        </button>

        <div className="mt-3">
          <label
            htmlFor={noteId}
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
          >
            Add a note
          </label>
          <div className="mt-2">
            <TextArea
              id={noteId}
              rows={2}
              value={note}
              onChange={(event) => onNote(event.target.value)}
              onBlur={onBlur}
              placeholder="What catches you — good or bad. A detail, a feeling, the type, the way it moves."
            />
          </div>
        </div>
      </div>
    </li>
  );
}
