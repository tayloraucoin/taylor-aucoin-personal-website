import Link from "next/link";
import type { ReactNode } from "react";

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
      <div className="mb-8 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>Agora · Website builds</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      {children}

      <nav className="mt-10 border-t border-(--color-faint) pt-6 font-body text-[14px] font-light text-(--color-dim)">
        <Link
          href={crossLink.href}
          className="underline decoration-(--color-faint) underline-offset-4 transition-colors hover:text-(--color-ink)"
        >
          {crossLink.label}
        </Link>
      </nav>
    </main>
  );
}
