import { SITE } from "@/lib/config";

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
export function LinkUnavailable({ expired = false }: { expired?: boolean }) {
  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        {expired ? "This link has expired." : "This link isn't working."}
      </h1>

      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        {expired
          ? "Links stop working after a while for safety. Send Taylor a note and he'll send a fresh one — everything you entered is still there."
          : "The address may be incomplete, or the link may have expired. Send Taylor a note and he'll send a fresh one — nothing you entered is lost."}
      </p>

      <p className="mt-8">
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
