"use client";

import { useState, useTransition } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { startShowcaseCheckout } from "../_actions/pay";
import { useIsPreview } from "@/components/intake/preview-mode";

/**
 * The coded track's pay button — the same contract as the platform track's.
 *
 * Its own component because it forwards a plan, and because the two tracks'
 * checkout actions are separate seams: keeping each button pointed at one
 * action means a fabricated call can at worst reach its own track's checkout.
 *
 * Disabled while Stripe opens, because a second tap would create a second
 * session. The label says what is happening rather than spinning — a progress
 * animation next to a payment reads as trouble.
 */
export function ShowcasePayButton({
  token,
  label,
  plan,
  addonKeys = [],
  promoCode,
  disabled = false,
}: {
  token: string;
  label: string;
  /** Null until the client picks; the button is disabled until they do. */
  plan: "half" | "full" | null;
  addonKeys?: string[];
  promoCode?: string;
  disabled?: boolean;
}) {
  /**
   * Preview never opens Checkout. This is the one place a Stripe session
   * can be started from this screen, so it is the one place that has to
   * refuse — a disabled button here is worth more than a rule written
   * anywhere else (ADM-4).
   */
  const preview = useIsPreview();

  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <GradientButton
        disabled={disabled || pending || plan === null || preview}
        onClick={() => {
          if (plan === null) return;
          setFailed(false);
          startTransition(async () => {
            try {
              await startShowcaseCheckout(token, plan, addonKeys, promoCode);
            } catch {
              // A redirect throws by design and unmounts this; anything that
              // lands here is a real failure to open Checkout.
              setFailed(true);
            }
          });
        }}
      >
        {pending ? "Opening secure checkout…" : label}
      </GradientButton>

      {failed ? (
        <p
          aria-live="polite"
          className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          That didn&apos;t open — try once more, and tell Taylor if it keeps
          happening. Nothing has been charged.
        </p>
      ) : null}
    </div>
  );
}
