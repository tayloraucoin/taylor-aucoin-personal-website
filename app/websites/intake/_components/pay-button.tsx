"use client";

import { useState, useTransition } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { startDepositCheckout } from "../[token]/_actions/pay";

/**
 * The one disabled button in the entire flow.
 *
 * Everywhere else Continue stays live because every question is optional
 * (D-INT-4). Here, a second tap while Stripe is opening would create a second
 * Checkout session, so the button goes quiet for the moment it takes to
 * redirect. The label says what is happening rather than spinning — a
 * progress animation next to a payment reads as trouble.
 */
export function PayButton({
  token,
  label,
  addonKeys = [],
  promoCode,
  adminTestPayment = false,
  disabled = false,
}: {
  token: string;
  label: string;
  /** Selected add-on keys, forwarded to the action. Amounts stay server-side. */
  addonKeys?: string[];
  /** An activated promo code. Resolved server-side; display never sets price. */
  promoCode?: string;
  /** When true, the server may swap in the admin test price if the env gate is on. */
  adminTestPayment?: boolean;
  /**
   * Terms gate (D-INT-11 as amended): the button is disabled until the
   * agreement box is ticked. Taylor's ruling, replacing the tap-nudge.
   */
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <GradientButton
        disabled={disabled || pending}
        onClick={() => {
          setFailed(false);
          startTransition(async () => {
            try {
              await startDepositCheckout(token, addonKeys, promoCode, adminTestPayment);
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
