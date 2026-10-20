import { buttonVariants, type ButtonVariant } from "@/components/ui/Button";

/** The disabled look, with each variant's hover held at rest. */
const BLOCKED: Record<ButtonVariant, string> = {
  primary:
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:border-(--color-fill) aria-disabled:hover:bg-(--color-fill)",
  ghost:
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:border-(--color-line-strong)",
};

/**
 * The form's one primary, at 176px or more and full width at 390 (PP-2).
 * Busy, it reads its busy label with `aria-busy` and keeps focus: it is
 * never disabled (D-SITE-169), so the form ignores a repeat press itself.
 * A polite status region beside it says the same for a screen reader.
 *
 * `blockedBy` is a validity gate, not busy: until the form's answers would
 * pass, the button is `aria-disabled` in the kit's disabled look (the
 * GradientButton's 60% and not-allowed cursor) and described by the element
 * that says why. It stays focusable and pressable, so a screen reader still
 * reaches it, and a press runs the form's own check, which shows the field
 * errors and moves focus to the first.
 */
export function SubmitButton({
  label,
  busyLabel,
  busy,
  variant = "primary",
  className = "",
  blockedBy,
}: {
  label: string;
  busyLabel: string;
  busy: boolean;
  /** Ghost where the page already has its one primary (home's notes). */
  variant?: ButtonVariant;
  className?: string;
  /** The id of the element saying why the answers don't pass yet. */
  blockedBy?: string;
}) {
  const blocked = Boolean(blockedBy) && !busy;
  return (
    <>
      <button
        type="submit"
        aria-busy={busy}
        aria-disabled={blocked || undefined}
        aria-describedby={blocked ? blockedBy : undefined}
        className={`${buttonVariants({ variant })} ${BLOCKED[variant]} w-full min-w-[176px] md:w-auto ${className}`}
      >
        {busy ? busyLabel : label}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {busy ? busyLabel : ""}
      </span>
    </>
  );
}
