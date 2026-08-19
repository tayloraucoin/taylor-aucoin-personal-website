import { INTAKE_STEP_COUNT } from "@/lib/intake/steps";

/**
 * A hairline track with a gold fill. No percentage, no "almost there", no
 * checkmarks — honest and dumb on purpose (UX spec §5.2). Manufactured
 * momentum is manufactured urgency wearing a progress bar.
 *
 * The bar is decorative; the step count above it carries the same information
 * as text, so screen readers get it once rather than twice.
 */
export function StepProgress({ current }: { current: number }) {
  const pct = (current / INTAKE_STEP_COUNT) * 100;

  return (
    <div
      aria-hidden
      className="mt-4 h-px w-full bg-(--color-faint)"
    >
      <div
        className="h-px transition-[width] duration-(--dur-base) ease-(--ease-out)"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--color-c2), var(--color-c3))",
        }}
      />
    </div>
  );
}
