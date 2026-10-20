/**
 * The site's two button looks (kit §6), as classes so a `next/link` can wear
 * them. Primary is the one solid action on a view: `--fill` under
 * `--on-fill`, never a gradient (house law 3). Ghost is the hairline-bordered
 * second action, and the header's call button. Small is the header's size.
 */
export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "small" | "default";

const BASE =
  "inline-flex items-center justify-center whitespace-nowrap rounded-(--radius) border font-body transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-(--color-fill) bg-(--color-fill) text-(--color-on-fill) hover:border-(--color-fill-hover) hover:bg-(--color-fill-hover)",
  ghost:
    "border-(--color-line-strong) bg-transparent text-(--color-ink) hover:border-(--color-ink)",
};

const SIZES: Record<ButtonSize, string> = {
  small: "h-9 px-4 text-[14px]",
  default: "h-11 px-5 text-[15px]",
};

export function buttonVariants({
  variant = "primary",
  size = "default",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

/**
 * A discipline tab (D-SITE-51): body text, the selected one in ink over a 2px
 * rule-coloured line that sits on the row's hairline. Looks only: home's
 * tablist and `/work`'s links each bring their own behaviour.
 */
export function tabVariants({ selected }: { selected: boolean }): string {
  return `-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-2 font-body text-(length:--text-body) transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) ${
    selected
      ? "border-(--color-rule) text-(--color-ink)"
      : "border-transparent text-(--color-dim) hover:text-(--color-ink)"
  }`;
}

/**
 * A type filter chip (D-SITE-54): hairline-bordered; selected takes the raised
 * surface, the strong border and a mark-coloured check (drawn by the caller).
 * `disabled` is the kit's disabled look (60% opacity, not-allowed, no hover)
 * for a row that shows but does not filter.
 */
export function chipVariants({
  selected,
  disabled = false,
}: {
  selected: boolean;
  disabled?: boolean;
}): string {
  return `inline-flex min-h-11 items-center gap-2 rounded-(--radius) border px-4 font-body text-(length:--text-small) transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) md:min-h-10 ${
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
  } ${
    selected
      ? "border-(--color-line-strong) bg-(--color-card) text-(--color-ink)"
      : `border-(--color-line-soft) text-(--color-body)${
          disabled
            ? ""
            : " hover:border-(--color-line-strong) hover:text-(--color-ink)"
        }`
  }`;
}
