"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveState } from "../_components/save-indicator";
import { saveStep } from "../[token]/_actions/save-step";

/** Quiet period after the last keystroke before a save is attempted. */
const DEBOUNCE_MS = 900;

/**
 * Below this, a save round-trip is not worth announcing. Showing "Saving…" for
 * 80ms and then "Saved" reads as instability on a form whose entire promise is
 * that nothing is lost.
 */
const ANNOUNCE_SAVING_AFTER_MS = 400;

const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [400, 1200, 3000];

function storageKey(token: string, stepKey: string) {
  // The token is a credential and localStorage is shared across the origin, so
  // key on a short prefix rather than the whole thing: enough to separate two
  // engagements on one device, not enough to hand the link to anything that
  // reads storage.
  return `ta-intake:${token.slice(0, 8)}:${stepKey}`;
}

function readLocal(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    // Private mode, quota, embedded webview. The form still works; it just
    // loses its offline safety net, which is the correct thing to degrade.
    return null;
  }
}

function writeLocal(key: string, values: Record<string, unknown>) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // As above — never let a storage failure interrupt typing.
  }
}

function clearLocal(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

/**
 * The no-loss contract, in one hook.
 *
 * The ordering that matters: every change is written to localStorage
 * **synchronously, before** any network attempt. A tab killed mid-debounce, a
 * dead battery, a tunnel — the answers are already on the device and sync on
 * the next visit. The server is where answers end up; the phone is where they
 * are safe in the meantime.
 *
 * The indicator never claims more than is true. "Saved" appears only after the
 * server confirms. A failed save keeps the local copy and says so in plain
 * words rather than throwing something a tradesperson has to interpret.
 *
 * Saves fire on blur and on unmount (which is what a step change is, since
 * every step is its own route). Debounced typing is a convenience on top of
 * that, not the mechanism.
 */
export function useStepAutosave({
  token,
  stepKey,
  initial,
}: {
  token: string;
  stepKey: string;
  initial: Record<string, unknown>;
}) {
  const key = storageKey(token, stepKey);

  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [state, setState] = useState<SaveState>("idle");

  const valuesRef = useRef(values);
  const dirtyRef = useRef(false);
  const inFlightRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  valuesRef.current = values;

  /**
   * Rehydrate anything the last visit could not sync. Local wins over the
   * server copy here by definition: it exists only when a save did not land.
   */
  useEffect(() => {
    const pending = readLocal(key);
    if (!pending) return;

    setValues((current) => ({ ...current, ...pending }));
    dirtyRef.current = true;
  }, [key]);

  const attempt = useCallback(
    async (attemptNumber = 0): Promise<void> => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      announceRef.current = setTimeout(
        () => setState("saving"),
        ANNOUNCE_SAVING_AFTER_MS,
      );

      const snapshot = valuesRef.current;
      const result = await saveStep(token, stepKey, snapshot);

      if (announceRef.current) clearTimeout(announceRef.current);
      inFlightRef.current = false;

      if (result.ok) {
        // Only clear the local copy once the server has it. If the client kept
        // typing during the round trip, the form is dirty again and the next
        // save carries the newer values.
        if (valuesRef.current === snapshot) {
          dirtyRef.current = false;
          clearLocal(key);
        }
        setState("saved");
        return;
      }

      if (result.reason === "link") {
        setState("error");
        return;
      }

      const offline =
        typeof navigator !== "undefined" && navigator.onLine === false;

      if (offline) {
        setState("offline");
        return;
      }

      if (attemptNumber + 1 < MAX_ATTEMPTS) {
        const wait = BACKOFF_MS[attemptNumber] ?? 3000;
        setTimeout(() => void attempt(attemptNumber + 1), wait);
        return;
      }

      setState("error");
    },
    [key, stepKey, token],
  );

  const flush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!dirtyRef.current) return;
    void attempt();
  }, [attempt]);

  const setValue = useCallback(
    (field: string, value: unknown) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        valuesRef.current = next;
        // Safety net first, network second. This line is the no-loss promise.
        writeLocal(key, next);
        return next;
      });

      dirtyRef.current = true;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void attempt(), DEBOUNCE_MS);
    },
    [attempt, key],
  );

  /** A step change unmounts this. Anything unsaved goes now, fire-and-forget. */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (dirtyRef.current) void saveStep(token, stepKey, valuesRef.current);
    };
  }, [stepKey, token]);

  /** Coming back online is the moment to retry, not a timer. */
  useEffect(() => {
    function onOnline() {
      if (dirtyRef.current) void attempt();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [attempt]);

  return {
    values,
    setValue,
    flush,
    state,
    retry: useCallback(() => void attempt(), [attempt]),
  };
}
