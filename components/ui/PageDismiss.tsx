"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const className =
  "sticky top-0 z-10 float-right m-4 rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.7)] px-3 py-2 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-body) backdrop-blur transition-colors hover:border-[rgb(232_185_97/.55)] hover:text-(--color-ink)";

/**
 * Same Esc control as the intercepted overlay, for full-page routes (/work/*, /stack).
 * Overlay uses router.back(); cold load / refresh has no in-app history, so we link home.
 */
export default function PageDismiss({ href = "/" }: { href?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(href);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, href]);

  return (
    <Link href={href} className={className} aria-label="Back to home">
      Esc
    </Link>
  );
}
