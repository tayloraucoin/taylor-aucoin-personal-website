"use client";

import { useEffect, useState, useTransition } from "react";
import {
  draftIntroTextAction,
  setLinkTextedAction,
} from "@/app/admin/(protected)/queue/_actions/queue";
import { createIntakeLinkAction } from "@/app/admin/(protected)/leads/_actions/engagement";
import type { ContactChannel } from "@/lib/types/crm";
import type { QueueLead } from "@/server/services/leads";
import { IntroEmailForm } from "./intro-email-form";

/**
 * The moment after a good call, in one motion (§3.8 state 3, D-CRM-26).
 *
 * Everything here is prefilled from what the conversation just captured —
 * nothing is re-entered. Every action is a choice and every one has a "not
 * right now" that costs exactly one click, because the point is that the
 * option exists while the call is fresh, not that the software decides.
 *
 * The disposition is already saved before any of this renders. Nothing on
 * this panel can lose it.
 */

/** What actually happened here, carried to the review screen as fact. */
export type CompletedAction =
  | { kind: "email"; to: string }
  | { kind: "text" }
  | { kind: "intake" }
  | { kind: "noEmail" };

export function PostCallPanel({
  lead,
  attemptId,
  owed,
  channel,
  capturedEmail,
  forDecisionMaker = false,
  onDone,
}: {
  lead: QueueLead;
  /** The attempt this call wrote — a texted link marks *that* dial. */
  attemptId: string;
  owed: { info: boolean; intake: boolean };
  channel: ContactChannel | null;
  /** Email captured on this call — the pinned lead snapshot may predate it. */
  capturedEmail: string;
  /** "Talk to the boss" was tagged — draft for someone passing it along. */
  forDecisionMaker?: boolean;
  onDone: (completed: CompletedAction[]) => void;
}) {
  const [completed, setCompleted] = useState<CompletedAction[]>([]);

  const add = (action: CompletedAction) =>
    setCompleted((prior) =>
      prior.some((p) => p.kind === action.kind) ? prior : [...prior, action],
    );

  const did = (kind: CompletedAction["kind"]) =>
    completed.some((c) => c.kind === kind);

  const wantsText = channel === "text";
  const hasEmail = Boolean(lead.contactEmail || capturedEmail);
  const showEmail = owed.info && !wantsText;
  const skippedWithoutEmail = showEmail && !hasEmail;

  return (
    <div className="flex flex-col gap-5 rounded-(--radius) border border-(--color-c2)/40 p-4">
      <p className="text-sm text-(--color-ink)">
        {owed.intake && owed.info
          ? "Logged. They want the info and they're ready to start."
          : owed.intake
            ? "Logged. They're ready to start — make them the link."
            : "Logged. They asked for the info — send it while you're still on their mind."}
      </p>

      {owed.info && wantsText ? (
        <TextBlock
          lead={lead}
          attemptId={attemptId}
          done={did("text")}
          onSent={() => add({ kind: "text" })}
          onUndo={() =>
            setCompleted((prior) => prior.filter((c) => c.kind !== "text"))
          }
        />
      ) : null}

      {showEmail ? (
        did("email") ? (
          <p className="text-sm text-(--color-ink)">Intro email sent.</p>
        ) : (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm text-(--color-body)">Intro email</h3>
            <IntroEmailForm
              leadId={lead.id}
              hasEmail={hasEmail}
              forDecisionMaker={forDecisionMaker}
              onSent={(to) => add({ kind: "email", to })}
            />
          </section>
        )
      ) : null}

      {owed.intake ? (
        <IntakeBlock lead={lead} done={did("intake")} onMinted={() => add({ kind: "intake" })} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onDone(
              skippedWithoutEmail && !did("email")
                ? [...completed, { kind: "noEmail" }]
                : completed,
            )
          }
          className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink)"
        >
          Done
        </button>
        <p className="text-xs text-(--color-dim)">
          Skipping is fine — the lead comes back on its date either way.
        </p>
      </div>
    </div>
  );
}

/**
 * The link, prepared for Taylor's phone (D-CRM-14).
 *
 * The app never sends it. On a phone the `sms:` link opens the composer with
 * the words already in it; on a laptop the words go to the clipboard. Either
 * way what gets recorded is that the link was *prepared* — the timeline says
 * "link texted", never "delivered", because only the phone knows that.
 *
 * Both affordances render and CSS picks one, rather than sniffing the user
 * agent: the breakpoint is already the thing that decides which device this
 * is, and a UA test would be a second, worse answer to the same question.
 */
