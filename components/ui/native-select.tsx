import * as React from "react";

/**
 * A styled native `<select>` with the OS arrow hidden and a chevron drawn
 * inside `px-3` / `right-3` padding — the same trigger math as the admin
 * Radix Select, without pulling Radix or lucide onto public surfaces.
 *
 * Horizontal padding lives on the primitive (`pl-3 pr-10`) so a call-site
 * `className` cannot collapse the chevron gutter. Pass colours, height, and
 * hover/focus through `className`; do not pass `px-*` or `pr-*`.
 */

const TRIGGER_BASE =
  "w-full min-h-[44px] appearance-none rounded-(--radius) border border-(--color-line) bg-(--color-well) pl-3 pr-10 text-sm text-(--color-body) outline-none focus-visible:border-(--color-c2) disabled:cursor-not-allowed disabled:opacity-50";

function SelectChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select">
>(function NativeSelect({ className, children, ...props }, ref) {
  return (
    <div className="relative w-fit">
      <select
        ref={ref}
        {...props}
        className={[TRIGGER_BASE, className ?? ""].join(" ")}
      >
        {children}
      </select>
      <SelectChevron />
    </div>
  );
});

export { NativeSelect };
