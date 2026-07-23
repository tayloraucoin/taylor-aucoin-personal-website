"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FIELD } from "@/lib/config";

/**
 * GradientRing — the "moving border" Taylor named unprompted, twice.
 *
 * A conic gradient MASKED TO THE BORDER ONLY. The mask is the whole trick:
 * without it, the gradient fills the box, the backdrop-blur pulls it through
 * the card, and you get an unreadable aurora behind the body copy. That bug
 * shipped once. Never put a gradient behind text.
 *
 * Rotation is driven by requestAnimationFrame writing `--angle` to the element.
 * NOT by a CSS keyframe — because changing `animation-duration` on hover
 * RESTARTS the keyframe, and the ring visibly jumps. Speed is lerped instead.
 *
 * `@property --angle` MUST be declared `inherits: true` (see globals.css).
 * The gradient lives on ::before; with `inherits: false` the pseudo-element
 * never sees the value JS is writing and the ring silently freezes at 0deg.
 */

export default function GradientRing({
  children,
  className = "",
  hoverAccelerate = true,
}: {
  children: ReactNode;
  className?: string;
  hoverAccelerate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let angle = Math.random() * 360;
    let speed: number = FIELD.RING_BASE;
    let target: number = FIELD.RING_BASE;
    let raf = 0;

    const enter = () => {
      if (hoverAccelerate) target = FIELD.RING_HOVER;
    };
    const leave = () => {
      target = FIELD.RING_BASE;
    };

    const tick = () => {
      speed += (target - speed) * 0.05; // lerp, so the ring never jumps
      angle = (angle + speed) % 360;
      el.style.setProperty("--angle", `${angle.toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    tick();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [hoverAccelerate]);

  return (
    <div
      ref={ref}
      data-interactive
      className={`group relative rounded-(--radius) backdrop-blur-[10px] transition-[background,transform,box-shadow] duration-(--dur-base) ease-(--ease-out) ${className}`}
      style={{
        background:
          "linear-gradient(158deg, rgb(255 255 255 / .05), rgb(255 255 255 / .01)), var(--color-card)",
      }}
      onPointerEnter={(e) => {
        const el = e.currentTarget;
        el.style.background =
          "linear-gradient(158deg, rgb(232 185 97 / .11), rgb(139 123 232 / .05) 60%, rgb(255 255 255 / .015)), var(--color-card-hover)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 18px 46px -22px rgb(232 185 97 / .35)";
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget;
        el.style.background =
          "linear-gradient(158deg, rgb(255 255 255 / .05), rgb(255 255 255 / .01)), var(--color-card)";
        el.style.transform = "";
        el.style.boxShadow = "";
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[.82] transition-opacity duration-(--dur-base) group-hover:opacity-100"
        style={{
          padding: "1.5px",
          background:
            "conic-gradient(from var(--angle), transparent 0deg, var(--color-c1) 50deg, var(--color-c2) 100deg, var(--color-c3) 145deg, transparent 215deg, transparent 360deg)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  );
}
