"use client";

import { useEffect, useRef } from "react";

/**
 * The step's heading, focused when the step mounts.
 *
 * Each step is its own route, so a Continue or Back is a real navigation and
 * this remounts — which is what moves a screen reader (and a keyboard) to the
 * top of the new question set instead of leaving it stranded in the previous
 * step's footer.
 *
 * It is an `h1` because it is this page's heading; the 28px display size is
 * the design system's h2 *scale*. Semantics and scale are separate decisions
 * and this is the pair the spec asks for.
 */
export function StepHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <h1
      ref={ref}
      tabIndex={-1}
      className="font-display text-[28px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink) focus:outline-none"
    >
      {children}
    </h1>
  );
}
