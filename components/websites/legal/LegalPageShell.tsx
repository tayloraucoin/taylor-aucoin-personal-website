import type { ReactNode } from "react";
import Link from "next/link";

/**
 * The standalone reading shell for `/websites/terms` and `/websites/privacy`.
 *
 * Quiet Gilt's reading cousin: same ground, glows, and grain from `body`, no
 * `RootField` (a legal document earns stillness even more than a form does),
 * one centered column at reading width. No site header — a client lands here
 * from the pay screen or an invoice, reads, and goes back; "Work with me" is
 * an exit they don't need. The one navigation affordance is the cross-link
 * between the two documents, passed in by the page.
 */
export default function LegalPageShell({
  crossLink,
  children,
}: {
  crossLink: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <main className="relative z-[2] mx-auto min-h-dvh max-w-[660px] px-[22px] py-12 md:py-20">
      <div className="mb-8 flex items-center gap-3.5 text-meta text-(--color-dim)">
        <span>Agora · Website builds</span>
        <span
          aria-hidden
          className="order-first h-px w-6 shrink-0 bg-(--color-rule)"
        />
      </div>

      {children}

      <nav className="mt-10 border-t border-(--color-faint) pt-6 text-meta text-(--color-dim)">
        <Link
          href={crossLink.href}
          className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
        >
          {crossLink.label}
        </Link>
      </nav>
    </main>
  );
}
