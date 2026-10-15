import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

/** External links (Cal.com, etc.) open in a new tab — the site stays open
 *  behind the booking flow. Internal navigation never does. */
const externalProps = (href: string) =>
  /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/**
 * Both CTAs render as a link or as a button depending on which prop arrives.
 * The intake flow needs real buttons (a step's Continue saves before it
 * navigates), and a second component with copied styling would be two homes
 * for one look. The classes below are unchanged from the link-only version.
 */
type CtaProps = {
  children: ReactNode;
  className?: string;
} & (
  | { href: string; onClick?: never; type?: never; disabled?: never }
  | {
      href?: never;
      onClick?: ComponentProps<"button">["onClick"];
      type?: ComponentProps<"button">["type"];
      disabled?: boolean;
    }
);

// Brand kit §3 and law 2: one solid fill, the same value in every state of a
// theme, sentence case, 15px Albert Sans 500. No gradient — gradients live in
// the ring and the atmosphere only. `normal-case` undoes the uppercase some
// call sites still pass in through `className`.
const GRADIENT_CLASS =
  "inline-flex items-center gap-2 rounded-(--radius) bg-(--color-fill) px-6 py-3.5 font-body text-[15px] font-medium normal-case leading-none tracking-normal text-(--color-on-fill) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:bg-(--color-fill-hover) disabled:cursor-not-allowed disabled:opacity-60";

const GHOST_CLASS =
  "inline-flex items-center gap-2 rounded-(--radius) border border-(--color-ghost-line) bg-(--color-ghost-fill) px-[22px] py-3.5 font-body text-[15px] font-medium normal-case leading-none tracking-normal text-(--color-ink) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-(--color-ghost-line-hover) hover:bg-(--color-ghost-fill-hover) disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Primary CTA. The name predates the rebrand; the fill is now the kit's solid
 * primary (carbon in A, patina in B). Still the strongest thing on screen.
 */
export function GradientButton({
  href,
  className,
  children,
  ...rest
}: CtaProps) {
  const classes = className ? `${GRADIENT_CLASS} ${className}` : GRADIENT_CLASS;

  if (href !== undefined) {
    return (
      <Link
        href={href}
        {...externalProps(href)}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      className={classes}
    >
      {children}
    </button>
  );
}

/** Ghost CTA. A strong-border outline with text-coloured label. */
export function GhostButton({ href, className, children, ...rest }: CtaProps) {
  const classes = className ? `${GHOST_CLASS} ${className}` : GHOST_CLASS;

  if (href !== undefined) {
    return (
      <Link href={href} {...externalProps(href)} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...rest} type={rest.type ?? "button"} className={classes}>
      {children}
    </button>
  );
}
