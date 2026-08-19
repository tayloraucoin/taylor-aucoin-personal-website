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
}: {
  token: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <GradientButton
        disabled={pending}
        onClick={() => {
          setFailed(false);
          startTransition(async () => {
            try {
              await startDepositCheckout(token);
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
