import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import { siteRoutes } from "@/lib/routes";
import { HeaderNav } from "./HeaderNav";

/**
 * One header on every page with chrome (D-SITE-2, 130): the wordmark home,
 * Work · About · Work with me · Contact, the call button to /book, the theme
 * toggle. Static, not sticky. Its column is the 1080 one the captures align
 * it to on every page.
 */
export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto w-full max-w-[1192px] px-[22px] pt-6 md:px-14 md:pt-10">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
        <Link
          href={siteRoutes.home}
          className="mr-auto inline-flex min-h-11 items-center text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-body)"
        >
          <Wordmark className="h-[18px] w-auto" />
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
