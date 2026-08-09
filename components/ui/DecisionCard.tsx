import type { Decision } from "@/content/work";
import Chip from "./Chip";

/**
 * Card treatment matching LabelCard surfaces (--color-spec-bg /
 * --color-spec-border, 3px radius, 24px padding). Static — no ring, no hover.
 *
 * Anatomy, top to bottom: optional chip row, decision statement (card-heading),
 * then INSTEAD OF / WHY blocks — label on its own line, body below it. Blocks
 * stack vertically; labels never inline with body text.
 */
export default function DecisionCard({ d }: { d: Decision }) {
  return (
    <div className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-6">
      {d.chip && (
        <div className="mb-3">
          <Chip>{d.chip}</Chip>
        </div>
      )}
      <p className="mb-3 font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)">
        {d.decision}
      </p>
      <div className="max-w-[58ch]">
        <span className="block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-dim)">
          Instead of
        </span>
        <p className="mt-1.5 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
          {d.alternative}
        </p>
      </div>
      <div className="mt-4 max-w-[58ch]">
        <span className="block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
          Why
        </span>
        <p className="mt-1.5 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
          {d.why}
        </p>
      </div>
    </div>
  );
}
