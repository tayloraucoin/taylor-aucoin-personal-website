"use client";

import { useEffect, useState } from "react";

/**
 * The house "something is happening" mark: a travelling hairline and a line of
 * copy that changes.
 *
 * Two things are deliberate.
 *
 * **It never implies progress.** Nothing on these paths can say how far along
 * it is — a model call returns when it returns — so the segment crosses and
 * re-enters rather than filling. The previous breathing rule read as a bar
 * filling and emptying, which is a promise the feature cannot keep.
 *
 * **The copy is the real liveness signal.** A moving graphic proves an
 * animation is running; a line that changes proves the page is still thinking
 * about you. It also buys the only honest use of a long wait, which is telling
 * someone what is coming — Taylor's note on the ingest run, 2026-09-05.
 *
 * Messages advance on a timer and stop on the last one rather than looping, so
 * a wait that outruns the script goes quiet instead of cycling forever and
 * looking like a carousel.
 */
export function WorkingIndicator({
  messages,
  intervalMs = 4200,
}: {
  /** Shown in order. The first is visible immediately. */
  messages: readonly string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;

    const timer = window.setTimeout(
      () => setIndex((current) => current + 1),
      intervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [index, messages.length, intervalMs]);

  return (
    <div>
      <div
        aria-hidden
        className="h-px w-full overflow-hidden bg-(--color-faint)"
      >
        <div
          className="h-px w-[30%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-c2), var(--color-c3), transparent)",
            animation: "ingest-sweep 2200ms ease-(--ease-out) infinite",
          }}
        />
      </div>

      {/* Polite rather than assertive: this is reassurance, and a screen reader
          interrupting itself every four seconds would be the opposite. */}
      <p
        aria-live="polite"
        className="mt-5 font-body text-[16px] font-light leading-[1.6] text-(--color-body)"
      >
        {messages[index]}
      </p>
    </div>
  );
}
