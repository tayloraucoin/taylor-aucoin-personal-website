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

const GRADIENT_CLASS =
  "inline-flex items-center gap-2 rounded-(--radius) px-6 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[.10em] text-[#0a0714] transition-[transform,box-shadow] duration-(--dur-fast) ease-(--ease-out) hover:-translate-y-px hover:shadow-[0_10px_32px_-12px_var(--color-c2)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const GRADIENT_STYLE = {
  background: "linear-gradient(102deg, var(--color-c2), var(--color-c3))",
};

const GHOST_CLASS =
  "inline-flex items-center rounded-(--radius) border border-[rgb(232_185_97/.42)] bg-[rgb(9_12_34/.55)] px-[22px] py-3.5 font-mono text-[11px] font-medium uppercase tracking-[.10em] text-[rgb(232_185_97/0.9)] backdrop-blur-[6px] transition-all duration-(--dur-fast) hover:border-[rgb(232_185_97/.72)] hover:bg-[rgb(9_12_34/.80)] hover:text-(--color-c3) disabled:cursor-not-allowed disabled:opacity-60";

/** Primary CTA. Gold→white fill. Must always be the brightest thing on screen. */
export function GradientButton({ href, className, children, ...rest }: CtaProps) {
  const classes = className ? `${GRADIENT_CLASS} ${className}` : GRADIENT_CLASS;

  if (href !== undefined) {
    return (
      <Link href={href} {...externalProps(href)} className={classes} style={GRADIENT_STYLE}>
        {children}
      </Link>
    );
  }

  return (
    <button {...rest} type={rest.type ?? "button"} className={classes} style={GRADIENT_STYLE}>
      {children}
    </button>
  );
}

/** Ghost CTA. Sits on a translucent card so the field never reads through the label. */
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
