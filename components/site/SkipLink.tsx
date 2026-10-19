"use client";

import type { MouseEvent } from "react";

/**
 * The first focusable element on every chrome page, hidden until focused
 * (D-SITE-235). A plain `#main` jump scrolls without moving focus to an
 * element that cannot take it, so the click focuses `main#main` itself.
 */
export function SkipLink() {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById("main");
    if (!main) return;
    event.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus();
    main.scrollIntoView();
  }

  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only rounded-(--radius) bg-(--color-fill) px-4 py-2.5 text-[15px] text-(--color-on-fill) focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
    >
      Skip to content
    </a>
  );
}
