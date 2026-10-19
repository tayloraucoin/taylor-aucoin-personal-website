import { buttonVariants, type ButtonVariant } from "@/components/ui/Button";

/**
 * The form's one primary, at 176px or more and full width at 390 (PP-2).
 * Busy, it reads its busy label with `aria-busy` and keeps focus: it is
 * never disabled (D-SITE-169), so the form ignores a repeat press itself.
 * A polite status region beside it says the same for a screen reader.
 */
export function SubmitButton({
  label,
  busyLabel,
  busy,
  variant = "primary",
  className = "",
}: {
  label: string;
  busyLabel: string;
  busy: boolean;
  /** Ghost where the page already has its one primary (home's notes). */
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <>
      <button
        type="submit"
        aria-busy={busy}
        className={`${buttonVariants({ variant })} w-full min-w-[176px] md:w-auto ${className}`}
      >
        {busy ? busyLabel : label}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {busy ? busyLabel : ""}
      </span>
    </>
  );
}
