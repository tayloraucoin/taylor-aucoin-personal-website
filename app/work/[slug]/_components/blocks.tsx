import type { ReactNode } from "react";

/**
 * The case study's shared pieces: a section with its h2, a ledger row (label
 * column 240, gap 32, body 640; stacked at 390), prose and the square bullet
 * list. An absent optional block never renders one of these, so it leaves no
 * heading, rule or gap (D-SITE-5).
 */

export function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 md:mt-24">
      <h2 className="font-display text-[24px] leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink) md:text-(length:--text-h2)">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Prose({
  children,
  tone = "body",
}: {
  children: ReactNode;
  tone?: "body" | "ink";
}) {
  return (
    <p
      className={`mt-6 max-w-[65ch] text-[16px] leading-[1.7] md:text-(length:--text-body) ${
        tone === "ink" ? "text-(--color-ink)" : "text-(--color-body)"
      }`}
    >
      {children}
    </p>
  );
}

export function LedgerRows({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 border-b border-(--color-line-soft)">{children}</div>
  );
}

/** A hairline-topped row: a label column over (at 390) or beside the body. */
export function LedgerRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-(--color-line-soft) py-6 md:grid-cols-[240px_minmax(0,640px)] md:gap-x-8 md:py-8">
      <div>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function RowTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
      {children}
    </h3>
  );
}

export function RowText({ children }: { children: ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.7] text-(--color-body) md:text-(length:--text-body)">
      {children}
    </p>
  );
}

/** The 4px square bullet (kit §3). */
export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="grid grid-cols-[18px_1fr] text-[16px] leading-[1.6] text-(--color-body) md:text-(length:--text-body)"
        >
          <span
            aria-hidden
            className="mt-[0.7em] block h-1 w-1 bg-(--color-line-strong)"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export const TEXT_LINK =
  "inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

export const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** Words that keep their capitals in a sentence-cased label. */
const KEEP: Record<string, string> = {
  AI: "AI",
  API: "API",
  CRM: "CRM",
  UI: "UI",
  QXMD: "QxMD",
  READ: "Read",
};

/**
 * A surface or row label in sentence case: "THE READ BLUEPRINT" reads "The
 * Read blueprint". Acronyms and product names keep their capitals; a label
 * already in mixed case is left as written.
 */
export function sentence(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text
    .split(" ")
    .map((word, i) => {
      if (KEEP[word]) return KEEP[word];
      const lower = word.toLowerCase();
      return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}
