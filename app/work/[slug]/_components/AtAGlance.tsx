import type { CaseStudy } from "@/content/work";
import { Block, LedgerRow, LedgerRows, RowText, TEXT_LINK } from "./blocks";

const LABEL =
  "text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase";

/**
 * At a glance (D-SITE-96): role · period · engagement type, the study's rows,
 * the stack and the links. Renders nothing for a study with none of them.
 */
export function AtAGlance({ c }: { c: CaseStudy }) {
  const rows = c.atAGlance ?? [];
  const links = c.links ?? [];
  if (rows.length === 0 && c.stack.length === 0 && links.length === 0) {
    return null;
  }
  return (
    <Block title="At a glance">
      <p className="mt-4 text-(length:--text-meta) text-(--color-dim)">
        {c.role} · {c.period} · {c.engagementType}
      </p>
      <LedgerRows>
        {rows.map((row) => (
          <LedgerRow
            key={row.label}
            label={<p className={LABEL}>{row.label}</p>}
          >
            <RowText>{row.value}</RowText>
          </LedgerRow>
        ))}
        {c.stack.length > 0 && (
          <LedgerRow label={<p className={LABEL}>Stack</p>}>
            <RowText>{c.stack.join(" · ")}</RowText>
          </LedgerRow>
        )}
        {links.length > 0 && (
          <LedgerRow label={<p className={LABEL}>Links</p>}>
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} className={TEXT_LINK}>
                      {link.label}
                    </a>
                  ) : (
                    <span className="text-(--color-body)">{link.label}</span>
                  )}
                  {(link.status || link.note) && (
                    <p className="text-(length:--text-meta) text-(--color-dim)">
                      {[link.status, link.note].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </LedgerRow>
        )}
      </LedgerRows>
    </Block>
  );
}
