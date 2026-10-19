import Link from "next/link";
import { Check } from "lucide-react";
import { chipVariants } from "@/components/ui/Button";
import { workHref, type Tab, type TypeFilter } from "@/lib/work/rows";
import { workIndex } from "./words";

/** The type chips (D-SITE-190): links writing `?type=`, one `nav` of them. */
export function TypeChipsNav({
  tab,
  chips,
  selected,
}: {
  tab: Tab;
  chips: TypeFilter[];
  selected: TypeFilter;
}) {
  return (
    <nav aria-label={workIndex.chipsNav}>
      <ul className="flex flex-wrap gap-2 pb-4 md:justify-end md:pb-3">
        {chips.map((chip) => (
          <li key={chip}>
            <Link
              href={workHref(tab, chip)}
              scroll={false}
              aria-current={chip === selected ? "true" : undefined}
              className={chipVariants({ selected: chip === selected })}
            >
              {chip === selected && (
                <Check
                  aria-hidden
                  size={14}
                  strokeWidth={2}
                  className="text-(--color-mark)"
                />
              )}
              {workIndex.chips[chip]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
