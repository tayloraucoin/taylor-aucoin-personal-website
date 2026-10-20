import { stepCountFor } from "@/lib/intake/tracks";
import type { IntakeTrackKey } from "@/lib/types/intake";

/**
 * The progress hairline: a hairline track with a mark fill that counts
 * finished steps, (n − 1)/total, so step 1 shows an empty track (D-SITE-159).
 * No percentage, no "almost there", no checkmarks — honest and dumb on purpose
 * (UX spec §5.2). Manufactured momentum is manufactured urgency wearing a
 * progress bar.
 *
 * The bar is decorative; the step count above it carries the same information
 * as text, so screen readers get it once rather than twice.
 */
export function StepProgress({
  track,
  current,
}: {
  track: IntakeTrackKey;
  current: number;
}) {
  const pct = ((current - 1) / stepCountFor(track)) * 100;

  return (
    <div
      aria-hidden
      data-progress-track
      className="mt-4 h-px w-full bg-(--color-faint)"
    >
      <div
        data-progress-fill
        className="h-px transition-[width] duration-(--dur-base) ease-(--ease-out)"
        style={{ width: `${pct}%`, background: "var(--color-mark)" }}
      />
    </div>
  );
}
