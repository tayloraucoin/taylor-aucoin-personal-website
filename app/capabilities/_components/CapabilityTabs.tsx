"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { CapabilityChips } from "@/components/capabilities/CapabilityChips";
import { tabVariants } from "@/components/ui/Button";
import {
  itemsForTab,
  searchWithTab,
  TAB_KEYS,
  type TabbedChipItem,
  type TabKey,
} from "./tabs";
import { capabilitiesPage as words } from "./words";

/**
 * The discipline tabs over the chips (D-SITE-146): an ARIA tablist with one
 * tab stop, arrows and Home/End moving focus and selection together. The
 * selected tab is written to `?tab=` by `replaceState`, so no history entry
 * and no server render; All removes it. At 390 the strip scrolls sideways
 * and keeps the selected tab in view. A tab change that drops an open card's
 * chip closes the card; focus stays on the tab (D-SITE-205).
 */
export function CapabilityTabs({
  items,
  initialTab,
  initialOpen = null,
}: {
  items: TabbedChipItem[];
  initialTab: TabKey;
  initialOpen?: string | null;
}) {
  const id = useId();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const strip = useRef<HTMLDivElement>(null);
  const tabs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const shown = useMemo(() => itemsForTab(items, tab), [items, tab]);

  // Keep the selected tab inside the strip's visible width.
  useEffect(() => {
    const box = strip.current;
    const el = tabs.current[tab];
    if (!box || !el) return;
    const left = el.offsetLeft - box.offsetLeft;
    const right = left + el.offsetWidth;
    if (left < box.scrollLeft) box.scrollLeft = left;
    else if (right > box.scrollLeft + box.clientWidth)
      box.scrollLeft = right - box.clientWidth;
  }, [tab]);

  const select = (next: TabKey, focus: boolean) => {
    if (focus) tabs.current[next]?.focus();
    if (next === tab) return;
    setTab(next);
    const { pathname, search, hash } = window.location;
    window.history.replaceState(
      null,
      "",
      `${pathname}${searchWithTab(search, next)}${hash}`,
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = TAB_KEYS.indexOf(tab);
    const last = TAB_KEYS.length - 1;
    const to =
      e.key === "ArrowRight"
        ? at === last
          ? 0
          : at + 1
        : e.key === "ArrowLeft"
          ? at === 0
            ? last
            : at - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (to === null) return;
    e.preventDefault();
    select(TAB_KEYS[to], true);
  };

  const tabId = (key: TabKey) => `${id}-tab-${key}`;
  const panel = `${id}-panel`;

  return (
    <>
      <div
        ref={strip}
        className="-mx-1 overflow-x-auto px-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          role="tablist"
          aria-label={words.tabsName}
          onKeyDown={onKeyDown}
          className="flex w-max min-w-full gap-x-4 border-b border-(--color-line-soft) md:gap-x-8"
        >
          {TAB_KEYS.map((key) => {
            const selected = key === tab;
            return (
              <button
                key={key}
                ref={(el) => {
                  tabs.current[key] = el;
                }}
                type="button"
                role="tab"
                id={tabId(key)}
                aria-selected={selected}
                aria-controls={panel}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(key, false)}
                className={`${tabVariants({ selected })} shrink-0 font-medium whitespace-nowrap`}
              >
                {words.tabs[key]}
              </button>
            );
          })}
        </div>
      </div>
      <div
        role="tabpanel"
        id={panel}
        aria-labelledby={tabId(tab)}
        className="md:mt-8"
      >
        <CapabilityChips
          items={shown}
          doneAt={words.doneAt}
          initialOpen={initialOpen}
          titleAs="h2"
          externalNote={words.externalNote}
        />
      </div>
    </>
  );
}
