/**
 * Flat label + body card. Uses --color-spec-bg / --color-spec-border — quieter
 * than --color-card. Static: no ring, hover, shadow, or transition.
 *
 * `index` prefixes the label with a zero-padded number in the Selected Work /
 * How-to-start register. Optional, and absent for every existing caller: a
 * deliverables list wants the count visible ("that's seven things"), while
 * Specialties is a set with no order to imply.
 */
type LabelCardProps = {
  label: string;
  /** 1-based. Rendered as `01 ·`, `02 ·`, … before the label. */
  index?: number;
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
  index,
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
        {index !== undefined && (
          <>
            {String(index).padStart(2, "0")}
            <span className="text-(--color-dim)"> · </span>
          </>
        )}
        {label}
      </span>
      <p className="text-[13.5px] font-light leading-[1.64] text-(--color-body)">
        {children}
      </p>
    </div>
  );
}
