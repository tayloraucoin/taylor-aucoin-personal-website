import Link from "next/link";
import type { LabelRow } from "@/components/ui/LabelRows";
import { LABEL, LABEL_ROW, TEXT_LINK } from "./Section";

/**
 * Label rows in the new brand: the coded page's fork of `LabelRows`, which
 * `/websites/platform` keeps as it was (D-SITE-209).
 */
export function LabelList({ rows }: { rows: readonly LabelRow[] }) {
  return (
    <dl className="mt-8 border-t border-(--color-line-soft)">
      {rows.map((row) => (
        <div key={row.label} className={LABEL_ROW}>
          <dt className={`${LABEL} md:pt-1`}>{row.label}</dt>
          <dd className="m-0 text-(length:--text-body) leading-[1.65] text-(--color-body)">
            {typeof row.body === "string"
              ? row.body
              : row.body.map((part, i) =>
                  typeof part === "string" ? (
                    <span key={i}>{part}</span>
                  ) : part.href.startsWith("/") ? (
                    <Link key={i} href={part.href} className={TEXT_LINK}>
                      {part.text}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={part.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={TEXT_LINK}
                    >
                      {part.text}
                    </a>
                  ),
                )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
