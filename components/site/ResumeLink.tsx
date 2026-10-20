import { SITE } from "@/lib/config";

/**
 * The résumé link, matched to the site's theme. Both anchors are rendered and
 * CSS shows one: dark mode (the ground state) links the carbon PDF, `.light`
 * links the print PDF. `display: none` keeps the hidden one out of the
 * accessibility tree, and there is no client JS, so nothing flashes.
 *
 * `alternate` adds "Print version" beside the dark link, so a visitor in dark
 * mode can still take the PDF that prints and parses cleanly. Light mode
 * needs none: its link is already the print version.
 */
export function ResumeLink({
  children,
  className,
  alternateClassName = className,
  alternate = false,
}: {
  children: React.ReactNode;
  className: string;
  alternateClassName?: string;
  alternate?: boolean;
}) {
  return (
    <>
      <a href={SITE.resumeDark} className={`${className} [.light_&]:hidden`}>
        {children}
      </a>
      {alternate && (
        <a
          href={SITE.resume}
          className={`${alternateClassName} [.light_&]:hidden`}
        >
          Print version<span className="sr-only"> of the résumé (PDF)</span>
        </a>
      )}
      <a
        href={SITE.resume}
        className={`${className} hidden! [.light_&]:inline-flex!`}
      >
        {children}
      </a>
    </>
  );
}
