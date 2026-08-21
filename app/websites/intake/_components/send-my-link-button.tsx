"use client";

import { useState, useTransition } from "react";
import { GhostButton } from "@/components/ui/GradientButton";
import { sendMyLink } from "../[token]/_actions/send-link";

/**
 * "Send me my link" — the device-switch escape hatch. A client who starts on a
 * phone in a van often wants to finish on a laptop with the photos on it.
 *
 * Says what happened either way. A button that silently succeeds is only
 * marginally better than one that silently fails.
 */
export function SendMyLinkButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"sent" | "failed" | null>(null);

  if (result === "sent") {
    return (
      <p
        aria-live="polite"
        className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)"
      >
        Sent — check your email
      </p>
    );
  }

  return (
    <div>
      <GhostButton
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult((await sendMyLink(token)) ? "sent" : "failed");
          })
        }
      >
        {pending ? "Sending…" : "Send me my link"}
      </GhostButton>

      {result === "failed" ? (
        <p
          aria-live="polite"
          className="mt-2 font-body text-[13.5px] font-light text-(--color-c2)"
        >
          That didn&apos;t send. Keep this tab open, or ask Taylor for a fresh
          link.
        </p>
      ) : null}
    </div>
  );
}
