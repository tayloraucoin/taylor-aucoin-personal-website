/**
 * Flat label + body card. Uses --color-spec-bg / --color-spec-border — quieter
 * than --color-card. Static: no ring, hover, shadow, or transition.
 */
type LabelCardProps = {
  label: string;
  children: React.ReactNode;
  padding?: "default" | "compact";
  className?: string;
};

const paddingClass = {
  default: "p-6",
  compact: "p-5",
} as const;

export default function LabelCard({
  label,
  children,
  padding = "default",
  className,
}: LabelCardProps) {
  return (
    <div
      className={[
        "rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg)",
        paddingClass[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        {label}
      </span>
      <p className="text-[13.5px] font-light leading-[1.64] text-(--color-body)">
        {children}
      </p>
    </div>
  );
}
