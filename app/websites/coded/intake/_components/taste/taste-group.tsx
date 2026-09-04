"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import type { ExampleGroup } from "@/content/intake-examples";
import { EXAMPLE_GROUPS } from "@/content/intake-examples/taxonomy";

/**
 * One archetype, closed until someone opens it.
 *
 * Twenty-plus live websites is a lot to hold in one scroll on a phone, and the
 * step this replaced laid every card out flat. Closed groups let a client spend
 * attention where they want it — and a group title is itself a first reaction:
 * "not that one" is a real answer, arrived at without opening anything.
 *
 * **Several may be open at once.** Forcing one-open is the accordion pattern
 * that makes people lose their place, and comparing two archetypes is exactly
 * what this screen is for.
 *
 * Open state is presentation only and is never persisted. It is lifted to the
 * step rather than held here so that the picks list can send someone back to a
 * row inside a group they had closed.
 *
 * In a document nobody can click, every group renders open: a row behind a
 * click is a question missing from the review (ADM-2).
 */
export function TasteGroup({
  group,
  count,
  picked,
  open,
  onToggle,
  children,
}: {
  group: ExampleGroup;
  count: number;
  picked: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const document = useIsDocument();
  const { title, line } = EXAMPLE_GROUPS[group];
  const bodyId = `group-${group}`;
  const expanded = document || open;

  return (
    <section className="border-t border-(--color-faint) first:border-t-0">
      <h3>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={onToggle}
          className="flex min-h-14 w-full items-start justify-between gap-4 py-5 text-left transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          <span className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
              {title}
            </span>
            <span className="mt-2 block font-body text-[13.5px] font-light leading-[1.6] text-(--color-body)">
              {line}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-3 pt-0.5">
            <span className="text-right font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
              {count} {count === 1 ? "site" : "sites"}
              {/* The count of picks is the only colour on a header, and it
                  appears only once there is something to count. */}
              {picked > 0 ? (
                <>
                  {" · "}
                  <span className="text-(--color-c2)">{picked} picked</span>
                </>
              ) : null}
            </span>
            <span
              aria-hidden
              className={`font-mono text-[10px] text-(--color-dim) transition-transform duration-(--dur-fast) ease-(--ease-out) ${
                expanded ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </span>
        </button>
      </h3>

      {expanded ? (
        <ul id={bodyId} className="mb-8 grid gap-4">
          {children}
        </ul>
      ) : null}
    </section>
  );
}
