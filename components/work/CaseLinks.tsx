import type { CaseLink } from "@/content/work";

/**
 * Outbound links on a case study — quiet metadata exits that prove the work
 * exists in the wild. NOT CTAs. They live in the header block, after the stack
 * chips and before the first content section, and stay visually subordinate to
 * the title and stack.
 *
 * Register: same as the footer links and the role/period row — mono, uppercase,
 * wide-tracked, --color-dim at rest, --color-ink with a gold border shift on
 * hover. Inscribed reference, not marketing. No gradient, no fill, no icons.
 *
 * If there are no links, render nothing. The family office case is anonymized
 * and must have zero outbound links.
 */
export default function CaseLinks({ links }: { links?: CaseLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="mb-12 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
      {links.map((link) => {
        const note = link.note && (
          <span className="opacity-60"> · {link.note}</span>
        );

        // Deprecated entries with no destination are inscribed, not clickable.
        if (!link.href) {
          return (
            <span key={link.label} className="opacity-50">
              {link.label}
              {note}
            </span>
          );
        }

        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-b-(--color-faint) pb-0.5 text-(--color-dim) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-b-(--color-c2) hover:text-(--color-ink)"
          >
            {link.label}
            {note}
          </a>
        );
      })}
    </div>
  );
}
