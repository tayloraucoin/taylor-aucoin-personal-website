import { SITE } from "@/lib/config";
import { Eyebrow } from "./eyebrow";

/**
 * A dead link — unknown, tampered, or expired.
 *
 * Warm and quiet, with one way out. Nothing red, no error code, no form to
 * retry against: the person reading this is a paying client whose link stopped
 * working, and the only useful thing on the screen is a way to reach Taylor.
 *
 * The expired case gets its own wording. That is safe rather than a leak:
 * reaching it requires a token that really existed, so it tells a stranger
 * nothing they did not already have. A random token lands on the generic copy.
 */
export function LinkUnavailable({
  expired = false,
}: {
  expired?: boolean;
}) {
  return (
    <div>
      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        {expired ? "This link has expired." : "This link isn't working."}
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        {expired
          ? "Links stop working after a while for safety. Send Taylor a note and he'll send a fresh one — everything you entered is still there."
          : "The address may be incomplete, or the link may have expired. Send Taylor a note and he'll send a fresh one — nothing you entered is lost."}
      </p>

      <p className="mt-8">
        <a
          href={`mailto:${SITE.email}`}
          className="font-mono text-[11px] uppercase tracking-[.10em] text-(--color-c2) underline underline-offset-4 hover:text-(--color-c3)"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
