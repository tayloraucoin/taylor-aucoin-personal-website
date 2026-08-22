"use client";

import { useState } from "react";
import { IntroEmailForm } from "./intro-email-form";

/**
 * The intro email as a modal, opened from the lead record.
 *
 * A shell and nothing more: every rule about the draft, the promo, the
 * re-send confirm, and the failure contract lives in `IntroEmailForm`, which
 * call mode's post-call panel renders inline (CRM-16). This file owns the
 * chrome and the way out.
 */
export function IntroEmailDialog({
  leadId,
  businessName,
  hasEmail,
  onClose,
}: {
  leadId: string;
  businessName: string;
  hasEmail: boolean;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Intro email to ${businessName}`}
        className="w-full max-w-2xl rounded-(--radius) border border-white/15 bg-(--color-ground-a) p-6"
      >
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-(family-name:--font-display) text-lg text-(--color-ink)">
            Intro email
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] text-sm text-(--color-dim) underline"
          >
            {sent ? "Done" : "Cancel"}
          </button>
        </div>

        <IntroEmailForm
          leadId={leadId}
          hasEmail={hasEmail}
          onSent={() => setSent(true)}
        />
      </div>
    </div>
  );
}
