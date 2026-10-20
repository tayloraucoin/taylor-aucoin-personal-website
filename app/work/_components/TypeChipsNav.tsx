import Link from "next/link";
import { Check } from "lucide-react";
import { chipVariants } from "@/components/ui/Button";
import { workHref, type Tab, type TypeFilter } from "@/lib/work/rows";
import { workIndex } from "./words";

/**
 * The type chips (D-SITE-190): links writing `?type=`, one `nav` of them.
 *
 * `disabled` is for a tab with no type chips (Websites): at md and up the
 * row stays, in the kit's disabled look, so the tab line never jumps between
 * tabs; each chip is a link with no href, so none takes focus or filters.
 * Hidden below md (feedback round 2, 2026-10-19).
 */
export function TypeChipsNav({
  tab,
  chips,
  selected,
  disabled = false,
}: {
  tab: Tab;
  chips: TypeFilter[];
  selected: TypeFilter;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <nav aria-label={workIndex.chipsNav} className="max-md:hidden">
        <ul className="flex flex-wrap gap-2 pb-4 md:justify-end md:pb-3">
          {chips.map((chip) => (
            <li key={chip}>
              <span
                role="link"
                aria-disabled="true"
                className={chipVariants({
                  selected: chip === selected,
                  disabled: true,
                })}
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
              </span>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

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
