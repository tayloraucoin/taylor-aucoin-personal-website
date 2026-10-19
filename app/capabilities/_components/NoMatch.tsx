import Link from "next/link";
import { siteRoutes } from "@/lib/routes";
import { capabilitiesPage as words } from "./words";

const LINK =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center text-(length:--text-small) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

/**
 * The no-match block (capabilities-build.md §6): the line, then Clear the
 * filter and Send a note, 24 apart, each a 44px target (D-SITE-174).
 */
export function NoMatch({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-8">
      <p className="text-(length:--text-body) text-(--color-body)">
        {words.noMatch}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-6">
        <button type="button" onClick={onClear} className={LINK}>
          {words.clear}
        </button>
        <Link href={siteRoutes.contact} className={LINK}>
          {words.sendNote}
        </Link>
      </p>
    </div>
  );
}
