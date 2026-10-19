"use client";

import { useEffect, useRef } from "react";
import { ELAPSED_NAME, HONEYPOT_NAME } from "./bot-check";

/**
 * The honeypot: off screen, out of the tab order and hidden from assistive
 * tech, so only a bot fills it. Named like a real field on purpose.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden
      className="absolute -left-[9999px] h-px w-px overflow-hidden"
    >
      <label>
        Website
        <input
          type="text"
          name={HONEYPOT_NAME}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}

/**
 * Remembers when the form mounted. Call the returned function as the form
 * submits: it writes the time the form was open into the form data, on the
 * client's own clock, so no clock skew can drop a real note.
 */
export function useFillTimer(): (formData: FormData) => void {
  const mountedAt = useRef<number | null>(null);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return (formData) => {
    const start = mountedAt.current;
    formData.set(
      ELAPSED_NAME,
      start === null ? "0" : String(Date.now() - start),
    );
  };
}
