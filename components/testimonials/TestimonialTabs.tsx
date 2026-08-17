"use client";

import { useState } from "react";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import {
  visibleTestimonials,
  type TestimonialRelationship,
} from "@/content/testimonials";

/** "worked with", not "worked for" — the tab absorbs managers AND peers
 *  (Bruno, Nick); each card's relationship line carries the precision. */
const TABS: Array<{ key: TestimonialRelationship; label: string }> = [
  { key: "worked-for", label: "People I worked with" },
  { key: "led", label: "Engineers I led" },
];

/**
 * TST-04 — the /testimonials page body. Two tabs for the two-sided story:
 * the people who hired Taylor, and the engineers who shipped under him.
 * Tab switch is an instant filter — nothing animates, nothing to freeze
 * under prefers-reduced-motion.
 */
export default function TestimonialTabs() {
  const [tab, setTab] = useState<TestimonialRelationship>("worked-for");
  const visible = visibleTestimonials().filter((t) => t.relationship === tab);

  return (
    <div>
      {/* Tracking tightens below md: at .28em the two labels overflow 375px
          and wrap mid-phrase. Desktop keeps the section-label register. */}
      <div
        role="tablist"
        aria-label="Testimonial groups"
        className="flex gap-5 border-b border-(--color-faint) md:gap-7"
      >
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px whitespace-nowrap border-b pb-4 font-mono text-[10px] uppercase tracking-[.14em] transition-colors duration-(--dur-fast) md:tracking-[.28em] ${
                active
                  ? "border-(--color-c2) text-(--color-ink)"
                  : "border-transparent text-(--color-dim) hover:text-(--color-body)"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {visible.map((t) => (
            <TestimonialCard key={t.slug} t={t} detail />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
          Quotes from this group are being confirmed.
        </p>
      )}
    </div>
  );
}
