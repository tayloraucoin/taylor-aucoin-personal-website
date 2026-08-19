"use client";

import { useEffect } from "react";
import { completeIntake } from "../[token]/_actions/complete";

/**
 * Commits completion when the Done screen is actually reached.
 *
 * Renders nothing. Like the step-progress marker, this fires from the client
 * rather than during render because Next prefetches `Link` targets — and the
 * last step's Continue points here. A render-time write would finish a
 * client's intake and email Taylor the document while they were still reading
 * step nine.
 *
 * `completeIntake` is itself idempotent, so a refresh cannot send twice.
 */
export function CompleteOnArrival({
  token,
  alreadyComplete,
}: {
  token: string;
  alreadyComplete: boolean;
}) {
  useEffect(() => {
    if (alreadyComplete) return;
    void completeIntake(token);
  }, [alreadyComplete, token]);

  return null;
}
