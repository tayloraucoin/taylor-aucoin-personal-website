import Link from "next/link";
import { SITE } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";
import Wordmark from "./Wordmark";

/**
 * Minimal persistent header (SVC-01). The site had no chrome before v3; this
 * stays as quiet as possible — footer's mono register, no bar, no border,
 * type floating above the field. "Work with me" is the one gold link: it is
 * the conversion path and earns the accent. Static, not sticky — it scrolls
 * away and never competes with PageDismiss on full pages.
 *
 * Rebrand (2026-10-15): the wordmark replaces the domain as the home link,
 * at 18px tall (about 100px wide, over the kit's 96px floor), and the theme
 * toggle joins the nav — the site has Light / Dark / System now.
 */
export default function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1080px] items-center justify-between gap-2 px-[22px] pt-6 font-mono text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] md:px-14 md:pt-8">
      <Link
        href="/"
        className="text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-body)"
      >
        <Wordmark className="h-[18px] w-auto" />
      </Link>
      <nav className="flex items-center gap-3 whitespace-nowrap sm:gap-5">
        <Link
          href="/services"
          className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          Work with me
        </Link>
        <a
          href={SITE.resume}
          className="text-(--color-body) transition-colors duration-(--dur-fast) hover:text-(--color-ink)"
        >
          Résumé
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
