import Link from "next/link";
import { tabVariants } from "@/components/ui/Button";
import { workHref, type Tab } from "@/lib/work/rows";
import { workIndex } from "./words";

/**
 * The discipline tabs (D-SITE-190): links writing `?tab=`, in a `nav` with
 * `aria-current` on the selected one. Never an ARIA tablist.
 */
export function WorkTabsNav({
  tabs,
  selected,
}: {
  tabs: Tab[];
  selected: Tab;
}) {
  return (
    <nav aria-label={workIndex.tabsNav}>
      <ul className="flex flex-wrap gap-x-4 max-md:[&_a]:text-(length:--text-small) md:gap-x-8">
        {tabs.map((tab) => (
          <li key={tab}>
            <Link
              href={workHref(tab, "all")}
              scroll={false}
              aria-current={tab === selected ? "true" : undefined}
              className={tabVariants({ selected: tab === selected })}
            >
              {workIndex.tabs[tab]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
