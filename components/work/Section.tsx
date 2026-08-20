import type { ReactNode } from "react";

export default function Section({
  label,
  right,
  children,
  id,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
  /** Anchor target (e.g. the media strip, for the header rail's jump link). */
  id?: string;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-(--color-faint) pb-4">
        <span className="font-mono text-[12px] font-medium uppercase tracking-[.28em] text-(--color-ink)">
          {label}
        </span>
        {right}
      </div>
      {children}
    </section>
  );
}
