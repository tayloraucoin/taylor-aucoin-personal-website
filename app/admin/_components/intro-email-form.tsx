"use client";

import { useEffect, useState, useTransition } from "react";
import {
  draftIntroAction,
  sendIntroAction,
} from "@/app/admin/(protected)/leads/_actions/lead";

/**
 * The intro email, shown as the draft it will actually send.
 *
 * One home for the send's laws, because there are now two places it appears:
 * the modal on the lead record, and inline in call mode's post-call panel
 * (CRM-16). Duplicating this would mean two implementations of the CASL
 * guard, the re-send confirm, and the failure contract — and they would drift
 * on the day one of them was fixed.
 *
 * Everything is editable — Taylor writes to a person he just spoke to, and a
 * template he cannot adjust is a template he will stop using. The promo
 * checkbox rewrites the draft rather than appending at send time, so what is
 * on screen is exactly what goes out.
 *
 * The CASL line is a reminder, not a gate (M-CRM-3): cold email is off-limits,
 * but the software cannot know whether someone asked on a call, and a hard
 * block would only be worked around by logging a fake one. The record of every
 * send is the actual compliance artifact.
 */
export function IntroEmailForm({
  leadId,
  hasEmail,
  onSent,
  footer,
}: {
  leadId: string;
  hasEmail: boolean;
  /** Fired once the send succeeds, with the address it went to. */
  onSent: (to: string) => void;
  /** Rendered beside Send — the caller's own way out (Cancel, Skip, …). */
  footer?: React.ReactNode;
}) {
  const [includePromo, setIncludePromo] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alreadySent, setAlreadySent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // The draft is composed on the server so the links carry the deployed
  // origin, not whatever host this browser happens to be on.
  useEffect(() => {
    let live = true;

    startTransition(async () => {
      const result = await draftIntroAction({ leadId, includePromo });
      if (!live) return;

      if (result.ok) {
        setSubject(result.subject);
        setBody(result.body);
        setAlreadySent(result.alreadySent);
        // Only prefill the address once; never overwrite a correction.
        setTo((current) => current || result.to);
        setMessage(null);
      } else {
        setMessage(result.message);
      }
      setLoading(false);
    });

    return () => {
      live = false;
    };
  }, [leadId, includePromo]);

  const send = () => {
    if (alreadySent && !confirming) return setConfirming(true);

    startTransition(async () => {
      const result = await sendIntroAction({
        leadId,
        to,
        subject,
        body,
        includePromo,
      });

      if (result.ok) {
        setSent(true);
        setMessage(null);
        onSent(to);
      } else {
        // The draft stays exactly as written — a failed send loses nothing.
        setConfirming(false);
        setMessage(result.message);
      }
    });
  };

  if (sent) {
    return (
      <p className="text-sm text-(--color-ink)">
        Sent to {to}. It&rsquo;s on the lead&rsquo;s timeline.
      </p>
    );
  }

  const field =
    "min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-(--color-dim)">
        Send only after they&rsquo;ve asked for it on a call.
      </p>

      {!hasEmail ? (
        <p className="text-xs text-(--color-c2)">
          No email on file for this lead — add one below and it saves with the
          send.
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-body)">To</span>
        <input
          type="email"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          data-typing
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-body)">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          data-typing
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-body)">Message</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={14}
          data-typing
          className="rounded-(--radius) border border-white/15 bg-black/30 px-3 py-2 font-(family-name:--font-mono) text-xs leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
      </label>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={includePromo}
          onChange={(event) => setIncludePromo(event.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm text-(--color-body)">
          Include the free change-round promo
        </span>
      </label>

      {message ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {message}
        </p>
      ) : null}

      {confirming ? (
        <p className="text-sm text-(--color-c2)">
          An intro already went to this lead. Send another?
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending || loading || !to}
          onClick={send}
          className="min-h-[44px] rounded-(--radius) bg-(--color-c1) px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Working…" : confirming ? "Yes, send again" : "Send"}
        </button>

        {confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-[44px] text-sm text-(--color-dim) underline"
          >
            Never mind
          </button>
        ) : null}

        {footer}
      </div>
    </div>
  );
}
