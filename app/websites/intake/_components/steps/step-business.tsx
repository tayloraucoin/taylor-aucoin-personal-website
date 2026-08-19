"use client";

import { useStepAutosave } from "../../_lib/use-step-autosave";
import { useReportSaveState } from "../../_lib/save-state";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

/**
 * Step 1 — About your business.
 *
 * The three name fields sit adjacent because a logo saying one thing and a
 * site saying another blocks Google Business Profile setup, and the client is
 * the only person who can reconcile them. Putting them in a row makes the
 * mismatch visible to them as they type — which is the whole point, so the
 * note below reads as information, not an error.
 *
 * Contact details arrive prefilled from what Taylor captured on the call
 * (D-INT-8). They are shown rather than asked: editable, quietly confirmed.
 */
export function StepBusiness({
  token,
  initial,
  prefill,
}: {
  token: string;
  initial: Record<string, unknown>;
  prefill: {
    businessName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
  };
}) {
  const form = useStepAutosave({
    token,
    stepKey: "business",
    initial: {
      businessName: prefill.businessName,
      contactName: prefill.contactName,
      contactEmail: prefill.contactEmail,
      contactPhone: prefill.contactPhone ?? "",
      ...initial,
    },
  });

  useReportSaveState(form.state, form.retry);

  const names = [
    form.values.businessName,
    form.values.legalName,
    form.values.logoName,
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  const namesDiffer = new Set(names).size > 1;

  return (
    <>
      <TextAnswer
        form={form}
        name="businessName"
        label="Business name as customers know it"
      />
      <TextAnswer
        form={form}
        name="legalName"
        label="Legal or registered name"
        help="If it's different."
      />
      <TextAnswer
        form={form}
        name="logoName"
        label="Name on your logo or signage"
        help="If it's different again."
        note={
          namesDiffer
            ? "Different names? Good — that matters for Google. Leave them exactly as they really are."
            : undefined
        }
      />

      <LongAnswer
        form={form}
        name="whatYouDo"
        label="What you do, in one sentence"
      />
      <TextAnswer
        form={form}
        name="howLong"
        label="How long you've been doing this"
        help="'Since 2023' or 'about two years' — either is fine."
      />

      <TextAnswer
        form={form}
        name="contactName"
        label="Who we'll be dealing with"
      />
      <TextAnswer
        form={form}
        name="contactPhone"
        label="Best phone number"
        mode="tel"
      />
      <TextAnswer
        form={form}
        name="contactEmail"
        label="Email"
        mode="email"
      />

      <TextAnswer
        form={form}
        name="businessNumber"
        label="Business number or incorporation"
        help="Only if you have one handy."
      />

      <ChoiceAnswer
        form={form}
        name="gstRegistered"
        label="Are you GST registered?"
        options={YES_NO_UNSURE}
      />

      <ChoiceAnswer
        form={form}
        name="insured"
        label="Do you have business insurance?"
        help="We can only say you're insured on the site if you actually are."
        options={YES_NO_UNSURE}
      />

      {form.values.insured === "yes" ? (
        <TextAnswer form={form} name="insuranceType" label="What kind?" />
      ) : null}

      <LongAnswer
        form={form}
        name="licences"
        label="Licences or certifications worth mentioning"
      />
    </>
  );
}
