"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Copies text and says so, in words, beside the button.
 *
 * Shared by the playbook (PIPE-2) and each engagement's pipeline (PIPE-3),
 * where copying a prompt is the primary action. The result line is a live
 * region so the confirmation reaches a screen reader, and it clears itself so
 * a second press reads as a second copy.
 *
 * `copiedMessage` lets a caller say more than "Copied" — the engagement
 * checklist names the variables it could not fill.
 */

const CLEAR_AFTER_MS = 2400;

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({
  text,
  label = "Copy",
  accessibleLabel,
  copiedMessage = "Copied",
}: {
  text: string;
  label?: string;
  accessibleLabel?: string;
  copiedMessage?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), CLEAR_AFTER_MS);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={accessibleLabel}
        className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-ink) hover:bg-(--color-card-hover) focus-visible:border-(--color-c2) focus-visible:outline-none"
      >
        {label}
      </button>
      <span role="status" className="text-xs text-(--color-dim)">
        {state === "copied"
          ? copiedMessage
          : state === "failed"
            ? "Couldn't copy. Open the step and select the text instead."
            : ""}
      </span>
    </span>
  );
}
