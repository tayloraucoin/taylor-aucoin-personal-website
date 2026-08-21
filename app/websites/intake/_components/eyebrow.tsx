/**
 * The site's mono eyebrow with its gold hairline trailing right, at intake
 * scale. Same idiom as Hero and SectionLabel — all-caps, wide-tracked mono is
 * what makes this read as the same product.
 */
export function Eyebrow({ children }: { children: string }) {
  return (
    <div className="mb-5 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
      <span>{children}</span>
      <span
        aria-hidden
        className="h-px max-w-[220px] flex-1"
        style={{
          background:
            "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
        }}
      />
    </div>
  );
}
