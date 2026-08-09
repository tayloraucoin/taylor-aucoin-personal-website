"use client";

import { useId, type KeyboardEvent } from "react";
import type { ProcessSection as ProcessSectionType } from "@/content/work";
import BulletList from "@/components/ui/BulletList";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      className={[
        "shrink-0 text-(--color-dim) transition-transform duration-(--dur-fast) ease-(--ease-out)",
        open ? "rotate-90" : "rotate-0",
      ].join(" ")}
    >
      <path
        d="M3.5 1.5L7.5 5L3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProcessMiniSection({
  section,
  open,
  onToggle,
  className,
}: {
  section: ProcessSectionType;
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const bulletsId = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={bulletsId}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="mt-7 cursor-pointer"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-ink)">
            {section.header}
          </h3>
          <Chevron open={open} />
        </div>
        <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
          {section.intro}
        </p>
      </div>
      <div
        id={bulletsId}
        className={[
          "grid overflow-hidden transition-[grid-template-rows] duration-(--dur-base) ease-(--ease-out)",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3">
            <BulletList items={section.bullets} />
          </div>
        </div>
      </div>
    </div>
  );
}
