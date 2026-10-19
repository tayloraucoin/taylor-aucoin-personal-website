"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { chipVariants, tabVariants } from "@/components/ui/Button";

export type TabChip = {
  key: string;
  label: string;
  /** Story ids in the order they show. */
  ids: string[];
  links: { label: string; href: string }[];
};

export type WorkTab = {
  key: string;
  label: string;
  /** Featured first; one chip means the tab shows no filter (D-SITE-54). */
  chips: TabChip[];
};

/**
 * Selected work's tabs and type chips (D-SITE-51, 54): the ARIA tabs pattern
 * with roving tabIndex and arrow keys, and a labelled group of aria-pressed
 * chips. The stories are server-rendered and handed in by id, so no work
 * content enters this leaf. A chip change keeps focus on the chip and
 * announces the count politely.
 */
export function WorkTabs({
  tabs,
  stories,
  liveCount,
  initialTab,
  initialChip,
}: {
  tabs: WorkTab[];
  stories: Record<string, ReactNode>;
  liveCount: string;
  initialTab?: string;
  initialChip?: string;
}) {
  const id = useId();
  const [tabKey, setTabKey] = useState(initialTab ?? tabs[0].key);
  const tab = tabs.find((t) => t.key === tabKey) ?? tabs[0];
  const [chipKey, setChipKey] = useState(initialChip ?? tab.chips[0].key);
  const chip = tab.chips.find((c) => c.key === chipKey) ?? tab.chips[0];
  const [announce, setAnnounce] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectTab = (i: number, focus: boolean) => {
    const next = tabs[i];
    setTabKey(next.key);
    setChipKey(next.chips[0].key);
    setAnnounce("");
    if (focus) tabRefs.current[i]?.focus();
  };

  const tabIndex = tabs.indexOf(tab);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 border-b border-(--color-line-soft) md:flex-row md:items-end md:justify-between">
        <div
          role="tablist"
          aria-label="Discipline"
          className="flex flex-wrap gap-x-8"
          onKeyDown={(e) => {
            const last = tabs.length - 1;
            const to =
              e.key === "ArrowRight"
                ? tabIndex === last
                  ? 0
                  : tabIndex + 1
                : e.key === "ArrowLeft"
                  ? tabIndex === 0
                    ? last
                    : tabIndex - 1
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? last
                      : null;
            if (to === null) return;
            e.preventDefault();
            selectTab(to, true);
          }}
        >
          {tabs.map((t, i) => (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={t === tab}
              aria-controls={`${id}-panel`}
              tabIndex={t === tab ? 0 : -1}
              onClick={() => selectTab(i, false)}
              className={tabVariants({ selected: t === tab })}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab.chips.length > 1 && (
          <div
            role="group"
            aria-label="Type"
            className="flex flex-wrap gap-2 pb-4 md:justify-end"
          >
            {tab.chips.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={c === chip}
                onClick={() => {
                  setChipKey(c.key);
                  setAnnounce(liveCount.replace("{n}", String(c.ids.length)));
                }}
                className={chipVariants({ selected: c === chip })}
              >
                {c === chip && (
                  <Check
                    aria-hidden
                    size={14}
                    strokeWidth={2}
                    className="text-(--color-mark)"
                  />
                )}
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tab.key}`}
      >
        {chip.ids.map((storyId) => (
          <div
            key={`${tab.key}-${storyId}`}
            className="border-t border-(--color-line-soft) first:border-t-0"
          >
            {stories[storyId]}
          </div>
        ))}
        <p className="flex flex-wrap gap-x-6 gap-y-2 border-t border-(--color-line-soft) pt-6">
          {chip.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)"
            >
              {l.label}
            </Link>
          ))}
        </p>
      </div>
    </>
  );
}

/**
 * The hero's See the work (D-SITE-4): to the first story, focus on its
 * heading; instant under reduced motion (D-SITE-178).
 */
export function SeeTheWorkLink({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#work"
      className={className}
      onClick={(e) => {
        const heading = document.querySelector<HTMLElement>(
          "#work [role=tabpanel] h3",
        );
        if (!heading) return;
        e.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        heading.scrollIntoView({
          behavior: reduce ? "instant" : "smooth",
          block: "start",
        });
        heading.focus({ preventScroll: true });
        history.replaceState(null, "", "#work");
      }}
    >
      {children}
    </a>
  );
}
