"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { LayoutGroup, motion, MotionConfig } from "motion/react";
import { siteRoutes } from "@/lib/routes";
import { CapabilityCard, type CapabilityChipItem } from "./CapabilityCard";

export type { CapabilityChipItem } from "./CapabilityCard";

const SHOWN = 8;

/**
 * The capability chips (D-SITE-46, 142, 147, 149): the first 8 in the order
 * given, Show all expands in place, the /capabilities link always shows.
 * A pressed chip becomes its card in place, one open at a time, as a
 * transform-based layout move (never an animated height): 200ms open, 160ms
 * close, instant when opened by keyboard or under reduced motion. Esc closes
 * and focus stays on the chip.
 */
export function CapabilityChips({
  items,
  doneAt,
  labels,
  initialOpen = null,
  initialAll = false,
}: {
  items: CapabilityChipItem[];
  doneAt: string;
  labels: { showAll: string; showFewer: string; search: string };
  initialOpen?: string | null;
  initialAll?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [all, setAll] = useState(initialAll);
  const instant = useRef(false);
  const [closing, setClosing] = useState(false);

  const shown = all ? items : items.slice(0, SHOWN);

  const toggle = (slug: string, byKeyboard: boolean) => {
    instant.current = byKeyboard;
    setClosing(open === slug);
    setOpen(open === slug ? null : slug);
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={id}>
        <ul className="mt-8 flex flex-wrap gap-3">
          {shown.map((item) => {
            const isOpen = open === item.slug;
            const panel = `${id}-${item.slug}`;
            return (
              <motion.li
                key={item.slug}
                layout="position"
                transition={{
                  duration: instant.current ? 0 : closing ? 0.16 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={
                  isOpen
                    ? "relative my-3 flex w-full flex-col rounded-(--radius) border border-(--color-line-strong) bg-(--color-card) p-6 md:p-7"
                    : "flex"
                }
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={(e) => toggle(item.slug, e.detail === 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && isOpen) {
                      e.preventDefault();
                      instant.current = false;
                      setClosing(true);
                      setOpen(null);
                    }
                  }}
                  className={
                    isOpen
                      ? "-mt-2 mb-2 inline-flex min-h-11 cursor-pointer items-center gap-2 self-end text-(length:--text-small) text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-ink) md:absolute md:top-5 md:right-7 md:m-0"
                      : "inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-(--radius) border border-(--color-line-strong) px-4 text-(length:--text-body) text-(--color-ink) transition-colors duration-(--dur-fast) hover:border-(--color-ink)"
                  }
                >
                  {item.name}
                  {isOpen ? (
                    <Minus aria-hidden size={16} strokeWidth={1.5} />
                  ) : (
                    <Plus aria-hidden size={16} strokeWidth={1.5} />
                  )}
                </button>
                <div id={panel} hidden={!isOpen}>
                  {isOpen && <CapabilityCard item={item} doneAt={doneAt} />}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          aria-expanded={all}
          onClick={() => {
            if (all && open && items.findIndex((i) => i.slug === open) >= SHOWN)
              setOpen(null);
            setAll(!all);
          }}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-(length:--text-small) text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-body)"
        >
          {all ? labels.showFewer : labels.showAll}
          {all ? (
            <ChevronUp aria-hidden size={16} strokeWidth={1.5} />
          ) : (
            <ChevronDown aria-hidden size={16} strokeWidth={1.5} />
          )}
        </button>
        <Link
          href={siteRoutes.capabilities}
          className="inline-flex min-h-11 items-center text-(length:--text-small) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)"
        >
          {labels.search}
        </Link>
      </div>
    </MotionConfig>
  );
}
