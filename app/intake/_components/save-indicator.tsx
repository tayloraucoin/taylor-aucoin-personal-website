"use client";

/**
 * The autosave state machine's voice (UX spec §6.2).
 *
 * The contract this component exists to keep: it never lies. `Saved` renders
 * only after the server has confirmed, and "saving" appears only when a save
 * has been in flight longer than ~400ms — below that the flicker reads as
 * instability on a form the client has been promised is safe.
 *
 * `aria-live="polite"` because a save is worth announcing once, quietly, and
 * never interrupting.
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

  return (
    <p
      aria-live="polite"
      className={`font-mono text-[10px] uppercase tracking-[.18em] transition-opacity duration-(--dur-fast) ease-(--ease-out) ${
        message ? "opacity-100" : "opacity-0"
      } ${state === "error" ? "text-(--color-c2)" : "text-(--color-dim)"}`}
    >
      {message}
      {state === "error" && onRetry ? (
        <>
          {" · "}
          <button
            type="button"
            onClick={onRetry}
            className="underline underline-offset-2 hover:text-(--color-c3)"
          >
            Try again
          </button>
        </>
      ) : null}
    </p>
  );
}
