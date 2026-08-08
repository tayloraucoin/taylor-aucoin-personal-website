import type { ReactNode } from "react";
import Link from "next/link";

/** Primary CTA. Gold→white fill. Must always be the brightest thing on screen. */
export function GradientButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-(--radius) px-6 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[.10em] text-[#0a0714] transition-[transform,box-shadow] duration-(--dur-fast) ease-(--ease-out) hover:-translate-y-px hover:shadow-[0_10px_32px_-12px_var(--color-c2)]"
      style={{
        background: "linear-gradient(102deg, var(--color-c2), var(--color-c3))",
      }}
    >
      {children}
    </Link>
  );
}

/** Ghost CTA. Sits on a translucent card so the field never reads through the label. */
export function GhostButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-(--radius) border border-[rgb(232_185_97/.42)] bg-[rgb(9_12_34/.55)] px-[22px] py-3.5 font-mono text-[11px] font-medium uppercase tracking-[.10em] text-[rgb(232_185_97/0.9)] backdrop-blur-[6px] transition-all duration-(--dur-fast) hover:border-[rgb(232_185_97/.72)] hover:bg-[rgb(9_12_34/.80)] hover:text-(--color-c3)"
    >
      {children}
    </Link>
  );
}
