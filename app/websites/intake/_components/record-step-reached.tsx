"use client";

import { useEffect } from "react";
import { recordStepReached } from "../[token]/_actions/navigation";

/**
 * Fires the progress marker once, after the step is actually on screen.
 *
 * Renders nothing. It exists because the write has to happen on a real visit,
 * not on a prefetch — see the action's own note.
 */
export function RecordStepReached({
  token,
  stepNumber,
}: {
  token: string;
  stepNumber: number;
}) {
  useEffect(() => {
    void recordStepReached(token, stepNumber);
  }, [token, stepNumber]);

  return null;
}
