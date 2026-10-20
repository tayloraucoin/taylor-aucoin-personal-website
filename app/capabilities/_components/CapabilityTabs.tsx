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
import { CapabilityFilter } from "./CapabilityFilter";
import { NoMatch } from "./NoMatch";
import {
  filterItems,
  itemsForTab,
  searchWithState,
  TAB_KEYS,
  type TabbedChipItem,
  type TabKey,
} from "./tabs";
import { capabilitiesPage as words } from "./words";

/** The status region speaks once typing has rested this long. */
const SETTLE_MS = 500;

/**
 * The filter over the discipline tabs over the chips (D-SITE-146, 148). One
 * leaf owns the query and the tab together: a tab change re-filters, typing
 * never moves the tab. Both live in the URL by one `replaceState`, so no
 * history entry and no server render; the open card never does.
 *
 * The tablist has one tab stop, arrows and Home/End moving focus and
 * selection. At 390 the strip scrolls sideways and keeps the selected tab in
 * view. A change that drops an open card's chip closes it and leaves focus
 * where it was (D-SITE-205).
 *
 * Motion (D-SITE-147, 178): typing and keyboard changes are instant; a
 * pointer tab change cross-fades the list in 120ms with scroll held; under
 * reduced motion every transition in this tree is 0s.
 */
export function CapabilityTabs({
  items,
  initialTab,
  initialQuery = "",
  initialOpen = null,
}: {
  items: TabbedChipItem[];
  initialTab: TabKey;
  initialQuery?: string;
  initialOpen?: string | null;
}) {
  const id = useId();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("");
  const [fade, setFade] = useState<"idle" | "out" | "in">("idle");
  const strip = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const tabs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shown = useMemo(
    () => filterItems(itemsForTab(items, tab), query),
    [items, tab, query],
  );

  const announce = (count: number) =>
    setStatus(count === 0 ? words.noMatch : words.count(count));

  const countFor = (t: TabKey, q: string) =>
    filterItems(itemsForTab(items, t), q).length;

  useEffect(() => () => clearTimeout(settle.current ?? undefined), []);

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

  // The pointer cross-fade: out at 0ms, then in over 120ms on the next frame.
  useEffect(() => {
    if (fade !== "out") return;
    const frame = requestAnimationFrame(() => setFade("in"));
    return () => cancelAnimationFrame(frame);
  }, [fade]);

  const writeUrl = (next: { tab: TabKey; q: string }) => {
    const { pathname, search, hash } = window.location;
    window.history.replaceState(
      null,
      "",
      `${pathname}${searchWithState(search, next)}${hash}`,
    );
  };

  const select = (next: TabKey, by: "pointer" | "keyboard") => {
    if (by === "keyboard") tabs.current[next]?.focus();
    if (next === tab) return;
    if (by === "pointer") {
      const y = window.scrollY;
      setFade("out");
      requestAnimationFrame(() => window.scrollTo({ top: y }));
    } else setFade("idle");
    setTab(next);
    writeUrl({ tab: next, q: query });
    clearTimeout(settle.current ?? undefined);
    announce(countFor(next, query));
  };

  const type = (q: string) => {
    setFade("idle");
    setQuery(q);
    writeUrl({ tab, q });
    clearTimeout(settle.current ?? undefined);
    settle.current = setTimeout(() => announce(countFor(tab, q)), SETTLE_MS);
  };

  const clear = () => {
    type("");
    field.current?.focus();
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
    select(TAB_KEYS[to], "keyboard");
  };

  const tabId = (key: TabKey) => `${id}-tab-${key}`;
  const panel = `${id}-panel`;

  return (
    <div className="motion-reduce:**:[animation-duration:0s]! motion-reduce:**:[transition-duration:0s]!">
      <CapabilityFilter
        ref={field}
        value={query}
        onChange={type}
        onClear={clear}
      />
      <div
        ref={strip}
        className="-mx-1 mt-6 overflow-x-auto px-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                onClick={(e) =>
                  select(key, e.detail === 0 ? "keyboard" : "pointer")
                }
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
        data-fade={fade}
        className={`md:mt-8 ${
          fade === "out"
            ? "opacity-0"
            : fade === "in"
              ? "opacity-100 transition-opacity duration-[120ms] ease-(--ease-out)"
              : ""
        }`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget) setFade("idle");
        }}
      >
        {shown.length > 0 ? (
          <CapabilityChips
            items={shown}
            doneAt={words.doneAt}
            initialOpen={initialOpen}
            titleAs="h2"
            externalNote={words.externalNote}
          />
        ) : (
          <NoMatch onClear={clear} />
        )}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
