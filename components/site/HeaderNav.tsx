"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { hidesCallButton } from "@/lib/routes";
import { BookCallLink } from "./BookCallLink";
import { currentNavItem, headerCallSurface, NAV_ITEMS } from "./nav";

/**
 * The header's path-aware half: the nav with its current item, the call
 * button and the toggle. At 390 the nav drops to its own row under the
 * wordmark and toggle, and the call button is gone (D-SITE-180); it returns
 * at `lg`, where the row has room for it beside the nav.
 */
export function HeaderNav() {
  const pathname = usePathname();
  const current = currentNavItem(pathname);
  const call = headerCallSurface(pathname);

  return (
    <>
      <nav
        aria-label="Main"
        className="order-last w-full md:order-none md:w-auto"
      >
        <ul className="flex items-center gap-6 md:gap-7">
          {NAV_ITEMS.map((item) => {
            const isCurrent = item.key === current;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center text-[15px] transition-colors duration-(--dur-fast) md:min-h-0 ${
                    isCurrent
                      ? "text-(--color-ink) underline decoration-(--color-mark) decoration-2 underline-offset-[6px]"
                      : "text-(--color-body) hover:text-(--color-ink)"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {!hidesCallButton(pathname) && (
        <div className="hidden lg:block">
          <BookCallLink
            surface={call?.surface ?? null}
            slug={call?.slug}
            placement="header"
            variant="ghost"
            size="small"
          />
        </div>
      )}
      <ThemeToggle />
    </>
  );
}
