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
