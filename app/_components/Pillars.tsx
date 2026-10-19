"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import GradientRing from "@/components/ui/GradientRing";

type Pillar = { title: string; line: string; open: string };

/**
 * The pillars (D-SITE-44): one ringed panel of four rows that open in place.
 * Each row is a button with `aria-expanded`; pressing it keeps focus on the
 * button, Esc closes it and focus stays. The ring is the house's masked
 * ring (law 1), which stops under reduced motion. The open row fades in by
 * CSS (`@starting-style`), never an animated height.
 *
 * Padding is the Paper artboards' (feedback 2026-10-19): the panel is 8px by
 * 32px with 24px rows at 1440, 4px by 20px with 20px rows at 390. A closed
 * row is as tall as its text; at 1440 the full-width button is 27px, past
 * the 24px target floor.
 */
export function Pillars({
  items,
  initialOpen = null,
}: {
  items: readonly Pillar[];
  initialOpen?: number | null;
}) {
  const id = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(
    () => new Set(initialOpen === null ? [] : [initialOpen]),
  );

  const set = (i: number, next: boolean) =>
    setOpen((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(i);
      else copy.delete(i);
      return copy;
    });

  return (
    <section aria-label="Pillars" className="mt-16 md:mt-24">
      <GradientRing
        hoverAccelerate={false}
        className="px-5 py-1 md:px-8 md:py-2"
      >
        <ul className="divide-y divide-(--color-line-soft)">
          {items.map((p, i) => {
            const isOpen = open.has(i);
            const panel = `${id}-pillar-${i}`;
            return (
              <li key={p.title} className="py-5 md:py-6">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => set(i, !isOpen)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" && isOpen) {
                        e.preventDefault();
                        set(i, false);
                      }
                    }}
                    className="grid w-full cursor-pointer grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-left md:grid-cols-[280px_1fr_auto] md:gap-x-8"
                  >
                    <span className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
                      {p.title}
                    </span>
                    <span className="col-start-1 row-start-2 text-(length:--text-body) leading-[1.6] text-(--color-body) md:col-start-2 md:row-start-1">
                      {p.line}
                    </span>
                    <span
                      aria-hidden
                      className="col-start-2 row-start-1 pt-1 text-(--color-dim) md:col-start-3"
                    >
                      {isOpen ? (
                        <Minus size={18} strokeWidth={1.5} />
                      ) : (
                        <Plus size={18} strokeWidth={1.5} />
                      )}
                    </span>
                  </button>
                </h3>
                <div
                  id={panel}
                  hidden={!isOpen}
                  className="mt-3 text-(length:--text-body) leading-[1.6] text-(--color-body) transition-[opacity,translate] duration-(--dur-fast) ease-(--ease-out) md:ml-[312px] md:pr-12 starting:-translate-y-1 starting:opacity-0"
                >
                  {p.open}
                </div>
              </li>
            );
          })}
        </ul>
      </GradientRing>
    </section>
  );
}
