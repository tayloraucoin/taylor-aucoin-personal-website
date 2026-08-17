import Link from "next/link";
import { SITE } from "@/lib/config";

/**
 * Minimal persistent header (SVC-01). The site had no chrome before v3; this
 * stays as quiet as possible — footer's mono register, no bar, no border,
 * type floating above the field. "Work with me" is the one gold link: it is
 * the conversion path and earns the accent. Static, not sticky — it scrolls
 * away and never competes with PageDismiss on full pages.
 */
export default function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1080px] items-baseline justify-between gap-4 px-[22px] pt-6 font-mono text-[10px] uppercase tracking-[.16em] md:px-14 md:pt-8">
      <Link
        href="/"
        className="text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-ink)"
      >
        tayloraucoin.com
      </Link>
      <nav className="flex items-baseline gap-5">
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
      </nav>
    </header>
  );
}
