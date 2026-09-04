"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createIntakeLinkAction,
  linkEngagementAction,
  unlinkEngagementAction,
} from "@/app/admin/(protected)/leads/_actions/engagement";
import { adminRoutes } from "@/lib/routes";
import type { EngagementSuggestion } from "@/server/services/leads";

/**
 * The bridge between a call and the money.
 *
 * Unlinked, it does the two things that turn a yes into a client: mint the
 * personal link, or attach the engagement a client already started themselves
 * from the public page.
 *
 * The prefill is the point. Everything Taylor learned on the call goes in
 * here, so the client is never asked for what he already knows (D-INT-8) — and
 * the project summary renders verbatim on their pay screen, which is why it is
 * editable prose rather than a generated label.
 */
export function EngagementPanel({
  leadId,
  defaults,
  suggestions,
}: {
  leadId: string;
  defaults: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    projectSummary: string;
  };
  suggestions: EngagementSuggestion[];
}) {
  const [contactName, setContactName] = useState(defaults.contactName);
  const [contactEmail, setContactEmail] = useState(defaults.contactEmail);
  const [contactPhone, setContactPhone] = useState(defaults.contactPhone);
  const [projectSummary, setProjectSummary] = useState(defaults.projectSummary);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const create = () => {
    startTransition(async () => {
      const result = await createIntakeLinkAction({
        leadId,
        contactName,
        contactEmail,
        contactPhone,
        projectSummary,
      });

      if (result.ok) {
        setCreatedUrl(result.url);
        setMessage(null);
      } else {
        setMessage(result.message);
      }
    });
  };

  const link = (engagementId: string) => {
    startTransition(async () => {
      const result = await linkEngagementAction({ leadId, engagementId });
      setMessage(result.ok ? null : result.message);
    });
  };

  if (createdUrl) {
    return (
      <div className="flex flex-col gap-3 rounded-(--radius) border border-(--color-c2)/40 p-4">
        <p className="text-sm text-(--color-ink)">
          Link created. Copy it now — it isn&rsquo;t stored anywhere and
          can&rsquo;t be shown again.
        </p>
        <code className="font-(family-name:--font-mono) text-xs break-all text-(--color-body)">
          {createdUrl}
        </code>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(createdUrl);
              setCopied(true);
            }}
            className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-(--color-ink)">
            Already started one themselves?
          </h3>
          <ul className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="flex flex-wrap items-center gap-3"
              >
                <span className="text-sm text-(--color-body)">
                  {suggestion.businessName} · {suggestion.contactEmail}
                </span>
                <span className="text-xs text-(--color-dim)">
                  matched on {suggestion.matchedOn}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => link(suggestion.id)}
                  className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-ink) disabled:opacity-50"
                >
                  Link this
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm text-(--color-ink)">Create an intake link</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-(--color-dim)">Their name</span>
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-(--color-dim)">Their email</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Their phone</span>
          <input
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">
            What they&rsquo;re buying — they read this on the pay screen
          </span>
          <textarea
            value={projectSummary}
            onChange={(event) => setProjectSummary(event.target.value)}
            rows={3}
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
          onClick={create}
          className="min-h-[44px] w-fit rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create intake link"}
        </button>
      </div>
    </div>
  );
}

/** The linked view: where they are, what they paid, and the way out. */
export function LinkedEngagement({
  leadId,
  engagementId,
  children,
}: {
  leadId: string;
  engagementId: string;
  children: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {children}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={adminRoutes.engagement(engagementId)}
          className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 py-2.5 text-sm text-(--color-ink)"
        >
          Open engagement
        </Link>

        {confirming ? (
          <>
            <span className="text-sm text-(--color-c2)">
              Unlink? The engagement and its deposit stay untouched.
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await unlinkEngagementAction({ leadId });
                  setConfirming(false);
                })
              }
              className="min-h-[44px] rounded-(--radius) border border-(--color-c2)/50 px-3 text-sm text-(--color-ink)"
            >
              Yes, unlink
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-[44px] text-sm text-(--color-dim) underline"
            >
              Never mind
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-[44px] text-sm text-(--color-dim) underline"
          >
            Unlink
          </button>
        )}
      </div>
    </div>
  );
}
