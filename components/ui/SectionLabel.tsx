/**
 * All-caps, wide-tracked mono. This is doing the "ancient / inscribed" work
 * in the design — it is how the site reads as *ancient futures* without a
 * single serif. Load-bearing. Do not swap it for a sans.
 */
export default function SectionLabel({ children }: { children: string }) {
  return (
    <div className="border-b border-[--color-faint] pb-4 font-mono text-[10px] uppercase tracking-[.28em] text-[--color-dim]">
      {children}
    </div>
  );
}
