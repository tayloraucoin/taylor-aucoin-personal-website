import Link from "next/link";
import { siteRoutes } from "@/lib/routes";

/**
 * The one not-found block, drawn on the case study and used site-wide
 * (D-SITE-19). Its line is the page's h1; Next answers it with HTTP 404.
 * Taylor's drafts keep their `[draft]` mark until he clears it (D-SITE-185).
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1080px] px-[22px] pt-32 pb-40 md:px-14 md:pt-48"
    >
      <h1 className="font-display text-[28px] leading-[1.15] font-semibold tracking-[-0.01em] text-(--color-ink) md:text-[32px]">
        This page isn&apos;t here. [draft]
      </h1>
      <p className="mt-6">
        <Link
          href={siteRoutes.work}
          className="text-[15px] text-(--color-ink) underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)"
        >
          See all work [draft]
        </Link>
      </p>
    </main>
  );
}
