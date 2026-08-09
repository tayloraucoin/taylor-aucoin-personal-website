"use client";

import { useState } from "react";
import type { ProcessContent } from "@/content/work";
import Section from "@/components/work/Section";
import ProcessMiniSection from "@/components/work/ProcessMiniSection";

function ToggleAllButton({
  allOpen,
  onClick,
}: {
  allOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-(--radius) border border-(--color-spec-border) px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[.10em] text-(--color-dim) transition-all duration-(--dur-fast) ease-(--ease-out) hover:border-(--color-c2) hover:text-(--color-c3)"
    >
      {allOpen ? "Collapse all" : "Expand all"}
    </button>
  );
}

export default function ProcessSection({ process }: { process: ProcessContent }) {
  const [openFlags, setOpenFlags] = useState(() =>
    process.sections.map(() => false),
  );

  const allOpen = openFlags.every(Boolean);
  const anyCollapsed = openFlags.some((v) => !v);

  const toggleAll = () => {
    setOpenFlags(process.sections.map(() => anyCollapsed));
  };

  const toggleOne = (i: number) => {
    setOpenFlags((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <Section
      label="Process"
      right={<ToggleAllButton allOpen={allOpen} onClick={toggleAll} />}
    >
      <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
        {process.intro}
      </p>
      {process.sections.map((s, i) => (
        <ProcessMiniSection
          key={s.header}
          section={s}
          open={openFlags[i] ?? false}
          onToggle={() => toggleOne(i)}
        />
      ))}
    </Section>
  );
}
