"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eyebrow } from "./eyebrow";

const POLL_MS = 2000;
const GIVE_UP_AFTER_MS = 40000;

/**
 * The gap between Stripe redirecting the client back and the webhook landing.
 *
 * Usually milliseconds, occasionally a few seconds, and the client is standing
 * there having just paid. The honest thing is to say we are confirming and
 * check again — never to read `?paid=1` and call it payment, which is exactly
 * the shortcut this screen exists to avoid.
 *
 * No spinner. Motion next to money reads as trouble, and a static line
 * respects reduced-motion without needing a rule.
 *
 * If the webhook never arrives we stop polling and hand over a human. A client
 * who paid and sees a page pretending to work forever is worse off than one
 * given an email address.
 */
export function PaymentConfirming({ supportEmail }: { supportEmail: string }) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const poll = setInterval(() => router.refresh(), POLL_MS);
    const stop = setTimeout(() => {
      clearInterval(poll);
      setGaveUp(true);
    }, GIVE_UP_AFTER_MS);

    return () => {
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, [router]);

  return (
    <div>
      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        Confirming your payment.
      </h1>

      <p
        aria-live="polite"
        className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)"
      >
        {gaveUp
          ? "This is taking longer than it should. Your payment went through — nothing is lost. Send Taylor a note and he'll sort it out."
          : "This usually takes a couple of seconds. You can leave this page open."}
      </p>

      {gaveUp ? (
        <p className="mt-6">
          <a
            href={`mailto:${supportEmail}`}
            className="font-mono text-[11px] uppercase tracking-[.10em] text-(--color-c2) underline underline-offset-4 hover:text-(--color-c3)"
          >
            {supportEmail}
          </a>
        </p>
      ) : null}
    </div>
  );
}
