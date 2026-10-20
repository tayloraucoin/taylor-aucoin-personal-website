"use client";

import { WarningGlyph } from "./warning-glyph";

/**
 * The autosave state machine's voice (UX spec §6.2).
 *
 * The contract this component exists to keep: it never lies. `Saved` renders
 * only after the server has confirmed, and "saving" appears only when a save
 * has been in flight longer than ~400ms — below that the flicker reads as
 * instability on a form the client has been promised is safe.
 *
 * `aria-live="polite"` because a save is worth announcing once, quietly, and
 * never interrupting. The region is one element for every state, so a state
 * change swaps its text once rather than mounting a second region.
 *
 * Drawn as the saved line (a 12px mark check, "Saved" in muted meta) and the
 * error line (the 16px warning glyph and the sentence in text colour, D-SITE-154),
 * both from plumb-proposals-2.
 *
 * INT-4 ships the states; INT-5 drives them from `useStepAutosave`.
 */
export type SaveState = "idle" | "saving" | "saved" | "offline" | "error";

const COPY: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  offline: "Saved on this phone — will sync",
  error: "Having trouble saving — your answers are safe on this phone",
};

export function SaveIndicator({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry?: () => void;
}) {
  const message = COPY[state];
  const isError = state === "error";

  return (
    <p
      aria-live="polite"
      data-save-line
      className={`flex items-start gap-1.5 text-meta leading-[1.55] transition-opacity duration-(--dur-fast) ease-(--ease-out) ${
        message ? "opacity-100" : "opacity-0"
      } ${isError ? "text-(--color-ink)" : "text-(--color-dim)"}`}
    >
      {state === "saved" ? (
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="mt-[4px] size-3 shrink-0 text-(--color-mark)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6.5 4.75 9 10 3" />
        </svg>
      ) : null}
      {isError ? <WarningGlyph /> : null}
      <span>
        {message}
        {isError && onRetry ? (
          <>
            {" "}
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 items-center align-middle text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
            >
              Try again
            </button>
          </>
        ) : null}
      </span>
    </p>
  );
}
