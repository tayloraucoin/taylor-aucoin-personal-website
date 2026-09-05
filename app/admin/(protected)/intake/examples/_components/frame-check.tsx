"use client";

import { useEffect, useState } from "react";

/**
 * Open the site in the frame, and record what you saw.
 *
 * **`embed` is a human's judgement and cannot be anything else** (D-PORT-17).
 * `X-Frame-Options` and `frame-ancestors` are hints in one direction only, and
 * a blocked frame is undetectable from page script — `load` fires on one in
 * Chromium, so nothing in the app can tell "refused" from "empty".
 *
 * There is deliberately **no header hint on screen**. It would be a hint about
 * a thing you are one click from settling by looking, it can be wrong in both
 * directions, and sitting beside the toggle it would function as the answer —
 * which is exactly the failure D-PORT-17 exists to prevent.
 * `yarn capture:example` still prints the header verdict in the terminal.
 *
 * The stage is the real 1512:982 box the overlay uses, so what Taylor judges is
 * the box a client would meet rather than a different-shaped preview.
 */
export function FrameCheck({
  url,
  name,
  embed,
  onEmbedChange,
}: {
  url: string;
  name: string;
  embed: boolean;
  onEmbedChange: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex flex-col gap-3 border-t border-(--color-faint) pt-4">
      <button
        type="button"
        disabled={!url.trim()}
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-fit rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) disabled:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        {/* [COPY — draft] */}
        Look at it framed
      </button>

      <label className="flex max-w-[48ch] items-start gap-3">
        <input
          type="checkbox"
          checked={embed}
          onChange={(event) => onEmbedChange(event.target.checked)}
          className="mt-1 size-4 accent-(--color-c2)"
        />
        <span className="flex flex-col gap-1">
          <span className="text-sm text-(--color-ink)">
            {/* [COPY — draft] */}
            The site renders inside the frame
          </span>
          <span className="text-sm text-(--color-dim)">
            {/* [COPY — draft] */}
            Tick this only after you&apos;ve opened it above and watched it
            load. A blocked frame looks exactly like an empty one.
          </span>
        </span>
      </label>

      {open ? (
        <div
          role="dialog"
          aria-modal
          aria-label={`${name || url} in a frame`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-(--color-ground-a)/95 p-6"
        >
          <div className="flex w-full max-w-5xl items-center justify-between">
            <span className="font-(family-name:--font-mono) text-[10px] tracking-[.30em] text-(--color-dim) uppercase">
              {name || url}
            </span>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink)"
            >
              Close
            </button>
          </div>

          {/*
            Sandboxed exactly as the client's overlay does it: no forms, no top
            navigation, no downloads. This is a stranger's site running in an
            admin tab.
          */}
          <iframe
            src={url}
            title={`${name || url} in a frame`}
            sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            className="aspect-[1512/982] w-full max-w-5xl rounded-(--radius) border border-(--color-line) bg-(--color-well)"
          />

          <p className="max-w-[60ch] text-center text-sm text-(--color-dim)">
            {/* [COPY — draft] */}
            If this is blank, the site refuses to be framed. That is the
            ordinary case, and the capture strip is what a client gets instead.
          </p>
        </div>
      ) : null}
    </div>
  );
}