function TextBlock({
  lead,
  attemptId,
  done,
  onSent,
  onUndo,
}: {
  lead: QueueLead;
  attemptId: string;
  done: boolean;
  onSent: () => void;
  onUndo: () => void;
}) {
  const [body, setBody] = useState("");
  const [phone, setPhone] = useState(lead.phone);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let live = true;
    startTransition(async () => {
      const result = await draftIntroTextAction({
        leadId: lead.id,
        includePromo: false,
      });
      if (!live) return;
      if (result.ok) {
        setBody(result.body);
        setPhone(result.phone);
      } else {
        setMessage(result.message);
      }
    });
    return () => {
      live = false;
    };
  }, [lead.id]);

  const record = (linkTexted: boolean) => {
    startTransition(async () => {
      await setLinkTextedAction({ attemptId, leadId: lead.id, linkTexted });
    });
  };

  if (done) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-(--color-ink)">Link texted.</p>
        <button
          type="button"
          onClick={() => {
            record(false);
            onUndo();
          }}
          className="min-h-[44px] px-2 text-sm text-(--color-dim) underline"
        >
          Didn&rsquo;t send it
        </button>
      </div>
    );
  }

  // `?&body=` rather than `?body=` or `&body=`: iOS and Android disagree about
  // the separator and this form is the one both accept.
  const smsHref = `sms:${phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(body)}`;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm text-(--color-body)">Text them the link</h3>
      <p className="text-xs text-(--color-dim)">
        Send only after they&rsquo;ve asked for it on a call.
      </p>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={6}
        aria-label="Text message"
        data-typing
        className="rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-2 text-sm leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
      />

      {message ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {/* Phone: opens the composer. */}
        <a
          href={smsHref}
          onClick={() => {
            record(true);
            onSent();
          }}
          className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 py-2.5 text-sm font-medium text-white lg:hidden"
        >
          Open in Messages
        </a>

        {/* Laptop: the words go to the clipboard, the sending is still his. */}
        <button
          type="button"
          disabled={pending || !body}
          onClick={() => {
            void navigator.clipboard.writeText(body);
            setCopied(true);
            record(true);
            onSent();
          }}
          className="hidden min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60 lg:block"
        >
          {copied ? "Copied" : "Copy text"}
        </button>

        <span className="text-xs text-(--color-dim)">{phone}</span>
      </div>
    </section>
  );
}

/**
 * The paid link, minted from what the call captured.
 *
 * Shown once and never again (M-INT-6): the plaintext token is not stored, so
 * a screen that could be dismissed before copying would lose it for good.
 * That is why the URL renders inline the moment it exists rather than behind
 * another click, and why the warning is text rather than a colour.
 */
function IntakeBlock({
  lead,
  done,
  onMinted,
}: {
  lead: QueueLead;
  done: boolean;
  onMinted: () => void;
}) {
  const [contactName, setContactName] = useState(lead.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(lead.contactEmail ?? "");
  const [summary, setSummary] = useState(lead.projectSummary);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const field =
    "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

  if (url) {
    return (
      <section className="flex flex-col gap-3">
        <p className="text-sm text-(--color-ink)">
          Link created. Copy it now — it isn&rsquo;t stored anywhere and
          can&rsquo;t be shown again.
        </p>
        <code className="font-(family-name:--font-mono) text-xs break-all text-(--color-body)">
          {url}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(url);
            setCopied(true);
          }}
          className="min-h-[44px] w-fit rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </section>
    );
  }

  if (done) return <p className="text-sm text-(--color-ink)">Intake link created.</p>;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm text-(--color-body)">Their intake link</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Their name</span>
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            data-typing
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Their email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            data-typing
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-(--color-dim)">
          What they&rsquo;re buying — they read this on the pay screen
        </span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          data-typing
          className="rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-2 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
      </label>

      {message ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending || !contactName || !contactEmail.includes("@")}
        onClick={() =>
          startTransition(async () => {
            const result = await createIntakeLinkAction({
              leadId: lead.id,
              contactName,
              contactEmail,
              contactPhone: lead.phone,
              projectSummary: summary,
            });
            if (result.ok) {
              setUrl(result.url);
              setMessage(null);
              onMinted();
            } else {
              setMessage(result.message);
            }
          })
        }
        className="min-h-[44px] w-fit rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create intake link"}
      </button>
    </section>
  );
}
