"use client";

import { useState, useTransition } from "react";
import { updateContactAction } from "@/app/admin/(protected)/leads/_actions/lead";
import { IntroEmailDialog } from "./intro-email-dialog";

/**
 * The contact block: the number to dial, the address to write to, and the one
 * button that turns a conversation into a sent intro.
 *
 * Editing is inline and optimistic-free — these are rare, deliberate
 * corrections, not a hot path, so a plain save with a visible result beats
 * cleverness.
 */
export function LeadContact({
  leadId,
  businessName,
  googlePhone,
  phoneOverride,
  contactEmail,
}: {
  leadId: string;
  businessName: string;
  googlePhone: string;
  phoneOverride: string | null;
  contactEmail: string | null;
}) {
  const [email, setEmail] = useState(contactEmail ?? "");
  const [phone, setPhone] = useState(phoneOverride ?? "");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = (patch: { contactEmail?: string; phoneOverride?: string }) => {
    startTransition(async () => {
      const result = await updateContactAction({ leadId, ...patch });
      if (result.ok) {
        setError(null);
        setSaved("Saved");
        setTimeout(() => setSaved(null), 1500);
      } else {
        setError(result.message);
      }
    });
  };

  const display = phoneOverride ?? googlePhone;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {display ? (
          <a
            href={`tel:${display.replace(/[^\d+]/g, "")}`}
            className="font-(family-name:--font-mono) text-xl text-(--color-ink)"
          >
            {display}
          </a>
        ) : (
          <span className="text-sm text-(--color-dim)">No number</span>
        )}

        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(display)}
          disabled={!display}
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-3 text-sm text-(--color-body) disabled:opacity-50"
        >
          Copy
        </button>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-3 text-sm text-(--color-ink)"
        >
          Intro email
        </button>

        {saved ? (
          <span className="text-xs text-(--color-dim)">{saved}</span>
        ) : null}
      </div>

      {phoneOverride && googlePhone && phoneOverride !== googlePhone ? (
        // Both stay visible: Google's value returns on the next sync anyway,
        // and two numbers that disagree are worth seeing side by side.
        <p className="text-xs text-(--color-dim)">Google has {googlePhone}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Email</span>
          <input
            type="email"
            value={email}
            placeholder="Add an email to send the intro"
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => {
              if (email !== (contactEmail ?? "")) save({ contactEmail: email });
            }}
            className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">
            Better number (optional)
          </span>
          <input
            type="tel"
            value={phone}
            placeholder={googlePhone || "None on file"}
            onChange={(event) => setPhone(event.target.value)}
            onBlur={() => {
              if (phone !== (phoneOverride ?? ""))
                save({ phoneOverride: phone });
            }}
            className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {error}
        </p>
      ) : null}

      {dialogOpen ? (
        <IntroEmailDialog
          leadId={leadId}
          businessName={businessName}
          hasEmail={Boolean(email)}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}

      {pending ? <span className="sr-only">Saving</span> : null}
    </div>
  );
}
