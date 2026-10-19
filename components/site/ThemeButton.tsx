"use client";

import { useId, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribeToNothing = () => () => {};

/**
 * The header's theme control as Paper draws it (file "Taylor Aucoin", Home,
 * "Theme toggle"): one 36px square with the strong hairline and the sun at
 * 16px, the same in both themes. Light and dark only; the site opens dark
 * (D-SITE-61), and a stored "system" from the admin's three-way group reads
 * as whatever it resolved to.
 *
 * The name stays "Theme"; the description says which theme is on and which
 * a press gives, so a screen reader hears the state without a third value.
 * The state is only knowable in the browser, so it is left out of the
 * server's markup and filled in after hydration.
 */
export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const descriptionId = useId();
  const current = hydrated
    ? resolvedTheme === "light"
      ? "light"
      : "dark"
    : null;
  const next = current === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      aria-label="Theme"
      aria-describedby={descriptionId}
      title={current ? `Switch to ${next}` : undefined}
      onClick={() => setTheme(next)}
      className="flex size-9 shrink-0 items-center justify-center rounded-(--radius) border border-(--color-ghost-line) bg-(--color-ghost-fill) text-(--color-ink) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-(--color-ghost-line-hover) hover:bg-(--color-ghost-fill-hover)"
    >
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="8" cy="8" r="3" />
        <path
          d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"
          strokeLinecap="round"
        />
      </svg>
      <span id={descriptionId} className="sr-only">
        {current
          ? `${current === "dark" ? "Dark" : "Light"} is on; switches to ${next}`
          : ""}
      </span>
    </button>
  );
}
