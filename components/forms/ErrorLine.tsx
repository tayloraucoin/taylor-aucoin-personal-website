import type { ReactNode } from "react";

/**
 * The intake's error line, reused (PP-2): a 16px warning glyph and the
 * sentence in text colour at Meta. Field errors sit between label and
 * control; a send error sits under the button as `role="alert"`.
 */
export function ErrorLine({
  id,
  role,
  className = "",
  children,
}: {
  id?: string;
  role?: "alert";
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      role={role}
      className={`flex items-start gap-2 text-meta leading-[1.55] text-(--color-ink) ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="mt-[2px] h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      >
        <path d="M8 1.75 14.75 13.75H1.25L8 1.75Z" />
        <path d="M8 6.25v3.5" strokeLinecap="round" />
        <circle cx="8" cy="11.6" r="0.7" fill="currentColor" stroke="none" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
