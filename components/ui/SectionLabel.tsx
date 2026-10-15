/**
 * The label: 12px Albert Sans 500, uppercase, +0.2em, muted, with the accent
 * rule before it — the brand's one recurring device (kit §3 and §4).
 */
export default function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-(--color-faint) pb-4 font-body text-(length:--text-label) font-medium uppercase tracking-(--tracking-label) text-(--color-dim)">
      <span aria-hidden className="h-px w-6 shrink-0 bg-(--color-rule)" />
      {children}
    </div>
  );
}
