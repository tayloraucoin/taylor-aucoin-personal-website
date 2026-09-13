"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: LucideIcon;
};

const OPTIONS: readonly ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const subscribeToNothing = () => () => {};

/**
 * `false` for the server render and the hydration pass, `true` after. The
 * stored theme is only knowable in the browser, so the pressed state must not
 * be part of the markup the server sent — next-themes' own guidance, done with
 * `useSyncExternalStore` rather than an effect that sets state.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * Light / Dark / System, as a connected segmented group in the rail's
 * footer — shadcn's `ToggleGroup` pattern
 * (ui.shadcn.com/docs/components/base/toggle-group), hand-built rather than
 * pulling in the Radix package it wraps. Three buttons is not enough surface
 * to justify a second Radix dependency (`@radix-ui/react-dialog` is the
 * rail's one, for the mobile Sheet), and the rail's own section flyout
 * already set the precedent of a CSS variant over a second overlay package.
 * The interaction contract is copied, not just the look: one shared border
 * and dividers rather than three separate buttons, roving tabindex so `Tab`
 * reaches the group once, and arrow keys move focus without changing the
 * value — activation is still Enter, Space, or a click, exactly how Radix's
 * own `ToggleGroup` behaves.
 *
 * Icon-only in both widths (Taylor, 2026-09-03: three labels read as bulky).
 * Sized well under the rail's 44px nav targets, and Taylor's explicit call
 * for the same reason — a settings control that gets touched once in a
 * while does not need the weight of the primary nav it sits under, and this
 * is a desktop tool with one user. `title` carries the word for the pointer,
 * a screen-reader span for everyone else.
 *
 * Selection is ink on `--color-tint`, not gold — gold in the rail marks
 * *where you are* (the active route), and this is a setting.
 *
 * `size` exists for the second home this got at the intake amendment to
 * D-ADM-13. The rail's 28px is a desktop concession the intake cannot make:
 * that surface is filled on a phone and its floor is a 48px target
 * (INTAKE-UX-SPEC §4), so `touch` is the same group at that height. Nothing
 * else about the control changes between the two.
 */
export function ThemeToggle({
  collapsed = false,
  size = "compact",
}: Readonly<{
  /** Stack vertically — the admin rail when it is narrowed. */
  collapsed?: boolean;
  /** `compact` is the rail's 28px; `touch` is the intake's 48px floor. */
  size?: "compact" | "touch";
}>) {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = hydrated
    ? OPTIONS.findIndex((option) => option.value === theme)
    : -1;
  // The roving-tabindex stop: the selected item until the user has moved
  // focus with the keyboard, then whichever item they last landed on.
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : focusedIndex;

  function focusAt(index: number) {
    const wrapped = (index + OPTIONS.length) % OPTIONS.length;
    setFocusedIndex(wrapped);
    itemRefs.current[wrapped]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = collapsed ? "ArrowDown" : "ArrowRight";
    const backward = collapsed ? "ArrowUp" : "ArrowLeft";
    if (event.key === forward) {
      event.preventDefault();
      focusAt(tabbableIndex + 1);
    } else if (event.key === backward) {
      event.preventDefault();
      focusAt(tabbableIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(OPTIONS.length - 1);
    }
  }

  return (
    <div className={collapsed ? "flex justify-center" : undefined}>
      <div
        role="group"
        aria-label="Theme"
        onKeyDown={onKeyDown}
        className={`inline-flex rounded-md border border-(--color-faint) ${
          collapsed
            ? "flex-col divide-y divide-(--color-faint)"
            : "divide-x divide-(--color-faint)"
        }`}
      >
        {OPTIONS.map(({ value, label, icon: Icon }, index) => {
          const selected = hydrated && theme === value;
          return (
            <button
              key={value}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              aria-pressed={selected}
              title={label}
              tabIndex={index === tabbableIndex ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => setTheme(value)}
              className={`flex items-center justify-center transition-colors focus:z-10 focus-visible:z-10 ${
                size === "touch" ? "size-12" : "size-7"
              } ${
                collapsed
                  ? "first:rounded-t-md last:rounded-b-md"
                  : "first:rounded-l-md last:rounded-r-md"
              } ${
                selected
                  ? "bg-(--color-tint) text-(--color-ink)"
                  : "text-(--color-dim) hover:bg-(--color-card-hover) hover:text-(--color-ink)"
              }`}
            >
              <Icon
                aria-hidden
                className={size === "touch" ? "size-4" : "size-3.5"}
              />
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
