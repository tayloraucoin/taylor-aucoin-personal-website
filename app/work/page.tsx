import type { Metadata } from "next";
import Link from "next/link";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { siteRoutes } from "@/lib/routes";
import {
  chipsForTab,
  entriesForTab,
  filterByType,
  groupByType,
  parseTab,
  parseType,
  visibleTabs,
} from "@/lib/work/rows";
import { TypeChipsNav } from "./_components/TypeChipsNav";
import { TypeGroup } from "./_components/TypeGroup";
import { workIndex } from "./_components/words";
import { WorkTabsNav } from "./_components/WorkTabsNav";
import { galleryFixture, WORK_STATES } from "./_fixtures";

export const metadata: Metadata = {
  title: workIndex.title,
  description: workIndex.description,
};

/**
 * `/work` (SITE-14): every published piece of work in one discipline, grouped
 * by how it was engaged. `?tab=` and `?type=` are read per request; every
 * tab, chip, group and order comes from `lib/work/rows`.
 */
export default async function WorkPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const state = await readPageState(searchParams, WORK_STATES);

  const tab = parseTab(params.tab);
  const real = entriesForTab(tab);
  const entries =
    state === "gallery" && tab === "product" ? [...real, galleryFixture] : real;
  const chips = chipsForTab(entries);
  const type = parseType(params.type, tab, entries);
  const groups = groupByType(filterByType(entries, type));

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1192px] px-[22px] pt-12 pb-20 md:px-14 md:pt-24 md:pb-24"
    >
      <h1 className="font-display text-[56px] leading-none font-semibold tracking-(--tracking-display) text-(--color-ink) md:text-(length:--text-display)">
        {workIndex.h1}
      </h1>
      <p className="mt-6 text-(length:--text-body) text-(--color-body)">
        {workIndex.intro}
      </p>

      <div className="mt-10 flex flex-col gap-4 border-b border-(--color-line-soft) md:mt-12 md:flex-row md:items-end md:justify-between">
        <WorkTabsNav tabs={visibleTabs()} selected={tab} />
        {chips.length > 0 ? (
          <TypeChipsNav tab={tab} chips={chips} selected={type} />
        ) : (
          // A tab with no type chips (Websites) keeps the chip row's height
          // at md and up, a 40px chip over its 12px foot, so the tab line
          // does not jump (feedback 2026-10-19).
          <div aria-hidden className="max-md:hidden md:h-13" />
        )}
      </div>

      <div className="mt-10 md:mt-16">
        {groups.map((group) => (
          <TypeGroup
            key={group.type}
            type={group.type}
            entries={group.entries}
            labelHidden={type !== "all"}
          />
        ))}
      </div>

      <p className="mt-6 border-t border-(--color-line-soft) pt-8 md:mt-12">
        <Link
          href={siteRoutes.capabilities}
          className="inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          {workIndex.capabilities}
        </Link>
      </p>
    </main>
  );
}
