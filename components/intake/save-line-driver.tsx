"use client";

import { useEffect, useState } from "react";
import {
  SaveIndicator,
  type SaveState,
} from "@/app/websites/intake/_components/save-indicator";

/** The window event a test or the admin preview sends to move the save line. */
export const SAVE_STATE_EVENT = "intake-fixture:save-state";

const STATES: readonly SaveState[] = [
  "idle",
  "saving",
  "saved",
  "offline",
  "error",
];

/**
 * The step's save line held still on one state, or moved by an event, for the
 * `save` fixture. Nothing is saved: Try again moves the line back to saving
 * rather than calling the action (D-SITE-241).
 */
export function SaveLineDriver({ initial }: { initial: SaveState }) {
  const [state, setState] = useState<SaveState>(initial);

  useEffect(() => {
    function onState(event: Event) {
      const next = (event as CustomEvent<unknown>).detail;
      if (STATES.includes(next as SaveState)) setState(next as SaveState);
    }
    window.addEventListener(SAVE_STATE_EVENT, onState);
    return () => window.removeEventListener(SAVE_STATE_EVENT, onState);
  }, []);

  return <SaveIndicator state={state} onRetry={() => setState("saving")} />;
}
