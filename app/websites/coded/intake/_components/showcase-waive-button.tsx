"use client";

import { useState, useTransition } from "react";
import { useIsPreview } from "@/components/intake/preview-mode";
import { GradientButton } from "@/components/ui/GradientButton";
import { waiveShowcaseDeposit } from "../_actions/waive";

/**
 * The button the pay screen shows instead of the pay button once the free
 * code is active.
 *
 * Its own component rather than a mode on `ShowcasePayButton`, for the same
 * reason the two tracks have separate buttons: each points at exactly one
 * action, so a fabricated call can at worst reach the seam it was built for.
 * This one cannot open Checkout; that one cannot waive anything.
 *
 * Disabled while the action runs, and refused outright in preview, where
 * nothing may change an engagement (ADM-4).
 */
export function ShowcaseWaiveButton({
  token,
  code,
  disabled = false,
}: {
  token: string;
  code: string;
  disabled?: boolean;
}) {
  const preview = useIsPreview();

  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <GradientButton
        disabled={disabled || pending || preview}
        onClick={() => {
          setFailed(false);
          startTransition(async () => {
            try {
              await waiveShowcaseDeposit(token, code);
            } catch {
              // A redirect throws by design and unmounts this; anything that
              // lands here is a real failure.
              setFailed(true);
            }
          });
        }}
      >
        {/* [COPY — pending Taylor] */}
        {pending ? "One moment…" : "Continue to the questionnaire"}
      </GradientButton>

      {failed ? (
        <p
          aria-live="polite"
          className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {/* [COPY — pending Taylor] */}
          That didn&apos;t go through — try once more, and tell Taylor if it
          keeps happening.
        </p>
      ) : null}
    </div>
  );
}
