"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        Confirming your payment.
      </h1>

      <p
        aria-live="polite"
        className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-body"
      >
        {gaveUp
          ? "This is taking longer than it should. Your payment went through — nothing is lost. Send Taylor a note and he'll sort it out."
          : "This usually takes a couple of seconds. You can leave this page open."}
      </p>

      {gaveUp ? (
        <p className="mt-6">
          <a
            href={`mailto:${supportEmail}`}
            className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
          >
            {supportEmail}
          </a>
        </p>
      ) : null}
    </div>
  );
}
